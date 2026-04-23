import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../service/authService'
import { connectSocket, disconnectSocket } from './context'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = authService.getToken()
        const storedUser = authService.getUser()

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(storedUser)
            connectSocket()
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        const response = await authService.login(username, password)
        const { token, operator } = response.data

        authService.storeToken(token)
        authService.storeUser(operator)

        setToken(token)
        setUser(operator)
        connectSocket()
    }

    const register = async (username, email, password, name, languages) => {
        const response = await authService.register(username, email, password, name, languages)
        const { token, operator } = response.data

        authService.storeToken(token)
        authService.storeUser(operator)

        setToken(token)
        setUser(operator)
        connectSocket()
    }

    const logout = () => {
        disconnectSocket()
        authService.removeToken()
        authService.removeUser()
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}