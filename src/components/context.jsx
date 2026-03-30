// ContextPanel.jsx
import { useState, useEffect } from "react"
import { getContext } from "../service/threadcalls.jsx"
import styles from "../style/context.module.css"

function ContextPanel({ threadId }) {
    const [context, setContext] = useState(null)
    const [tab, setTab] = useState("context")

    useEffect(() => {
        const data = getContext(threadId)
        if (data) setContext(data)
    }, [threadId])

    if (!context) return <div className={styles.empty}>No context found</div>

    return (
        <div className={styles.panel}>
            <div className={styles.tabs}>
                <TabBtn label="Context"       active={tab === "context"} onClick={() => setTab("context")} />
                <TabBtn label="Quick Actions" active={tab === "actions"} onClick={() => setTab("actions")} />
            </div>
            <div className={styles.content}>
                {tab === "context" ? <ContextTab context={context} /> : <ActionsTab context={context} />}
            </div>
        </div>
    )
}

function ContextTab({ context }) {
    const { customer, session, orders } = context

    return (
        <div className={styles.tabContent}>

            <Section title="Customer">
                <Row label="Name"  value={customer.name} />
                <Row label="Email" value={customer.email} />
                <Row label="Lang"  value={customer.lang.toUpperCase()} />
            </Section>

            <Section title="Session">
                <Row label="Location"   value={`${session.city}, ${session.country}`} />
                <Row label="Local time" value={session.local_time} />
                <Row label="Currency"   value={session.cart_snapshot.currency} />
                <Row label="Sentiment"  value={`${session.sentiment_label} (${Math.round(session.sentiment_conf * 100)}%)`} />
            </Section>

            <Section title="URL Trail">
                {session.url_trail.map((url, i) => (
                    <div key={i} className={styles.urlItem}>
                        <span className={styles.urlIndex}>{i + 1}</span>
                        <span className={styles.urlText}>{url}</span>
                    </div>
                ))}
            </Section>

            <Section title="Cart">
                {session.cart_snapshot.items.length === 0
                    ? <span className={styles.muted}>Empty</span>
                    : <>
                        {session.cart_snapshot.items.map((item, i) => (
                            <Row key={i} label={item.name}
                                 value={`${session.cart_snapshot.currency} ${item.price.toFixed(2)}`} />
                        ))}
                        <div className={styles.cartTotal}>
                            <Row label="Total"
                                 value={`${session.cart_snapshot.currency} ${session.cart_snapshot.total.toFixed(2)}`} />
                        </div>
                    </>
                }
            </Section>

            <Section title="Orders">
                {orders.length === 0
                    ? <span className={styles.muted}>No orders</span>
                    : orders.map(order => (
                        <div key={order.id} className={styles.orderBlock}>
                            <Row label={order.id} value={order.status} />
                            {order.shipments.map((shp, i) => (
                                <div key={i} className={styles.shipment}>
                                    {shp.carrier} · {shp.tracking_no} · {shp.last_status}
                                </div>
                            ))}
                        </div>
                    ))
                }
            </Section>

        </div>
    )
}

function ActionsTab({ context }) {
    const { session, orders } = context
    const hasOrder = orders.length > 0

    return (
        <div className={styles.tabContent}>

            <Section title="Communication">
                <ActionBtn label="Request email" />
                <ActionBtn label="Request photo" />
                <ActionBtn label="Send tracking link" disabled={!hasOrder} />
            </Section>

            <Section title="Shipping">
                <ActionBtn label="Get shipping quote" />
                <ActionBtn label={`Shipping to ${session.country}`} />
            </Section>

            <Section title="Payment">
                <ActionBtn label="Send PayPal request" />
                <ActionBtn label="Apply discount" />
                <ActionBtn label="Issue refund" disabled={!hasOrder} />
            </Section>

            <Section title="Support">
                <ActionBtn label="Check return policy" />
                <ActionBtn label="Start return flow" disabled={!hasOrder} />
                <ActionBtn label="Search docs" />
            </Section>

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
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowValue}>{value}</span>
        </div>
    )
}

function ActionBtn({ label, disabled = false }) {
    return (
        <button className={`${styles.actionBtn} ${disabled ? styles.actionBtnDisabled : ""}`} disabled={disabled}>
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