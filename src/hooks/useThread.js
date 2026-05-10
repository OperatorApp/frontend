import { useState, useEffect, useCallback } from "react"
import { getThreadById } from "../service/threadService.jsx"
import { sendMessage } from "../service/messageService.jsx"
import { socket } from "../context/context.jsx"


export function useThread(threadId) {
    const [thread, setThread] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!threadId) {
            setThread(null)
            return
        }

        let cancelled = false

        setLoading(true)
        setError(null)

        socket.emit("join_thread", threadId)

        getThreadById(threadId)
            .then(data => {
                if (!cancelled) setThread(data)
            })
            .catch(err => {
                if (cancelled) return
                console.error("Failed to fetch thread:", err)
                setError(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        sessionStorage.setItem("threadId", String(threadId))

        const handleMessage = (response) => {
            const message = response.data || response
            if (message.thread_id !== threadId) return

            setThread(prev => {
                if (!prev) return prev
                const messages = prev.messages || []
                if (messages.some(m => m.id === message.id)) return prev
                return {
                    ...prev,
                    messages: [...messages, message],
                    snapshot: message.snapshot ?? prev.snapshot,
                }
            })
        }

        socket.on("message", handleMessage)

        return () => {
            cancelled = true
            socket.off("message", handleMessage)
        }
    }, [threadId])

    const send = useCallback((text, threadId) => {
        if (!text.trim()) return
        sendMessage(text, threadId)
    }, [])

    return { thread, loading, error, send }
}