"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import { format, isToday, isYesterday } from "date-fns"
import {
    Search, Download, TrendingUp,
    Sparkles, CheckCircle2, Clock,
    ArrowUpRight, Wallet as WalletIcon, Trash2,
    AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWalletAnalysis } from "@/lib/gemini"

// NoSQL-style Document Interface
export interface TransactionLog {
    id: string
    amount: number
    timestamp: string
    type: "saved" | "spent"
    category?: string
    note?: string
}

interface WalletViewProps {
    logs: TransactionLog[]
    onDeleteLog?: (logId: string) => void
    onDeleteAllLogs?: () => void
}

// Swipeable Transaction Item Component with proper reveal behavior
function SwipeableTransaction({
    log,
    index,
    onDelete,
    formatDate
}: {
    log: TransactionLog
    index: number
    onDelete: (id: string) => void
    formatDate: (timestamp: string) => string
}) {
    const x = useMotionValue(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Transform for delete button opacity and scale
    const deleteOpacity = useTransform(x, [-80, -40, 0], [1, 0.5, 0])
    const deleteScale = useTransform(x, [-80, -40, 0], [1, 0.8, 0.6])
    const cardOpacity = useTransform(x, [-200, -100], [0, 1])

    const handleDragEnd = () => {
        const currentX = x.get()

        if (currentX < -50) {
            // Reveal delete button - snap to -80px
            animate(x, -80, { type: "spring", stiffness: 500, damping: 30 })
            setIsRevealed(true)
        } else {
            // Reset position
            animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
            setIsRevealed(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        // Animate out
        await animate(x, -300, { duration: 0.3, ease: "easeInOut" })
        onDelete(log.id)
    }

    const handleReset = () => {
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
        setIsRevealed(false)
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
                opacity: isDeleting ? 0 : 1,
                y: 0,
                scale: 1,
                height: isDeleting ? 0 : "auto",
                marginBottom: isDeleting ? 0 : 8
            }}
            exit={{
                opacity: 0,
                x: -300,
                scale: 0.8,
                height: 0,
                marginBottom: 0,
                transition: { duration: 0.3, ease: "easeInOut" }
            }}
            transition={{
                delay: index * 0.05,
                layout: { type: "spring", stiffness: 300, damping: 25 }
            }}
            className="relative overflow-hidden rounded-xl"
        >
            {/* Delete Button Background - Always present but revealed on swipe */}
            <motion.div
                style={{ opacity: deleteOpacity, scale: deleteScale }}
                className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center"
            >
                <motion.button
                    onClick={handleDelete}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1 px-4 py-3 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                    <motion.div
                        animate={{ rotate: isRevealed ? [0, -10, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Trash2 className="w-5 h-5 text-red-400" />
                    </motion.div>
                    <span className="text-[10px] text-red-400 font-semibold">Delete</span>
                </motion.button>
            </motion.div>

            {/* Swipeable Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={isRevealed ? handleReset : undefined}
                style={{ x, opacity: cardOpacity }}
                className="card-premium rounded-xl p-4 group hover:border-emerald-500/30 transition-all cursor-grab active:cursor-grabbing relative z-10 bg-slate-900/95"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Status Icon with pulse animation on new items */}
                        <motion.div
                            className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors"
                            initial={isToday(new Date(log.timestamp)) ? { scale: 0.8 } : {}}
                            animate={isToday(new Date(log.timestamp)) ? {
                                scale: [1, 1.1, 1],
                                transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
                            } : {}}
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </motion.div>

                        {/* Details */}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                    {formatDate(log.timestamp)}
                                </span>
                                {isToday(new Date(log.timestamp)) && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded"
                                    >
                                        NEW
                                    </motion.span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{format(new Date(log.timestamp), 'h:mm a')}</span>
                                <span>•</span>
                                <motion.span
                                    className="text-slate-600"
                                    animate={{ opacity: isRevealed ? 0 : 0.7 }}
                                >
                                    ← Swipe to delete
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                        <motion.div
                            className="font-mono font-black text-lg text-emerald-400"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                        >
                            +₱{log.amount.toLocaleString()}
                        </motion.div>
                        <div className="text-[10px] text-slate-600 font-mono">
                            #{log.id.slice(0, 8)}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

// Delete All Confirmation Modal with enhanced animations
function DeleteAllModal({
    isOpen,
    onClose,
    onConfirm,
    logCount,
    totalAmount,
    isDeleting
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    logCount: number
    totalAmount: number
    isDeleting: boolean
}) {
    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop with blur */}
            <motion.div
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: "blur(8px)" }}
                exit={{ backdropFilter: "blur(0px)" }}
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            />

            {/* Modal with bounce animation */}
            <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative w-full max-w-md"
            >
                <div className="card-premium rounded-2xl p-6 border-red-500/30 overflow-hidden">
                    {/* Animated background pulse */}
                    <motion.div
                        className="absolute inset-0 bg-red-500/5"
                        animate={{ opacity: [0.05, 0.1, 0.05] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Warning Icon with shake animation */}
                    <motion.div
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center relative z-10"
                        animate={{ rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        className="text-xl font-bold text-center text-white mb-2 relative z-10"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Delete All Logs?
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-center text-slate-400 text-sm mb-4 relative z-10"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        This action cannot be undone. You are about to permanently delete:
                    </motion.p>

                    {/* Stats with count-up animation feel */}
                    <motion.div
                        className="bg-red-500/10 rounded-xl p-4 mb-6 relative z-10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-sm">Total Logs:</span>
                            <motion.span
                                className="font-bold text-red-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {logCount} entries
                            </motion.span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Total Value:</span>
                            <motion.span
                                className="font-mono font-bold text-red-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                ₱{totalAmount.toLocaleString()}
                            </motion.span>
                        </div>
                    </motion.div>

                    {/* Warning text with typewriter effect feel */}
                    <motion.p
                        className="text-center text-xs text-slate-500 mb-6 relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        ⚠️ All your progress will be lost forever
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        className="flex gap-3 relative z-10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.button
                            onClick={onClose}
                            disabled={isDeleting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800/50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <motion.div
                                        className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete All
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export function WalletView({ logs, onDeleteLog, onDeleteAllLogs }: WalletViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [analysis, setAnalysis] = useState<string>("Analyzing your saving habits...")
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Derived State
    const totalSaved = logs.reduce((acc, log) => acc + log.amount, 0)
    const averageEntry = logs.length > 0 ? totalSaved / logs.length : 0
    const highestSave = logs.length > 0 ? Math.max(...logs.map(l => l.amount)) : 0
    const todaySaved = logs
        .filter(l => isToday(new Date(l.timestamp)))
        .reduce((acc, l) => acc + l.amount, 0)

    // Filtered logs based on search
    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs
        const query = searchQuery.toLowerCase()
        return logs.filter(log =>
            log.amount.toString().includes(query) ||
            log.category?.toLowerCase().includes(query) ||
            format(new Date(log.timestamp), 'MMM d, yyyy').toLowerCase().includes(query)
        )
    }, [logs, searchQuery])

    // Get AI Analysis
    useEffect(() => {
        if (logs.length > 0) {
            setIsAnalysisLoading(true)
            const fetchAnalysis = async () => {
                const result = await getWalletAnalysis(logs)
                if (result) setAnalysis(result)
                setIsAnalysisLoading(false)
            }
            fetchAnalysis()
        } else {
            setAnalysis("Start logging your savings to get AI-powered financial insights.")
        }
    }, [logs])

    // Format date with relative labels
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp)
        if (isToday(date)) return "Today"
        if (isYesterday(date)) return "Yesterday"
        return format(date, 'MMM d, yyyy')
    }

    // Handle single log deletion
    const handleDeleteLog = async (logId: string) => {
        if (!onDeleteLog) return
        await onDeleteLog(logId)
    }

    // Handle delete all
    const handleDeleteAll = async () => {
        if (!onDeleteAllLogs) return
        setIsDeleting(true)
        try {
            await onDeleteAllLogs()
            setShowDeleteAllModal(false)
        } finally {
            setIsDeleting(false)
        }
    }

    // Export to CSV
    const handleExport = () => {
        if (logs.length === 0) return
        const headers = ['Date', 'Time', 'Amount', 'Category', 'Note']
        const rows = logs.map(log => [
            format(new Date(log.timestamp), 'yyyy-MM-dd'),
            format(new Date(log.timestamp), 'HH:mm:ss'),
            log.amount.toString(),
            log.category || '',
            log.note || ''
        ])
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gambleguard-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <>
            {/* Delete All Modal */}
            <AnimatePresence>
                {showDeleteAllModal && (
                    <DeleteAllModal
                        isOpen={showDeleteAllModal}
                        onClose={() => setShowDeleteAllModal(false)}
                        onConfirm={handleDeleteAll}
                        logCount={logs.length}
                        totalAmount={totalSaved}
                        isDeleting={isDeleting}
                    />
                )}
            </AnimatePresence>

            <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
                {/* Stats Grid with stagger animation */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    {[
                        { icon: WalletIcon, label: "Total Saved", value: totalSaved, color: "emerald" },
                        { icon: Clock, label: "Today", value: todaySaved, color: "blue" },
                        { icon: TrendingUp, label: "Avg. Entry", value: Math.round(averageEntry), color: "amber" },
                        { icon: ArrowUpRight, label: "Best Save", value: highestSave, color: "purple" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className={`flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2`}>
                                        <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-500`} />
                                        {stat.label}
                                    </div>
                                    <motion.div
                                        className={`text-2xl font-black text-${stat.color}-400 font-mono`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                    >
                                        ₱{stat.value.toLocaleString()}
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* AI Insight Card */}
                <Card className="card-premium border-indigo-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/20">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                            </div>
                            AI Pattern Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {isAnalysisLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-sm text-slate-400"
                                >
                                    <motion.div
                                        className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Analyzing patterns...
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="content"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-slate-300 leading-relaxed"
                                >
                                    {analysis}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Search & Controls */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by amount or date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full input-dark rounded-xl pl-10 pr-4 py-2.5 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            onClick={handleExport}
                            disabled={logs.length === 0}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2.5 card-premium rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </motion.button>
                        {onDeleteAllLogs && logs.length > 0 && (
                            <motion.button
                                onClick={() => setShowDeleteAllModal(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2.5 card-premium rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete All
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Swipe Hint with animation */}
                {logs.length > 0 && onDeleteLog && (
                    <motion.div
                        className="flex items-center gap-2 px-1 text-[10px] text-slate-600"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.span
                            className="inline-block w-6 h-0.5 bg-gradient-to-r from-slate-500 to-transparent"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span>Swipe left on any transaction to reveal delete</span>
                    </motion.div>
                )}

                {/* Transaction List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                            Transaction History
                        </span>
                        <motion.span
                            className="text-xs text-slate-600"
                            key={filteredLogs.length}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
                        </motion.span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {filteredLogs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="card-premium rounded-xl p-12 text-center"
                            >
                                <motion.div
                                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <WalletIcon className="w-8 h-8 text-slate-600" />
                                </motion.div>
                                <p className="text-slate-500 font-medium">
                                    {searchQuery ? 'No matching transactions' : 'No transactions yet'}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                    {searchQuery ? 'Try a different search term' : 'Start by logging your first save on the Guard tab'}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div layout className="space-y-2">
                                {filteredLogs.map((log, index) => (
                                    onDeleteLog ? (
                                        <SwipeableTransaction
                                            key={log.id}
                                            log={log}
                                            index={index}
                                            onDelete={handleDeleteLog}
                                            formatDate={formatDate}
                                        />
                                    ) : (
                                        <motion.div
                                            key={log.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="card-premium rounded-xl p-4 group hover:border-emerald-500/30 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-white">
                                                                {formatDate(log.timestamp)}
                                                            </span>
                                                            {isToday(new Date(log.timestamp)) && (
                                                                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                                                                    NEW
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span>{format(new Date(log.timestamp), 'h:mm a')}</span>
                                                            <span>•</span>
                                                            <span className="text-emerald-500/70">Disciplined</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono font-black text-lg text-emerald-400">
                                                        +₱{log.amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-600 font-mono">
                                                        #{log.id.slice(0, 8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Stats Summary */}
                {logs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-premium rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <motion.span
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span>Streak: {logs.length} saves</span>
                            </div>
                            <div className="text-slate-500">
                                Potential 5yr value: <span className="text-emerald-400 font-bold font-mono">₱{Math.round(totalSaved * 2.5).toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    )
}
