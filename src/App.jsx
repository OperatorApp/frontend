
import './App.css'
import { ConversationPanel } from "./components/conversationPanel"
import { ThreadContextPanel } from "./components/threadContextPanel.jsx"
import { useState } from "react"
import { scenarios } from "./datacalls/threadcalls.jsx"
import { addMessage } from "./datacalls/threadcalls.jsx"
import { getThreads } from "./datacalls/threadcalls.jsx"

function App() {
    const [id, setCustomerId] = useState(1)
    const [steps, setSteps] = useState({ thread_1: 0, thread_2: 0 })

    const playNextMessage = () => {
        const thread = getThreads(id)
        const threadId = thread.id
        const script = scenarios[threadId] ?? []
        const currentStep = steps[threadId] ?? 0

        if (currentStep >= script.length) return

        const next = script[currentStep]
        addMessage(threadId, next)

        setSteps(prev => ({ ...prev, [threadId]: currentStep + 1 }))
    }

    const isDone = () => {
        const thread = getThreads(id)
        const script = scenarios[thread.id] ?? []
        return (steps[thread.id] ?? 0) >= script.length
    }

    return (
        <>
            <ConversationPanel setCustomerId={setCustomerId} activeId={id} />
            <ThreadContextPanel
                customerId={id}
                playNextMessage={playNextMessage}
                isDone={isDone()}
            />
        </>
    )
}

export default App
