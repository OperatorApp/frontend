import { createContext, useState, useCallback } from "react"

export const MessageContext = createContext(null)

export function MessageProvider({ children }) {
    const [messages, setMessages] = useState([])

    const addMessage = useCallback((message) => {
        setMessages(prev => [...prev, message])
    }, [])

    return (
        <MessageContext.Provider value={{ messages, addMessage }}>
            {children}
        </MessageContext.Provider>
    )
}
