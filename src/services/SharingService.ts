import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { SessionSnapshot } from "../models/SessionSnapshot";
import { StorageService } from "./StorageService";

export interface SessionExport {
  version: string;
  exportedAt: string;
  sessions: SessionSnapshot[];
  metadata: {
    extensionVersion: string;
    platform: string;
  };
}

export interface ShareableSession {
  session: SessionSnapshot;
  shareLink?: string;
  shareCode?: string;
  expiresAt?: string;
}

/**
 * SharingService handles session export, import, and sharing
 */
export class SharingService {
  private static readonly EXPORT_VERSION = "1.0.0";

  constructor(private storageService: StorageService) {}

  /**
   * Export sessions to JSON file
   */
  async exportSessions(sessions: SessionSnapshot[]): Promise<void> {
    const exportData: SessionExport = {
      version: SharingService.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      sessions,
      metadata: {
        extensionVersion:
          vscode.extensions.getExtension("preston176.flowlens")?.packageJSON
            .version || "unknown",
        platform: process.platform,
      },
    };

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(
        `flowlens-sessions-${new Date().toISOString().split("T")[0]}.json`
      ),
      filters: {
        "JSON Files": ["json"],
        "All Files": ["*"],
      },
    });

    if (!uri) {
      return;
    }

    try {
      await fs.writeFile(
        uri.fsPath,
        JSON.stringify(exportData, null, 2),
        "utf-8"
      );
      vscode.window
        .showInformationMessage(
          `✅ Exported ${sessions.length} session(s) to ${path.basename(
            uri.fsPath
          )}`,
          "Open File"
        )
        .then((action) => {
          if (action === "Open File") {
            vscode.commands.executeCommand("vscode.open", uri);
          }
        });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export sessions: ${error}`);
    }
  }

  /**
   * Import sessions from JSON file
   */
  async importSessions(): Promise<number> {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        "JSON Files": ["json"],
        "All Files": ["*"],
      },
    });

    if (!uris || uris.length === 0) {
      return 0;
    }

    try {
      const content = await fs.readFile(uris[0].fsPath, "utf-8");
      const importData: SessionExport = JSON.parse(content);

      // Validate format
      if (!importData.version || !importData.sessions) {
        throw new Error("Invalid export file format");
      }

      // Import sessions
      const imported = importData.sessions.length;
      for (const session of importData.sessions) {
        // Generate new ID to avoid conflicts
        session.id = `imported_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await this.storageService.saveSession(session);
      }

      vscode.window
        .showInformationMessage(
          `✅ Imported ${imported} session(s)`,
          "View Sessions"
        )
        .then((action) => {
          if (action === "View Sessions") {
            vscode.commands.executeCommand("FlowLens.showSessions");
          }
        });

      return imported;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import sessions: ${error}`);
      return 0;
    }
  }

  /**
   * Generate shareable session code (base64 encoded, compressed)
   */
  async generateShareCode(session: SessionSnapshot): Promise<string> {
    // Create a sanitized version (remove absolute paths for privacy)
    const shareable: SessionSnapshot = {
      ...session,
      editors: session.editors.map((e) => ({
        ...e,
        path: this.sanitizePath(e.path),
      })),
      workspace: session.workspace
        ? {
            ...session.workspace,
            path: "[Removed for privacy]",
          }
        : undefined,
    };

    // Encode to base64
    const json = JSON.stringify(shareable);
    const base64 = Buffer.from(json).toString("base64");

    // Create short code (first 12 chars of hash)
    const shareCode = Buffer.from(base64)
      .toString("hex")
      .substring(0, 12)
      .toUpperCase();

    return shareCode;
  }

  /**
   * Create shareable link for a session (simulated - would need backend in production)
   */
  async createShareableLink(
    session: SessionSnapshot
  ): Promise<ShareableSession> {
    const shareCode = await this.generateShareCode(session);

    // In production, this would send to backend API
    // For now, we create a GitHub Gist-style link concept
    const shareLink = `https://flowlens.app/share/${shareCode}`;

    const shareable: ShareableSession = {
      session,
      shareLink,
      shareCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Copy to clipboard
    const sessionSummary = this.formatSessionForSharing(session);
    const shareText = `${sessionSummary}\n\n📎 Session Code: ${shareCode}\n🔗 Link: ${shareLink}\n\n(FlowLens session sharing - coming soon!)`;

    await vscode.env.clipboard.writeText(shareText);

    return shareable;
  }

  /**
   * Export session as markdown documentation
   */
  async exportAsMarkdown(session: SessionSnapshot): Promise<string> {
    const md = `# ${session.title}

**Captured:** ${new Date(session.timestamp).toLocaleString()}  
**Branch:** ${session.git?.branch || "N/A"}  
**Commit:** ${session.git?.head || "N/A"}

## Open Files (${session.editors.length})

${session.editors
  .map(
    (e, i) =>
      `${i + 1}. \`${this.sanitizePath(e.path)}\`${
        e.cursor ? ` (Line ${e.cursor.line + 1})` : ""
      }`
  )
  .join("\n")}

## Terminals (${session.terminals.length})

${session.terminals
  .map(
    (t, i) =>
      `${i + 1}. **${t.name}**${
        t.lastCommand ? ` - Last command: \`${t.lastCommand}\`` : ""
      }`
  )
  .join("\n")}

${session.notes ? `## Notes\n\n${session.notes}` : ""}

---
*Generated by FlowLens*
`;

    return md;
  }

  /**
   * Sanitize file path for sharing (remove user-specific parts)
   */
  private sanitizePath(filePath: string): string {
    // Remove home directory
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    if (homeDir && filePath.startsWith(homeDir)) {
      filePath = "~" + filePath.substring(homeDir.length);
    }

    // Extract relative path if in workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        if (filePath.startsWith(folder.uri.fsPath)) {
          return filePath.substring(folder.uri.fsPath.length + 1);
        }
      }
    }

    return path.basename(filePath);
  }

  /**
   * Format session for sharing text
   */
  private formatSessionForSharing(session: SessionSnapshot): string {
    return `📸 FlowLens Session: ${session.title}
		
🗂️ ${session.editors.length} files
💻 ${session.terminals.length} terminals
🌿 ${session.git?.branch || "No branch"}
${session.notes ? `📝 ${session.notes}` : ""}`.trim();
  }
}
