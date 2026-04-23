import { useState } from "react";
import { usePromptButtons } from "../hooks/useAiPromptButtons.js";

function AddButtonModal({ onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!name.trim() || !prompt.trim()) {
            setError("Both fields are required.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit(name.trim(), prompt.trim());
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Add Prompt Button</h3>

                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Summarize"
                />

                <label>Prompt</label>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Summarize the conversation so far"
                    rows={4}
                />

                {error && <p className="error-text">{error}</p>}

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                        {submitting ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PromptButtons() {
    const { buttons, loading, error, addButton, removeButton } = usePromptButtons();
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="settings-section">
            <h3>Prompt Buttons</h3>
            <p>Quick-access buttons that appear in the chat interface.</p>

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <div className="prompt-buttons-list">
                {buttons.map(btn => (
                    <div key={btn.id} className="prompt-button-row">
                        <span className="prompt-button-name">{btn.name}</span>
                        <button
                            onClick={() => removeButton(btn.id)}
                            className="btn-danger"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={() => setShowModal(true)} className="btn-primary">
                + Add Button
            </button>

            {showModal && (
                <AddButtonModal
                    onClose={() => setShowModal(false)}
                    onSubmit={addButton}
                />
            )}
        </div>
    );
}

export { PromptButtons };