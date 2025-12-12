"use client"

import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { motion } from 'framer-motion'
import { Fingerprint, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'

interface PasskeyLoginProps {
    onSuccess?: (data: { userId: string; username?: string }) => void;
    onError?: (error: string) => void;
    onSwitchToRegister?: () => void;
}

export function PasskeyLogin({ onSuccess, onError, onSwitchToRegister }: PasskeyLoginProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleLogin = async () => {
        setStatus('loading')
        setMessage('Starting authentication...')

        try {
            // Step 1: Get authentication options from server
            const optionsRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!optionsRes.ok) {
                const error = await optionsRes.json()
                throw new Error(error.error || 'Failed to start authentication')
            }

            const { options } = await optionsRes.json()
            setMessage('Please authenticate with your passkey...')

            // Step 2: Trigger the browser's WebAuthn prompt
            const authentication = await startAuthentication({ optionsJSON: options })

            setMessage('Verifying...')

            // Step 3: Send authentication response to server for verification
            const verifyRes = await fetch('/api/auth/login', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: authentication }),
            })

            if (!verifyRes.ok) {
                const error = await verifyRes.json()
                throw new Error(error.error || 'Authentication failed')
            }

            const result = await verifyRes.json()

            setStatus('success')
            setMessage(`Welcome back${result.username ? `, ${result.username}` : ''}!`)

            if (onSuccess) {
                onSuccess({
                    userId: result.userId,
                    username: result.username,
                })
            }
        } catch (error: any) {
            console.error('Authentication error:', error)
            setStatus('error')

            // Handle specific WebAuthn errors
            if (error.name === 'NotAllowedError') {
                setMessage('Authentication was cancelled or timed out')
            } else if (error.message?.includes('not recognized')) {
                setMessage('Passkey not found. Please register first.')
            } else {
                setMessage(error.message || 'Authentication failed')
            }

            if (onError) {
                onError(error.message)
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <KeyRound className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Sign In</h2>
                        <p className="text-xs text-slate-500">Use your registered passkey</p>
                    </div>
                </div>

                {/* Passkey Animation */}
                <div className="flex justify-center py-8">
                    <motion.div
                        animate={status === 'loading' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`relative p-6 rounded-2xl ${status === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : status === 'error'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-slate-800/50 border-slate-700'
                            } border`}
                    >
                        <Fingerprint className={`w-16 h-16 ${status === 'success'
                                ? 'text-emerald-400'
                                : status === 'error'
                                    ? 'text-red-400'
                                    : status === 'loading'
                                        ? 'text-indigo-400'
                                        : 'text-slate-500'
                            }`} />

                        {status === 'loading' && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                className="absolute inset-0 border-2 border-transparent border-t-indigo-400 rounded-2xl"
                            />
                        )}
                    </motion.div>
                </div>

                {/* Status Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${status === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : status === 'error'
                                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                            }`}
                    >
                        {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                        {status === 'error' && <AlertCircle className="w-4 h-4" />}
                        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span className="text-sm">{message}</span>
                    </motion.div>
                )}

                {/* Login Button */}
                {status !== 'success' && (
                    <button
                        onClick={handleLogin}
                        disabled={status === 'loading'}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5" />
                                Sign in with Passkey
                            </>
                        )}
                    </button>
                )}

                {/* Switch to Register */}
                {status !== 'success' && onSwitchToRegister && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={onSwitchToRegister}
                            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Don't have a passkey? <span className="text-emerald-400">Register one</span>
                        </button>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-slate-400 text-sm">
                            Redirecting to your dashboard...
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
