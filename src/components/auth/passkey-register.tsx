"use client"

import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { motion } from 'framer-motion'
import { Fingerprint, Smartphone, Monitor, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface PasskeyRegisterProps {
    onSuccess?: (data: { userId: string; username: string; deviceType: string }) => void;
    onError?: (error: string) => void;
}

export function PasskeyRegister({ onSuccess, onError }: PasskeyRegisterProps) {
    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [deviceType, setDeviceType] = useState<string | null>(null)

    const handleRegister = async () => {
        if (!username || username.length < 3) {
            setStatus('error')
            setMessage('Username must be at least 3 characters')
            return
        }

        setStatus('loading')
        setMessage('Starting passkey registration...')

        try {
            // Step 1: Get registration options from server
            const optionsRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            })

            if (!optionsRes.ok) {
                const error = await optionsRes.json()
                throw new Error(error.error || 'Failed to start registration')
            }

            const { options } = await optionsRes.json()
            setMessage('Please complete authentication on your device...')

            // Step 2: Trigger the browser's WebAuthn prompt
            const registration = await startRegistration({ optionsJSON: options })

            setMessage('Verifying passkey...')

            // Step 3: Send registration response to server for verification
            const verifyRes = await fetch('/api/auth/register', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: registration }),
            })

            if (!verifyRes.ok) {
                const error = await verifyRes.json()
                throw new Error(error.error || 'Failed to verify registration')
            }

            const result = await verifyRes.json()

            setStatus('success')
            setMessage(result.message || 'Passkey registered successfully!')
            setDeviceType(result.deviceType)

            if (onSuccess) {
                onSuccess({
                    userId: result.userId,
                    username: result.username,
                    deviceType: result.deviceType,
                })
            }
        } catch (error: any) {
            console.error('Registration error:', error)
            setStatus('error')

            // Handle specific WebAuthn errors
            if (error.name === 'NotAllowedError') {
                setMessage('Authentication was cancelled or timed out')
            } else if (error.name === 'InvalidStateError') {
                setMessage('This device already has a passkey registered')
            } else {
                setMessage(error.message || 'Registration failed')
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
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Fingerprint className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Register Passkey</h2>
                        <p className="text-xs text-slate-500">Secure your account with Face ID or Windows Hello</p>
                    </div>
                </div>

                {/* Device Icons */}
                <div className="flex justify-center gap-6 mb-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`p-3 rounded-xl transition-all ${deviceType === 'iPhone' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700'} border`}>
                            <Smartphone className={`w-8 h-8 ${deviceType === 'iPhone' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        </div>
                        <span className="text-xs text-slate-500">iPhone</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`p-3 rounded-xl transition-all ${deviceType === 'Windows' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700'} border`}>
                            <Monitor className={`w-8 h-8 ${deviceType === 'Windows' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        </div>
                        <span className="text-xs text-slate-500">Windows</span>
                    </div>
                </div>

                {/* Username Input */}
                {status !== 'success' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Choose a username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={status === 'loading'}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
                        />
                    </div>
                )}

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

                {/* Register Button */}
                {status !== 'success' && (
                    <button
                        onClick={handleRegister}
                        disabled={status === 'loading' || !username}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5" />
                                Register with Passkey
                            </>
                        )}
                    </button>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                        >
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </motion.div>
                        <p className="text-slate-400 text-sm">
                            You can now sign in using your passkey!
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
