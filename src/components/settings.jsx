import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { authService } from "../service/authService.js"
import { operatorService } from "../service/operatorService.js"
import { upsertKnowledge } from "../service/aiSuggestionService.js"
import { PromptButtons } from "./PromptButtons.jsx"
import styles from "../style/settings.module.css"

function Settings() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const [apiKey, setApiKey] = useState(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(null)

    const [languages, setLanguages] = useState([])
    const [newLanguage, setNewLanguage] = useState("")
    const [langLoading, setLangLoading] = useState(false)
    const [langError, setLangError] = useState(null)

    const [knowledge, setKnowledge] = useState("")
    const [knowledgeLoading, setKnowledgeLoading] = useState(false)
    const [knowledgeError, setKnowledgeError] = useState(null)
    const [knowledgeSaved, setKnowledgeSaved] = useState(false)

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const res = await operatorService.getLanguagesSer()
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.languages || [])
                setLanguages(list)
            } catch (err) {
                setLangError(err.message || "Failed to fetch languages")
            }
        }
        fetchLanguages()
    }, [])

    const handleGenerateApiKey = async () => {
        setLoading(true)
        setError(null)
        try {
            const generatedApiKey = await authService.generateApiKey()
            setApiKey(generatedApiKey)
        } catch (err) {
            setError(err.message || "Failed to generate API key")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (!apiKey) return
        navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleAddLanguage = async () => {
        const trimmed = newLanguage.trim()
        if (!trimmed) return
        if (languages.includes(trimmed)) {
            setLangError("Language already added")
            return
        }
        const updated = [...languages, trimmed]
        setLangLoading(true)
        setLangError(null)
        try {
            await operatorService.updateLanguageSer(updated)
            setLanguages(updated)
            setNewLanguage("")
        } catch (err) {
            setLangError(err.message || "Failed to add language")
        } finally {
            setLangLoading(false)
        }
    }

    const handleDeleteLanguage = async (lang) => {
        const updated = languages.filter(l => l !== lang)
        setLangLoading(true)
        setLangError(null)
        try {
            await operatorService.updateLanguageSer(updated)
            setLanguages(updated)
        } catch (err) {
            setLangError(err.message || "Failed to delete language")
        } finally {
            setLangLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddLanguage()
        }
    }

    const handleSaveKnowledge = async () => {
        if (!knowledge.trim()) return
        setKnowledgeLoading(true)
        setKnowledgeError(null)
        setKnowledgeSaved(false)
        try {
            await upsertKnowledge(knowledge)
            setKnowledgeSaved(true)
            setTimeout(() => setKnowledgeSaved(false), 2500)
        } catch (err) {
            setKnowledgeError(err.message || "Failed to save knowledge")
        } finally {
            setKnowledgeLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <button onClick={() => navigate('/')} className={styles.back}>
                Back
            </button>
            <h2 className={styles.title}>Settings</h2>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>API Key</h3>
                <p className={styles.sectionDescription}>
                    Generate an API key to access the service programmatically.
                </p>

                {apiKey && (
                    <div className={styles.apiKeyDisplay}>
                        <code>{apiKey}</code>
                        <button onClick={handleCopy} className={styles.btnCopy}>
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                )}

                {error && <p className={styles.errorText}>{error}</p>}

                <button
                    onClick={handleGenerateApiKey}
                    disabled={loading}
                    className={styles.btnPrimary}
                >
                    {loading ? "Generating..." : apiKey ? "Regenerate API Key" : "Generate API Key"}
                </button>

                {apiKey && (
                    <p className={styles.warning}>
                        Store this key securely — it won't be shown again after you leave this page.
                    </p>
                )}
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Languages</h3>
                <p className={styles.sectionDescription}>Manage the languages you support.</p>

                <div className={styles.langAdd}>
                    <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. English"
                        disabled={langLoading}
                        className={styles.langInput}
                    />
                    <button
                        onClick={handleAddLanguage}
                        disabled={langLoading || !newLanguage.trim()}
                        className={styles.btnPrimary}
                    >
                        Add
                    </button>
                </div>

                {langError && <p className={styles.errorText}>{langError}</p>}

                {languages.length === 0 ? (
                    <p className={styles.muted}>No languages added yet.</p>
                ) : (
                    <ul className={styles.langList}>
                        {languages.map((lang) => (
                            <li key={lang} className={styles.langItem}>
                                <span>{lang}</span>
                                <button
                                    onClick={() => handleDeleteLanguage(lang)}
                                    disabled={langLoading}
                                    className={styles.btnDangerSmall}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Knowledge Base</h3>
                <p className={styles.sectionDescription}>
                    Provide content the AI can reference when generating suggestions. Saving replaces the previous knowledge entry.
                </p>

                <textarea
                    value={knowledge}
                    onChange={(e) => setKnowledge(e.target.value)}
                    placeholder="Paste or type your knowledge base content here..."
                    disabled={knowledgeLoading}
                    rows={10}
                    className={styles.knowledgeTextarea}
                />

                {knowledgeError && <p className={styles.errorText}>{knowledgeError}</p>}

                <button
                    onClick={handleSaveKnowledge}
                    disabled={knowledgeLoading || !knowledge.trim()}
                    className={styles.btnPrimary}
                >
                    {knowledgeLoading ? "Saving..." : knowledgeSaved ? "Saved!" : "Save Knowledge"}
                </button>
            </div>

            <PromptButtons />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Account</h3>
                <button onClick={logout} className={styles.btnDanger}>
                    Log Out
                </button>
            </div>
        </div>
    )
}

export { Settings }