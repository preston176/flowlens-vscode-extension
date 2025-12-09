import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { EditorService } from "../services/EditorService";
import { WorkspaceService } from "../services/WorkspaceService";
import { TemplateService } from "../services/TemplateService";

/**
 * Command to create a session from a template
 */
export async function captureFromTemplateCommand(
  storageService: StorageService,
  editorService: EditorService,
  workspaceService: WorkspaceService
): Promise<void> {
  const templateService = new TemplateService(storageService);
  const templates = await templateService.getAllTemplates();

  if (templates.length === 0) {
    vscode.window.showInformationMessage("No templates available");
    return;
  }

  // Show template picker
  const selected = await vscode.window.showQuickPick(
    templates.map((t) => ({
      label: t.name,
      description: t.description,
      detail: `${t.category} • ${t.tags.join(", ")} ${
        t.isBuiltIn ? "(Built-in)" : "(Custom)"
      }`,
      template: t,
    })),
    {
      placeHolder: "Select a session template",
      matchOnDescription: true,
      matchOnDetail: true,
    }
  );

  if (!selected) {
    return;
  }

  // Apply template
  const session = await templateService.applyTemplate(selected.template);

  // Ask if user wants to customize
  const action = await vscode.window.showInformationMessage(
    `Apply "${selected.label}" template?`,
    "Apply & Save",
    "Customize First",
    "Cancel"
  );

  if (action === "Cancel" || !action) {
    return;
  }

  if (action === "Customize First") {
    const customTitle = await vscode.window.showInputBox({
      prompt: "Session title",
      value: session.title,
    });

    if (customTitle) {
      session.title = customTitle;
    }

    const notes = await vscode.window.showInputBox({
      prompt: "Add notes (optional)",
      placeHolder: "What are you working on?",
    });

    if (notes) {
      session.notes = notes;
    }
  }

  // Save the session
  await storageService.saveSession(session);

  // Offer to restore immediately
  const restore = await vscode.window.showInformationMessage(
    `Session "${session.title}" created from template!`,
    "Restore Now",
    "View Sessions"
  );

  if (restore === "Restore Now") {
    const failedFiles = await editorService.restoreEditors(session);
    const restoredTerminals = editorService.restoreTerminals(session);

    if (failedFiles.length === 0) {
      vscode.window.showInformationMessage(
        `✅ Restored: ${session.title} (${restoredTerminals} terminals)`
      );
    } else {
      vscode.window.showWarningMessage(
        `Partially restored: ${failedFiles.length} files failed`
      );
    }
  } else if (restore === "View Sessions") {
    vscode.commands.executeCommand("FlowLens.showSessions");
  }
}
