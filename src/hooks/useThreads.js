import { useState, useEffect } from "react"
import { getThreads, getThreadById } from "../service/threadService.jsx"
import { socket } from "../context/context.jsx"

function markThreadPending(threads, threadId, selectedThreadId, lastMessage = null) {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return threads

    const updated = {
        ...thread,
        last_message_at: lastMessage?.created_at || new Date().toISOString(),
        messages: lastMessage ? [lastMessage] : thread.messages,
        status: threadId !== selectedThreadId ? "PENDING" : thread.status
    }
    const rest = threads.filter(t => t.id !== threadId)
    return [updated, ...rest]
}

async function loadThreads(setThreads, setError, setLoading, filters = {}) {
    try {
        const data = await getThreads(filters)
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

        setThreads(prevThreads => {
            const exists = prevThreads.find(t => t.id === messageThreadId)

            if (!exists) {
                getThreadById(messageThreadId).then(newThread => {
                    setThreads(prev => [newThread, ...prev])
                })
                return prevThreads
            }

            return markThreadPending(prevThreads, messageThreadId, selectedThreadId, payload.last_message)
        })
    }

    socket.on("thread_updated", handleThreadUpdated)
    return () => socket.off("thread_updated", handleThreadUpdated)
}

function subscribeToOperatorThreads() {
    socket.emit("join_operator_threads")
    return () => socket.emit("leave_operator_threads")
}

export function useThreads(selectedThreadId, filters = {}) {
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [debouncedFilters, setDebouncedFilters] = useState(filters)

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedFilters(filters), 400)
        return () => clearTimeout(timeout)
    }, [filters.name, filters.hasMessages, filters.pendingOnly])

    useEffect(() => {
        loadThreads(setThreads, setError, setLoading, debouncedFilters)
    }, [debouncedFilters])

    useEffect(() => subscribeToOperatorThreads(), [])
    useEffect(() => subscribeToThreadUpdates(selectedThreadId, setThreads), [selectedThreadId])

    return { threads, loading, error, setThreads }
}