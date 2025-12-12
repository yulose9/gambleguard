"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Bitcoin, TrendingUp, DollarSign, Target, Sparkles, Clock, AlertTriangle } from "lucide-react"

interface InvestmentInsightProps {
    amount: number
    data: string | null
    isLoading: boolean
}

interface InvestmentCard {
    title: string
    icon: "crypto" | "stock" | "safe" | "goal"
    prediction: string
    projectedValue: string
    roi: string
    color: "amber" | "emerald" | "blue" | "purple"
    timeHorizon?: string
}

interface AnalysisData {
    cards: InvestmentCard[]
}

const colorSchemes = {
    amber: {
        gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
        border: "border-amber-500/30",
        borderHover: "hover:border-amber-400/50",
        glow: "bg-amber-500",
        text: "text-amber-100",
        textMuted: "text-amber-200/80",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        icon: "text-amber-400",
        iconBg: "bg-amber-500/20"
    },
    emerald: {
        gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
        border: "border-emerald-500/30",
        borderHover: "hover:border-emerald-400/50",
        glow: "bg-emerald-500",
        text: "text-emerald-100",
        textMuted: "text-emerald-200/80",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: "text-emerald-400",
        iconBg: "bg-emerald-500/20"
    },
    blue: {
        gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
        border: "border-blue-500/30",
        borderHover: "hover:border-blue-400/50",
        glow: "bg-blue-500",
        text: "text-blue-100",
        textMuted: "text-blue-200/80",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: "text-blue-400",
        iconBg: "bg-blue-500/20"
    },
    purple: {
        gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
        border: "border-purple-500/30",
        borderHover: "hover:border-purple-400/50",
        glow: "bg-purple-500",
        text: "text-purple-100",
        textMuted: "text-purple-200/80",
        badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        icon: "text-purple-400",
        iconBg: "bg-purple-500/20"
    }
}

export function InvestmentInsight({ amount, data, isLoading }: InvestmentInsightProps) {

    const parsedData = useMemo(() => {
        if (!data) return null;
        try {
            const cleanJson = data.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson) as AnalysisData;
        } catch (e) {
            console.error("Failed to parse investment data", e);
            return null;
        }
    }, [data]);

    if (amount <= 0) return null

    // Premium Loading State
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <div className="absolute inset-0 blur-md bg-emerald-400/30 animate-ping" />
                    </div>
                    <span className="text-sm text-slate-400 font-medium">AI analyzing investment opportunities...</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="h-72 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl border border-slate-800/50 overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <div className="w-10 h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                                    <div className="w-16 h-6 bg-slate-800/50 rounded-full animate-pulse" />
                                </div>
                                <div className="w-3/4 h-5 bg-slate-800/50 rounded animate-pulse" />
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-slate-800/50 rounded animate-pulse" />
                                    <div className="w-5/6 h-3 bg-slate-800/50 rounded animate-pulse" />
                                    <div className="w-4/6 h-3 bg-slate-800/50 rounded animate-pulse" />
                                </div>
                                <div className="pt-4 space-y-3">
                                    <div className="w-2/3 h-8 bg-slate-800/50 rounded animate-pulse" />
                                    <div className="w-full h-10 bg-slate-800/50 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!parsedData) return null;

    const getIcon = (type: string, colorClass: string) => {
        const iconProps = { className: `w-5 h-5 ${colorClass}` };
        switch (type) {
            case 'crypto': return <Bitcoin {...iconProps} />;
            case 'safe': return <DollarSign {...iconProps} />;
            case 'goal': return <Target {...iconProps} />;
            default: return <TrendingUp {...iconProps} />;
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                        AI-Powered Projections
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Not financial advice</span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {parsedData.cards.map((card, idx) => {
                    const scheme = colorSchemes[card.color] || colorSchemes.emerald;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: idx * 0.1,
                                duration: 0.5,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="group"
                        >
                            <div className={`
                                relative h-full rounded-2xl overflow-hidden
                                bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90
                                backdrop-blur-xl
                                border ${scheme.border} ${scheme.borderHover}
                                transition-all duration-500 ease-out
                                hover:shadow-2xl hover:shadow-black/20
                                hover:-translate-y-1
                            `}>
                                {/* Ambient Glow Effect */}
                                <div className={`
                                    absolute -top-20 -right-20 w-40 h-40 
                                    ${scheme.glow} rounded-full 
                                    blur-[80px] opacity-20
                                    group-hover:opacity-40 group-hover:scale-110
                                    transition-all duration-700
                                `} />

                                {/* Subtle Grid Pattern */}
                                <div className="absolute inset-0 opacity-[0.02]"
                                    style={{
                                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                                        backgroundSize: '24px 24px'
                                    }}
                                />

                                {/* Content */}
                                <div className="relative p-6 flex flex-col h-full min-h-[280px]">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`
                                            p-3 rounded-xl ${scheme.iconBg}
                                            border border-white/5
                                            shadow-lg shadow-black/10
                                        `}>
                                            {getIcon(card.icon, scheme.icon)}
                                        </div>

                                        {card.timeHorizon && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                                    {card.timeHorizon}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className={`text-base font-bold uppercase tracking-wide mb-3 ${scheme.text}`}>
                                        {card.title}
                                    </h3>

                                    {/* Prediction Text */}
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium flex-grow line-clamp-3 mb-6">
                                        {card.prediction}
                                    </p>

                                    {/* Value Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5">
                                                Projected Value
                                            </div>
                                            <div className={`
                                                font-black font-mono tracking-tight leading-none
                                                bg-gradient-to-r ${scheme.gradient.replace('to-transparent', `to-white`)} 
                                                bg-clip-text text-transparent
                                                ${card.projectedValue.length > 20 ? 'text-xl' : 'text-2xl'}
                                            `} style={{ WebkitTextFillColor: 'white' }}>
                                                {card.projectedValue}
                                            </div>
                                        </div>

                                        {/* ROI Badge */}
                                        <div className={`
                                            w-full py-3 px-4 rounded-xl
                                            ${scheme.badge} border
                                            text-center font-bold text-xs uppercase tracking-wider
                                            backdrop-blur-sm
                                        `}>
                                            {card.roi}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900/30 border border-slate-800/30"
            >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500/60" />
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                    Research first before you invest. Past performance ≠ future results.
                </p>
            </motion.div>
        </div>
    )
}
