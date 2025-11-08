import * as vscode from 'vscode';
import { SessionSnapshot } from '../models/SessionSnapshot';
import { StorageService } from '../services/StorageService';
import { GitService } from '../services/GitService';
import { EditorService } from '../services/EditorService';
import { WorkspaceService } from '../services/WorkspaceService';

export async function captureSessionCommand(
	storageService: StorageService,
	gitService: GitService,
	editorService: EditorService,
	workspaceService: WorkspaceService
): Promise<void> {
	const editors = editorService.captureEditors();
	const terminals = editorService.captureTerminals();
	const git = await gitService.captureGitInfo();
	const workspace = workspaceService.getCurrentWorkspace();

	const title = await vscode.window.showInputBox({
		prompt: 'Session title',
		placeHolder: 'e.g. Fixing API bug',
		value: 'Quick session'
	});

	if (typeof title === 'undefined') {
		vscode.window.showInformationMessage('Capture cancelled');
		return;
	}

	const notes = await vscode.window.showInputBox({
		prompt: 'Optional short note',
		placeHolder: 'Why you paused (optional)'
	});

	const session: SessionSnapshot = {
		id: `session_${new Date().toISOString()}`,
		title: title || 'Untitled session',
		timestamp: new Date().toISOString(),
		editors,
		terminals,
		git,
		notes: notes || undefined,
		workspace,
	};

	await storageService.saveSession(session);
	vscode.window.showInformationMessage(`Captured session: ${session.title}`);
}
