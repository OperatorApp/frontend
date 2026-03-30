import moment from "moment"




function isIdThread(thread, id) {
    if (!thread) {
        return false
    }
    return thread.customer_id === id

}

function isIdMessage(message, id) {
    return message.thread_id === id;
}

function getThreads(customerId) {
    if (!customerId) return <div>Select a user</div>
    return ThreadArr.find((thread) => isIdThread(thread, customerId))
}


function getMessages(thread_id) {
    return Message.filter((messages) => isIdMessage(messages, thread_id))
}


function changeStatusThread(thread) {
    thread.status = "OPEN"
}


function getContext(threadId) {
    return MOCK_CONTEXT[threadId] || null
}

function addMessage(threadId, msgOrText) {
    const thread = ThreadArr.find(t => t.id === threadId)
    if (!thread) return
    if (typeof msgOrText === "string") {
        Message.push({
            id: "msg_" + Date.now(),
            thread_id: threadId,
            sender: "operator",
            text_original: msgOrText,
            lang_detected: "fr",
            text_translated: null,
            qe_bucket: null,
            created_at: new Date().toISOString(),
        })
    } else {
        Message.push({...msgOrText, thread_id: threadId})
    }
}

export {getThreads, getMessages, changeStatusThread, addMessage, getContext}


let ThreadArr = [
    {
        id: "thread_1",
        customer_id: 1,
        session_id: "sess_11",
        status: "OPEN",
        created_at: moment().subtract(18, "minutes").toISOString(),
        last_message_at: moment().subtract(2, "minutes").toISOString(),
    },
    {
        id: "thread_2",
        customer_id: 2,
        session_id: "sess_5",
        status: "NEW",
        created_at: moment().subtract(35, "minutes").toISOString(),
        last_message_at: moment().subtract(5, "minutes").toISOString(),
    },
]

