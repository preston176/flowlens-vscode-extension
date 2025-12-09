import * as vscode from "vscode";
import { StorageService } from "./services/StorageService";
import { GitService } from "./services/GitService";
import { EditorService } from "./services/EditorService";
import { WorkspaceService } from "./services/WorkspaceService";
import { SmartNamingService } from "./services/SmartNamingService";
import { AutoCaptureService } from "./services/AutoCaptureService";
import { AnalyticsService } from "./services/AnalyticsService";
import { showSessionsCommand } from "./commands/showSessions";
import { openDashboardCommand } from "./commands/openDashboard";
import { shareSessionCommand } from "./commands/sharingCommands";

let autoCaptureService: AutoCaptureService | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log("FlowLens extension is active.");

  // Initialize services
  const storageService = new StorageService(context);
  const gitService = new GitService();
  const editorService = new EditorService();
  const workspaceService = new WorkspaceService();
  const smartNaming = new SmartNamingService(gitService);
  const analyticsService = new AnalyticsService(storageService); // Initialize auto-capture service
  autoCaptureService = new AutoCaptureService(
    storageService,
    gitService,
    editorService,
    workspaceService,
    smartNaming
  );
  autoCaptureService.start();

  // Register commands
  const showCommand = vscode.commands.registerCommand(
    "FlowLens.showSessions",
    () => showSessionsCommand(storageService, editorService, workspaceService)
  );

  const openDashboardCmd = vscode.commands.registerCommand(
    "FlowLens.openDashboard",
    () => openDashboardCommand(storageService, analyticsService)
  );

  const shareSessionCmd = vscode.commands.registerCommand(
    "FlowLens.shareSession",
    () => shareSessionCommand(storageService)
  );

  // Demo command
  const { activateDemoCommand } = require("../demo/demo-runner");
  activateDemoCommand(context);

  context.subscriptions.push(
    showCommand,
    openDashboardCmd,
    shareSessionCmd
  );
}

export function deactivate() {
  if (autoCaptureService) {
    autoCaptureService.stop();
  }
}
