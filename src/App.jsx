import './App.css'
import { ConversationPanel } from "./components/conversationPanel"
import { ThreadContextPanel } from "./components/threadContextPanel.jsx"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { MessageProvider } from "./context/MessageContext.jsx"
import { AuthProvider, useAuth } from "./context/AuthContext.jsx"
import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Settings } from "./components/settings.jsx"
import layout from './style/appLayout.module.css'


function MainApp() {
    const [selectedThreadId, setSelectedThreadId] = useState(null)

    return (
        <MessageProvider>
            <div
                className={layout.layout}
                data-view={selectedThreadId ? 'thread' : 'list'}
            >
                <ConversationPanel
                    setSelectedThreadId={setSelectedThreadId}
                    selectedThreadId={selectedThreadId}
                />
                <ThreadContextPanel
                    selectedThreadId={selectedThreadId}
                    onBack={() => setSelectedThreadId(null)}
                />
            </div>
        </MessageProvider>
    )
}

function AuthenticatedApp() {
    return (
        <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
    )
}

function UnauthenticatedApp() {
    const [showLogin, setShowLogin] = useState(true)

    return showLogin ? (
        <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
        <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
    )
}

function AppContent() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App