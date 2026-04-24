import { useState } from "react";
import { usePromptButtons } from "../hooks/useAiPromptButtons.js";
import styles from "../style/settings.module.css";

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
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
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

                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.btnSecondary}>Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting} className={styles.btnPrimary}>
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
        <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Prompt Buttons</h3>
            <p className={styles.sectionDescription}>
                Quick-access buttons that appear in the chat interface.
            </p>

            {loading && <p className={styles.sectionDescription}>Loading...</p>}
            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.promptList}>
                {buttons.map(btn => (
                    <div key={btn.id} className={styles.promptRow}>
                        <span className={styles.promptName}>{btn.name}</span>
                        <button
                            onClick={() => removeButton(btn.id)}
                            className={styles.btnDanger}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={() => setShowModal(true)} className={styles.btnPrimary}>
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