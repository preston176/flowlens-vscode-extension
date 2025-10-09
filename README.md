# FlowLens — Preserve Your Flow. Resume Where You Left Off.

<!-- Badges -->
[![status](https://img.shields.io/badge/status-coming_soon-0ea5e9?style=for-the-badge&logo=clock)](./)
[![target](https://img.shields.io/badge/target-VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![privacy](https://img.shields.io/badge/privacy-local_first-10B981?style=for-the-badge&logo=lock&logoColor=white)](./)
[![waitlist](https://img.shields.io/badge/waitlist-500%2B_devs-7C3AED?style=for-the-badge&logo=mailchimp&logoColor=white)](./)
[![license](https://img.shields.io/badge/license-proprietary-6B7280?style=for-the-badge&logo=github&logoColor=white)](./)

> Coming soon — FlowLens is a code editor extension (primary target: VS Code). It remembers why you opened files, what you were debugging, and how your workflow looked — so when you return, you can instantly pick up where you left off.

FlowLens is a VS Code extension concept plus a lightweight companion UI that helps developers reclaim lost focus and reduce the cost of context switching.

---

## What FlowLens Does

- Captures a lightweight, privacy-first snapshot of your coding context (open files, tabs, cursor positions, terminals, git state and short notes).
- Groups sessions into meaningful work contexts automatically ("Fixing API bug", "UI cleanup", etc.).
- Lets you resume a session with one click — restoring the editor layout and reopening the right terminals and files so you can pick up exactly where you left off.

FlowLens is designed to reduce the daily friction developers face when context is lost: interruptions, machine restarts, and switching machines.

---

## Supported editors

FlowLens targets developer tooling broadly; initial rollout will prioritize VS Code. Planned editor support (roadmap):

[![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![JetBrains](https://img.shields.io/badge/JetBrains-000000?style=flat-square&logo=jetbrains&logoColor=white)](https://www.jetbrains.com/)
[![Neovim](https://img.shields.io/badge/Neovim-57A143?style=flat-square&logo=neovim&logoColor=white)](https://neovim.io/)
[![Vim](https://img.shields.io/badge/Vim-019733?style=flat-square&logo=vim&logoColor=white)](https://www.vim.org/)
[![Sublime](https://img.shields.io/badge/Sublime%20Text-FF9800?style=flat-square&logo=sublime-text&logoColor=white)](https://www.sublimetext.com/)

*Primary target: VS Code (alpha). Other editors are planned based on demand.*

---

## Product Principles

- Minimal: only store compact metadata needed to restore a workspace. No file contents are uploaded.
- Local-first: your context is owned by you and lives on your machine by default.
- Private: telemetry is minimized; we never collect code contents.
- Fast: restoring flow should be immediate — no hunting for files or terminal histories.

---

## How it will work (high-level)

1. Capture
   - FlowLens observes your active VS Code session and records lightweight metadata about the state: open editors and tabs (paths + cursor positions), terminal commands (history metadata), git HEAD/branch, and optional short notes.
   - Capture happens incrementally and locally so there is no blocking IO or heavy background work.

2. Sync (optional)
   - By default context lives locally. If you opt into cross-device sync, FlowLens encrypts and stores only metadata (not file contents) to your chosen sync backend or provider.
   - Sync is end-to-end encrypted; keys are controlled by you.

3. Resume
   - When you choose a session, FlowLens reopens files, restores split layout where possible, replays terminal commands (or restores last terminal state), and restores cursor positions/selection.
   - Resume is a single action that returns you to the exact mental state you had when you paused work.

---

## Privacy & Security

- Local by default: snapshots are stored on your machine unless you opt into sync.
- No code uploads: FlowLens does not upload file contents. Only compact metadata required to reconstruct layout and workflow is stored.
- Optional sync uses client-side encryption so unencrypted metadata never leaves your device.
- No analytics by default — we will ask for opt-in feedback during beta.

We will publish a dedicated security & privacy page before launch with full technical details.

---

## Typical session snapshot (example)

This is a simplified illustration of the metadata FlowLens stores for a session. It is intentionally compact and does NOT include file contents.

```json
{
  "id": "session_2025-10-08_09-22",
  "title": "Fixing API bug",
  "timestamp": "2025-10-08T09:22:00Z",
  "editors": [
    { "path": "src/api/user.js", "cursor": { "line": 42, "col": 8 } },
    { "path": "tests/user.test.js", "cursor": { "line": 10, "col": 2 } }
  ],
  "terminals": [
    { "id": "term-1", "lastCommand": "npm run test:watch" }
  ],
  "git": { "branch": "fix/user-validation", "head": "a1b2c3d" },
  "notes": "Investigate validation edge-case for signup flow"
}
```

---

## User experience (planned)

- One-click Resume: open the FlowLens panel and click Resume to restore a session.
- Smart grouping: sessions are auto-grouped by activity, filenames, and commit messages.
- Quick notes: add a short "thought trail" to remind your future self why you paused.

---

## Technical preview (planned stack)

- Platform: VS Code extension (primary) with a small companion UI for account & optional sync settings.
- Frontend prototype: React + TailwindCSS + Framer Motion; UI patterns inspired by shadcn/ui.
- Extension APIs: VS Code Extension API for editor state, terminals, and workspace metadata.
- Sync (optional): encrypted metadata sync to a user-chosen backend; client-side keys.

> Note: this repo currently contains the landing page prototype only. Extension and companion UI are future work.

---

## Roadmap

- [x] Landing page & waitlist
- [ ] Private alpha — core capture & resume flow (local-only)
- [ ] Encrypted sync across devices (opt-in)
- [ ] Shareable sessions & team workflows (beta)
- [ ] Editor integrations (deeper state restore, plugin ecosystem)

---

## FAQ

**Will FlowLens upload my code?**

No — FlowLens never uploads file contents. Only compact metadata used to reopen files/terminals is stored. Sync is optional and end-to-end encrypted.

**What happens with unsaved changes?**

The extension will preserve editor positions and either prompt you or offer a safe workflow to persist unsaved buffers. Details will be finalized during alpha.

**Can teams share sessions?**

Team sharing is on the roadmap as an opt-in feature — data sharing will be explicit and permissioned.

---

## Join the waitlist

FlowLens is coming soon. Join the waitlist from the landing page or contact us at: hello@flowlens.example (placeholder).

---

## Contact & Credits

Built by a small team of developers obsessed with flow and focused work. Design inspirations include Apple, Linear, and modern productivity tools.

For questions or partnership inquiries: hello@flowlens.example (placeholder).

---

## License

This repository currently contains marketing and design assets for FlowLens. Code and assets are proprietary for now — contact us to discuss licensing.

---

## Build & Release (webview)

The webview UI is bundled and shipped in `dist/` for offline use. To build the webview and the extension locally:

1. Install dev dependencies:

```bash
npm install
```

2. Build the extension and webview (production):

```bash
node esbuild.js --production
```

This produces:
- `dist/extension.js` — the compiled extension runtime.
- `dist/webview.js` — the bundled Preact webview (IIFE).
- `dist/webview.css` — compiled Tailwind CSS.

3. Run the extension in the Extension Development Host (F5). Use the command palette:
- `FlowLens: Capture Session` to capture state
- `FlowLens: Open Sessions Panel` to open the bundled webview

CI / Publishing

We recommend adding a GitHub Actions workflow that installs dependencies, builds the webview, runs tests and (optionally) publishes the extension using an `VSCE_TOKEN` secret.
