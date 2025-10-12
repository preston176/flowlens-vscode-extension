# 🌀 FlowLens — Instantly Resume Your Coding Flow

[![target](https://img.shields.io/badge/Target-VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![privacy](https://img.shields.io/badge/Privacy-Local_First-10B981?style=for-the-badge&logo=lock&logoColor=white)](./)
[![waitlist](https://img.shields.io/badge/Waitlist-29%2B_Developers-7C3AED?style=for-the-badge&logo=mailchimp&logoColor=white)](./)

  
![Screenshot](./.docs/screenshot.png)
  

<p align="center">
  <b>Website:</b> <a href="https://flowlens-vscode.vercel.app">flowlens-vscode.vercel.app</a> &nbsp;|&nbsp;
  <b><a href="./HOWTO.md">How To Use</a></b> &nbsp;|&nbsp;
  <b><a href="./SECURITY.md">Security</a></b> &nbsp;|&nbsp;
  <b><a href="./CONTRIBUTING.md">Contributing</a></b>
</p>

> **FlowLens** helps you save your work context in Visual Studio Code and instantly resume where you left off;

> open files, terminals, git branch, and notes: all restored with one click.


## 📘 Table of Contents

1. [What is FlowLens?](#-what-is-flowlens)
2. [Demo](#-demo)
3. [Prerequisites](#-prerequisites)
4. [How To Use FlowLens](#-how-to-use-flowlens)
   - [Capture Your Current Session](#capture-your-current-session)
   - [View and Resume a Saved Session](#view-and-resume-a-saved-session)
   - [Delete a Session](#delete-a-session)
5. [Expected Results](#-expected-results)
6. [Troubleshooting](#-troubleshooting)
7. [Additional Information](#-additional-information)
8. [Product Vision & Roadmap](#-product-vision--roadmap)
9. [License](#-license)
10. [Contributing](#-contributing)

---

## ✨ What is FlowLens?

**FlowLens** is a privacy-first extension for Visual Studio Code that helps developers capture and restore their coding sessions.

Each session snapshot includes:
- Open files and cursor positions  
- Terminal commands and state  
- Active git branch and commit  
- Optional short notes  

When you return, FlowLens restores your exact editor layout, terminal setup, and focus — so you can pick up right where you left off.

---

## 📸 Demo


![Screenshot](./docs/screenshot.png)

### Navigate Your Sessions Effortlessly

![Screenshot2](./docs/screenshot2.png)

### Quickly Jump Back Into Flow

![Screenshot3](./docs/screenshot3.png)


---

## 🛠️ Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) installed on your computer  
- FlowLens extension installed and enabled  
- Basic familiarity with VS Code’s Command Palette  

---

## 🧭 How To Use FlowLens

### 🪄 Capture Your Current Session

1. Work as usual — open files, terminals, etc.  
2. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> (Windows/Linux) or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> (Mac).  
3. Search for **`FlowLens: Capture Session`** and select it.  
4. Enter a short title (e.g. *“Fixing API Bug”*).  
5. Optionally, add a quick note to describe what you were doing.  
6. A success message confirms the capture.

### 🚀 View and Resume a Saved Session

1. Open the Command Palette again.  
2. Search for **`FlowLens: Open Sessions Panel`**.  
3. Browse your saved sessions in the panel.  
4. Use the search bar to filter by title, note, or file name.  
5. Click **Resume** next to any session to instantly restore your environment.

### 🗑️ Delete a Session

1. Open the **FlowLens Sessions Panel**.  
2. Locate the session you want to remove.  
3. Click **Delete** to permanently remove it.

---

## ✅ Expected Results

- Saved sessions appear in the panel with your title and notes.  
- Resuming restores your files, terminals, and layout.  
- Deleted sessions are removed immediately and cannot be recovered.  

---

## 🧩 Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|-----------|
| Sessions not appearing | No sessions captured yet | Capture a session and reload VS Code |
| Files not reopening | File moved or deleted | Check file paths and ensure access |
| Extension not working | Disabled or corrupt install | Re-enable or reinstall FlowLens |

---

## 💡 Additional Information

- FlowLens **never uploads your code** — only lightweight metadata (file paths, positions, git branch, notes).  
- All data is stored **locally** on your machine by default.  
- Optional sync (coming soon) will be end-to-end encrypted and fully opt-in.  
- Use notes to leave a “thought trail” for your future self.  

For updates or support, visit the [official website](https://flowlens-vscode.vercel.app).

---

## 🛤️ Product Vision & Roadmap

**Guiding Principles**
- 🧠 *Focus-first:* Reduce mental overhead of restarting work.  
- 🔒 *Private by design:* No code content ever leaves your device.  
- ⚡ *Fast and lightweight:* Restores sessions instantly.  
- 🧩 *Cross-editor future:* VS Code first; JetBrains, Neovim, and Sublime next.

**Roadmap**
- [x] Landing page & waitlist  
- [ ] Private alpha — core capture & resume flow (local-only)  
- [ ] Encrypted cross-device sync (opt-in)  
- [ ] Team workflows and shareable sessions (beta)  
- [ ] Deep editor integrations & plugin ecosystem  

---

## ⚖️ License

This repository currently contains marketing and design assets for FlowLens.  
All code and assets are proprietary at this stage.  

**© 2025 FlowLens Team. All rights reserved.**

---

## 🤝 Contributing

We welcome early feedback, ideas, and collaboration!  
Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

<p align="center">
  <sub>Built by developers obsessed with flow, focus, and frictionless coding.</sub><br/>
  <sub>Inspired by tools like Linear, Notion, and Apple’s design simplicity.</sub>
</p>
