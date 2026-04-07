import { useState } from "react"
import { getAiSuggestion } from "../service/aiSuggestionService.js"

export function useAiSuggestion() {
    const [suggestion, setSuggestion] = useState(null)
    const [loading, setLoading] = useState(false)

    const suggest = async (messages, threadId) => {
        setLoading(true)
        setSuggestion(null)

        try {
            const lastMessages = messages.slice(-5)
            const context = lastMessages
                .map(m => `${m.sender}: ${m.text_original}`)
                .join("\n")

            const prompt = `Based on this conversation:\n${context}\n\nSuggest a helpful reply for the operator. plain text only, no formatting.`
            const result = await getAiSuggestion(prompt, threadId)
            setSuggestion(result)
        } catch (err) {
            console.error("AI suggestion failed:", err)
            setSuggestion(null)
        } finally {
            setLoading(false)
        }
    }

    const clear = () => setSuggestion(null)

    return { suggestion, loading, suggest, clear }
}