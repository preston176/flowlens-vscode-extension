import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { SharingService } from "../services/SharingService";

/**
 * Export sessions command
 */
export async function exportSessionsCommand(
  storageService: StorageService
): Promise<void> {
  const sharingService = new SharingService(storageService);
  const sessions = await storageService.getSessions();

  if (sessions.length === 0) {
    vscode.window.showInformationMessage("No sessions to export");
    return;
  }

  // Ask user what to export
  const choice = await vscode.window.showQuickPick(
    [
      { label: "📦 Export All Sessions", value: "all" },
      { label: "🎯 Export Selected Sessions", value: "select" },
      { label: "🗓️ Export Recent (Last 7 Days)", value: "recent" },
    ],
    {
      placeHolder: "What would you like to export?",
    }
  );

  if (!choice) {
    return;
  }

  let sessionsToExport = sessions;

  if (choice.value === "select") {
    const selected = await vscode.window.showQuickPick(
      sessions.map((s) => ({
        label: s.title,
        description: new Date(s.timestamp).toLocaleString(),
        picked: false,
        session: s,
      })),
      {
        canPickMany: true,
        placeHolder: "Select sessions to export",
      }
    );

    if (!selected || selected.length === 0) {
      return;
    }

    sessionsToExport = selected.map((s) => s.session);
  } else if (choice.value === "recent") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sessionsToExport = sessions.filter(
      (s) => new Date(s.timestamp) >= sevenDaysAgo
    );

    if (sessionsToExport.length === 0) {
      vscode.window.showInformationMessage("No sessions in the last 7 days");
      return;
    }
  }

  await sharingService.exportSessions(sessionsToExport);
}

/**
 * Import sessions command
 */
export async function importSessionsCommand(
  storageService: StorageService
): Promise<void> {
  const sharingService = new SharingService(storageService);
  await sharingService.importSessions();
}

/**
 * Share session command
 */
export async function shareSessionCommand(
  storageService: StorageService
): Promise<void> {
  const sharingService = new SharingService(storageService);
  const sessions = await storageService.getSessions();

  if (sessions.length === 0) {
    vscode.window.showInformationMessage("No sessions to share");
    return;
  }

  // Select session to share
  const selected = await vscode.window.showQuickPick(
    sessions.map((s) => ({
      label: s.title,
      description: new Date(s.timestamp).toLocaleString(),
      detail: `${s.editors.length} files • ${s.terminals.length} terminals`,
      session: s,
    })),
    {
      placeHolder: "Select a session to share",
    }
  );

  if (!selected) {
    return;
  }

  // Choose sharing method
  const method = await vscode.window.showQuickPick(
    [
      { label: "🔗 Create Shareable Link", value: "link" },
      { label: "📋 Copy Session Summary", value: "summary" },
      { label: "📄 Export as Markdown", value: "markdown" },
      { label: "💾 Export as JSON File", value: "json" },
    ],
    {
      placeHolder: "How would you like to share?",
    }
  );

  if (!method) {
    return;
  }

  switch (method.value) {
    case "link":
      const shareable = await sharingService.createShareableLink(
        selected.session
      );
      vscode.window
        .showInformationMessage(
          `✅ Share link copied! Code: ${shareable.shareCode}`,
          "View Instructions"
        )
        .then((action) => {
          if (action === "View Instructions") {
            vscode.window.showInformationMessage(
              'Share the link or code with your team. They can import it using "FlowLens: Import Sessions"'
            );
          }
        });
      break;

    case "summary":
      const summary = `📸 ${selected.session.title}

🗂️ Files (${selected.session.editors.length}):
${selected.session.editors
  .map((e, i) => `  ${i + 1}. ${e.path.split("/").pop()}`)
  .join("\n")}

💻 Terminals: ${selected.session.terminals.length}
🌿 Branch: ${selected.session.git?.branch || "N/A"}
${selected.session.notes ? `\n📝 Notes: ${selected.session.notes}` : ""}`;

      await vscode.env.clipboard.writeText(summary);
      vscode.window.showInformationMessage(
        "✅ Session summary copied to clipboard!"
      );
      break;

    case "markdown":
      const markdown = await sharingService.exportAsMarkdown(selected.session);
      const doc = await vscode.workspace.openTextDocument({
        content: markdown,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc);
      break;

    case "json":
      await sharingService.exportSessions([selected.session]);
      break;
  }
}
