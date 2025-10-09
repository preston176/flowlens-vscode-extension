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

		panel.webview.html = getWebviewContent();

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

function getWebviewContent(): string {
		return `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>FlowLens Sessions</title>
		<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
		<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
		<script src="https://cdn.tailwindcss.com"></script>
		<style>body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }</style>
	</head>
	<body class="bg-gray-900 text-white p-6">
		<div id="root"></div>

		<script>
			const vscode = acquireVsCodeApi ? acquireVsCodeApi() : null;

			function el(name, props, ...children) {
				return React.createElement(name, props, ...children);
			}

			function App() {
				const [sessions, setSessions] = React.useState([]);
				React.useEffect(() => {
					window.addEventListener('message', ev => {
						const msg = ev.data;
						if (msg.type === 'sessions') setSessions(msg.data || []);
						if (msg.type === 'deleted') setSessions(s => s.filter(x => x.id !== msg.id));
					});
					if (vscode) vscode.postMessage({ type: 'ready' });
				}, []);

				if (!sessions || sessions.length === 0) {
					return el('div', { className: 'text-gray-400' }, 'No sessions yet. Capture a session using the command palette.');
				}

				return el('div', { className: 'space-y-4' },
					sessions.map(s => el('div', { key: s.id, className: 'p-4 rounded-lg bg-gray-800/60' },
						el('div', { className: 'flex justify-between items-start' },
							el('div', null,
								el('div', { className: 'text-lg font-semibold' }, s.title || 'Untitled'),
								el('div', { className: 'text-sm text-gray-400' }, new Date(s.timestamp).toLocaleString()),
								s.notes ? el('div', { className: 'mt-2 text-sm text-gray-300' }, s.notes) : null
							),
							el('div', null,
								el('button', { className: 'mr-2 px-3 py-1 bg-blue-600 rounded', onClick: () => vscode && vscode.postMessage({ type: 'resume', id: s.id }) }, 'Resume'),
								el('button', { className: 'px-3 py-1 bg-red-600 rounded', onClick: () => vscode && vscode.postMessage({ type: 'delete', id: s.id }) }, 'Delete')
							)
						),
						el('details', { className: 'mt-2 text-sm text-gray-300' },
							el('summary', null, 'Editors (' + (s.editors ? s.editors.length : 0) + ')'),
							el('ul', { className: 'list-disc ml-5 mt-2' }, (s.editors || []).map(function(e){ return el('li', { key: e.path }, e.path + (e.cursor ? '  - ' + (e.cursor.line + 1) + ':' + (e.cursor.col + 1) : '')); }))
						)
					))
				);
			}

			ReactDOM.render(React.createElement(App), document.getElementById('root'));
		</script>
	</body>
</html>`;
}
