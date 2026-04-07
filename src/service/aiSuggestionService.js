// service/aiSuggestionService.js
import {authService} from "./authService.js";

const BASE_URL = import.meta.env.VITE_API_URL

async function getAiSuggestion(prompt, threadId) {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/knowledge/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, thread_id: threadId })
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.response
}

export { getAiSuggestion }