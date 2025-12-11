import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { EditorService } from "../services/EditorService";
import { WorkspaceService } from "../services/WorkspaceService";
import { SessionSnapshot } from "../models/SessionSnapshot";

/**
 * Restore session command - allows user to pick a session to restore
 */
export async function restoreSessionCommand(
  storageService: StorageService,
  editorService: EditorService,
  workspaceService: WorkspaceService,
  session?: SessionSnapshot
): Promise<void> {
  let sessionToRestore = session;

  // If no session provided, let user pick one
  if (!sessionToRestore) {
    const sessions = await storageService.getSessions();

    if (!sessions || sessions.length === 0) {
      vscode.window.showInformationMessage(
        'No FlowLens sessions saved yet. Use "Capture Session" to create one.'
      );
      return;
    }

    const items = sessions.map((s) => ({
      label: s.title,
      description: new Date(s.timestamp).toLocaleString(),
      detail: `${s.editors.length} files • ${s.terminals.length} terminals${
        s.git?.branch ? " • " + s.git.branch : ""
      }`,
      session: s,
    }));

    const pick = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a session to restore",
    });

    if (!pick) {
      return;
    }

    sessionToRestore = pick.session;
  }

  // Validate workspace if session has workspace info
  const currentWorkspace = workspaceService.getCurrentWorkspace();
  if (sessionToRestore.workspace && currentWorkspace) {
    const isSameWorkspace = workspaceService.isSameWorkspace(
      sessionToRestore.workspace,
      currentWorkspace
    );
    if (!isSameWorkspace) {
      const action = await vscode.window.showWarningMessage(
        `Session "${sessionToRestore.title}" was captured in workspace "${sessionToRestore.workspace.name}" but you're currently in "${currentWorkspace.name}". Some files may not exist.`,
        "Continue Anyway",
        "Cancel"
      );

      if (action !== "Continue Anyway") {
        return;
      }
    }
  }

  // Restore the session
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Restoring session: ${sessionToRestore.title}`,
      cancellable: false,
    },
    async (progress) => {
      const failedFiles = await editorService.restoreEditors(
        sessionToRestore!,
        progress
      );
      const restoredTerminals = editorService.restoreTerminals(
        sessionToRestore!
      );

      // Build result message
      const messages: string[] = [];

      if (failedFiles.length === 0 && sessionToRestore!.editors.length > 0) {
        messages.push(`Restored ${sessionToRestore!.editors.length} file(s)`);
      } else if (failedFiles.length > 0) {
        const successCount =
          sessionToRestore!.editors.length - failedFiles.length;
        messages.push(
          `Restored ${successCount}/${sessionToRestore!.editors.length} file(s)`
        );
      }

      if (restoredTerminals > 0) {
        messages.push(`${restoredTerminals} terminal(s)`);
      }

      if (failedFiles.length > 0) {
        const fileList =
          failedFiles.length <= 3
            ? failedFiles.join(", ")
            : `${failedFiles.length} files`;
        vscode.window.showWarningMessage(
          `Restored session: ${
            sessionToRestore!.title
          }. ${messages.join(", ")}. Failed to open: ${fileList}`
        );
      } else {
        vscode.window.showInformationMessage(
          `Restored session: ${sessionToRestore!.title}. ${messages.join(", ")}`
        );
      }
    }
  );
}
