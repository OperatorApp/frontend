import { useState, useEffect } from "react"
import { getThreads, getThreadById } from "../service/threadService.jsx"
import { socket } from "../context/context.jsx"


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
        getThreads(debouncedFilters)
            .then(data => setThreads(data))
            .catch(err => {
                console.error("Failed to fetch threads:", err)
                setError(err)
            })
            .finally(() => setLoading(false))
    }, [debouncedFilters])

    useEffect(() => {
        socket.emit("join_operator_threads")
        return () => socket.emit("leave_operator_threads")
    }, [])

    useEffect(() => {
        const handleThreadUpdated = (response) => {
            const payload = response.data || response
            const threadId = payload.thread_id

            setThreads(prev => {
                const existing = prev.find(t => t.id === threadId)

                if (!existing) {
                    getThreadById(threadId).then(newThread => {
                        setThreads(curr => [newThread, ...curr])
                    })
                    return prev
                }

                const updated = {
                    ...existing,
                    last_message_at: payload.last_message?.created_at || new Date().toISOString(),
                    messages: payload.last_message ? [payload.last_message] : existing.messages,
                    status: threadId !== selectedThreadId ? "PENDING" : existing.status,
                }

                return [updated, ...prev.filter(t => t.id !== threadId)]
            })
        }

        socket.on("thread_updated", handleThreadUpdated)
        return () => socket.off("thread_updated", handleThreadUpdated)
    }, [selectedThreadId])

    return { threads, loading, error, setThreads }
}