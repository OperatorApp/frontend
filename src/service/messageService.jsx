import {socket} from "../context/context.jsx"

function sendMessage(text, onMessageSent) {
    const threadId = Number(sessionStorage.getItem("threadId"))

    if (!threadId || threadId === 0) {
        console.error("No valid thread ID found")
        return
    }

    const messageData = {
        thread_id: threadId,
        text,
        sender: "OPERATOR"
    }
    if (onMessageSent) {
        onMessageSent({
            thread_id: threadId,
            text_original: text,
            text,
            sender: "OPERATOR",
            created_at: new Date().toISOString()
        })
    }

    socket.emit("send_message", messageData)
}


export {sendMessage}










