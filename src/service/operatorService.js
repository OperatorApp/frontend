import { authService } from './authService'

const API_URL = import.meta.env.VITE_API_URL


export const operatorService = {

    updateLanguageSer: async (languages) => {
        try {
            const token = authService.getToken()

            const response = await fetch(`${API_URL}/operator/update-languages`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ languages })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || error.message || 'Failed to update languages')
            }

            return await response.json()
        } catch (error) {
            console.error("Error in updateLanguageSer:", error)
            throw error
        }
    },

    getLanguagesSer: async () => {
        try {
            const token = authService.getToken()

            const response = await fetch(`${API_URL}/operator/languages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || error.message || 'Failed to fetch languages')
            }

            return await response.json()
        } catch (error) {
            console.error("Error in getLanguagesSer:", error)
            throw error
        }
    }
}