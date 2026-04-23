import styles from "../style/threadContextPanel.module.css"
import { useState } from "react"
import { ContextPanel } from "./context.jsx"
import { useThread } from "../hooks/useThread.js"
import {useScrollBottom} from "../hooks/useScrollBottom.js";
import {useAiSuggestion} from "../hooks/useAiSugesstion.js";

function ThreadContextPanel({ selectedThreadId }) {
    const { thread, loading, error, send } = useThread(selectedThreadId)
    const [text, setText] = useState("")

    return (
        <div className={styles.threadContext}>
            <Thread
                thread={thread}
                loading={loading}
                error={error}
                send={send}
                selectedThreadId={selectedThreadId}
                text={text}
                setText={setText}
            />
            <ContextPanel snapshot={thread?.snapshot} threadId={selectedThreadId}
                          onResponse={(response) => setText(response)} />
        </div>
    )
}

function Thread({ thread, loading, error, send, selectedThreadId, text, setText  }) {
    const scrollRef = useScrollBottom(thread?.messages)
    const { suggestion, loading: aiLoading, suggest, clear } = useAiSuggestion()

    const handleSend = () => {
        if (!selectedThreadId) return
        send(text, selectedThreadId)
        setText("")
        clear()
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend()
    }

    const handleSuggest = () => {
        if (!thread?.messages?.length) return
        suggest(thread.messages, selectedThreadId)
    }

    const handleUseSuggestion = () => {
        setText(suggestion)
        clear()
    }

    if (loading) return <div className={styles.thread}>Loading...</div>
    if (error) return <div className={styles.thread}>Error loading thread</div>
    if (!thread) return <div className={styles.thread}>Select a user</div>

    return (
        <div className={styles.thread}>
            <div className="header">Thread</div>
            <div className={styles.messages} ref={scrollRef}>
                {thread.messages && thread.messages.length > 0 ? (
                    thread.messages.map(message => (
                        <Message key={message.id} message={message} />
                    ))
                ) : (
                    <div style={{ padding: "20px", color: "#999" }}>No messages yet</div>
                )}
            </div>

            {suggestion && (
                <div className={styles.suggestion}>
                    <span>{suggestion}</span>
                    <button onClick={handleUseSuggestion}>Use</button>
                    <button onClick={clear}>Dismiss</button>
                </div>
            )}

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
                <button onClick={handleSuggest} disabled={aiLoading}>
                    {aiLoading ? "..." : "AI"}
                </button>
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
