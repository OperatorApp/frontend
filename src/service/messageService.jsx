import {getSocket} from "../context/context.jsx"

function sendMessage(text, threadId) {
    const socket = getSocket()
    if (!socket?.connected) {
        console.error("Socket not connected")
        return
    }

    const id = threadId || Number(sessionStorage.getItem("threadId"))

    if (!id || id === 0) {
        console.error("No valid thread ID found in sessionStorage or parameter")
        return
    }

    const messageData = {
        thread_id: id,
        text,
        sender: "OPERATOR"
    }

    console.log("Sending message:", messageData)
    socket.emit("send_message", messageData)
}

function subscribeToMessages(callback) {
    const socket = getSocket()
    if (!socket) {
        console.error("Socket not available")
        return () => {}
    }

    socket.on("new_message", callback)
    return () => socket.off("new_message", callback)
}

export {sendMessage, subscribeToMessages}










