"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: string
    name: string
    lastLogin?: Date
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    checkSession: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/session')
            const data = await res.json()

            if (data.authenticated && data.user) {
                setUser({
                    id: data.user.id,
                    name: data.user.name,
                    lastLogin: data.user.lastLogin ? new Date(data.user.lastLogin) : undefined,
                })
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Session check failed:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/session', { method: 'DELETE' })
            setUser(null)
            // Redirect to login
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    useEffect(() => {
        checkSession()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                checkSession,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
