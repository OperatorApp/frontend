import {authService} from "./authService.js";

const BASE_URL = import.meta.env.VITE_API_URL

async function createPromptButton(name, prompt) {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/prompt-button`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, prompt })
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
}

async function getPromptButtons() {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/prompt-button`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
}

async function upsertPromptButton(name, prompt) {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/prompt-button`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, prompt })
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
}

async function deletePromptButton(buttonId) {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/prompt-button/${buttonId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.message
}

async function firePromptButton(buttonId, threadId) {
    const token = authService.getToken()

    const response = await fetch(`${BASE_URL}/ai/prompt-button/fire`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ buttonId, threadId })
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    console.log("Prompt button fired, response:", data.data)
    return data
}

export { createPromptButton, getPromptButtons, upsertPromptButton, deletePromptButton, firePromptButton }