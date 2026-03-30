import styles from "../style/threadContextPanel.module.css"
import { useState } from "react"
import { ContextPanel } from "./context.jsx"
import { useThread } from "../hooks/useThread.js"
import {useScrollBottom} from "../hooks/useScrollBottom.js";

function ThreadContextPanel({ selectedThreadId }) {
    return (
        <div className={styles.threadContext}>
            <Thread threadId={selectedThreadId} />
            <ContextPanel threadId={selectedThreadId} />
        </div>
    )
}

function Thread({ threadId }) {
    const [text, setText] = useState("")
    const { thread, loading, error, send } = useThread(threadId)
    const scrollRef = useScrollBottom(thread?.messages)

    const handleSend = () => {
        send(text)
        setText("")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend()
    }

    if (loading) return (<div className={styles.thread}>Loading...</div>)
    if (error) return <div className={styles.thread}>Error loading thread</div>
    if (!thread) return <div className={styles.thread}>Select a user</div>

    return (
        <div className={styles.thread}>
            <div className="header">Thread</div>
            <div className={styles.messages} ref={scrollRef}>
                {thread.messages.map(message => (
                    <Message key={message.id} message={message} />
                ))}
            </div>
            <div className={styles.messagesDiv}>
                <input
                    className={styles.text}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

function Message({ message }) {
    const senderStyles = {
        OPERATOR: styles.operator,
        CUSTOMER: styles.customer,
        AI_SUGGESTION: styles.aiSuggestion,
    }

    const className = senderStyles[message.sender] || styles.customer

    return (
        <div className={className}>
            <div className={styles.org}>{message.text_original}</div>
            <div className={styles.trans}>{message.text_translated}</div>
        </div>
    )
}

export { ThreadContextPanel }
