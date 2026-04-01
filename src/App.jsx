
import './App.css'
import { ConversationPanel } from "./components/conversationPanel"
import { ThreadContextPanel } from "./components/threadContextPanel.jsx"
import { MessageProvider } from "./context/MessageContext.jsx"
import { useState } from "react"



function App() {
    const [selectedThreadId, setSelectedThreadId] = useState(null)

    return (
        <MessageProvider>
            <ConversationPanel setSelectedThreadId={setSelectedThreadId} selectedThreadId={selectedThreadId} />
            <ThreadContextPanel selectedThreadId={selectedThreadId} />
        </MessageProvider>
    )
}

export default App
