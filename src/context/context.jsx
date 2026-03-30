

import { io } from "socket.io-client"

export const socket = io("http://localhost:3001/", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "123"
    },
    query: {
        "my-key": "my-value"
    }
})

socket.on("connect", () => console.log("connected to server"))
socket.on("disconnect", () => console.log("disconnected"))

