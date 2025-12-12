"use server"

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./secrets";

// Cache the client to avoid re-initializing on every call
let aiClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

async function getAIClient(): Promise<GoogleGenAI | null> {
    // Return cached client if API key hasn't changed
    const currentKey = await getGeminiApiKey();

    if (!currentKey) {
        console.warn("Gemini API key not found in Secret Manager or environment");
        return null;
    }

    if (aiClient && cachedApiKey === currentKey) {
        return aiClient;
    }

    // Create new client with the API key
    aiClient = new GoogleGenAI({ apiKey: currentKey });
    cachedApiKey = currentKey;
    return aiClient;
}

// Using stable flash model for production reliability
const modelId = 'gemini-1.5-flash';

export async function getGeminiInsight(amount: number): Promise<string | null> {
    const ai = await getAIClient();
    if (!ai) {
        return getFallbackInsight(amount);
    }

    try {
        const prompt = `You are a dark, psychological financial strategist. The user just saved ${amount} PHP by NOT gambling.

TASK: Write a short, punchy psychological insight (2-3 sentences max) that:
1. Makes gambling seem foolish and impatient ("The casino loves your impatience")
2. Makes investing seem like a smart person's cheat code
3. Includes a specific growth calculation (e.g., "This ₱${amount} at 15% annual growth becomes ₱${Math.round(amount * 1.15 ** 5)} in 5 years")

TONE: Dark. Manipulative but for their own good. Like a mentor slapping sense into them.

RULES:
- NO quotation marks around the response
- NO markdown formatting
- Just raw, impactful text
- Be specific with numbers

Example output style:
The casino would have vaporized this ₱${amount} in 10 seconds flat. But parked in NVDA stock? In 5 years, this becomes ₱${Math.round(amount * 3)}. Your impatience is their profit margin.`;

        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        // Extract text from the response
        const text = result.text;
        if (!text) {
            console.warn("Empty response from Gemini");
            return getFallbackInsight(amount);
        }

        return text.trim();
    } catch (error) {
        console.error("Error fetching Gemini insight:", error);
        return getFallbackInsight(amount);
    }
}

function getFallbackInsight(amount: number): string {
    const growth5yr = Math.round(amount * 2.5);
    const fallbacks = [
        `The casino would have eaten this ₱${amount.toLocaleString()} in seconds. But in a solid index fund? This becomes ₱${growth5yr.toLocaleString()} in 5 years. Your patience is your profit.`,
        `Every peso you don't gamble is a peso that works for you. This ₱${amount.toLocaleString()} could become ₱${growth5yr.toLocaleString()} while you sleep. The house always wins - unless you're not playing.`,
        `Casinos are designed to extract money from the impatient. You just proved you're smarter than their algorithms. This ₱${amount.toLocaleString()} is now yours to grow.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export async function getGeminiInvestmentAnalysis(amount: number): Promise<string | null> {
    const ai = await getAIClient();
    if (!ai) return JSON.stringify(getFallbackInvestmentData(amount));

    try {
        const prompt = `For ₱${amount} PHP, generate exactly 4 investment projection cards.

OUTPUT FORMAT: Raw JSON only. No markdown. No code blocks.

{
  "cards": [
    {
      "title": "Bitcoin Strategy",
      "icon": "crypto",
      "prediction": "2-3 sentence explanation in simple Filipino-friendly English",
      "projectedValue": "₱X,XXX - ₱X,XXX",
      "roi": "Simple ROI description like '3-5x potential'",
      "color": "amber",
      "timeHorizon": "X Years"
    },
    {
      "title": "Tech Giants",
      "icon": "stock",
      "prediction": "...",
      "projectedValue": "₱X,XXX - ₱X,XXX",
      "roi": "...",
      "color": "emerald",
      "timeHorizon": "..."
    },
    {
      "title": "Safe Harbor",
      "icon": "safe",
      "prediction": "...",
      "projectedValue": "₱X,XXX - ₱X,XXX",
      "roi": "...",
      "color": "blue",
      "timeHorizon": "..."
    },
    {
      "title": "Dream Goal",
      "icon": "goal",
      "prediction": "Motivational text about what this money could buy. Theme: Make money your slave.",
      "projectedValue": "₱X,XXX - ₱X,XXX",
      "roi": "...",
      "color": "purple",
      "timeHorizon": "...",
      "dreamItems": [
        { "name": "Item Name (e.g. Toyota Innova, Gaming PC)", "price": "Approx Price", "category": "car or tech or house or business" }
      ]
    }
  ]
}

RULES:
- Use realistic Philippine peso values
- Predictions should be relatable ("like owning digital land")
- Include risk warnings naturally
- For dreamItems, suggest 3 diverse items that the user could aim for. prioritizing:
    - Cars: Toyota Innova, Supra, or popular PH cars
    - Tech: iPhone 16/Latest, Samsung S24, Google Pixel, High-end Gaming PC
    - Property: Downpayment for house/condo, Sari-sari store
- NO markdown, just raw JSON`;

        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = result.text;
        if (!text) {
            console.warn("Empty investment response");
            return JSON.stringify(getFallbackInvestmentData(amount));
        }

        return text.trim();
    } catch (error) {
        console.error("Error fetching investment analysis:", error);
        return JSON.stringify(getFallbackInvestmentData(amount));
    }
}

function getFallbackInvestmentData(amount: number) {
    return {
        cards: [
            {
                title: "Bitcoin Strategy",
                icon: "crypto",
                prediction: `Bitcoin and top coins like ETH or SOL are like digital land. If you hold this ₱${amount.toLocaleString()} for a few years, history shows it could explode in value. It's risky, but the payoff is huge.`,
                projectedValue: `₱${(amount * 3).toLocaleString()} - ₱${(amount * 5).toLocaleString()}`,
                roi: "3-5x potential",
                color: "amber",
                timeHorizon: "4 Years"
            },
            {
                title: "Tech Giants",
                icon: "stock",
                prediction: `Companies like Nvidia, Google, and Meta are building the AI future. Investing ₱${amount.toLocaleString()} here is like owning a piece of the machines. High growth, medium risk.`,
                projectedValue: `₱${(amount * 2).toLocaleString()} - ₱${(amount * 3).toLocaleString()}`,
                roi: "2-3x growth",
                color: "emerald",
                timeHorizon: "5 Years"
            },
            {
                title: "Safe Harbor",
                icon: "safe",
                prediction: `The S&P 500 or Gold is like a magic vault that slowly adds money every year. Your ₱${amount.toLocaleString()} grows steadily while you sleep. Low risk, guaranteed peace of mind.`,
                projectedValue: `₱${(amount * 1.3).toLocaleString()} - ₱${(amount * 1.5).toLocaleString()}`,
                roi: "30-50% growth",
                color: "blue",
                timeHorizon: "7 Years"
            },
            {
                title: "Dream Goal",
                icon: "goal",
                prediction: `Let this money work for you. In 5 years, this could fund a business or your dream tech. Make money your slave, not your master.`,
                projectedValue: `₱${(amount * 3).toLocaleString()} - ₱${(amount * 4).toLocaleString()}`,
                roi: "Financial Freedom",
                color: "purple",
                timeHorizon: "5 Years",
                dreamItems: [
                    { name: "High-End Gaming PC", price: "₱150,000", category: "tech" },
                    { name: "Toyota Innova (Downpayment)", price: "₱300,000", category: "car" },
                    { name: "Sari-Sari Store Capital", price: "₱50,000", category: "business" }
                ]
            }
        ]
    };
}

