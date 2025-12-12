"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PasskeyLogin } from '@/components/auth/passkey-login'
import { PasskeyRegister } from '@/components/auth/passkey-register'
import { ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const router = useRouter()

    const handleLoginSuccess = () => {
        // Redirect to main app after successful login
        setTimeout(() => {
            router.push('/')
            router.refresh()
        }, 1500)
    }

    const handleRegisterSuccess = () => {
        // Redirect to main app after successful registration
        setTimeout(() => {
            router.push('/')
            router.refresh()
        }, 1500)
    }

    return (
        <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] bg-emerald-500/8 rounded-full blur-[150px]" />
                <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-indigo-500/8 rounded-full blur-[150px]" />
            </div>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8 z-10"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/40 rounded-xl blur-xl opacity-60" />
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                        <ShieldCheck className="text-white w-7 h-7 drop-shadow-md" />
                    </div>
                </div>
                <div>
                    <h1 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        GambleGuard
                    </h1>
                    <span className="text-[10px] text-slate-500 font-semibold tracking-[0.12em] uppercase">
                        Break Free • Build Wealth
                    </span>
                </div>
            </motion.div>

            {/* Auth Cards */}
            <div className="relative z-10 w-full max-w-md">
                <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <PasskeyLogin
                                onSuccess={handleLoginSuccess}
                                onSwitchToRegister={() => setMode('register')}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <PasskeyRegister onSuccess={handleRegisterSuccess} />
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Already have a passkey? <span className="text-indigo-400">Sign in</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center z-10"
            >
                <p className="text-xs text-slate-600 max-w-sm">
                    🔐 Your passkey is stored securely on your device using Face ID (iPhone) or Windows Hello.
                    No passwords are used or stored.
                </p>
            </motion.div>
        </main>
    )
}
