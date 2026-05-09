# OperatorApp — Frontend (Operator Dashboard)

The web dashboard that customer support operators use to handle conversations from the OperatorApp platform. Built with React 19 and Vite, it talks to the [`backend`](https://github.com/OperatorApp/backend) over REST and Socket.IO.

---

## Features

- **Two-panel layout** — conversation list on the left, thread context panel on the right. On narrow viewports it switches to a stacked view (controlled by a `data-view` attribute on the layout root).
- **Real-time messaging** — Socket.IO client receives `message`, `thread_updated`, and `paint_updated` events live.
- **Filterable thread list** — filter by customer name, "pending only", and "has messages".
- **Paint State visualization** — each thread shows a `ThreadColorIndicator` derived from its base hue, and the context panel brightens sections (customer, session, cart, orders, sentiment, URL trail) as their relevance scores climb.
- **AI helpers**
    - **AI suggestion** — generates a draft reply for the operator from the last 5 messages.
    - **Prompt buttons** — saved prompts that fire against the operator's knowledge base.
- **Knowledge base editor** — paste in product/policy text; the backend syncs it to an OpenAI vector store.
- **Settings** — change preferred languages, generate API keys for the embedded customer widget.
- **Auth** — login / register flows with JWT stored in `localStorage`.

---

## Tech stack

- React 19
- Vite 7
- React Router 7
- Socket.IO client 4
- Lucide React (icons)
- Moment (timestamps)
- CSS Modules + design tokens (`src/style/tokens.css`)

---

## Prerequisites

- Node.js 18+
- A running [`backend`](https://github.com/OperatorApp/backend) (defaults to `http://localhost:3001`)

---

## Setup

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:5173)
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:3001` (see [`vite.config.js`](./vite.config.js)). If your backend runs elsewhere, update the proxy target.

---

## Environment variables

Create a `.env` in the project root:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Base URL for REST calls. Leave as `/api` to use the Vite dev proxy. |
| `VITE_SOCKET_URL` | `http://localhost:3001` | URL of the backend Socket.IO server. |

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint over the project. |

---

## Project structure

```
frontend/
├── index.html
├── vite.config.js                # /api proxy → backend
├── eslint.config.js
├── public/
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx                   # Routes + auth gate + main layout
    ├── components/
    │   ├── LoginForm.jsx
    │   ├── RegisterForm.jsx
    │   ├── conversationPanel.jsx     # Thread list + filters
    │   ├── threadContextPanel.jsx    # Right-hand context + chat
    │   ├── ThreadColorIndicator.jsx  # Paint State swatch
    │   ├── PromptButtons.jsx
    │   ├── settings.jsx
    │   └── context.jsx
    ├── hooks/
    │   ├── useThreads.js             # List threads with filters
    │   ├── useThread.js              # Single-thread state
    │   ├── usePaintState.js          # Subscribes to paint_updated
    │   ├── useAiSugesstion.js        # Generates draft replies
    │   ├── useAiPromptButtons.js     # CRUD for prompt buttons
    │   └── useScrollBottom.js
    ├── service/                  # API + socket clients
    │   ├── authService.js
    │   ├── threadService.jsx
    │   ├── messageService.jsx
    │   ├── paintService.js
    │   ├── operatorService.js
    │   ├── aiSuggestionService.js
    │   └── aiPromptButtonsService.js
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── MessageContext.jsx
    │   └── context.jsx
    ├── style/                    # CSS modules + tokens
    └── assets/
```

---

## How it connects to the backend

- **REST** — through `import.meta.env.VITE_API_URL` (default `/api`, proxied to the backend in dev). Endpoints used: `/auth/*`, `/thread/*`, `/ai/*`, `/operator/*`.
- **Socket.IO** — connects to `VITE_SOCKET_URL` with `auth.token` (the JWT from `localStorage`). The dashboard joins:
    - The selected `thread_<id>` room (for `message` and `paint_updated` events).
    - The global `operators` room (for `thread_updated` events when any thread receives activity).
- **Auth** — JWT is stored in `localStorage` under `access_token` and sent as a `Bearer` token on REST calls. The `AuthContext` exposes `isAuthenticated`, `loading`, `login`, `register`, `logout`.

---

## License

MIT