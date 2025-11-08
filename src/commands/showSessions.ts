import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { EditorService } from '../services/EditorService';
import { WorkspaceService } from '../services/WorkspaceService';
import { SessionSnapshot } from '../models/SessionSnapshot';

interface SessionQuickPickItem extends vscode.QuickPickItem {
	session: SessionSnapshot;
}

interface FilterOption extends vscode.QuickPickItem {
	filterType: 'workspace' | 'all';
}

export async function showSessionsCommand(
	storageService: StorageService,
	editorService: EditorService,
	workspaceService: WorkspaceService
): Promise<void> {
	const currentWorkspace = workspaceService.getCurrentWorkspace();

	let sessions: SessionSnapshot[];

	if (currentWorkspace) {
		const filterChoice = await vscode.window.showQuickPick<FilterOption>(
			[
				{
					label: `$(folder) Current Workspace: ${currentWorkspace.name}`,
					description: 'Show only sessions from this workspace',
					filterType: 'workspace'
				},
				{
					label: '$(globe) All Workspaces',
					description: 'Show sessions from all workspaces',
					filterType: 'all'
				}
			],
			{ placeHolder: 'Choose session scope' }
		);

		if (!filterChoice) {
			return;
		}

		sessions = filterChoice.filterType === 'workspace'
			? await storageService.getSessionsByWorkspace(currentWorkspace)
			: await storageService.getSessions();
	} else {
		sessions = await storageService.getSessions();
	}

	if (!sessions || sessions.length === 0) {
		vscode.window.showInformationMessage('No FlowLens sessions saved yet. Use "Capture Session" to create one.');
		return;
	}

	const items: SessionQuickPickItem[] = sessions.map(s => {
		const workspaceBadge = s.workspace ? `$(folder) ${s.workspace.name}` : '$(file) No workspace';
		return {
			label: s.title,
			description: new Date(s.timestamp).toLocaleString(),
			detail: `${workspaceBadge} ${s.notes ? '• ' + s.notes : ''}`,
			session: s
		};
	});

	const pick = await vscode.window.showQuickPick(items, {
		placeHolder: 'Select a session to resume'
	});

	if (!pick) {
		return;
	}

	const session = pick.session;

	// Validate workspace if session has workspace info
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
}
