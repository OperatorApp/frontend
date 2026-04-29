import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../service/authService.js";
import { operatorService } from "../service/operatorService.js";
import { upsertKnowledge } from "../service/aiSuggestionService.js";
import { PromptButtons } from "./PromptButtons.jsx";

function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [apiKey, setApiKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    const [languages, setLanguages] = useState([]);
    const [newLanguage, setNewLanguage] = useState("");
    const [langLoading, setLangLoading] = useState(false);
    const [langError, setLangError] = useState(null);

    const [knowledge, setKnowledge] = useState("");
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [knowledgeError, setKnowledgeError] = useState(null);
    const [knowledgeSaved, setKnowledgeSaved] = useState(false);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const res = await operatorService.getLanguagesSer();
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.languages || []);
                setLanguages(list);
            } catch (err) {
                setLangError(err.message || "Failed to fetch languages");
            }
        };
        fetchLanguages();
    }, []);

    const handleGenerateApiKey = async () => {
        setLoading(true);
        setError(null);
        try {
            const generatedApiKey = await authService.generateApiKey();
            setApiKey(generatedApiKey);
        } catch (err) {
            setError(err.message || "Failed to generate API key");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddLanguage = async () => {
        const trimmed = newLanguage.trim();
        if (!trimmed) return;
        if (languages.includes(trimmed)) {
            setLangError("Language already added");
            return;
        }

        const updated = [...languages, trimmed];
        setLangLoading(true);
        setLangError(null);
        try {
            await operatorService.updateLanguageSer(updated);
            setLanguages(updated);
            setNewLanguage("");
        } catch (err) {
            setLangError(err.message || "Failed to add language");
        } finally {
            setLangLoading(false);
        }
    };

    const handleDeleteLanguage = async (lang) => {
        const updated = languages.filter(l => l !== lang);
        setLangLoading(true);
        setLangError(null);
        try {
            await operatorService.updateLanguageSer(updated);
            setLanguages(updated);
        } catch (err) {
            setLangError(err.message || "Failed to delete language");
        } finally {
            setLangLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddLanguage();
        }
    };

    const handleSaveKnowledge = async () => {
        if (!knowledge.trim()) return;
        setKnowledgeLoading(true);
        setKnowledgeError(null);
        setKnowledgeSaved(false);
        try {
            await upsertKnowledge(knowledge);
            setKnowledgeSaved(true);
            setTimeout(() => setKnowledgeSaved(false), 2500);
        } catch (err) {
            setKnowledgeError(err.message || "Failed to save knowledge");
        } finally {
            setKnowledgeLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <button onClick={() => navigate('/')} className="btn-back">
                Back
            </button>
            <h2>Settings</h2>

            <div className="settings-section">
                <h3>API Key</h3>
                <p>Generate an API key to access the service programmatically.</p>

                {apiKey && (
                    <div className="api-key-display">
                        <code>{apiKey}</code>
                        <button onClick={handleCopy} className="btn-copy">
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                )}

                {error && <p className="error-text">{error}</p>}

                <button
                    onClick={handleGenerateApiKey}
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? "Generating..." : apiKey ? "Regenerate API Key" : "Generate API Key"}
                </button>

                {apiKey && (
                    <p className="warning-text">
                        Store this key securely — it won't be shown again after you leave this page.
                    </p>
                )}
            </div>

            <div className="settings-section">
                <h3>Languages</h3>
                <p>Manage the languages you support.</p>

                <div className="language-add">
                    <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. English"
                        disabled={langLoading}
                    />
                    <button
                        onClick={handleAddLanguage}
                        disabled={langLoading || !newLanguage.trim()}
                        className="btn-primary"
                    >
                        Add
                    </button>
                </div>

                {langError && <p className="error-text">{langError}</p>}

                {languages.length === 0 ? (
                    <p className="muted-text">No languages added yet.</p>
                ) : (
                    <ul className="language-list">
                        {languages.map((lang) => (
                            <li key={lang} className="language-item">
                                <span>{lang}</span>
                                <button
                                    onClick={() => handleDeleteLanguage(lang)}
                                    disabled={langLoading}
                                    className="btn-danger-small"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="settings-section">
                <h3>Knowledge Base</h3>
                <p>Provide content the AI can reference when generating suggestions. Saving replaces the previous knowledge entry.</p>

                <textarea
                    value={knowledge}
                    onChange={(e) => setKnowledge(e.target.value)}
                    placeholder="Paste or type your knowledge base content here..."
                    disabled={knowledgeLoading}
                    rows={10}
                    className="knowledge-textarea"
                />

                {knowledgeError && <p className="error-text">{knowledgeError}</p>}

                <button
                    onClick={handleSaveKnowledge}
                    disabled={knowledgeLoading || !knowledge.trim()}
                    className="btn-primary"
                >
                    {knowledgeLoading ? "Saving..." : knowledgeSaved ? "Saved!" : "Save Knowledge"}
                </button>
            </div>

            <PromptButtons />

            <div className="settings-section">
                <h3>Account</h3>
                <button onClick={logout} className="btn-danger">
                    Log Out
                </button>
            </div>
        </div>
    );
}

export { Settings };