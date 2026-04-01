import {socket} from "../context/context.jsx"

function sendMessage(text, threadId) {
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


export {sendMessage}










