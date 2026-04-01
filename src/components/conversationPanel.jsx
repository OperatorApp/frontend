import styles from "../style/conversationPanel.module.css"
import icon from "../assets/icon.png"
import { useThreads } from "../hooks/useThreads.js"
import {getThreadById, patchThreadStatusOPEN} from "../service/threadService.jsx";

function ConversationPanel({ setSelectedThreadId, selectedThreadId }) {
    const { threads, loading, error, setThreads } = useThreads(selectedThreadId)

    const handleSelectThread = async (threadId) => {
        console.log(`Selecting thread ${threadId}`)
        setSelectedThreadId(threadId)
        try {
            await patchThreadStatusOPEN(threadId)
            const fetchedThread = await getThreadById(threadId)
            setThreads(prev =>
                prev.map(thread =>
                    thread.id === threadId ? fetchedThread : thread
                )
            )
        } catch (err) {
            console.error("Failed to update thread status:", err)
        }
        sessionStorage.setItem("threadId", threadId)
    }

    if (loading) return <div className={styles.panel}>Loading...</div>
    if (error) return <div className={styles.panel}>Error loading threads</div>

    return (
        <div className={styles.panel}>
            <div className="header">Conversation</div>
            <div className={styles.conversationContent}>
                {threads && threads.length > 0 ? (
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
