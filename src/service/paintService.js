// service/paintService.js
import { authService } from "./authService"
import { socket } from "../context/context.jsx"

const BASE_URL = import.meta.env.VITE_API_URL

async function getPaintState(threadId) {
    if (!threadId) throw new Error("Thread ID is required")
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/thread/${threadId}/paint`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch paint state: ${response.status}`)
    }

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    console.log(data)
    return data.data
}

function subscribeToPaintUpdates(threadId, callback) {
    const handler = (response) => {
        const payload = response.data || response
        if (payload.thread_id !== threadId) return
        callback(payload)
    }

    socket.on("paint_updated", handler)
    return () => socket.off("paint_updated", handler)
}

export { getPaintState, subscribeToPaintUpdates }