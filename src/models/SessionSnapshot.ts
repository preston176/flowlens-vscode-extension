export interface EditorSnapshot {
  path: string;
  cursor: { line: number; col: number } | null;
}

export interface TerminalSnapshot {
  name: string;
  lastCommand?: string | null;
}

export interface GitSnapshot {
  branch?: string | null;
  head?: string | null;
}

export interface WorkspaceInfo {
  name: string;
  path: string;
}

export interface DebugSnapshot {
  breakpoints: Array<{
    filePath: string;
    line: number;
    condition?: string;
    enabled: boolean;
  }>;
  watchExpressions?: string[];
}

export interface SettingsSnapshot {
  globalSettings: { [key: string]: any };
  workspaceSettings: { [key: string]: any };
}

export interface SessionSnapshot {
  id: string;
  title: string;
  timestamp: string;
  editors: EditorSnapshot[];
  terminals: TerminalSnapshot[];
  git?: GitSnapshot;
  notes?: string;
  workspace?: WorkspaceInfo;
  debug?: DebugSnapshot;
  settings?: SettingsSnapshot;
  tags?: string[];
  isPro?: boolean; // For premium features
}

export const SESSIONS_KEY = "flowlens.sessions";
