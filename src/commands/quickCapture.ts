import * as vscode from "vscode";
import { SessionSnapshot } from "../models/SessionSnapshot";
import { StorageService } from "../services/StorageService";
import { GitService } from "../services/GitService";
import { EditorService } from "../services/EditorService";
import { WorkspaceService } from "../services/WorkspaceService";
import { SmartNamingService } from "../services/SmartNamingService";

/**
 * Quick capture command - captures session with smart naming, no prompts
 */
export async function quickCaptureCommand(
  storageService: StorageService,
  gitService: GitService,
  editorService: EditorService,
  workspaceService: WorkspaceService
): Promise<void> {
  const smartNaming = new SmartNamingService(gitService);

  const editors = editorService.captureEditors();
  const terminals = editorService.captureTerminals();
  const git = await gitService.captureGitInfo();
  const workspace = workspaceService.getCurrentWorkspace();

  // Generate smart name automatically
  const title = await smartNaming.generateSessionName(editors);

  const session: SessionSnapshot = {
    id: `session_${new Date().toISOString()}`,
    title,
    timestamp: new Date().toISOString(),
    editors,
    terminals,
    git,
    workspace,
  };

  await storageService.saveSession(session);

  // Show notification with action
  const action = await vscode.window.showInformationMessage(
    `📸 Captured: ${session.title}`,
    "View Sessions",
    "Add Note"
  );

  if (action === "View Sessions") {
    vscode.commands.executeCommand("FlowLens.showSessions");
  } else if (action === "Add Note") {
    const note = await vscode.window.showInputBox({
      prompt: "Add a note to this session",
      placeHolder: "Why you paused or what to remember...",
    });

    if (note) {
      session.notes = note;
      await storageService.updateSession(session);
      vscode.window.showInformationMessage("Note added!");
    }
  }
}
