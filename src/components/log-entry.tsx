"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LogEntryProps {
    onLog: (amount: number) => void
}

const SUCCESS_PHRASES = [
    "Future you is already thanking you.",
    "That's a win for your wallet.",
    "The house lost, you won.",
    "Smart money stays in your pocket.",
    "Building wealth, one decision at a time.",
    "Keep this streak alive!",
    "Imagine this compounding at 8%.",
    "You are the master of your fate.",
    "Better than a jackpot: Certainty.",
    "Gambling is a tax on hope. You just got a tax break.",
    "Secure the bag. 💼",
    "Victory against the impulse!",
    "Your discipline is your greatest asset.",
    "That's grocery money right there.",
    "Invest this and watch it grow.",
    "Zero risk, 100% savings.",
    "You just paid your future self.",
    "Casino CEO is crying right now.",
    "Brick by brick, you're building freedom.",
    "Safety net > Bet.",
    "Financial freedom feels better than a flush.",
    "This is how millionaires are made.",
    "You're stronger than the odds.",
    "Redirecting funds to 'Success' account.",
    "No house edge here.",
    "Winning is keeping your money.",
    "Instant 100% return by not losing it.",
    "Proud of you.",
    "That was close, but you won.",
    "Think of the interest looking at this.",
    "Money saved is money earned.",
    "Boss move.",
    "Legendary self-control.",
    "Not today, casino.",
    "Your portfolio likes this.",
    "Compounding starts now.",
    "Break the cycle. Keep the cash.",
    "You are rewriting your story.",
    "Odds of keeping this money: 100%.",
    "Score: You 1, Impulse 0.",
    "Another brick in your fortress of wealth.",
    "Pure profit.",
    "That's a nice dinner instead of a bad beat.",
    "Discipline equals freedom.",
    "Stay focused. Stay rich.",
    "The best bet is on yourself.",
    "Short term pain, long term gain.",
    "Walk away a winner.",
    "Nothing beats peace of mind.",
    "Bankroll protected."
];

// Quick amount suggestions
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function LogEntry({ onLog }: LogEntryProps) {
    const [amount, setAmount] = useState("")
    const [displayValue, setDisplayValue] = useState("")
    const [isLogged, setIsLogged] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-focus on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus()
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value.replace(/[^0-9.]/g, "")

        // Prevent multiple decimals
        const parts = raw.split('.')
        if (parts.length > 2) {
            raw = parts[0] + '.' + parts.slice(1).join('')
        }
        // Limit decimal places
        if (parts[1] && parts[1].length > 2) {
            raw = parts[0] + '.' + parts[1].substring(0, 2)
        }

        setAmount(raw)
        setDisplayValue(raw)
    }

    const formatCurrency = (val: string) => {
        if (!val) return ""
        const num = parseFloat(val)
        if (isNaN(num)) return ""
        return num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

    const handleBlur = () => {
        setIsFocused(false)
        if (amount) {
            setDisplayValue(formatCurrency(amount))
        }
    }

    const handleFocus = () => {
        setIsFocused(true)
        setDisplayValue(amount)
    }

    const handleQuickAmount = (quickAmount: number) => {
        const newAmount = (parseFloat(amount) || 0) + quickAmount
        setAmount(newAmount.toString())
        setDisplayValue(formatCurrency(newAmount.toString()))
        inputRef.current?.focus()
    }

    const triggerLog = () => {
        const val = parseFloat(amount)
        if (!isNaN(val) && val > 0) {
            setIsLogged(true)
            onLog(val)

            // Pick random phrase
            const randomPhrase = SUCCESS_PHRASES[Math.floor(Math.random() * SUCCESS_PHRASES.length)];
            setSuccessMessage(randomPhrase);

            setTimeout(() => {
                setIsLogged(false)
                setAmount("")
                setDisplayValue("")
            }, 3500)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        triggerLog()
    }

    const parsedAmount = parseFloat(amount) || 0

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!isLogged ? (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        {/* Main Input Card */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-2xl blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

                            <div className="relative card-premium p-6 space-y-5">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <label htmlFor="amount-input" className="text-sm font-semibold text-slate-400 uppercase tracking-wider cursor-pointer flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        Amount to Guard
                                    </label>
                                    {parsedAmount > 0 && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"
                                        >
                                            5yr: ₱{Math.round(parsedAmount * 2.5).toLocaleString()}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Input Field */}
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/80 font-mono text-3xl pointer-events-none select-none">₱</span>
                                    <Input
                                        ref={inputRef}
                                        id="amount-input"
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder="0"
                                        value={displayValue}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        onFocus={handleFocus}
                                        className="pl-12 text-4xl font-mono font-bold input-dark h-20 rounded-xl text-white placeholder:text-slate-700 text-right pr-4"
                                        autoComplete="off"
                                        aria-label="Amount in Pesos"
                                    />
                                </div>

                                {/* Quick Amount Chips */}
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_AMOUNTS.map((quickAmount) => (
                                        <button
                                            key={quickAmount}
                                            type="button"
                                            onClick={() => handleQuickAmount(quickAmount)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                                        >
                                            +₱{quickAmount.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={!amount || parsedAmount <= 0}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => { e.preventDefault(); triggerLog(); }}
                                    className="w-full h-14 btn-primary rounded-xl text-base tracking-wide relative overflow-hidden group/btn"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Log & Guard
                                        <ShieldCheck className="w-5 h-5" />
                                    </span>
                                    {/* Shimmer effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                </Button>
                            </div>
                        </div>

                        {/* Privacy Note */}
                        <p className="text-center text-[10px] text-slate-600 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            All data is private and stored locally on your device
                        </p>
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
                    >
                        {/* Success Icon */}
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                                className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-30"
                            />
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                            >
                                <Coins className="w-12 h-12 text-white drop-shadow-lg" />
                            </motion.div>
                        </div>

                        {/* Success Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                        >
                            <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                                Funds Secured!
                            </h3>
                            <div className="text-lg text-slate-300">
                                You just protected{" "}
                                <span className="text-emerald-400 font-black font-mono text-2xl">
                                    ₱{parseFloat(amount).toLocaleString()}
                                </span>
                            </div>
                        </motion.div>

                        {/* Motivational Quote */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card-premium p-5 max-w-sm mx-auto"
                        >
                            <p className="text-emerald-200 italic font-medium leading-relaxed">
                                "{successMessage}"
                            </p>
                        </motion.div>

                        {/* Growth Preview */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xs text-slate-500 flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Potential 5yr growth: ₱{Math.round(parseFloat(amount) * 2.5).toLocaleString()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
