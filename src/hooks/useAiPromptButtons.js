import { useState, useEffect } from "react";
import {
    getPromptButtons,
    createPromptButton,
    deletePromptButton,
    upsertPromptButton
} from "../service/aiPromptButtonsService.js";

function usePromptButtons() {
    const [buttons, setButtons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchButtons = async () => {
            setLoading(true);
            try {
                const data = await getPromptButtons();
                setButtons(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchButtons();
    }, []);

    const addButton = async (name, prompt) => {
        const newButton = await createPromptButton(name, prompt);
        setButtons(prev => [...prev, newButton]);
    };

    const removeButton = async (buttonId) => {
        await deletePromptButton(buttonId);
        setButtons(prev => prev.filter(b => b.id !== buttonId));
    };

    const updateButton = async (name, prompt) => {
        const updated = await upsertPromptButton(name, prompt);
        setButtons(prev => prev.map(b => b.name === name ? updated : b));
    };

    return { buttons, loading, error, addButton, removeButton, updateButton };
}

export { usePromptButtons };