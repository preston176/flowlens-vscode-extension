import * as vscode from "vscode";
import { StorageService } from "./services/StorageService";
import { GitService } from "./services/GitService";
import { EditorService } from "./services/EditorService";
import { WorkspaceService } from "./services/WorkspaceService";
import { SmartNamingService } from "./services/SmartNamingService";
import { AutoCaptureService } from "./services/AutoCaptureService";
import { MonetizationService } from "./services/MonetizationService";
import { AnalyticsService } from "./services/AnalyticsService";
import { captureSessionCommand } from "./commands/captureSession";
import { showSessionsCommand } from "./commands/showSessions";
import { openSessionsPanelCommand } from "./commands/openSessionsPanel";
import { quickCaptureCommand } from "./commands/quickCapture";
import { captureFromTemplateCommand } from "./commands/captureFromTemplate";
import { showProductivityDashboardCommand } from "./commands/showProductivityDashboard";
import { openDashboardCommand } from "./commands/openDashboard";
import {
  exportSessionsCommand,
  importSessionsCommand,
  shareSessionCommand,
} from "./commands/sharingCommands";

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
  const captureCommand = vscode.commands.registerCommand(
    "FlowLens.captureSession",
    () =>
      captureSessionCommand(
        storageService,
        gitService,
        editorService,
        workspaceService
      )
  );

  const showCommand = vscode.commands.registerCommand(
    "FlowLens.showSessions",
    () => showSessionsCommand(storageService, editorService, workspaceService)
  );

  const openPanelCommand = vscode.commands.registerCommand(
    "FlowLens.openSessionsPanel",
    () =>
      openSessionsPanelCommand(storageService, editorService, workspaceService)
  );

  const quickCaptureCmd = vscode.commands.registerCommand(
    "FlowLens.quickCapture",
    () =>
      quickCaptureCommand(
        storageService,
        gitService,
        editorService,
        workspaceService
      )
  );

  const captureFromTemplateCmd = vscode.commands.registerCommand(
    "FlowLens.captureFromTemplate",
    () =>
      captureFromTemplateCommand(
        storageService,
        editorService,
        workspaceService
      )
  );

  const showDashboardCmd = vscode.commands.registerCommand(
    "FlowLens.showProductivityDashboard",
    () => showProductivityDashboardCommand(storageService)
  );

  const openDashboardCmd = vscode.commands.registerCommand(
    "FlowLens.openDashboard",
    () => openDashboardCommand(storageService, analyticsService)
  );
  const exportSessionsCmd = vscode.commands.registerCommand(
    "FlowLens.exportSessions",
    () => exportSessionsCommand(storageService)
  );

  const importSessionsCmd = vscode.commands.registerCommand(
    "FlowLens.importSessions",
    () => importSessionsCommand(storageService)
  );

  const shareSessionCmd = vscode.commands.registerCommand(
    "FlowLens.shareSession",
    () => shareSessionCommand(storageService)
  );

  // Monetization commands
  const monetizationService = new MonetizationService(context);

  const showUpgradeCmd = vscode.commands.registerCommand(
    "FlowLens.upgradeToPro",
    () => monetizationService.showUpgradePrompt("Unlimited Sessions")
  );

  // Demo command
  const { activateDemoCommand } = require("../demo/demo-runner");
  activateDemoCommand(context);

  context.subscriptions.push(
    captureCommand,
    showCommand,
    openPanelCommand,
    quickCaptureCmd,
    captureFromTemplateCmd,
    showDashboardCmd,
    openDashboardCmd,
    exportSessionsCmd,
    importSessionsCmd,
    shareSessionCmd,
    showUpgradeCmd
  );
}

export function deactivate() {
  if (autoCaptureService) {
    autoCaptureService.stop();
  }
}
