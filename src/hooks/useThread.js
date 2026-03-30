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

        const fetchThread = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getThreadById(threadId)
                setThread(data)
                socket.emit("join_thread", threadId)
            } catch (err) {
                setError(err)
                console.error("Failed to fetch thread:", err)
            } finally {
                setLoading(false)
            }
        }

        const handleMessage = (response) => {
            const message = response.data || response

            setThread(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    messages: [...prev.messages, message]
                }
            })
        }

        socket.on("message", handleMessage)
        fetchThread()

        return () => {
            socket.off("message", handleMessage)
        }
    }, [threadId])

    const send = useCallback((text) => {
        if (!text.trim()) return
        sendMessage(text)
    }, [])

    return { thread, loading, error, send }
}
