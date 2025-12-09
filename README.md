# FlowLens

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/preston176.flowlens?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=preston176.flowlens)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/preston176.flowlens?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=preston176.flowlens)
[![License](https://img.shields.io/badge/license-Proprietary-blue?style=flat-square)](./LICENSE)

Context-aware session management for VS Code. Capture and restore your complete development environment—open editors, terminal state, git context, and cursor positions.

**Links:** [Marketplace](https://marketplace.visualstudio.com/items?itemName=preston176.flowlens) | [Website](https://flowlens-vscode.vercel.app) | [Security](./.docs/SECURITY.md)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Session Data Model](#session-data-model)
- [Configuration](#configuration)
- [Development](#development)
- [Roadmap](#roadmap)
- [License](#license)

---

## Quick Start

### Installation

```bash
code --install-extension preston176.flowlens
```

### Basic Usage

1. **Capture**: Command Palette (`Cmd+Shift+P`) → `FlowLens: Show Sessions` → Create new
2. **Restore**: `FlowLens: Show Sessions` → Select session
3. **Analytics**: `FlowLens: Open Dashboard`

**Requirements**: VS Code >= 1.104.0, Git (optional)

---

## Features

### Core Capabilities

- **Session Snapshots**: Capture editor state, terminals, git branch, and workspace folders
- **Instant Restore**: Reopen files at exact cursor positions, recreate terminals, checkout branches
- **Privacy-First**: All data stored locally in VS Code GlobalState—no code content uploaded
- **Auto-Capture**: Trigger on git branch switch, workspace change, or idle timeout
- **Analytics**: Track context switching patterns and productivity metrics

### Session Contents

- Open files with cursor positions and selections
- Terminal working directories and last commands
- Git branch, commit SHA, and dirty state
- Workspace folders and custom notes

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Commands["Command Layer"]
        CMD_SHOW["Show Sessions"]
        CMD_DASH["Open Dashboard"]
        CMD_SHARE["Share Session"]
    end
    
    subgraph Services["Service Layer"]
        SVC_STORAGE["StorageService"]
        SVC_EDITOR["EditorService"]
        SVC_GIT["GitService"]
        SVC_WORKSPACE["WorkspaceService"]
        SVC_ANALYTICS["AnalyticsService"]
        SVC_AUTO["AutoCaptureService"]
    end
    
    subgraph API["VS Code API"]
        API_WORKSPACE["workspace.*"]
        API_WINDOW["window.*"]
        API_SCM["scm.*"]
    end
    
    subgraph Storage["Storage Layer"]
        STORE_LOCAL["GlobalState<br/>(Local)"]
        STORE_CLOUD["Cloud Sync<br/>(Planned)"]
    end
    
    CMD_SHOW --> SVC_STORAGE
    CMD_SHOW --> SVC_EDITOR
    CMD_DASH --> SVC_ANALYTICS
    CMD_SHARE --> SVC_STORAGE
    
    SVC_EDITOR --> API_WINDOW
    SVC_GIT --> API_SCM
    SVC_WORKSPACE --> API_WORKSPACE
    SVC_AUTO --> SVC_GIT
    SVC_AUTO --> SVC_EDITOR
    
    SVC_STORAGE --> STORE_LOCAL
    SVC_ANALYTICS --> STORE_LOCAL
    STORE_LOCAL -.-> STORE_CLOUD
    
    style SVC_STORAGE fill:#4ec9b0,stroke:#333,stroke-width:3px
    style STORE_LOCAL fill:#569cd6,stroke:#333,stroke-width:2px
```

### Capture Session Flow

```mermaid
sequenceDiagram
    actor User
    participant CMD as Command
    participant ED as EditorService
    participant GIT as GitService
    participant STORE as StorageService
    participant API as VS Code API
    
    User->>CMD: Execute "Show Sessions"
    CMD->>ED: captureEditorState()
    ED->>API: window.visibleTextEditors
    API-->>ED: editor[]
    ED->>API: Get selections & positions
    API-->>ED: cursor data
    
    CMD->>GIT: captureGitState()
    GIT->>API: scm.repositories
    API-->>GIT: branch, commit, isDirty
    
    CMD->>CMD: Build SessionSnapshot
    CMD->>STORE: saveSession(snapshot)
    STORE->>API: context.globalState.update()
    API-->>STORE: success
    STORE-->>User: ✓ Session captured
```

### Restore Session Flow

```mermaid
sequenceDiagram
    actor User
    participant CMD as Command
    participant STORE as StorageService
    participant ED as EditorService
    participant GIT as GitService
    participant API as VS Code API
    
    User->>CMD: Select session
    CMD->>STORE: getSession(id)
    STORE->>API: context.globalState.get()
    API-->>STORE: SessionSnapshot
    
    CMD->>CMD: Validate session
    CMD->>ED: checkFilesExist()
    ED->>API: workspace.fs.stat()
    API-->>ED: file status
    
    alt Files exist
        CMD->>GIT: checkoutBranch()
        GIT->>API: Execute git checkout
        API-->>GIT: ✓ Branch checked out
        
        CMD->>ED: restoreEditors()
        ED->>API: workspace.openTextDocument()
        API-->>ED: document
        ED->>API: window.showTextDocument()
        API-->>ED: editor
        ED->>API: Set cursor position
        
        ED-->>User: ✓ Session restored
    else Files missing
        CMD-->>User: ⚠️ Some files not found
    end
```

### Service Dependencies

```mermaid
graph LR
    subgraph Commands
        SHOW[Show Sessions]
        DASH[Dashboard]
        SHARE[Share]
    end
    
    subgraph Core
        STORE[StorageService]
    end
    
    subgraph Helpers
        EDITOR[EditorService]
        GIT[GitService]
        WS[WorkspaceService]
    end
    
    subgraph Advanced
        ANALYTICS[AnalyticsService]
        AUTO[AutoCaptureService]
        SMART[SmartNamingService]
    end
    
    SHOW --> STORE
    SHOW --> EDITOR
    SHOW --> WS
    
    DASH --> STORE
    DASH --> ANALYTICS
    
    SHARE --> STORE
    
    ANALYTICS --> STORE
    
    AUTO --> STORE
    AUTO --> GIT
    AUTO --> EDITOR
    AUTO --> WS
    
    SMART --> GIT
    
    style STORE fill:#4ec9b0,stroke:#333,stroke-width:3px
    style EDITOR fill:#4ec9b0,stroke:#333,stroke-width:2px
    style GIT fill:#4ec9b0,stroke:#333,stroke-width:2px
    style WS fill:#4ec9b0,stroke:#333,stroke-width:2px
```

---

## Session Data Model

### Class Diagram

```mermaid
classDiagram
    class SessionSnapshot {
        +string id
        +string title
        +number timestamp
        +string? notes
        +EditorState[] editors
        +TerminalState[] terminals
        +GitState git
        +WorkspaceState workspace
        +Metadata metadata
    }
    
    class EditorState {
        +string path
        +Position cursor
        +Selection? selection
        +number? scrollOffset
        +number viewColumn
    }
    
    class TerminalState {
        +string id
        +string cwd
        +string? lastCommand
        +string name
    }
    
    class GitState {
        +string branch
        +string commit
        +boolean isDirty
        +string? remote
    }
    
    class WorkspaceState {
        +string[] folders
        +string? name
        +Record~string,any~? settings
    }
    
    class Metadata {
        +number captureTime
        +number fileCount
        +number terminalCount
        +string[] tags
    }
    
    class Position {
        +number line
        +number character
    }
    
    class Selection {
        +Position start
        +Position end
    }
    
    SessionSnapshot "1" --> "*" EditorState
    SessionSnapshot "1" --> "*" TerminalState
    SessionSnapshot "1" --> "1" GitState
    SessionSnapshot "1" --> "1" WorkspaceState
    SessionSnapshot "1" --> "1" Metadata
    EditorState "1" --> "1" Position
    EditorState "1" --> "0..1" Selection
    Selection "1" --> "2" Position
```

### TypeScript Schema

```typescript
interface SessionSnapshot {
  id: string;
  title: string;
  timestamp: number;
  notes?: string;

  editors: Array<{
    path: string;
    cursor: { line: number; character: number };
    selection?: { start: Position; end: Position };
    scrollOffset?: number;
    viewColumn: number;
  }>;

  terminals: Array<{
    id: string;
    cwd: string;
    lastCommand?: string;
    name: string;
  }>;

  git: {
    branch: string;
    commit: string;
    isDirty: boolean;
    remote?: string;
  };

  workspace: {
    folders: string[];
    name?: string;
    settings?: Record<string, any>;
  };

  metadata: {
    captureTime: number;
    fileCount: number;
    terminalCount: number;
    tags: string[];
  };
}
```

### Storage Location

- **Local**: `~/.config/Code/User/globalStorage/preston176.flowlens/sessions.json`
- **Sync** (planned): E2E encrypted, user-controlled backend

---

## Configuration

All settings are prefixed with `flowlens.*`:

```json
{
  "flowlens.autoCapture.enabled": true,
  "flowlens.autoCapture.onBranchSwitch": true,
  "flowlens.autoCapture.onIdleTime": false,
  "flowlens.autoCapture.idleMinutes": 30,
  "flowlens.autoCapture.onWorkspaceFolderChange": true,
  "flowlens.autoCapture.maxPerDay": 20,
  "flowlens.analytics.trackUsage": true
}
```

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoCapture.enabled` | boolean | `true` | Enable automatic session capture |
| `autoCapture.onBranchSwitch` | boolean | `true` | Capture when switching git branches |
| `autoCapture.onIdleTime` | boolean | `false` | Capture after idle period |
| `autoCapture.idleMinutes` | number | `30` | Idle threshold (5-120 minutes) |
| `autoCapture.onWorkspaceFolderChange` | boolean | `true` | Capture when workspace folders change |
| `autoCapture.maxPerDay` | number | `20` | Maximum auto-captures per day |
| `analytics.trackUsage` | boolean | `true` | Track local usage metrics |

---

## Development

### Build from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Run tests
npm test

# Create VSIX package
vsce package
```

### Project Structure

```
flowlens-vscode-extension/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── commands/                 # Command handlers
│   │   ├── openDashboard.ts
│   │   ├── showSessions.ts
│   │   └── sharingCommands.ts
│   ├── services/                 # Business logic
│   │   ├── StorageService.ts
│   │   ├── EditorService.ts
│   │   ├── GitService.ts
│   │   ├── WorkspaceService.ts
│   │   ├── AnalyticsService.ts
│   │   └── AutoCaptureService.ts
│   ├── models/
│   │   └── SessionSnapshot.ts
│   └── test/
├── dist/                         # Compiled output
└── package.json
```

### Debug Configuration

Press `F5` to launch Extension Development Host with debugging enabled.

---

## Roadmap

### v0.2.0 (Q1 2026)

- [ ] Session templates (preconfigured workspace setups)
- [ ] Diff view between sessions
- [ ] Enhanced search and filtering
- [ ] Public API for extensions

### v0.3.0 (Q2 2026)

- [ ] E2E encrypted cloud sync
- [ ] Team session sharing
- [ ] CLI tool for headless management
- [ ] Collaboration features

### v1.0.0 (Q3 2026)

- [ ] JetBrains IDE support
- [ ] Neovim plugin
- [ ] Plugin marketplace
- [ ] ML-powered productivity insights

---

## License

Proprietary. All rights reserved.

**© 2025 FlowLens Team**

For licensing inquiries, contact the development team via [GitHub Issues](https://github.com/preston176/flowlens-vscode-extension/issues).

---

## Contributing

See [CONTRIBUTING.md](./.docs/CONTRIBUTING.md) for guidelines on:

- Bug reports
- Feature requests
- Security disclosures
- Code contributions (when open-sourced)
