import styles from "../style/threadContextPanel.module.css"
import { useState } from "react"
import { ContextPanel } from "./context.jsx"
import { useThread } from "../hooks/useThread.js"
import { useScrollBottom } from "../hooks/useScrollBottom.js";
import { useAiSuggestion } from "../hooks/useAiSugesstion.js";
import { ArrowLeft, Info } from "lucide-react"

function ThreadContextPanel({ selectedThreadId, onBack }) {
    const { thread, loading, error, send } = useThread(selectedThreadId)
    const [text, setText] = useState("")
    const [contextOpen, setContextOpen] = useState(false)

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
                onBack={onBack}
                onToggleContext={() => setContextOpen(o => !o)}
            />
            <ContextPanel
                snapshot={thread?.snapshot}
                threadId={selectedThreadId}
                onResponse={(response) => setText(response)}
                isOpen={contextOpen}
                onClose={() => setContextOpen(false)}
            />
            {contextOpen && (
                <div
                    className={styles.contextBackdrop}
                    onClick={() => setContextOpen(false)}
                />
            )}
        </div>
    )
}

function Thread({ thread, loading, error, send, selectedThreadId, text, setText, onBack, onToggleContext }) {
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

    const header = (
        <div className={styles.threadHeader}>
            {onBack && (
                <button
                    className={styles.backBtn}
                    onClick={onBack}
                    aria-label="Back to conversations"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            <span className={styles.threadTitle}>Thread</span>
            {onToggleContext && (
                <button
                    className={styles.contextToggle}
                    onClick={onToggleContext}
                    aria-label="Toggle context"
                >
                    <Info size={18} />
                </button>
            )}
        </div>
    )

    if (loading) return <div className={styles.thread}>{header}<div className={styles.emptyMessages}>Loading...</div></div>
    if (error) return <div className={styles.thread}>{header}<div className={styles.emptyMessages}>Error loading thread</div></div>
    if (!thread) return <div className={styles.thread}>{header}<div className={styles.emptyMessages}>Select a conversation to begin</div></div>

    return (
        <div className={styles.thread}>
            {header}
            <div className={styles.messages} ref={scrollRef}>
                {thread.messages && thread.messages.length > 0 ? (
                    thread.messages.map(message => (
                        <Message key={message.id} message={message} />
                    ))
                ) : (
                    <div className={styles.emptyMessages}>No messages yet</div>
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
            {message.text_translated && (
                <div className={styles.trans}>{message.text_translated}</div>
            )}
        </div>
    )
}

export { ThreadContextPanel }