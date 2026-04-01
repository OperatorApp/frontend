import { useState, useEffect, useCallback } from "react"
import { getThreadById } from "../service/threadService.jsx"
import { sendMessage } from "../service/messageService.jsx"
import { socket } from "../context/context.jsx"

function appendMessage(thread, message, activeThreadId) {
    if (!thread || message.thread_id !== activeThreadId) {
        return thread
    }

    const messages = thread.messages || []
    const messageExists = messages.some(existingMessage => existingMessage.id === message.id)

    if (messageExists) {
        return thread
    }

    return {
        ...thread,
        messages: [...messages, message]
    }
}

function subscribeToThreadMessages(threadId, setThread) {
    const handleMessage = (response) => {
        const message = response.data || response
        setThread(prevThread => appendMessage(prevThread, message, threadId))
    }

    socket.on("message", handleMessage)

    return () => {
        socket.off("message", handleMessage)
    }
}

async function loadThread(threadId, setThread, setError, setLoading, isMountedRef) {
    setLoading(true)
    setError(null)

    try {
        const data = await getThreadById(threadId)

        if (!isMountedRef.current) {
            return
        }

        setThread(data)
        socket.emit("join_thread", threadId)
    } catch (err) {
        if (!isMountedRef.current) {
            return
        }

        setError(err)
        console.error("Failed to fetch thread:", err)
    } finally {
        if (isMountedRef.current) {
            setLoading(false)
        }
    }
}



export function useThread(threadId) {
    const [thread, setThread] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!threadId) {
            setThread(null)
            return
        }

        const isMountedRef = { current: true }
        const unsubscribe = subscribeToThreadMessages(threadId, setThread)

        loadThread(threadId, setThread, setError, setLoading, isMountedRef)
        sessionStorage.setItem("threadId", String(threadId))

        return () => {
            isMountedRef.current = false
            socket.emit("leave_thread", threadId)
            unsubscribe()
        }
    }, [threadId])

    const send = useCallback((text, threadId) => {
        if (!text.trim()) return
        sendMessage(text, threadId)
    }, [])

    return { thread, loading, error, send }
}
