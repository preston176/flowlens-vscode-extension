import * as vscode from 'vscode';
import { StorageService } from './services/StorageService';
import { GitService } from './services/GitService';
import { EditorService } from './services/EditorService';
import { WorkspaceService } from './services/WorkspaceService';
import { captureSessionCommand } from './commands/captureSession';
import { showSessionsCommand } from './commands/showSessions';
import { openSessionsPanelCommand } from './commands/openSessionsPanel';

export function activate(context: vscode.ExtensionContext) {
	console.log('FlowLens extension is active.');

	// Initialize services
	const storageService = new StorageService(context);
	const gitService = new GitService();
	const editorService = new EditorService();
	const workspaceService = new WorkspaceService();

	// Register commands
	const captureCommand = vscode.commands.registerCommand(
		'FlowLens.captureSession',
		() => captureSessionCommand(storageService, gitService, editorService, workspaceService)
	);

	const showCommand = vscode.commands.registerCommand(
		'FlowLens.showSessions',
		() => showSessionsCommand(storageService, editorService, workspaceService)
	);

	const openPanelCommand = vscode.commands.registerCommand(
		'FlowLens.openSessionsPanel',
		() => openSessionsPanelCommand(storageService, editorService, workspaceService)
	);

	context.subscriptions.push(captureCommand, showCommand, openPanelCommand);
}

export function deactivate() {}
