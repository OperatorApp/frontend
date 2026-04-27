const API_URL = import.meta.env.VITE_API_URL

function extractApiKey(payload) {
    if (typeof payload === 'string') {
        return payload
    }

    if (!payload || typeof payload !== 'object') {
        return null
    }

    if (typeof payload.apiKey === 'string') {
        return payload.apiKey
    }

    if (typeof payload.api_key === 'string') {
        return payload.api_key
    }

    return extractApiKey(payload.data)
}

export const authService = {
    async login(username, password) {
        console.log('authService.login called with username:', username)
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })

        console.log('Login response status:', response.status)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Login failed')
        }

        const data = await response.json()
        console.log('Login response data:', data)
        return data
    },

    async register(username, email, password, name, languages) {
        const response = await fetch(`${API_URL}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password, name, languages })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Registration failed')
        }

        return await response.json()
    },

    async generateApiKey() {
        const token = authService.getToken()
        const response = await fetch(`${API_URL}/auth/create-api-key`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
        })
        const data = await response.json()

        if (!response.ok || data?.success === false) {
            throw new Error(data?.message || data?.error || 'Failed to generate API key')
        }

        const apiKey = extractApiKey(data)

        if (!apiKey) {
            throw new Error('API key was not present in the response')
        }

        return apiKey
    },

    async changeOperatorLanguages(languages) {
        const token = authService.getToken()
        const response = await fetch(`${API_URL}/auth/update-language`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ languages })
        })
        const data = await response.json()

        if (!response.ok || data?.success === false) {
            throw new Error(data?.message || data?.error || 'Failed to update languages')
        }

        return data
    },


    async refreshToken() {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        })

        if (!response.ok) {
            throw new Error('Token refresh failed')
        }

        return await response.json()
    },

    storeToken(token) {
        localStorage.setItem('access_token', token)
    },

    getToken() {
        return localStorage.getItem('access_token')
    },

    removeToken() {
        localStorage.removeItem('access_token')
    },

    storeUser(user) {
        localStorage.setItem('user', JSON.stringify(user))
    },

    getUser() {
        const user = localStorage.getItem('user')
        if (!user) return null

        try {
            return JSON.parse(user)
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error)
            localStorage.removeItem('user') // Clear corrupted data
            return null
        }
    },

    removeUser() {
        localStorage.removeItem('user')
    }
}











