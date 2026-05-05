import { useState } from "react"
import styles from "../style/context.module.css"
import { usePromptButtons } from "../hooks/useAiPromptButtons.js"
import { firePromptButton } from "../service/aiPromptButtonsService.js"
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
        let timestamp = null
        if (entry.ts) {
            const d = new Date(entry.ts)
            timestamp = isNaN(d)
                ? formatDisplayValue(entry.ts)
                : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
        return {
            text: formatDisplayValue(entry.url) || formatDisplayValue(entry),
            timestamp,
        }
    }
    return { text: formatDisplayValue(entry), timestamp: null }
}

// ─── Section catalog ───────────────────────────────────────
// One entry per section type. `id` must match the backend's
// section IDs so paint scores line up. Adding a section means
// adding one entry here and nothing else.

const SECTIONS = [
    {
        id: "customer",
        title: "Customer",
        isVisible: (ctx) => !!ctx?.customer,
        render: (ctx) => {
            const { customer } = ctx
            return (
                <>
                    {customer.name && <Row label="Name" value={customer.name} />}
                    {customer.email && <Row label="Email" value={customer.email} />}
                    {customer.lang && <Row label="Lang" value={customer.lang.toUpperCase()} />}
                </>
            )
        },
    },
    {
        id: "session",
        title: "Session",
        isVisible: (ctx) =>
            !!(ctx?.country || ctx?.city || ctx?.local_time || ctx?.cart_snapshot?.currency || ctx?.sentiment_label),
        render: (ctx) => {
            const { country, city, local_time, cart_snapshot, sentiment_label, sentiment_conf } = ctx
            return (
                <>
                    {(city || country) && (
                        <Row label="Location" value={[city, country].filter(Boolean).join(", ")} />
                    )}
                    {local_time && <Row label="Local time" value={local_time} />}
                    {cart_snapshot?.currency && <Row label="Currency" value={cart_snapshot.currency} />}
                    {sentiment_label && (
                        <Row
                            label="Sentiment"
                            value={`${sentiment_label}${sentiment_conf ? ` (${Math.round(sentiment_conf * 100)}%)` : ""}`}
                        />
                    )}
                </>
            )
        },
    },
    {
        id: "url_trail",
        title: "URL Trail",
        isVisible: (ctx) => ctx?.url_trail?.length > 0,
        render: (ctx) => (
            <>
                {ctx.url_trail.map((entry, i) => {
                    const { text, timestamp } = formatUrlTrailEntry(entry)
                    return (
                        <div key={i} className={styles.urlItem}>
                            <span className={styles.urlIndex}>{i + 1}</span>
                            <span className={styles.urlText}>{text}</span>
                            {timestamp && <span className={styles.urlTimestamp}>{timestamp}</span>}
                        </div>
                    )
                })}
            </>
        ),
    },
    {
        id: "cart",
        title: "Cart",
        isVisible: (ctx) => !!ctx?.cart_snapshot,
        render: (ctx) => {
            const cart = ctx.cart_snapshot
            if (!cart.items?.length) return <span className={styles.muted}>Empty</span>
            return (
                <>
                    {cart.items.map((item, i) => (
                        <Row
                            key={i}
                            label={item.name}
                            value={`${cart.currency || ""} ${item.price?.toFixed(2) || ""}`}
                        />
                    ))}
                    {cart.total != null && (
                        <div className={styles.cartTotal}>
                            <Row label="Total" value={`${cart.currency || ""} ${cart.total.toFixed(2)}`} />
                        </div>
                    )}
                </>
            )
        },
    },
    {
        id: "orders",
        title: "Orders",
        isVisible: (ctx) => ctx?.orders?.length > 0,
        render: (ctx) => (
            <>
                {ctx.orders.map(order => (
                    <div key={order.id} className={styles.orderBlock}>
                        <Row label={order.id} value={order.status} />
                        {order.shipments?.map((shp, i) => (
                            <div key={i} className={styles.shipment}>
                                {[shp.carrier, shp.tracking_no, shp.last_status].filter(Boolean).join(" · ")}
                            </div>
                        ))}
                    </div>
                ))}
            </>
        ),
    },
]

// ─── Panel ──────────────────────────────────────────────────

function ContextPanel({
                          snapshot,
                          threadId,
                          onResponse,
                          isOpen,
                          onClose,
                          getSectionColor,
                          getSectionScore,
                      }) {
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
                {tab === "context" ? (
                    <ContextTab
                        context={snapshot}
                        getSectionColor={getSectionColor}
                        getSectionScore={getSectionScore}
                    />
                ) : (
                    <ActionsTab
                        context={snapshot}
                        threadId={threadId}
                        onResponse={onResponse}
                    />
                )}
            </div>
        </div>
    )
}

// ─── Context tab ────────────────────────────────────────────

function ContextTab({ context, getSectionColor, getSectionScore }) {
    if (!context) return null

    const visible = SECTIONS.filter(s => s.isVisible(context))

    const sorted = [...visible].sort((a, b) => {
        const scoreA = getSectionScore?.(a.id) ?? 0
        const scoreB = getSectionScore?.(b.id) ?? 0
        if (scoreB !== scoreA) return scoreB - scoreA
        return SECTIONS.indexOf(a) - SECTIONS.indexOf(b)
    })

    return (
        <div className={styles.tabContent}>
            {sorted.map(section => (
                <Section
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    getSectionColor={getSectionColor}
                    getSectionScore={getSectionScore}
                >
                    {section.render(context)}
                </Section>
            ))}
        </div>
    )
}

// ─── Actions tab ────────────────────────────────────────────

function ActionsTab({ context, threadId, onResponse }) {
    const { buttons, loading } = usePromptButtons()
    const [firingId, setFiringId] = useState(null)

    const handlePromptButton = async (btn) => {
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

// ─── Primitives ─────────────────────────────────────────────

function Section({ id, title, getSectionColor, getSectionScore, children }) {
    const color = id ? getSectionColor?.(id) : null
    const score = id ? getSectionScore?.(id) ?? 0 : null

    const style = color
        ? { "--section-color": color, transition: "background-color 400ms ease" }
        : undefined

    return (
        <div
            className={styles.section}
            style={style}
            data-section-id={id}
            data-score={score != null ? score.toFixed(2) : undefined}
        >
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
        <button
            className={`${styles.tabBtn} ${active ? styles.tabBtnActive : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export { ContextPanel }