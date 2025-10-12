# Copilot Instructions for FlowLens VS Code Extension

## Project Overview
- **FlowLens** is a privacy-first VS Code extension that captures and restores your coding context (open files, terminals, git state, notes) to help you resume work instantly after interruptions.
- The repo contains both the extension code and a marketing website (`website/`).
- **Current state:** Only the landing page prototype is implemented; extension code is planned.

## Architecture & Key Components
- **Landing Page:**
  - Located in `website/` (Vite + Preact + Tailwind CSS).
  - Main entry: `website/src/pages/App.tsx` (all UI/logic for the landing page).
  - Custom styles: `website/src/styles/tailwind.css` (includes both Tailwind and project-specific CSS).
  - Build/deploy: see `website/README.md` for local dev and Vercel deployment.
- **Extension (planned):**
  - Will use VS Code Extension API to capture editor/terminal state and provide a webview UI.
  - Planned build: `esbuild.js` bundles extension and webview assets into `dist/`.

## Developer Workflows
- **Website:**
  - `cd website && npm install`
  - `npm run dev` (local dev server)
  - `npm run build` (production build to `website/dist`)
  - `npm run preview` (preview production build)
- **Extension (future):**
  - `npm install` (root)
  - `node esbuild.js --production` (builds extension/webview to `dist/`)
  - Launch Extension Dev Host in VS Code (F5)
  - Use commands: `FlowLens: Capture Session`, `FlowLens: Open Sessions Panel`

## Project-Specific Patterns & Conventions
- **No code or file contents are ever uploaded**; only metadata is stored (see `README.md` for sample session JSON).
- **Custom CSS** is used for gradients, checkboxes, and VS Code-like UI in the landing page. See `tailwind.css` for non-Tailwind rules.
- **Cumulative checkmarks** and animated VS Code mock UI are implemented in `App.tsx`.
- **All session data is local by default**; optional sync is end-to-end encrypted (planned).

## Integration Points
- **Website:** Standalone, deployable to Vercel. No backend required.
- **Extension:** (Planned) Integrates with VS Code APIs for editor/terminal state, webview UI, and (optionally) sync providers.

## Key Files & Directories
- `website/src/pages/App.tsx` — Main landing page UI/logic
- `website/src/styles/tailwind.css` — Tailwind + custom CSS
- `esbuild.js` — Bundles extension/webview (future)
- `README.md` — Product vision, privacy, build instructions, and session metadata example

## Example: Session Metadata
```json
{
  "id": "session_2025-10-08_09-22",
  "title": "Fixing API bug",
  "editors": [
    { "path": "src/api/user.js", "cursor": { "line": 42, "col": 8 } }
  ],
  "terminals": [
    { "id": "term-1", "lastCommand": "npm run test:watch" }
  ],
  "git": { "branch": "fix/user-validation", "head": "a1b2c3d" },
  "notes": "Investigate validation edge-case for signup flow"
}
```

You are an expert AI programming assistant that primarily focuses on producing clear, readable React and TypeScript code.

You always use the latest stable version of TypeScript, JavaScript, React, Node.js, Next.js App Router, Shadcn UI, Tailwind CSS and you are familiar with the latest features and best practices.

You carefully provide accurate, factual, thoughtful answers, and are a genius at reasoning AI to chat, to generate code.

Style and Structure

Naming Conventions

TypeScript Usage

UI and Styling

Performance Optimization

Other Rules need to follow:

Don't be lazy, write all the code to implement features I ask for.

---

For more details, see the root `README.md` and `website/README.md`.

*If any conventions or workflows are unclear or missing, please request clarification or suggest updates!*