let Message = [
    // Kaylen opens in German
    {
        id: "msg_1", thread_id: "thread_1",
        sender: "customer",
        text_original: "Hallo! Ich möchte ein pH-Messgerät für mein Aquarium bestellen. Liefern Sie nach Österreich?",
        lang_detected: "de",
        created_at: moment().subtract(18, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "Bonjour ! Je voudrais commander un pH-mètre pour mon aquarium. Livrez-vous en Autriche ?",
        qe_score: 0.91,
        qe_bucket: "HIGH",
    },
    // Olivier replies in French, customer sees German
    {
        id: "msg_2", thread_id: "thread_1",
        sender: "operator",
        text_original: "Bonjour Kaylen ! Oui, nous livrons en Autriche. Quel type d'aquarium avez-vous, eau douce ou eau de mer ?",
        lang_detected: "fr",
        created_at: moment().subtract(15, "minutes").toISOString(),
        target_lang: "de",
        text_translated: "Hallo Kaylen! Ja, wir liefern nach Österreich. Was für ein Aquarium haben Sie – Süßwasser oder Salzwasser?",
        qe_score: 0.94,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_3", thread_id: "thread_1",
        sender: "customer",
        text_original: "Süßwasser, 200 Liter. Ich habe ein Budget von etwa 60 Euro.",
        lang_detected: "de",
        created_at: moment().subtract(13, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "Eau douce, 200 litres. Mon budget est d'environ 60 euros.",
        qe_score: 0.96,
        qe_bucket: "HIGH",
    },
    // AI suggests two product links — one is hallucinated (edge case)
    {
        id: "msg_4", thread_id: "thread_1",
        sender: "ai_suggestion",
        text_original: "Suggestion: Blue Lab pH Pen (REF: BL-PH-001) — €48.99 ✓\nHanna Instruments HI98103 (REF: HI-103-XX) — €54.00 ⚠️ ref unverified",
        lang_detected: "fr",
        created_at: moment().subtract(11, "minutes").toISOString(),
        target_lang: null,
        text_translated: null,
        qe_score: null,
        qe_bucket: null,
    },
    // Operator edits, removes bad link, sends shipping info
    {
        id: "msg_5", thread_id: "thread_1",
        sender: "operator",
        text_original: "Je vous recommande le Blue Lab pH Pen à €48,99. La livraison en Autriche est €6,50, délai 3–5 jours. Puis-je avoir votre email pour envoyer la demande PayPal ?",
        lang_detected: "fr",
        created_at: moment().subtract(8, "minutes").toISOString(),
        target_lang: "de",
        text_translated: "Ich empfehle den Blue Lab pH Pen für €48,99. Der Versand nach Österreich kostet €6,50, Lieferzeit 3–5 Tage. Darf ich Ihre E-Mail für die PayPal-Anfrage haben?",
        qe_score: 0.89,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_6", thread_id: "thread_1",
        sender: "customer",
        text_original: "kaylen.weber@gmail.com — danke!",
        lang_detected: "de",
        created_at: moment().subtract(5, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "kaylen.weber@gmail.com — merci !",
        qe_score: 0.99,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_7", thread_id: "thread_1",
        sender: "operator",
        text_original: "Parfait, demande PayPal envoyée ! Bonne journée 🙂",
        lang_detected: "fr",
        created_at: moment().subtract(2, "minutes").toISOString(),
        target_lang: "de",
        text_translated: "Super, PayPal-Anfrage gesendet! Einen schönen Tag noch 🙂",
        qe_score: 0.97,
        qe_bucket: "HIGH"
    },
    {
        id: "msg_8", thread_id: "thread_2",
        sender: "customer",
        text_original: "Hi, my pH probe readings are way off, it's been jumping between 4 and 9 randomly.",
        lang_detected: "en",
        created_at: moment().subtract(35, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "Bonjour, mes mesures de sonde pH sont complètement fausses, elles oscillent entre 4 et 9 aléatoirement.",
        qe_score: 0.88,
        qe_bucket: "HIGH",
    },
    // Olivier sees purchase context: probe bought 5 months ago
    {
        id: "msg_9", thread_id: "thread_2",
        sender: "operator",
        text_original: "Bonjour Tristan ! J'ai votre commande — sonde HI98103, achetée il y a 5 mois. Avez-vous essayé de la calibrer récemment ?",
        lang_detected: "fr",
        created_at: moment().subtract(32, "minutes").toISOString(),
        target_lang: "en",
        text_translated: "Hi Tristan! I have your order — HI98103 probe, purchased 5 months ago. Have you tried calibrating it recently?",
        qe_score: 0.93,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_10", thread_id: "thread_2",
        sender: "customer",
        text_original: "No, I didn't know I had to. How do I do that?",
        lang_detected: "en",
        created_at: moment().subtract(29, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "Non, je ne savais pas que c'était nécessaire. Comment faire ?",
        qe_score: 0.97,
        qe_bucket: "HIGH",
    },
    // AI step-by-step — hallucinated step (edge case)
    {
        id: "msg_11", thread_id: "thread_2",
        sender: "ai_suggestion",
        text_original: "Calibration steps:\n1. Rinse probe with distilled water\n2. Dip in pH 7 buffer for 2 min\n3. Press CAL on device ⚠️ (HI98103 has no CAL button — hallucinated)\n4. Repeat with pH 4 buffer\n5. Rinse and store in KCl solution",
        lang_detected: "fr",
        created_at: moment().subtract(26, "minutes").toISOString(),
        target_lang: null, text_translated: null, qe_score: null, qe_bucket: null,
    },
    // Operator rewrites removing bad step
    {
        id: "msg_12", thread_id: "thread_2",
        sender: "operator",
        text_original: "Voici comment calibrer :\n1. Rincez la sonde à l'eau distillée\n2. Plongez-la dans le tampon pH 7 pendant 2 min — l'écran se stabilise automatiquement\n3. Répétez avec le tampon pH 4\n4. Rincez et stockez dans la solution KCl\nDites-moi ce que vous observez !",
        lang_detected: "fr",
        created_at: moment().subtract(23, "minutes").toISOString(),
        target_lang: "en",
        text_translated: "Here's how to calibrate:\n1. Rinse the probe with distilled water\n2. Dip in pH 7 buffer for 2 min — the screen stabilises automatically\n3. Repeat with pH 4 buffer\n4. Rinse and store in KCl solution\nLet me know what you see!",
        qe_score: 0.91,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_13", thread_id: "thread_2",
        sender: "customer",
        text_original: "I tried it but the readings are still totally wrong even after calibration. It won't stabilise at all.",
        lang_detected: "en",
        created_at: moment().subtract(15, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "J'ai essayé mais les mesures sont toujours fausses après la calibration. Ça ne se stabilise pas du tout.",
        qe_score: 0.90,
        qe_bucket: "HIGH",
    },
    // Probe is malfunctioning — return flow triggered
    {
        id: "msg_14", thread_id: "thread_2",
        sender: "operator",
        text_original: "D'accord, cela indique un défaut de la sonde. Elle est sous garantie (6 mois). Je vais créer un retour pour vous — vous recevrez une étiquette d'envoi par email sous 24h.",
        lang_detected: "fr",
        created_at: moment().subtract(8, "minutes").toISOString(),
        target_lang: "en",
        text_translated: "Okay, this points to a probe defect. It's still under warranty (6 months). I'll create a return for you — you'll receive a shipping label by email within 24h.",
        qe_score: 0.95,
        qe_bucket: "HIGH",
    },
    {
        id: "msg_15", thread_id: "thread_2",
        sender: "customer",
        text_original: "That's great, thank you so much for your help!",
        lang_detected: "en",
        created_at: moment().subtract(5, "minutes").toISOString(),
        target_lang: "fr",
        text_translated: "Super, merci beaucoup pour votre aide !",
        qe_score: 0.98,
        qe_bucket: "HIGH",
    }
]


const MOCK_CONTEXT = {
    thread_1: {
        // SessionContextSnapshot
        session: {
            country: "AT",
            city: "Vienna",
            local_time: "10:32 AM",
            url_trail: ["/products/ph-meters", "/products/bluelab-ph-pen", "/cart"],
            cart_snapshot: {
                items: [{ref: "BL-PH-001", name: "Bluelab pH Pen", qty: 1, price: 48.99}],
                total: 48.99,
                currency: "EUR",
            },
            sentiment_label: "positive",
            sentiment_conf: 0.82,
        },
        // Customer
        customer: {
            id: 1,
            name: "Kaylen Weber",
            email: "kaylen.weber@gmail.com",
            lang: "de",
        },
        // Orders + Shipments
        orders: [
            {
                id: "ord_441",
                status: "PENDING_PAYMENT",
                created_at: "2025-03-10T09:14:00Z",
                shipments: [],
            },
        ],
        // ThreadPaintState
        paint: {
            intent: "purchase",
            shipping_needed: true,
            product_identified: true,
            payment_method: "paypal",
            ai_flag: "bad_product_ref",
        },
    },

    thread_2: {
        session: {
            country: "FR",
            city: "Lyon",
            local_time: "10:25 AM",
            url_trail: ["/support", "/support/troubleshooting", "/products/hanna-hi98103"],
            cart_snapshot: {items: [], total: 0, currency: "EUR"},
            sentiment_label: "frustrated",
            sentiment_conf: 0.76,
        },
        customer: {
            id: 2,
            name: "Tristan Moreau",
            email: "tristan.moreau@gmail.com",
            lang: "en",
        },
        orders: [
            {
                id: "ord_187",
                status: "DELIVERED",
                created_at: "2024-10-01T14:00:00Z",
                shipments: [
                    {
                        id: "shp_88",
                        carrier: "DHL",
                        tracking_no: "1Z999AA10123456784",
                        last_status: "DELIVERED",
                        last_seen_at: "2024-10-06T11:30:00Z",
                    },
                ],
            },
        ],
        paint: {
            intent: "technical_support",
            product_ref: "HI98103",
            purchase_age_days: 152,
            warranty_valid: true,
            resolution_path: "return_initiated",
            ai_flag: "hallucinated_step",
        },
    },
}


// src/datacalls/scenarios.js

const scenarios = {
    thread_1: [
        {
            id: "msg_1",
            sender: "customer",
            text_original: "Hallo! Ich möchte ein pH-Messgerät bestellen. Liefern Sie nach Österreich?",
            lang_detected: "de",
            text_translated: "Bonjour ! Je voudrais commander un pH-mètre. Livrez-vous en Autriche ?",
            qe_bucket: "HIGH",
            // what the context panel should show after this message
            contextUpdate: null,
        },
        {
            id: "msg_2",
            sender: "operator",
            text_original: "Bonjour Kaylen ! Oui, nous livrons en Autriche. Eau douce ou eau de mer ?",
            lang_detected: "fr",
            text_translated: "Hallo Kaylen! Ja, wir liefern nach Österreich. Süßwasser oder Salzwasser?",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            id: "msg_3",
            sender: "customer",
            text_original: "Süßwasser, 200 Liter. Budget etwa 60 Euro.",
            lang_detected: "de",
            text_translated: "Eau douce, 200 litres. Budget environ 60 euros.",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            // AI suggests products — one is hallucinated
            id: "msg_4",
            sender: "ai_suggestion",
            text_original: "Suggestion:\n• Bluelab pH Pen (REF: BL-PH-001) — €48.99 ✓\n• Hanna HI98103 (REF: HI-103-XX) — €54.00 ⚠️ ref unverified",
            lang_detected: "fr",
            text_translated: null,
            qe_bucket: null,
            contextUpdate: {
                intent: "purchase",
                product_identified: true,
                ai_flag: "bad_product_ref",   // makes context panel show warning
            },
        },
        {
            id: "msg_5",
            sender: "operator",
            text_original: "Je recommande le Bluelab pH Pen €48,99. Livraison Autriche €6,50, 3–5 jours. Votre email pour PayPal ?",
            lang_detected: "fr",
            text_translated: "Ich empfehle den Bluelab pH Pen €48,99. Versand Österreich €6,50, 3–5 Tage. Ihre Email für PayPal?",
            qe_bucket: "HIGH",
            contextUpdate: {
                shipping_needed: true,
                payment_method: "paypal",
            },
        },
        {
            id: "msg_6",
            sender: "customer",
            text_original: "kaylen.weber@gmail.com — danke!",
            lang_detected: "de",
            text_translated: "kaylen.weber@gmail.com — merci !",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            id: "msg_7",
            sender: "operator",
            text_original: "Parfait, demande PayPal envoyée ! Bonne journée 🙂",
            lang_detected: "fr",
            text_translated: "Super, PayPal-Anfrage gesendet! Einen schönen Tag 🙂",
            qe_bucket: "HIGH",
            contextUpdate: {resolved: true},
        },
    ],

    thread_2: [
        {
            id: "msg_8",
            sender: "customer",
            text_original: "Hi, my pH probe readings are jumping between 4 and 9 randomly.",
            lang_detected: "en",
            text_translated: "Mes mesures de sonde pH oscillent entre 4 et 9 aléatoirement.",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            id: "msg_9",
            sender: "operator",
            text_original: "Bonjour Tristan ! Sonde HI98103, achetée il y a 5 mois. Avez-vous calibré récemment ?",
            lang_detected: "fr",
            text_translated: "Hi Tristan! HI98103 probe, bought 5 months ago. Calibrated recently?",
            qe_bucket: "HIGH",
            contextUpdate: {
                product_ref: "HI98103",
                purchase_age_days: 152,
                warranty_valid: true,
            },
        },
        {
            id: "msg_10",
            sender: "customer",
            text_original: "No, I didn't know I had to. How do I do that?",
            lang_detected: "en",
            text_translated: "Non, je ne savais pas. Comment faire ?",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            // AI gives steps — one is hallucinated
            id: "msg_11",
            sender: "ai_suggestion",
            text_original: "1. Rinse with distilled water\n2. Dip in pH 7 buffer 2 min\n3. Press CAL button ⚠️ (HI98103 has no CAL button)\n4. Repeat pH 4\n5. Store in KCl",
            lang_detected: "fr",
            text_translated: null,
            qe_bucket: null,
            contextUpdate: {ai_flag: "hallucinated_step"},
        },
        {
            // Operator rewrites removing bad step
            id: "msg_12",
            sender: "operator",
            text_original: "1. Rincez à l'eau distillée\n2. Tampon pH 7 pendant 2 min — stabilisation automatique\n3. Répétez pH 4\n4. Stockez dans KCl",
            lang_detected: "fr",
            text_translated: "1. Rinse with distilled water\n2. pH 7 buffer 2 min — auto stabilises\n3. Repeat pH 4\n4. Store in KCl",
            qe_bucket: "HIGH",
            contextUpdate: {ai_flag: null},
        },
        {
            id: "msg_13",
            sender: "customer",
            text_original: "Still totally wrong even after calibration. Won't stabilise at all.",
            lang_detected: "en",
            text_translated: "Toujours faux après calibration. Ça ne se stabilise pas.",
            qe_bucket: "HIGH",
            // probe is broken — triggers return flow in context
            contextUpdate: {
                resolution_path: "return_initiated",
                warranty_valid: true,
            },
        },
        {
            id: "msg_14",
            sender: "operator",
            text_original: "Défaut de sonde confirmé. Encore sous garantie (6 mois). Je crée un retour — étiquette envoi par email sous 24h.",
            lang_detected: "fr",
            text_translated: "Probe defect confirmed. Still under warranty (6 months). Creating a return — shipping label by email within 24h.",
            qe_bucket: "HIGH",
            contextUpdate: null,
        },
        {
            id: "msg_15",
            sender: "customer",
            text_original: "That's great, thank you so much!",
            lang_detected: "en",
            text_translated: "Super, merci beaucoup !",
            qe_bucket: "HIGH",
            contextUpdate: {resolved: true},
        },
    ],
}

export {scenarios}