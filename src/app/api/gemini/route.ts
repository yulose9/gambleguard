// Gemini AI API Route
// Converts server actions to stable API endpoints to avoid cache mismatch issues

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Cache the client
let aiClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

async function getAIClient(): Promise<GoogleGenAI | null> {
    // Get API key from environment
    const currentKey = process.env.GEMINI_API_KEY;

    if (!currentKey) {
        console.warn("Gemini API key not found");
        return null;
    }

    if (aiClient && cachedApiKey === currentKey) {
        return aiClient;
    }

    aiClient = new GoogleGenAI({ apiKey: currentKey });
    cachedApiKey = currentKey;
    return aiClient;
}

const modelId = 'gemini-1.5-flash';

// POST /api/gemini?action=insight|investment|wallet
export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');
        const body = await request.json();

        const ai = await getAIClient();

        switch (action) {
            case 'insight':
                return handleInsight(ai, body.amount);
            case 'investment':
                return handleInvestment(ai, body.amount);
            case 'wallet':
                return handleWallet(ai, body.logs);
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
    }
}

async function handleInsight(ai: GoogleGenAI | null, amount: number) {
    if (!ai || amount <= 0) {
        return NextResponse.json({
            result: getFallbackInsight(amount)
        });
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
- Be specific with numbers`;

        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        return NextResponse.json({
            result: result.text?.trim() || getFallbackInsight(amount)
        });
    } catch (error) {
        console.error('Insight error:', error);
        return NextResponse.json({ result: getFallbackInsight(amount) });
    }
}

async function handleInvestment(ai: GoogleGenAI | null, amount: number) {
    if (!ai || amount <= 0) {
        return NextResponse.json({
            result: JSON.stringify(getFallbackInvestmentData(amount))
        });
    }

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
      "prediction": "What tangible thing in Philippines this could buy if grown (car downpayment, sari-sari store capital, house renovation). Theme: Make money your slave.",
      "projectedValue": "₱X,XXX - ₱X,XXX",
      "roi": "...",
      "color": "purple",
      "timeHorizon": "..."
    }
  ]
}

RULES:
- Use realistic Philippine peso values
- Predictions should be relatable ("like owning digital land")
- Include risk warnings naturally
- NO markdown, just raw JSON`;

        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        return NextResponse.json({
            result: result.text?.trim() || JSON.stringify(getFallbackInvestmentData(amount))
        });
    } catch (error) {
        console.error('Investment error:', error);
        return NextResponse.json({ result: JSON.stringify(getFallbackInvestmentData(amount)) });
    }
}

async function handleWallet(ai: GoogleGenAI | null, logs: any[]) {
    if (!logs || logs.length === 0) {
        return NextResponse.json({
            result: "Start logging your savings to get AI-powered financial insights."
        });
    }

    if (!ai) {
        return NextResponse.json({ result: getWalletFallback(logs) });
    }

    try {
        const simplifiedLogs = logs.slice(0, 20).map((l: any) => ({
            date: new Date(l.timestamp).toLocaleDateString(),
            amount: l.amount
        }));

        const total = simplifiedLogs.reduce((sum: number, l: any) => sum + l.amount, 0);
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
            return NextResponse.json({ result: getWalletFallback(logs) });
        }

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error('Wallet analysis error:', error);
        return NextResponse.json({ result: getWalletFallback(logs) });
    }
}

// Fallback functions
function getFallbackInsight(amount: number): string {
    const growth5yr = Math.round(amount * 2.5);
    const fallbacks = [
        `The casino would have eaten this ₱${amount.toLocaleString()} in seconds. But in a solid index fund? This becomes ₱${growth5yr.toLocaleString()} in 5 years. Your patience is your profit.`,
        `Every peso you don't gamble is a peso that works for you. This ₱${amount.toLocaleString()} could become ₱${growth5yr.toLocaleString()} while you sleep. The house always wins - unless you're not playing.`,
        `Casinos are designed to extract money from the impatient. You just proved you're smarter than their algorithms. This ₱${amount.toLocaleString()} is now yours to grow.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
                prediction: `Let this money work for you instead of losing it to the casino. In 5 years, this could fund a sari-sari store or a car downpayment. Make money your slave, not your master.`,
                projectedValue: `₱${(amount * 3).toLocaleString()} - ₱${(amount * 4).toLocaleString()}`,
                roi: "Financial Freedom",
                color: "purple",
                timeHorizon: "5 Years"
            }
        ]
    };
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
