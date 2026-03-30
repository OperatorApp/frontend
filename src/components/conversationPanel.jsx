import styles from "../style/conversationPanel.module.css"
import icon from "../assets/icon.png"
import { useThreads } from "../hooks/useThreads.js"

function ConversationPanel({ setSelectedThreadId }) {
    const { threads, loading, error } = useThreads()

    const handleSelectThread = (threadId) => {
        setSelectedThreadId(threadId)
        sessionStorage.setItem("threadId", threadId)
    }

    if (loading) return <div className={styles.panel}>Loading...</div>
    if (error) return <div className={styles.panel}>Error loading threads</div>

    return (
        <div className={styles.panel}>
            <div className="header">Conversation</div>
            <div className={styles.conversationContent}>
                {threads.map(thread => (
                    <User
                        key={thread.id}
                        threadId={thread.id}
                        name={thread.customer.name}
                        onSelect={handleSelectThread}
                    />
                ))}
            </div>
        </div>
    )
}

function User({ threadId, name, onSelect }) {
    return (
        <button onClick={() => onSelect(threadId)} className={styles.user}>
            <img src={icon} alt="user avatar" width={50} height={50} />
            <div className={styles.userText}>
                <h3>{name}</h3>
            </div>
        </button>
    )
}

export { ConversationPanel }
