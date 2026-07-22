# Quizzly

React + Express App for a real-time multiplayer quiz game. The full product/feature spec lives in [scope.md](./scope.md) — treat it as the authoritative source for features, edge cases, and the color palette.

## Repo layout

npm workspaces monorepo:

- `client/` — React + Vite + TypeScript frontend
- `server/` — Node.js + TypeScript backend

Neither workspace is scaffolded yet — this file documents the committed stack ahead of implementation.

## Full Stack Overview

### Client

- React + Vite + TypeScript
- TailwindCSS
- React Router v6
- React Context + useReducer — game, lobby, chat state
- TanStack Query — REST API calls
- Socket.io client — real-time events
- Uploadthing — file uploads

### Server

- Node.js + TypeScript
- Express — REST API
- Socket.io — real-time
- Prisma + PostgreSQL (Neon)
- Auth.js — credentials + Google OAuth
- OpenAI — quiz + answer generation (structured output)
- Uploadthing — file storage
- In-memory Map — active room state (no Redis)
- Zod — validation
- bcryptjs — password hashing

### Database

- PostgreSQL via Neon
- Prisma ORM

### File Storage

- Uploadthing — avatars, quiz cover images

### AI

- OpenAI — `gpt-4o` default, `gpt-4o-mini` as cost fallback
- Structured JSON output — non-agentic, single call per generation
- Two use cases:
  - Generate full quiz from title
  - Generate answer options from question text + quiz title

## Package manager & commands

npm. Once scaffolded:

- `npm install` — installs all workspaces from the root
- `npm run dev --workspace=client` — frontend dev server
- `npm run dev --workspace=server` — backend dev server

(Placeholders — no scripts exist yet.)

## Deployment — Railway

Two services from the same GitHub repo — `client/` and `server/`.
Database: Railway Postgres plugin or paste Neon connection string as `DATABASE_URL`.
Railway supports WebSockets natively.
Run Prisma migrations at build time not start time.
Never hardcode localhost — use `VITE_API_URL` and `VITE_SOCKET_URL` env vars.

## Conventions

- TypeScript strict mode across both workspaces.
- No comments unless explaining a non-obvious "why."
- Reuse existing patterns/utilities before adding new ones; no premature abstraction.

---

## Primary responsibilities

Claude Code owns the client folder entirely:

- All UI pages and components
- All context + reducer logic
- All REST API calls via TanStack Query
- Animations and transitions

Ethan owns the server:

- Express routes
- Socket.io event handlers
- Game state management
- Scoring logic
- Auth
- All socket event listeners

## Server assistance disclaimer

Claude Code may assist with server code when explicitly asked by Ethan.
When helping with server code:

- Follow the same Controller / Service / Repository pattern
- Never modify auth logic unless explicitly asked
- Never modify socket event names
- Always confirm before adding new dependencies
- Zod for all validation
- Async errors must use asyncHandler wrapper

## Rules

- Never modify anything in /server unless explicitly asked
- Never create or emit socket events not listed in the table above — ask first
- Use Context + useReducer for all game, lobby, chat, and auth state
- Use TanStack Query for all REST API calls
- Never store auth token in localStorage — keep in memory via AuthContext
- TailwindCSS only — no inline styles, no CSS modules
- TypeScript strict — no any, no type assertions unless absolutely necessary
- All components must handle loading, error, and empty states
- Ask before adding any new dependency
