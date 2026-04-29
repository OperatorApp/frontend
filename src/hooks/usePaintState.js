import { useState, useEffect, useCallback } from "react"
import { getPaintState, subscribeToPaintUpdates } from "../service/paintService"

export function usePaint(threadId) {
    const [paint, setPaint] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!threadId) {
            setPaint(null)
            return
        }

        const isMountedRef = { current: true }

        setLoading(true)
        getPaintState(threadId)
            .then(data => {
                if (isMountedRef.current) setPaint(data)
            })
            .catch(err => {
                console.error("Failed to load paint state:", err)
            })
            .finally(() => {
                if (isMountedRef.current) setLoading(false)
            })

        const unsubscribe = subscribeToPaintUpdates(threadId, (update) => {
            setPaint(prev => ({
                ...prev,
                scores: update.scores,
                base_color: update.base_color ?? prev?.base_color,
            }))
        })

        return () => {
            isMountedRef.current = false
            unsubscribe()
        }
    }, [threadId])

    const getSectionColor = useCallback((sectionId) => {
        if (!paint?.base_color) return null
        const score = paint.scores?.[sectionId] ?? 0
        const { h, s, v } = paint.base_color
        const modulatedV = v * (0.4 + 0.6 * score)
        return `hsl(${h}, ${s * 100}%, ${modulatedV * 100}%)`
    }, [paint])

    const getSectionScore = useCallback((sectionId) => {
        return paint?.scores?.[sectionId] ?? 0
    }, [paint])

    return { paint, loading, getSectionColor, getSectionScore }
}