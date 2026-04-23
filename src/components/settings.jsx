import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../service/authService.js";
import {PromptButtons} from "./PromptButtons.jsx";

function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [apiKey, setApiKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

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
