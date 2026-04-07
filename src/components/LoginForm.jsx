import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const LoginForm = ({ onSwitchToRegister }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('Login form submitted with:', { username, password: '***' })
        setError('')
        setLoading(true)

        try {
            console.log('Calling login...')
            await login(username, password)
            console.log('Login completed successfully')
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" onClick={onSwitchToRegister} className="link-button">
                    Register
                </button>
            </p>
        </div>
    )
}
