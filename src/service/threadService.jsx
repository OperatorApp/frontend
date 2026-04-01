
const BASE_URL = import.meta.env.VITE_API_URL


async function getMessagesFromThread(username) {
    if (!username) {
        throw new Error("Username is required")
    }

    const threadRes = await fetch(`${BASE_URL}/thread/username/${username}`)
    if (!threadRes.ok) {
        throw new Error(`Failed to fetch thread: ${threadRes.status}`)
    }
    const threadData = await threadRes.json()

    if (!threadData.success) throw new Error(threadData.error)

    const thread = threadData.data

    if (!thread?.id) {
        throw new Error("Thread or thread ID is null/undefined")
    }

    sessionStorage.setItem("threadId", String(thread.id))

    const messagesRes = await fetch(`${BASE_URL}/thread/${thread.id}/messages`)
    if (!messagesRes.ok) {
        throw new Error(`Failed to fetch messages: ${messagesRes.status}`)
    }
    const messagesData = await messagesRes.json()

    console.log(messagesData)
    if (!messagesData.success) throw new Error(messagesData.error)

    return { thread, messages: messagesData.data || [] }
}


async function getThreads(){
    const response = await fetch(`${BASE_URL}/thread`)
    if(!response.ok){
        throw new Error(`Failed to fetch threads: ${response.status}`)
    }
    const data = await response.json()
    return data.data || []
}

async function getThreadById(id) {
    if (!id) {
        throw new Error("Thread ID is required")
    }

    const response = await fetch(`${BASE_URL}/thread/${id}`)
    if (!response.ok) {
        throw new Error(`Failed to fetch thread: ${response.status}`)
    }
    const data = await response.json()

    if (!data.success) throw new Error(data.error)
        return data.data
}

async function patchThreadStatusOPEN(id){
    if (!id) {
        throw new Error("Thread ID is required")
    }

    const response = await fetch(`${BASE_URL}/thread/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "OPEN"
        })
    })

    if (!response.ok) {
        throw new Error(`Failed to update thread status: ${response.status}`)
    }
}

export { getMessagesFromThread, getThreads, getThreadById, patchThreadStatusOPEN }











