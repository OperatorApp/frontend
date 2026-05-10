import { useState } from "react"
import styles from "../style/context.module.css"
import { usePromptButtons } from "../hooks/useAiPromptButtons.js"
import { firePromptButton } from "../service/aiPromptButtonsService.js"
import { X } from "lucide-react"


function ContextPanel({ snapshot, threadId, onResponse, isOpen, onClose, getSectionColor, getSectionScore }) {
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
                <button
                    className={`${styles.tabBtn} ${tab === "context" ? styles.tabBtnActive : ""}`}
                    onClick={() => setTab("context")}
                >
                    Context
                </button>
                <button
                    className={`${styles.tabBtn} ${tab === "actions" ? styles.tabBtnActive : ""}`}
                    onClick={() => setTab("actions")}
                >
                    Quick Actions
                </button>
            </div>

            <div className={styles.content}>
                {tab === "context"
                    ? <ContextTab context={snapshot} getSectionColor={getSectionColor} getSectionScore={getSectionScore} />
                    : <ActionsTab threadId={threadId} onResponse={onResponse} />}
            </div>
        </div>
    )
}


function ContextTab({ context, getSectionColor, getSectionScore }) {
    if (!context) return null

    const sections = []

    if (context.customer) {
        const c = context.customer
        sections.push({
            id: "customer",
            title: "Customer",
            content: (
                <>
                    {c.name && <Row label="Name" value={c.name} />}
                    {c.email && <Row label="Email" value={c.email} />}
                    {c.lang && <Row label="Lang" value={c.lang.toUpperCase()} />}
                </>
            ),
        })
    }

    const hasSession = context.country || context.city || context.local_time
        || context.cart_snapshot?.currency || context.sentiment_label
    if (hasSession) {
        sections.push({
            id: "session",
            title: "Session",
            content: (
                <>
                    {(context.city || context.country) && (
                        <Row label="Location" value={[context.city, context.country].filter(Boolean).join(", ")} />
                    )}
                    {context.local_time && <Row label="Local time" value={context.local_time} />}
                    {context.cart_snapshot?.currency && <Row label="Currency" value={context.cart_snapshot.currency} />}
                    {context.sentiment_label && (
                        <Row
                            label="Sentiment"
                            value={
                                context.sentiment_conf
                                    ? `${context.sentiment_label} (${Math.round(context.sentiment_conf * 100)}%)`
                                    : context.sentiment_label
                            }
                        />
                    )}
                </>
            ),
        })
    }

    if (context.url_trail?.length) {
        sections.push({
            id: "url_trail",
            title: "URL Trail",
            content: context.url_trail.map((entry, i) => {
                const url = typeof entry === "string" ? entry : entry?.url ?? ""
                let timestamp = null
                if (entry?.ts) {
                    const d = new Date(entry.ts)
                    if (!isNaN(d)) timestamp = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }
                return (
                    <div key={i} className={styles.urlItem}>
                        <span className={styles.urlIndex}>{i + 1}</span>
                        <span className={styles.urlText}>{url}</span>
                        {timestamp && <span className={styles.urlTimestamp}>{timestamp}</span>}
                    </div>
                )
            }),
        })
    }

    if (context.cart_snapshot) {
        const cart = context.cart_snapshot
        const fmt = n => `${cart.currency || ""} ${Number(n ?? 0).toFixed(2)}`
        sections.push({
            id: "cart",
            title: "Cart",
            content: !cart.items?.length
                ? <span className={styles.muted}>Empty</span>
                : (
                    <>
                        {cart.items.map((item, i) => (
                            <div key={i} className={styles.cartItem}>
                                <div className={styles.cartItemName}>{item.name}</div>
                                <div className={styles.cartItemMeta}>
                                    {item.qty > 1 && <span>×{item.qty}</span>}
                                    <span>{fmt(item.price)}</span>
                                </div>
                            </div>
                        ))}
                        {cart.total != null && (
                            <div className={styles.cartTotal}>
                                <Row label="Total" value={fmt(cart.total)} />
                            </div>
                        )}
                    </>
                ),
        })
    }

    if (context.orders?.length) {
        sections.push({
            id: "orders",
            title: "Orders",
            content: context.orders.map(order => (
                <div key={order.id} className={styles.orderBlock}>
                    <Row label={order.id} value={order.status} />
                    {order.shipments?.map((shp, i) => (
                        <div key={i} className={styles.shipment}>
                            {[shp.carrier, shp.tracking_no, shp.last_status].filter(Boolean).join(" · ")}
                        </div>
                    ))}
                </div>
            )),
        })
    }

    sections.sort((a, b) => (getSectionScore?.(b.id) ?? 0) - (getSectionScore?.(a.id) ?? 0))

    return (
        <div className={styles.tabContent}>
            {sections.map(s => {
                const color = getSectionColor?.(s.id)
                const score = getSectionScore?.(s.id) ?? 0
                return (
                    <div
                        key={s.id}
                        className={styles.section}
                        style={color ? { "--section-color": color } : undefined}
                        data-section-id={s.id}
                        data-score={score.toFixed(2)}
                    >
                        <div className={styles.sectionTitle}>{s.title}</div>
                        <div className={styles.sectionBody}>{s.content}</div>
                    </div>
                )
            })}
        </div>
    )
}


function ActionsTab({ threadId, onResponse }) {
    const { buttons, loading } = usePromptButtons()
    const [firingId, setFiringId] = useState(null)

    const handleFire = async (btn) => {
        setFiringId(btn.id)
        try {
            const result = await firePromptButton(btn.id, threadId)
            onResponse?.(result.response, result.thread_id)
        } catch (err) {
            console.error("Prompt button error:", err)
        } finally {
            setFiringId(null)
        }
    }

    if (loading || !buttons.length) return null

    return (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Prompt Buttons</div>
                <div className={styles.sectionBody}>
                    {buttons.map(btn => (
                        <button
                            key={btn.id}
                            className={styles.actionBtn}
                            disabled={firingId !== null}
                            onClick={() => handleFire(btn)}
                        >
                            {firingId === btn.id ? "..." : btn.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}


function Row({ label, value }) {
    return (
        <div className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowValue}>{value}</span>
        </div>
    )
}


export { ContextPanel }