export async function getWalletAnalysis(logs: any[]): Promise<string | null> {
    // Early return if no logs
    if (!logs || logs.length === 0) {
        return "Start logging your savings to get AI-powered financial insights.";
    }

    const ai = await getAIClient();
    if (!ai) {
        console.warn("AI client not available for wallet analysis");
        return getWalletFallback(logs);
    }

    try {
        const simplifiedLogs = logs.slice(0, 20).map(l => ({
            date: new Date(l.timestamp).toLocaleDateString(),
            amount: l.amount
        }));

        const total = simplifiedLogs.reduce((sum, l) => sum + l.amount, 0);
        const avgSave = Math.round(total / simplifiedLogs.length);
        const logsCount = simplifiedLogs.length;

        const prompt = `You are analyzing a user's gambling prevention savings. Here's their data:
- Total logs: ${logsCount}
- Total saved: ₱${total.toLocaleString()} PHP
- Average save: ₱${avgSave.toLocaleString()} per entry
- Recent saves: ${JSON.stringify(simplifiedLogs.slice(0, 5))}

Write a personalized 2-3 sentence analysis of their saving pattern. Be specific about:
1. Their consistency (are they saving regularly?)
2. The growth trend (are amounts increasing?)
3. One motivational statement about their progress

RULES:
- No markdown formatting
- No quotation marks
- Be specific with their numbers
- Sound like a supportive financial coach`;

        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = result.text?.trim();
        if (!text || text.length < 20) {
            console.warn("Empty or too short wallet analysis response");
            return getWalletFallback(logs);
        }

        return text;
    } catch (error) {
        console.error("Error fetching wallet analysis:", error);
        return getWalletFallback(logs);
    }
}

function getWalletFallback(logs: any[]): string {
    const total = logs.reduce((sum, l) => sum + (l.amount || 0), 0);
    const count = logs.length;
    const avg = count > 0 ? Math.round(total / count) : 0;

    const fallbacks = [
        `You've saved ₱${total.toLocaleString()} across ${count} entries, averaging ₱${avg.toLocaleString()} per save. This discipline is the foundation of wealth building - keep going!`,
        `With ${count} logged saves totaling ₱${total.toLocaleString()}, you're proving that consistency beats luck every time. The average saver can't match your ₱${avg.toLocaleString()} per entry.`,
        `₱${total.toLocaleString()} saved, ${count} temptations resisted. At this rate, you're building a fortress of financial security. Each ₱${avg.toLocaleString()} save is a brick in that wall.`
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
