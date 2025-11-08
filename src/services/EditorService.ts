import * as vscode from 'vscode';
import { EditorSnapshot, TerminalSnapshot, SessionSnapshot } from '../models/SessionSnapshot';

export class EditorService {
	captureEditors(): EditorSnapshot[] {
		return vscode.window.visibleTextEditors.map(e => {
			const sel = e.selection && !e.selection.isEmpty ? e.selection.active : e.selection.active;
			return {
				path: e.document.uri.fsPath,
				cursor: sel ? { line: sel.line, col: sel.character } : null,
			};
		});
	}

	captureTerminals(): TerminalSnapshot[] {
		return vscode.window.terminals.map(t => ({
			name: t.name,
			lastCommand: null
		}));
	}

	async restoreEditors(
		session: SessionSnapshot,
		progress?: vscode.Progress<{ increment?: number; message?: string }>
	): Promise<string[]> {
		const failedFiles: string[] = [];
		const totalFiles = session.editors.length;

		for (let i = 0; i < session.editors.length; i++) {
			const ed = session.editors[i];

			if (progress) {
				progress.report({
					increment: (100 / totalFiles),
					message: `Opening file ${i + 1}/${totalFiles}`
				});
			}

			try {
				const uri = vscode.Uri.file(ed.path);
				const doc = await vscode.workspace.openTextDocument(uri);
				const editor = await vscode.window.showTextDocument(doc, { preview: false });

				if (ed.cursor && editor) {
					const line = Math.max(0, Math.min(ed.cursor.line, doc.lineCount - 1));
					const char = Math.max(0, ed.cursor.col);
					const pos = new vscode.Position(line, char);
					editor.selection = new vscode.Selection(pos, pos);
					editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
				}
			} catch (e) {
				console.error('Failed to open', ed.path, e);
				failedFiles.push(ed.path);
			}
		}

		return failedFiles;
	}
}
