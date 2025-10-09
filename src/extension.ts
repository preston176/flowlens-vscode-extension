// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface EditorSnapshot {
	path: string;
	cursor: { line: number; col: number } | null;
}

interface TerminalSnapshot {
	name: string;
	lastCommand?: string | null;
}

interface GitSnapshot {
	branch?: string | null;
	head?: string | null;
}

interface SessionSnapshot {
	id: string;
	title: string;
	timestamp: string;
	editors: EditorSnapshot[];
	terminals: TerminalSnapshot[];
	git?: GitSnapshot;
	notes?: string;
}

const SESSIONS_KEY = 'flowlens.sessions';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('FlowLens extension is active.');

	// Hello world (existing) command
	const hello = vscode.commands.registerCommand('FlowLens.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from flowlens-vscode-extension!');
	});

	// Capture a lightweight session snapshot
	const capture = vscode.commands.registerCommand('FlowLens.captureSession', async () => {
		const editors = vscode.window.visibleTextEditors.map(e => {
			const sel = e.selection && !e.selection.isEmpty ? e.selection.active : e.selection.active;
			return {
				path: e.document.uri.fsPath,
				cursor: sel ? { line: sel.line, col: sel.character } : null,
			} as EditorSnapshot;
		});

		const terminals: TerminalSnapshot[] = vscode.window.terminals.map(t => ({ name: t.name, lastCommand: null }));

		// Try to get git information (best-effort)
		let git: GitSnapshot | undefined = undefined;
		try {
			const gitExt = vscode.extensions.getExtension('vscode.git')?.exports;
			if (gitExt && typeof gitExt.getAPI === 'function') {
				const api = gitExt.getAPI(1);
				const repo = api.repositories[0];
				if (repo) {
					git = { branch: repo.state.HEAD?.name ?? null, head: repo.state.HEAD?.commit ?? null };
				}
			}
		} catch (e) {
			// ignore; git info is optional
			git = undefined;
		}

		const title = await vscode.window.showInputBox({ prompt: 'Session title', placeHolder: 'e.g. Fixing API bug', value: 'Quick session' });
		if (typeof title === 'undefined') {
			vscode.window.showInformationMessage('Capture cancelled');
			return;
		}

		const notes = await vscode.window.showInputBox({ prompt: 'Optional short note', placeHolder: 'Why you paused (optional)' });

		const session: SessionSnapshot = {
			id: `session_${new Date().toISOString()}`,
			title: title || 'Untitled session',
			timestamp: new Date().toISOString(),
			editors,
			terminals,
			git,
			notes: notes || undefined,
		};

		const existing: SessionSnapshot[] = context.globalState.get(SESSIONS_KEY, []);
		existing.unshift(session);
		await context.globalState.update(SESSIONS_KEY, existing.slice(0, 50));

		vscode.window.showInformationMessage(`Captured session: ${session.title}`);
	});

	// Show saved sessions and allow resuming
	const show = vscode.commands.registerCommand('FlowLens.showSessions', async () => {
		const sessions: SessionSnapshot[] = context.globalState.get(SESSIONS_KEY, []);
		if (!sessions || sessions.length === 0) {
			vscode.window.showInformationMessage('No FlowLens sessions saved yet. Use "Capture Session" to create one.');
			return;
		}

		const pick = await vscode.window.showQuickPick(sessions.map(s => ({ label: s.title, description: new Date(s.timestamp).toLocaleString(), detail: s.notes, session: s } as any)), { placeHolder: 'Select a session to resume' } as any);
		if (!pick) {
			return;
		}
		const session: SessionSnapshot = (pick as any).session;

		// Resume: open editors and restore cursors (best-effort)
		for (const ed of session.editors) {
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
				// ignore files that can't be opened
				console.error('Failed to open', ed.path, e);
			}
		}

		vscode.window.showInformationMessage(`Resumed session: ${session.title}`);
	});

	// Open sessions webview (React + Tailwind via CDN) with richer controls
	const openPanel = vscode.commands.registerCommand('FlowLens.openSessionsPanel', async () => {
		const panel = vscode.window.createWebviewPanel(
			'flowlens.sessions',
			'FlowLens Sessions',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

			panel.webview.html = await getWebviewContent(panel);

		// When the webview requests sessions, send them
		panel.webview.onDidReceiveMessage(async (msg) => {
			if (msg?.type === 'ready') {
				const sessions: SessionSnapshot[] = context.globalState.get(SESSIONS_KEY, []);
				panel.webview.postMessage({ type: 'sessions', data: sessions });
			}

			if (msg?.type === 'resume') {
				const id = msg.id as string;
				const sessions: SessionSnapshot[] = context.globalState.get(SESSIONS_KEY, []);
				const session = sessions.find(s => s.id === id);
				if (!session) {
					panel.webview.postMessage({ type: 'error', message: 'Session not found' });
					return;
				}

				// Resume like before
				for (const ed of session.editors) {
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
					}
				}

				vscode.window.showInformationMessage(`Resumed session: ${session.title}`);
				panel.webview.postMessage({ type: 'resumed', id });
			}

			if (msg?.type === 'delete') {
				const id = msg.id as string;
				let sessions: SessionSnapshot[] = context.globalState.get(SESSIONS_KEY, []);
				const before = sessions.length;
				sessions = sessions.filter(s => s.id !== id);
				await context.globalState.update(SESSIONS_KEY, sessions);
				panel.webview.postMessage({ type: 'deleted', id, remaining: sessions.length });
				console.log(`Deleted session ${id} (${before} -> ${sessions.length})`);
			}
		});
	});

	context.subscriptions.push(hello, capture, show, openPanel);
}

export function deactivate() {}

async function getWebviewContent(panel?: vscode.WebviewPanel): Promise<string> {
			// Require local bundled webview assets (dist/webview.js). If missing, show an informative page.
			try {
					const fs = require('fs');
					const path = require('path');
					if (panel && fs.existsSync(path.join(__dirname, '..', 'dist', 'webview.js'))) {
							const webview = panel.webview;
							const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, '..', 'dist', 'webview.js')));
							const cssPath = path.join(__dirname, '..', 'dist', 'webview.css');
							const cssUri = fs.existsSync(cssPath) ? webview.asWebviewUri(vscode.Uri.file(cssPath)) : null;
							return `<!doctype html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>FlowLens Sessions</title>
			${cssUri ? `<link rel="stylesheet" href="${cssUri}">` : ''}
		</head>
		<body>
			<div id="root"></div>
			<script src="${scriptUri}"></script>
		</body>
	</html>`;
					} else {
							// Informative page telling developer to build the webview
							return `<!doctype html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>FlowLens Sessions</title>
			<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;background:#0b1220;color:#fff;padding:24px} .notice{background:#1f2937;padding:16px;border-radius:8px}</style>
		</head>
		<body>
			<div class="notice">
				<h2>FlowLens webview not built</h2>
				<p>The webview bundle <code>dist/webview.js</code> was not found. Build the webview to view the panel.</p>
				<p>Run: <code>npm install && node esbuild.js --production</code></p>
			</div>
		</body>
	</html>`;
					}
			} catch (e) {
					return `<!doctype html><html><body><pre style="color:#fff">Error preparing webview: ${String(e)}</pre></body></html>`;
			}
	}
