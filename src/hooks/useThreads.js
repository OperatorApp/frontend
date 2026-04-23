import { useState, useEffect } from "react"
import { getThreads } from "../service/threadService.jsx"
import { socket } from "../context/context.jsx"

function markThreadPending(threads, threadId, selectedThreadId) {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return threads

    const updated = {
        ...thread,
        last_message_at: new Date().toISOString(),
        status: threadId !== selectedThreadId ? "PENDING" : thread.status
    }
    const rest = threads.filter(t => t.id !== threadId)
    return [updated, ...rest]
}


async function loadThreads(setThreads, setError, setLoading) {
    try {
        const data = await getThreads()
        console.log("Loaded threads:", data)
        setThreads(data)
    } catch (err) {
        setError(err)
        console.error("Failed to fetch threads:", err)
    } finally {
        setLoading(false)
    }
}

function subscribeToThreadUpdates(selectedThreadId, setThreads) {
    const handleThreadUpdated = (response) => {
        const payload = response.data || response
        const messageThreadId = payload.thread_id
        console.log("new messaage came", payload, messageThreadId)
        setThreads(prevThreads => markThreadPending(prevThreads, messageThreadId, selectedThreadId))
    }

    socket.on("thread_updated", handleThreadUpdated)

    return () => {
        socket.off("thread_updated", handleThreadUpdated)
    }
}

function subscribeToOperatorThreads() {
    socket.emit("join_operator_threads")

    return () => {
        socket.emit("leave_operator_threads")
    }
}

export function useThreads(selectedThreadId) {
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect( () => {
        loadThreads(setThreads, setError, setLoading)
    }, [])

    useEffect(() => {
        return subscribeToOperatorThreads()
    }, [])

    useEffect(() => {
        return subscribeToThreadUpdates(selectedThreadId, setThreads)
    }, [selectedThreadId])

    return { threads, loading, error, setThreads }
}
