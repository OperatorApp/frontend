import { useState } from "react"
import styles from "../style/context.module.css"
import { usePromptButtons } from "../hooks/useAiPromptButtons.js";
import { firePromptButton } from "../service/aiPromptButtonsService.js";
import { X } from "lucide-react"

function formatDisplayValue(value) {
    if (value == null) return ""
    if (typeof value === "string" || typeof value === "number") return String(value)
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (typeof value === "object") {
        if (typeof value.url === "string") return value.url
        if (typeof value.ts === "string" || typeof value.ts === "number") return String(value.ts)
        return JSON.stringify(value)
    }
    return String(value)
}

function formatUrlTrailEntry(entry) {
    if (typeof entry === "string") {
        return { text: entry, timestamp: null }
    }

    if (entry && typeof entry === "object") {
        return {
            text: formatDisplayValue(entry.url) || formatDisplayValue(entry),
            timestamp: entry.ts ? formatDisplayValue(entry.ts) : null,
        }
    }

    return { text: formatDisplayValue(entry), timestamp: null }
}

function ContextPanel({ snapshot, threadId, onResponse, isOpen, onClose }) {
    const [tab, setTab] = useState("context")

    if (!snapshot) {
        return (
            <div className={styles.panel} data-open={isOpen ? "true" : undefined}>
                {onClose && (
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close context">
                        <X size={18} />
                    </button>
                )}
                <div className={styles.empty}>No context found</div>
            </div>
        )
    }

    return (
        <div className={styles.panel} data-open={isOpen ? "true" : undefined}>
            {onClose && (
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close context">
                    <X size={18} />
                </button>
            )}
            <div className={styles.tabs}>
                <TabBtn label="Context"       active={tab === "context"} onClick={() => setTab("context")} />
                <TabBtn label="Quick Actions" active={tab === "actions"} onClick={() => setTab("actions")} />
            </div>
            <div className={styles.content}>
                {tab === "context" ? <ContextTab context={snapshot} /> : <ActionsTab context={snapshot} threadId={threadId} onResponse={onResponse}/>}
            </div>
        </div>
    )
}

function ContextTab({ context }) {
    const { customer, country, city, local_time, url_trail, cart_snapshot, sentiment_label, sentiment_conf, orders } = context || {}

    return (
        <div className={styles.tabContent}>

            {customer && (
                <Section title="Customer">
                    {customer.name && <Row label="Name" value={customer.name} />}
                    {customer.email && <Row label="Email" value={customer.email} />}
                    {customer.lang && <Row label="Lang" value={customer.lang.toUpperCase()} />}
                </Section>
            )}

            {(country || city || local_time || cart_snapshot?.currency || sentiment_label) && (
                <Section title="Session">
                    {(city || country) && (
                        <Row label="Location" value={[city, country].filter(Boolean).join(", ")} />
                    )}
                    {local_time && <Row label="Local time" value={local_time} />}
                    {cart_snapshot?.currency && <Row label="Currency" value={cart_snapshot.currency} />}
                    {sentiment_label && (
                        <Row label="Sentiment" value={`${sentiment_label}${sentiment_conf ? ` (${Math.round(sentiment_conf * 100)}%)` : ""}`} />
                    )}
                </Section>
            )}

            {url_trail?.length > 0 && (
                <Section title="URL Trail">
                    {url_trail.map((entry, i) => {
                        const { text, timestamp } = formatUrlTrailEntry(entry)

                        return (
                            <div key={i} className={styles.urlItem}>
                                <span className={styles.urlIndex}>{i + 1}</span>
                                <span className={styles.urlText}>{text}</span>
                                {timestamp && <span className={styles.urlTimestamp}>{timestamp}</span>}
                            </div>
                        )
                    })}
                </Section>
            )}

            {cart_snapshot && (
                <Section title="Cart">
                    {!cart_snapshot.items?.length
                        ? <span className={styles.muted}>Empty</span>
                        : <>
                            {cart_snapshot.items.map((item, i) => (
                                <Row key={i} label={item.name}
                                     value={`${cart_snapshot.currency || ""} ${item.price?.toFixed(2) || ""}`} />
                            ))}
                            {cart_snapshot.total != null && (
                                <div className={styles.cartTotal}>
                                    <Row label="Total"
                                         value={`${cart_snapshot.currency || ""} ${cart_snapshot.total.toFixed(2)}`} />
                                </div>
                            )}
                        </>
                    }
                </Section>
            )}

            {orders?.length > 0 && (
                <Section title="Orders">
                    {orders.map(order => (
                        <div key={order.id} className={styles.orderBlock}>
                            <Row label={order.id} value={order.status} />
                            {order.shipments?.map((shp, i) => (
                                <div key={i} className={styles.shipment}>
                                    {[shp.carrier, shp.tracking_no, shp.last_status].filter(Boolean).join(" · ")}
                                </div>
                            ))}
                        </div>
                    ))}
                </Section>
            )}

        </div>
    )
}

function ActionsTab({ context, threadId, onResponse }) {
    const { country, orders } = context || {}
    const hasOrder = orders?.length > 0
    const { buttons, loading } = usePromptButtons()
    const [firingId, setFiringId] = useState(null)

    const handlePromptButton = async (btn) => {
        setFiringId(btn.id)
        try {
            console.log("threadId in ActionsTab:", threadId)
            const result = await firePromptButton(btn.id, threadId)
            onResponse?.(result.response, result.thread_id)
        } catch (err) {
            console.error("Prompt button error:", err)
        } finally {
            setFiringId(null)
        }
    }

    return (
        <div className={styles.tabContent}>

            {!loading && buttons.length > 0 && (
                <Section title="Prompt Buttons">
                    {buttons.map(btn => (
                        <ActionBtn
                            key={btn.id}
                            label={firingId === btn.id ? "..." : btn.name}
                            disabled={firingId !== null}
                            onClick={() => handlePromptButton(btn)}
                        />
                    ))}
                </Section>
            )}

        </div>
    )
}

function Section({ title, children }) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionBody}>{children}</div>
        </div>
    )
}

function Row({ label, value }) {
    return (
        <div className={styles.row}>
            <span className={styles.rowLabel}>{formatDisplayValue(label)}</span>
            <span className={styles.rowValue}>{formatDisplayValue(value)}</span>
        </div>
    )
}

function ActionBtn({ label, disabled = false, onClick }) {
    return (
        <button
            className={`${styles.actionBtn} ${disabled ? styles.actionBtnDisabled : ""}`}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

function TabBtn({ label, active, onClick }) {
    return (
        <button className={`${styles.tabBtn} ${active ? styles.tabBtnActive : ""}`} onClick={onClick}>
            {label}
        </button>
    )
}

export { ContextPanel }