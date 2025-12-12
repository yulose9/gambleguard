"use client"

import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, Bitcoin, Cpu, PiggyBank, Flame, Info } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, ReferenceLine } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"

const chartConfig = {
    invested: {
        label: "S&P 500",
        color: "#3b82f6",
    },
    bitcoin: {
        label: "Bitcoin",
        color: "#f59e0b",
    },
    nvidia: {
        label: "NVIDIA",
        color: "#10b981",
    },
    gambled: {
        label: "Casino Loss",
        color: "#ef4444",
    },
} satisfies ChartConfig

interface VersusModeProps {
    amount: number
}

export function VersusMode({ amount }: VersusModeProps) {
    const [hoveredYear, setHoveredYear] = useState<number | null>(null)

    const data = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => {
            const year = new Date().getFullYear() + i

            // S&P 500: ~10% avg annual return
            const investedVal = amount * Math.pow(1.10, i)

            // Bitcoin: Volatile, ~40% historical (optimistic)
            const btcVal = amount * Math.pow(1.40, i)

            // NVIDIA: AI boom, ~25%
            const nvdaVal = amount * Math.pow(1.25, i)

            // Gambling: Consistent loss (-50% per year represents the reality)
            const gambledVal = amount * Math.pow(0.5, i)

            return {
                year: year.toString(),
                invested: Math.round(investedVal),
                bitcoin: Math.round(btcVal),
                nvidia: Math.round(nvdaVal),
                gambled: Math.round(gambledVal),
            }
        })
    }, [amount])

    const finalYear = data[data.length - 1]
    const btcGrowth = ((finalYear.bitcoin - amount) / amount * 100).toFixed(0)
    const casinoLoss = ((amount - finalYear.gambled) / amount * 100).toFixed(0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
        >
            <Card className="card-premium overflow-hidden">
                {/* Header */}
                <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                Market vs. Casino
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                5-Year Wealth Trajectory Comparison
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                            <span className="text-xs text-slate-400">Starting:</span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                                ₱{amount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {/* Chart */}
                    <div className="h-[320px] w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={data}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    onMouseMove={(e) => {
                                        if (e?.activeTooltipIndex !== undefined) {
                                            setHoveredYear(e.activeTooltipIndex)
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredYear(null)}
                                >
                                    <defs>
                                        <linearGradient id="gradBtc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradNvda" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradSpy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradGambled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        vertical={false}
                                        stroke="rgba(255,255,255,0.03)"
                                        strokeDasharray="4 4"
                                    />

                                    {/* Reference line at starting amount */}
                                    <ReferenceLine
                                        y={amount}
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeDasharray="4 4"
                                        label={{
                                            value: 'Start',
                                            position: 'right',
                                            fill: '#64748b',
                                            fontSize: 10
                                        }}
                                    />

                                    <XAxis
                                        dataKey="year"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={12}
                                        stroke="#64748b"
                                        fontSize={11}
                                        fontWeight={500}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            if (val >= 1000000) return `₱${(val / 1000000).toFixed(1)}M`
                                            if (val >= 1000) return `₱${(val / 1000).toFixed(0)}k`
                                            return `₱${val}`
                                        }}
                                        stroke="#475569"
                                        fontSize={10}
                                        width={55}
                                    />

                                    <ChartTooltip
                                        cursor={{ stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 2 }}
                                        content={
                                            <ChartTooltipContent
                                                className="bg-slate-900/95 border-slate-700 backdrop-blur-xl rounded-lg shadow-xl"
                                                formatter={(value, name) => (
                                                    <span className="font-mono font-bold">
                                                        ₱{Number(value).toLocaleString()}
                                                    </span>
                                                )}
                                            />
                                        }
                                    />

                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{
                                            paddingTop: '16px',
                                            fontSize: '11px',
                                            fontWeight: 500
                                        }}
                                    />

                                    {/* Casino Loss - Background, dashed */}
                                    <Area
                                        type="monotone"
                                        dataKey="gambled"
                                        name="Casino Loss"
                                        fill="url(#gradGambled)"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        strokeDasharray="6 4"
                                        dot={false}
                                    />

                                    {/* S&P 500 */}
                                    <Area
                                        type="monotone"
                                        dataKey="invested"
                                        name="S&P 500"
                                        fill="url(#gradSpy)"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />

                                    {/* NVIDIA */}
                                    <Area
                                        type="monotone"
                                        dataKey="nvidia"
                                        name="NVIDIA"
                                        fill="url(#gradNvda)"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                    />

                                    {/* Bitcoin - Topmost */}
                                    <Area
                                        type="monotone"
                                        dataKey="bitcoin"
                                        name="Bitcoin"
                                        fill="url(#gradBtc)"
                                        stroke="#f59e0b"
                                        strokeWidth={2.5}
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </CardContent>

                {/* Footer Stats */}
                <CardFooter className="border-t border-slate-800/50 pt-5">
                    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Bitcoin */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                <Bitcoin className="w-3.5 h-3.5 text-amber-500" />
                                Bitcoin (5yr)
                            </div>
                            <div className="text-lg font-black font-mono text-amber-400">
                                ₱{finalYear.bitcoin.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +{btcGrowth}%
                            </div>
                        </div>

                        {/* NVIDIA */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                                NVIDIA (5yr)
                            </div>
                            <div className="text-lg font-black font-mono text-emerald-400">
                                ₱{finalYear.nvidia.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +{((finalYear.nvidia - amount) / amount * 100).toFixed(0)}%
                            </div>
                        </div>

                        {/* S&P 500 */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                <PiggyBank className="w-3.5 h-3.5 text-blue-500" />
                                S&P 500 (5yr)
                            </div>
                            <div className="text-lg font-black font-mono text-blue-400">
                                ₱{finalYear.invested.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +{((finalYear.invested - amount) / amount * 100).toFixed(0)}%
                            </div>
                        </div>

                        {/* Casino Reality */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                <Flame className="w-3.5 h-3.5 text-red-500" />
                                Casino (5yr)
                            </div>
                            <div className="text-lg font-black font-mono text-red-400">
                                ₱{finalYear.gambled.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                -{casinoLoss}% lost
                            </div>
                        </div>
                    </div>
                </CardFooter>

                {/* Disclaimer */}
                <div className="px-6 pb-4">
                    <div className="flex items-start gap-2 text-[10px] text-slate-600 bg-slate-900/50 rounded-lg px-3 py-2">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                            Historical averages used for illustration. Past performance does not guarantee future results.
                            Bitcoin and stocks carry significant risk.
                        </span>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
