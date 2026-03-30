import { useState, useEffect } from "react"
import { getThreads } from "../service/threadService.jsx"

export function useThreads() {
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const data = await getThreads()
                console.log(data)
                setThreads(data)
            } catch (err) {
                setError(err)
                console.error("Failed to fetch threads:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchThreads()
    }, [])

    return { threads, loading, error }
}
