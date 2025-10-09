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
		// If a bundled webview script exists in dist, load it via webview.asWebviewUri
		try {
				const fs = require('fs');
				if (panel && fs.existsSync('dist/webview.js')) {
						const webview = panel.webview;
						const path = require('path');
						const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, '..', 'dist', 'webview.js')));
						const cssPath = path.join(__dirname, '..', 'dist', 'webview.css');
						const cssUri = fs.existsSync(cssPath) ? webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, '..', 'dist', 'webview.css'))) : null;
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
				}
		} catch (e) {
				// ignore and fall back to inline UI
		}

		return `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>FlowLens Sessions</title>
		<style>
			:root { --bg: #0b1220; --card: #0f1724; --muted: #94a3b8; --accent: #2563eb; }
			body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: var(--bg); color: #fff; margin:0; padding:20px; }
			.card { background: rgba(15,23,36,0.75); padding:12px; border-radius:8px; }
			.title { font-weight:600; font-size:16px; }
			.muted { color: var(--muted); font-size:12px; }
			.btn { border: none; color: white; padding:6px 10px; border-radius:6px; cursor:pointer; }
			.btn-blue { background: var(--accent); margin-right:8px; }
			.btn-red { background: #dc2626; }
			.session { margin-bottom:12px; }
			details { margin-top:8px; }
			ul { margin-top:6px; }
		</style>
	</head>
	<body>
		<div id="root"></div>

		<script>
			const vscode = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;

			function createSessionCard(s) {
				const wrapper = document.createElement('div');
				wrapper.className = 'session card';

				const top = document.createElement('div');
				top.style.display = 'flex';
				top.style.justifyContent = 'space-between';

				const info = document.createElement('div');
				const title = document.createElement('div');
				title.className = 'title';
				title.textContent = s.title || 'Untitled';
				info.appendChild(title);

				const ts = document.createElement('div');
				ts.className = 'muted';
				ts.textContent = new Date(s.timestamp).toLocaleString();
				info.appendChild(ts);

				if (s.notes) {
					const notes = document.createElement('div');
					notes.style.marginTop = '6px';
					notes.className = 'muted';
					notes.textContent = s.notes;
					info.appendChild(notes);
				}

				const actions = document.createElement('div');
				const resume = document.createElement('button');
				resume.className = 'btn btn-blue';
				resume.textContent = 'Resume';
				resume.onclick = () => vscode && vscode.postMessage({ type: 'resume', id: s.id });

				const del = document.createElement('button');
				del.className = 'btn btn-red';
				del.textContent = 'Delete';
				del.onclick = () => vscode && vscode.postMessage({ type: 'delete', id: s.id });

				actions.appendChild(resume);
				actions.appendChild(del);

				top.appendChild(info);
				top.appendChild(actions);

				wrapper.appendChild(top);

				const details = document.createElement('details');
				const summary = document.createElement('summary');
				summary.textContent = 'Editors (' + ((s.editors && s.editors.length) || 0) + ')';
				details.appendChild(summary);

				const ul = document.createElement('ul');
				(s.editors || []).forEach(e => {
					const li = document.createElement('li');
					li.textContent = e.path + (e.cursor ? '  - ' + (e.cursor.line + 1) + ':' + (e.cursor.col + 1) : '');
					ul.appendChild(li);
				});
				details.appendChild(ul);
				wrapper.appendChild(details);

				return wrapper;
			}

			function renderSessions(sessions) {
				const root = document.getElementById('root');
				root.innerHTML = '';
				if (!sessions || sessions.length === 0) {
					const empty = document.createElement('div');
					empty.className = 'muted';
					empty.textContent = 'No sessions yet. Capture a session using the command palette.';
					root.appendChild(empty);
					return;
				}

				sessions.forEach(s => {
					root.appendChild(createSessionCard(s));
				});
			}

			window.addEventListener('message', ev => {
				const msg = ev.data;
				if (msg.type === 'sessions') renderSessions(msg.data || []);
				if (msg.type === 'deleted') {
					// request updated list
					if (vscode) vscode.postMessage({ type: 'ready' });
				}
			});

			if (vscode) vscode.postMessage({ type: 'ready' });
		</script>
	</body>
</html>`;
}
