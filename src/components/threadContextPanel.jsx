import styles from "../style/threadContextPanel.module.css"
import {getThreads, getMessages, addMessage} from "../datacalls/threadcalls.jsx"
import {useState} from "react";
import {ContextPanel} from "./context.jsx";



function ThreadContextPanel({ customerId, playNextMessage, isDone }) {
    return (
        <div className={styles.threadContext}>
            <Thread
                customerId={customerId}
                playNextMessage={playNextMessage}
                isDone={isDone}
            />
            <ContextPanel threadId={getThreads(customerId).id} />
        </div>
    )
}

function Thread({ customerId, playNextMessage, isDone }) {
    const [text, setText] = useState("")
    if (!customerId) return <div>Select a user</div>

    let thread = getThreads(customerId)
    let messages = getMessages(thread.id)

    function handleSend() {
        if (!text.trim()) return
        addMessage(thread.id, text)
        setText("")
    }

    return (
        <div className={styles.thread}>
            <div className="header">Thread</div>
            <div className={styles.messages}>
                {messages.map(message => {
                    if (message.sender === "operator") {
                        return <div className={styles.operator} key={message.id}>
                            <div className={styles.org}>{message.text_original}</div>
                            <div className={styles.trans}>{message.text_translated}</div>
                        </div>
                    }
                    if (message.sender === "customer") {
                        return <div className={styles.customer} key={message.id}>
                            <div className={styles.org}>{message.text_original}</div>
                            <div className={styles.trans}>{message.text_translated}</div>
                        </div>
                    }
                    if (message.sender === "ai_suggestion") {
                        return <div className={styles.aiSuggestion} key={message.id}>
                            <div className={styles.org}>{message.text_original}</div>
                            <div className={styles.trans}>{message.text_translated}</div>
                        </div>
                    }
                })}
            </div>

            <div className={styles.messagesDiv}>
                <input
                    className={styles.text}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <button onClick={handleSend}>Send</button>
                {/* ── scenario player ── */}
                <button onClick={playNextMessage} disabled={isDone}>
                    {isDone ? "✓ Done" : "▶ Next"}
                </button>
            </div>
        </div>
    )
}


function Context() {
    return <div className={styles.context}>
        <div className="header">Context</div>
        <div className={styles.contextContent}></div>
    </div>
}


export {ThreadContextPanel}

