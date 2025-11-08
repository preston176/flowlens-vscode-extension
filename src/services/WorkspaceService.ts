import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceInfo } from '../models/SessionSnapshot';

export class WorkspaceService {
	getCurrentWorkspace(): WorkspaceInfo | undefined {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (!workspaceFolders || workspaceFolders.length === 0) {
			return undefined;
		}

		let targetFolder = workspaceFolders[0];

		if (workspaceFolders.length > 1) {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const activeFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
				if (activeFolder) {
					targetFolder = activeFolder;
				}
			}
		}

		return {
			name: targetFolder.name,
			path: targetFolder.uri.fsPath
		};
	}

	getWorkspaceName(workspacePath: string): string {
		return path.basename(workspacePath);
	}

	isSameWorkspace(workspace1: WorkspaceInfo | undefined, workspace2: WorkspaceInfo | undefined): boolean {
		if (!workspace1 || !workspace2) {
			return workspace1 === workspace2;
		}
		return path.normalize(workspace1.path) === path.normalize(workspace2.path);
	}
}
