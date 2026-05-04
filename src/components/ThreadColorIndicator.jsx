import { usePaint } from "../hooks/usePaintState.js"
import styles from "../style/conversationPanel.module.css"

function aggregateColor(paint) {
    if (!paint?.base_color) return null
    const { h, s, v } = paint.base_color
    const scores = Object.values(paint.scores ?? {})
    const maxScore = scores.length ? Math.max(...scores) : 0
    const modulatedV = v * (0.4 + 0.6 * maxScore)
    return `hsl(${h}, ${s * 100}%, ${modulatedV * 100}%)`
}

export function ThreadColorIndicator({ threadId }) {
    const { paint } = usePaint(threadId)
    const color = aggregateColor(paint)

    return (
        <span
            className={styles.threadIndicator}
            style={color ? { backgroundColor: color } : undefined}
            aria-hidden="true"
        />
    )
}