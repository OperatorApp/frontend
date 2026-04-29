
import { io } from "socket.io-client"
import {authService} from "../service/authService.js";

let socket = null

export function getSocket() {
    return socket
}

export function connectSocket() {
    if (socket?.connected) {
        return socket
    }

    const token = authService.getToken()
    if (!token) {
        console.error("No token available for socket connection")
        return null
    }

    socket = io(import.meta.env.VITE_SOCKET_URL, {
        reconnectionDelayMax: 10000,
        auth: { token },
    })

    socket.on("connect", () => console.log("connected to server"))
    socket.on("disconnect", () => console.log("disconnected"))
    socket.on("connect_error", (err) => console.error("socket connect error:", err.message))

    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export { socket }

