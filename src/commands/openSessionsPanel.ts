import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { EditorService } from '../services/EditorService';
import { WorkspaceService } from '../services/WorkspaceService';
import { getWebviewContent } from '../ui/webview/SessionsPanel';

export async function openSessionsPanelCommand(
	storageService: StorageService,
	editorService: EditorService,
	workspaceService: WorkspaceService
): Promise<void> {
	const panel = vscode.window.createWebviewPanel(
		'flowlens.sessions',
		'FlowLens Sessions',
		vscode.ViewColumn.One,
		{ enableScripts: true }
	);

	panel.webview.html = getWebviewContent(panel);

	panel.webview.onDidReceiveMessage(async (msg) => {
		if (msg?.type === 'ready') {
			const sessions = await storageService.getSessions();
			const currentWorkspace = workspaceService.getCurrentWorkspace();
			panel.webview.postMessage({
				type: 'sessions',
				data: sessions,
				currentWorkspace
			});
		}

		if (msg?.type === 'resume') {
			const id = msg.id as string;
			const session = await storageService.getSessionById(id);

			if (!session) {
				panel.webview.postMessage({ type: 'error', message: 'Session not found' });
				return;
			}

			// Validate workspace if session has workspace info
			const currentWorkspace = workspaceService.getCurrentWorkspace();
			if (session.workspace && currentWorkspace) {
				const isSameWorkspace = workspaceService.isSameWorkspace(session.workspace, currentWorkspace);
				if (!isSameWorkspace) {
					const action = await vscode.window.showWarningMessage(
						`Session "${session.title}" was captured in workspace "${session.workspace.name}" but you're currently in "${currentWorkspace.name}". Some files may not exist.`,
						'Continue Anyway',
						'Cancel'
					);

					if (action !== 'Continue Anyway') {
						return;
					}
				}
			}

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Restoring session: ${session.title}`,
				cancellable: false
			}, async (progress) => {
				const failedFiles = await editorService.restoreEditors(session, progress);
				const restoredTerminals = editorService.restoreTerminals(session);

				// Build result message
				const messages: string[] = [];

				if (failedFiles.length === 0 && session.editors.length > 0) {
					messages.push(`Restored ${session.editors.length} file(s)`);
				} else if (failedFiles.length > 0) {
					const successCount = session.editors.length - failedFiles.length;
					messages.push(`Restored ${successCount}/${session.editors.length} file(s)`);
				}

				if (restoredTerminals > 0) {
					messages.push(`${restoredTerminals} terminal(s)`);
				}

				if (failedFiles.length > 0) {
					const fileList = failedFiles.length <= 3 ? failedFiles.join(', ') : `${failedFiles.length} files`;
					vscode.window.showWarningMessage(`Resumed session: ${session.title}. ${messages.join(', ')}. Failed to open: ${fileList}`);
				} else {
					vscode.window.showInformationMessage(`Resumed session: ${session.title}. ${messages.join(', ')}`);
				}
			});

			panel.webview.postMessage({ type: 'resumed', id });
		}

		if (msg?.type === 'delete') {
			const id = msg.id as string;
			const result = await storageService.deleteSession(id);
			panel.webview.postMessage({ type: 'deleted', id, remaining: result.remaining });
			console.log(`Deleted session ${id} (remaining: ${result.remaining})`);
		}
	});
}
