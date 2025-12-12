"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Shield } from "lucide-react"

interface GeminiInsightProps {
    amount: number
    insight: string | null
    isLoading: boolean
}

export function GeminiInsight({ amount, insight, isLoading }: GeminiInsightProps) {
    return (
        <div className="w-full relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/30 via-cyan-500/20 to-emerald-600/30 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-700" />

            {/* Main Container */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]">
                    <div className="h-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                </div>

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col gap-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-xl border border-emerald-500/20">
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    {isLoading && (
                                        <div className="absolute -inset-1 bg-emerald-500/30 rounded-xl blur-md animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="w-3 h-3" />
                                        AI Guardian
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Psychological Defense System</p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Protected</span>
                            </div>
                        </div>

                        {/* Insight Content */}
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3 py-2"
                                >
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <div className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                                        <span>AI analyzing your decision...</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-800/50 rounded-full w-full animate-pulse" />
                                        <div className="h-4 bg-slate-800/50 rounded-full w-4/5 animate-pulse" />
                                        <div className="h-4 bg-slate-800/50 rounded-full w-3/5 animate-pulse" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="relative"
                                >
                                    {/* Quote Mark */}
                                    <div className="absolute -top-2 -left-1 text-4xl font-serif text-emerald-500/20 select-none">"</div>

                                    {/* Main Text */}
                                    <p className="text-base md:text-lg font-medium text-slate-200 leading-relaxed pl-4 border-l-2 border-emerald-500/30">
                                        {insight || getDefaultInsight(amount)}
                                    </p>

                                    {/* Quote Mark End */}
                                    <div className="absolute -bottom-4 right-4 text-4xl font-serif text-emerald-500/20 select-none rotate-180">"</div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-4 pt-4 border-t border-slate-800/50 mt-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                    ₱{amount.toLocaleString()} Protected
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-600">
                                Potential 5yr growth: <span className="text-emerald-400 font-bold">₱{Math.round(amount * 2.5).toLocaleString()}</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getDefaultInsight(amount: number): string {
    const growth = Math.round(amount * 2.5);
    return `Every peso you don't gamble becomes a soldier in your wealth army. This ₱${amount.toLocaleString()} could become ₱${growth.toLocaleString()} in 5 years while you sleep.`;
}
