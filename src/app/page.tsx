"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { LogEntry } from "@/components/log-entry"
import { VersusMode } from "@/components/versus-mode"
import { GeminiInsight } from "@/components/gemini-insight"
import { InvestmentInsight } from "@/components/investment-insight"
import { WalletView, TransactionLog } from "@/components/wallet-view"
import { ShieldCheck, TrendingUp, Wallet, CloudUpload, Sparkles, Menu, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SlotCounter } from "@/components/ui/slot-counter"

import { getGeminiInsight, getGeminiInvestmentAnalysis } from "@/lib/gemini"

// Real-time sync interval (3 seconds)
const SYNC_INTERVAL = 3000

// API-based Gemini calls to avoid server action cache issues
async function fetchGeminiInsight(amount: number): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini?action=insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    if (res.ok) {
      const data = await res.json()
      return data.result || null
    }
  } catch (error) {
    console.error('Failed to fetch insight:', error)
  }
  return null
}

async function fetchGeminiInvestment(amount: number): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini?action=investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    if (res.ok) {
      const data = await res.json()
      return data.result || null
    }
  } catch (error) {
    console.error('Failed to fetch investment:', error)
  }
  return null
}

export default function Home() {
  // State for Tabs
  const [activeTab, setActiveTab] = useState<"guard" | "invest" | "wallet">("guard")

  // State for Logs (SHARED GLOBAL DATABASE)
  const [logs, setLogs] = useState<TransactionLog[]>([])

  // State for persistent Insight
  const [insight, setInsight] = useState<string | null>(null)
  const [isInsightLoading, setIsInsightLoading] = useState(false)

  // State for persistent Investment Analysis
  const [investmentData, setInvestmentData] = useState<string | null>(null)
  const [isInvestmentLoading, setIsInvestmentLoading] = useState(false)

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Derived State
  const sessionSaved = logs.reduce((acc, log) => acc + log.amount, 0)
  const [lastAdded, setLastAdded] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch logs from SHARED database
  const fetchLogs = useCallback(async (showLoading = false) => {
    if (showLoading) setIsSyncing(true)
    try {
      const res = await fetch('/api/shared-logs')
      if (res.ok) {
        const data = await res.json()
        if (data.logs) {
          setLogs(data.logs)
          setLastSyncTime(new Date())
        }
      }
    } catch (error) {
      console.error('Failed to fetch shared logs:', error)
    } finally {
      if (showLoading) setIsSyncing(false)
      setIsLoading(false)
    }
  }, [])

  // Initial load + Real-time polling
  useEffect(() => {
    // Initial fetch
    fetchLogs(true)

    // Set up real-time polling
    if (isRealTimeEnabled) {
      syncIntervalRef.current = setInterval(() => {
        fetchLogs(false) // Silent background sync
      }, SYNC_INTERVAL)
    }

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [fetchLogs, isRealTimeEnabled])

  // Add log to SHARED database
  const handleLog = async (amount: number) => {
    try {
      const res = await fetch('/api/shared-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          category: 'Gambling Prevention',
          note: 'Resisted urge to gamble',
          type: 'saved'
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newLog: TransactionLog = {
          id: data.logId,
          amount: amount,
          timestamp: new Date().toISOString(),
          type: 'saved',
          category: 'Gambling Prevention',
          note: 'Resisted urge to gamble'
        }
        // Optimistic update + will be synced on next poll
        setLogs(prev => [newLog, ...prev])
        setLastAdded(amount)
        setTimeout(() => setLastAdded(null), 3000)
      }
    } catch (error) {
      console.error('Failed to save log:', error)
    }

    // Fetch AI Insight & Investment Analysis via API routes
    const newTotal = sessionSaved + amount

    setIsInsightLoading(true)
    setIsInvestmentLoading(true)

    fetchGeminiInsight(newTotal)
      .then((aiText) => {
        if (aiText) setInsight(aiText)
      })
      .finally(() => setIsInsightLoading(false))

    fetchGeminiInvestment(newTotal)
      .then((investJson) => {
        if (investJson) setInvestmentData(investJson)
      })
      .finally(() => setIsInvestmentLoading(false))
  }

  // Manual sync
  const handleManualSync = () => {
    fetchLogs(true)
  }

  // Delete single log from SHARED database
  const handleDeleteLog = async (logId: string) => {
    // Optimistic update
    setLogs(prev => prev.filter(log => log.id !== logId))

    try {
      await fetch(`/api/shared-logs?id=${logId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete log:', error)
      // Refetch to restore if failed
      fetchLogs(false)
    }
  }

  // Delete all logs from SHARED database
  const handleDeleteAllLogs = async () => {
    // Optimistic update
    setLogs([])
    setInsight(null)
    setInvestmentData(null)

    try {
      await fetch('/api/shared-logs?all=true', { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete all logs:', error)
      fetchLogs(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-indigo-500/8 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto min-h-screen flex flex-col p-4 md:p-6 pb-28 z-10">

        {/* Header */}
        <header className="flex items-center justify-between py-3 md:py-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/40 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                <ShieldCheck className="text-white w-6 h-6 drop-shadow-md" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GambleGuard
                </h1>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  BETA
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-[0.12em] uppercase block mt-0.5">
                Break Free • Build Wealth
              </span>
            </div>
          </div>

          {/* Real-Time Sync Indicator */}
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">LIVE</span>
            </div>

            {/* Manual sync button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="text-xs flex items-center gap-1.5 transition-all border rounded-full px-3 py-1.5 disabled:opacity-40 text-slate-500 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "guard" && (
            <motion.div
              key="guard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center flex-1 min-h-[75vh] gap-6"
            >
              {/* Hero Counter */}
              <div className="text-center space-y-3 relative z-10">
                <h2 className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                  <Wallet className="w-3.5 h-3.5" />
                  Total Wealth Preserved
                </h2>

                <div className="relative inline-block">
                  {/* Glow behind counter */}
                  {sessionSaved > 0 && (
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
                  )}

                  <div className="relative text-6xl md:text-8xl font-black font-mono tracking-tighter py-2 leading-none">
                    <span className="mr-2 text-emerald-400/90 text-4xl md:text-6xl align-top select-none">₱</span>
                    <SlotCounter value={sessionSaved} />
                  </div>

                  {/* Floating Added Indicator */}
                  <AnimatePresence>
                    {lastAdded && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: -70, scale: 1 }}
                        exit={{ opacity: 0, y: -90, scale: 0.8 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 text-xl md:text-2xl font-black text-emerald-300 bg-emerald-950/95 px-5 py-2 rounded-full border border-emerald-500/40 whitespace-nowrap z-50 shadow-xl shadow-emerald-500/20 font-mono backdrop-blur-sm"
                      >
                        +₱{lastAdded.toLocaleString()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Streak indicator */}
                {logs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-xs text-slate-500"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{logs.length} saves this session</span>
                  </motion.div>
                )}
              </div>

              {/* Main Interaction */}
              <div className="w-full max-w-md mx-auto space-y-5 z-20">
                <LogEntry onLog={handleLog} />

                {sessionSaved > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <GeminiInsight
                      amount={sessionSaved}
                      insight={insight}
                      isLoading={isInsightLoading}
                    />
                  </motion.div>
                )}

                {sessionSaved === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center py-4"
                  >
                    <p className="text-xs text-slate-600 font-medium">
                      Enter the amount you were tempted to gamble
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "invest" && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-4 pb-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Investment Projections</h2>
                    <p className="text-xs text-slate-500">See what your money could become</p>
                  </div>
                </div>
                {sessionSaved > 0 && (
                  <div className="hidden md:block text-right">
                    <span className="text-xs text-slate-500">Analyzing</span>
                    <div className="text-lg font-bold font-mono text-emerald-400">₱{sessionSaved.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {sessionSaved > 0 ? (
                <div className="space-y-6">
                  <InvestmentInsight
                    amount={sessionSaved}
                    data={investmentData}
                    isLoading={isInvestmentLoading}
                  />
                  <VersusMode amount={sessionSaved} />
                </div>
              ) : (
                <div className="card-premium rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium">No savings to project yet</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Log some savings on the Guard tab to see projections
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "wallet" && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="pt-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Wallet History</h2>
                  <p className="text-xs text-slate-500">Track your discipline over time</p>
                </div>
              </div>

              <WalletView
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onDeleteAllLogs={handleDeleteAllLogs}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom">
          <div className="max-w-sm mx-auto">
            <div className="h-16 bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex items-center justify-around shadow-2xl shadow-black/30">
              {[
                { id: 'guard' as const, icon: ShieldCheck, label: 'Guard' },
                { id: 'invest' as const, icon: TrendingUp, label: 'Invest' },
                { id: 'wallet' as const, icon: Wallet, label: 'Wallet' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${activeTab === id
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-emerald-500/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${activeTab === id ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                  <span className="text-[10px] font-semibold relative z-10">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </main>
  )
}
