import { useState } from "react"
import styles from "../style/conversationPanel.module.css"
import icon from "../assets/icon.png"
import { useThreads } from "../hooks/useThreads.js"
import { getThreadById, patchThreadStatusOPEN } from "../service/threadService.jsx"
import { SlidersHorizontal } from "lucide-react"

function ConversationPanel({ setSelectedThreadId, selectedThreadId }) {
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [filters, setFilters] = useState({
        name: "",
        hasMessages: undefined,
        pendingOnly: false
    })

    const { threads, loading, error, setThreads } = useThreads(selectedThreadId, filters)

    const handleSelectThread = async (threadId) => {
        setSelectedThreadId(threadId)
        try {
            await patchThreadStatusOPEN(threadId)
            const fetchedThread = await getThreadById(threadId)
            setThreads(prev =>
                prev.map(thread => thread.id === threadId ? fetchedThread : thread)
            )
        } catch (err) {
            console.error("Failed to update thread status:", err)
        }
        sessionStorage.setItem("threadId", threadId)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    if (loading) return <div className={styles.panel}>Loading...</div>
    if (error) return <div className={styles.panel}>Error loading threads</div>

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span>Conversations</span>
                <button
                    className={styles.filterToggle}
                    onClick={() => setFiltersOpen(prev => !prev)}
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {filtersOpen && (
                <div className={styles.filterPanel}>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={filters.name}
                        onChange={e => handleFilterChange("name", e.target.value)}
                        className={styles.filterInput}
                    />
                    <div className={styles.filterRow}>
                        <label>
                            <input
                                type="checkbox"
                                checked={filters.pendingOnly}
                                onChange={e => handleFilterChange("pendingOnly", e.target.checked)}
                            />
                            Pending only
                        </label>
                        <select
                            value={filters.hasMessages ?? ""}
                            onChange={e => handleFilterChange(
                                "hasMessages",
                                e.target.value === "" ? undefined : e.target.value === "true"
                            )}
                            className={styles.filterSelect}
                        >
                            <option value="">All</option>
                            <option value="true">Has messages</option>
                            <option value="false">No messages</option>
                        </select>
                    </div>
                </div>
            )}

            <div className={styles.conversationContent}>
                {threads?.length > 0 ? (
                    threads.map(thread => (
                        <User
                            key={thread.id}
                            threadId={thread.id}
                            name={thread.customer?.name || "Unknown"}
                            status={thread.status}
                            selectedThreadId={selectedThreadId}
                            onSelect={handleSelectThread}
                        />
                    ))
                ) : (
                    <div style={{ padding: "20px", color: "#fff" }}>No threads available</div>
                )}
            </div>
        </div>
    )
}

function User({ threadId, name, onSelect, status, selectedThreadId }) {
    const isPending = status === "PENDING" && threadId !== selectedThreadId
    return (
        <button onClick={() => onSelect(threadId)} className={isPending ? styles.userPending : styles.user}>
            <img src={icon} alt="user avatar" width={50} height={50} />
            <div className={styles.userText}>
                <h3>{name}</h3>
                <span style={{ fontSize: "0.75rem", color: "#999" }}>{status || "OPEN"}</span>
            </div>
        </button>
    )
}

export { ConversationPanel }
