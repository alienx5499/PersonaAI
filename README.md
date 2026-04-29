# PersonaAI

PersonaAI is a persona-based AI chatbot built for Scaler Academy and InterviewBit-style mentorship. The app provides real, conversational responses using distinct system prompts for three personas:

- Anshuman Singh
- Abhimanyu Saxena
- Kshitij Mishra

It also supports multiple interaction modes (default chat, thinking, websearch, canvas) and multimodal inputs (image and PDF).

## Live Demo

- **Deployed URL:** [personaaimentor.vercel.app](https://personaaimentor.vercel.app)
- **Local dev (Next.js default):** `http://localhost:3000`

## Features

- Clean chat UI with a persona selector
- Switching personas resets the conversation and context
- Persona-specific suggestion chips (quick-start prompts)
- Typing indicator while the backend is generating a reply
- Mobile responsive layout
- Backend prompt wiring with persona-specific system prompts
- Graceful API error handling
- Safety hardening:
  - rate limiting for `POST /api/chat`
  - strict request timeouts and abort handling for LLM, web lookup, and PDF extraction

## Architecture (Mermaid)

```mermaid
flowchart TD
  U[User] --> UI[Frontend Chat UI\nPersona selector + chat panel]
  UI -->|POST /api/chat| API[Next.js API Route\nsrc/app/api/chat/route.ts]
  API --> RATE[Rate limit + timeout\nAbortController]
  API --> SVC[Chat service\nsrc/server/chat/chat-service.ts]
  SVC --> PROMPTS[Persona system prompts\nsrc/lib/system-prompts.ts]
  SVC --> MODES[Mode instructions\nsrc/server/chat/mode-instructions.ts]
  MODES --> WEB[Web search snippets\nsrc/server/chat/websearch.ts]
  MODES --> PDFTXT[PDF text extraction\nsrc/server/chat/pdf-extract.ts]
  SVC --> MODEL[NVIDIA LLM API\nOpenAI-compatible client]
  SVC --> POLICY[Sanitize output\ncontent-policy]
  POLICY --> UI

  %% Palette: handDrawn (from your sample)
  style U fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
  style UI fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
  style API fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style RATE fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style SVC fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style PROMPTS fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#7F1D1D
  style MODES fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B
  style WEB fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B
  style PDFTXT fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B
  style MODEL fill:#D1FAE5,stroke:#047857,stroke-width:2px,color:#064E3B
  style POLICY fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#3B0764
```

## Persona switch flow (Mermaid)

```mermaid
flowchart TD
  U[User] --> SEL[Select persona]
  SEL --> RESET[resetConversation]
  RESET --> UI[Frontend chat panel]
  UI --> API[POST /api/chat]
  API --> SVC[chat-service generateChatReply]
  SVC --> PROMPTS[Pick system prompt]
  PROMPTS --> LLM[NVIDIA LLM API]
  LLM --> REPLY[Sanitized assistant reply]
  REPLY --> UI2[Render response]

  %% Palette: handDrawn
  style U fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
  style SEL fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style RESET fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style UI fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
  style API fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style SVC fill:#FFEDD5,stroke:#F7931A,stroke-width:2px,color:#2D2D2D
  style PROMPTS fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#7F1D1D
  style LLM fill:#D1FAE5,stroke:#047857,stroke-width:2px,color:#064E3B
  style REPLY fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#3B0764
  style UI2 fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
```

## Setup

1. Clone the repo:
   - `git clone https://github.com/alienx5499/PersonaAI`
2. Go to the project folder:
   - `cd PersonaAI`
3. Install dependencies:
   - `pnpm install`
4. Configure environment:
   - Copy `./.env.example` to `./.env`
   - Set `NVIDIA_API_KEY` in `./.env` (never commit real keys)
5. Run locally:
   - `pnpm dev`
   - Open `http://localhost:3000`

## Screenshots

| #   | Screen                                            | Image                                                                                                                                          |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Persona selector + active state                   | <img width="3024" height="566" alt="Persona selector" src="https://github.com/user-attachments/assets/d2315139-bc7f-4954-b114-363a189ec058" /> |
| 2   | Chat panel with suggestions + attachment handling | <img width="3014" height="870" alt="Chat panel" src="https://github.com/user-attachments/assets/f78eac1b-23f6-41e9-9a73-9f57b0816507" />       |
| 3   | Full-page app view                                | <img width="3024" height="1650" alt="Full-page app view" src="https://github.com/user-attachments/assets/696afbcb-73c5-4e21-a17a-465e90737dc7" /> |

## Repo Notes

- Persona system prompts live in [`src/lib/system-prompts.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/lib/system-prompts.ts)
- The chat API route is in [`src/app/api/chat/route.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/app/api/chat/route.ts)
- The server-side chat orchestration is in [`src/server/chat/chat-service.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/server/chat/chat-service.ts)
- Multimodal mode helpers:
  - [`src/server/chat/websearch.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/server/chat/websearch.ts)
  - [`src/server/chat/pdf-extract.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/server/chat/pdf-extract.ts)
  - [`src/server/chat/mode-instructions.ts`](https://github.com/alienx5499/PersonaAI/blob/main/src/server/chat/mode-instructions.ts)
