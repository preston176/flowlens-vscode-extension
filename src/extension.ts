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
		// Simple HTML/JS webview using VS Code Webview UI Toolkit and plain DOM
		// https://github.com/microsoft/vscode-webview-ui-toolkit
		// No dependency on dist/webview.js
			const toolkitUri = panel?.webview.asWebviewUri(vscode.Uri.joinPath(
					vscode.Uri.file(__dirname),
					'..',
					'node_modules',
					'@vscode',
					'webview-ui-toolkit',
					'dist',
					'toolkit.js',
			));
			// Return as a single string literal to avoid TypeScript parsing errors
			   return [
			   '<!DOCTYPE html>',
			   '<html lang="en">',
			   '<head>',
			   '  <meta charset="UTF-8">',
			   '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
			   '  <title>FlowLens Sessions</title>',
			   `  <script type="module" src="${toolkitUri}"></script>`,
			   '  <style>',
			   '    body { background: #0b1220; color: #fff; font-family: system-ui, Segoe UI, Roboto, Helvetica, Arial; margin: 0; padding: 0; }',
			   '    .container { max-width: 600px; margin: 40px auto; background: #181c24; border-radius: 12px; box-shadow: 0 4px 32px #0004; padding: 32px 24px; }',
			   '    h1 { font-size: 2rem; margin-bottom: 1.5rem; }',
			   '    .search-bar { display: flex; align-items: center; margin-bottom: 1.5rem; gap: 0.5rem; }',
			   '    .search-input { flex: 1; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #23272e; background: #23272e; color: #fff; font-size: 1rem; outline: none; transition: border 0.2s; }',
			   '    .search-input:focus { border: 1.5px solid #388bfd; background: #23272e; }',
			   '    .session { background: #23272e; border-radius: 8px; margin-bottom: 1rem; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; }',
			   '    .session-info { flex: 1; }',
			   '    .session-title { font-weight: 600; font-size: 1.1rem; }',
			   '    .session-meta { color: #a0aec0; font-size: 0.95rem; margin-bottom: 0.5rem; }',
			   '    .session-notes { color: #e0e7ef; font-size: 0.95rem; margin-bottom: 0.5rem; }',
			   '    .session-actions { display: flex; flex-direction: column; gap: 0.5rem; min-width: 110px; }',
			   '    .session-editors { color: #b5cdfa; font-size: 0.92rem; margin-top: 0.5rem; }',
			   '    .empty { color: #7dd3fc; text-align: center; margin: 2rem 0; }',
			   '    vscode-button, button {',
			   '      font-size: 1rem;',
			   '      border-radius: 6px;',
			   '      padding: 0.45rem 1.1rem;',
			   '      font-weight: 500;',
			   '      margin: 0;',
			   '      box-shadow: none;',
			   '      transition: background 0.15s, color 0.15s, border 0.15s;',
			   '    }',
			   '    vscode-button[appearance="primary"] { background: #388bfd; color: #fff; border: none; }',
			   '    vscode-button[appearance="primary"]:hover, vscode-button[appearance="primary"]:focus { background: #2563eb; color: #fff; }',
			   '    vscode-button[appearance="secondary"] { background: #23272e; color: #b5cdfa; border: 1px solid #3b4252; }',
			   '    vscode-button[appearance="secondary"]:hover, vscode-button[appearance="secondary"]:focus { background: #1e222a; color: #fff; border: 1.5px solid #388bfd; }',
			   '  </style>',
			   '</head>',
			   '<body>',
			   '  <div class="container">',
			   '    <h1>FlowLens Sessions</h1>',
			   '    <div class="search-bar">',
			   '      <input id="search" class="search-input" type="text" placeholder="Search sessions, notes, files, terminals..." autocomplete="off" spellcheck="false" />',
			   '    </div>',
			   '    <div id="sessions"></div>',
			   '    <div id="empty" class="empty" style="display:none">No sessions yet. Use <b>Capture Session</b> to save your context.</div>',
			   '  </div>',
			   '  <script type="module">',
			   '    const vscode = acquireVsCodeApi();',
			   '    let allSessions = [];',
			   '    function filterSessions(query) {',
			   '      if (!query) return allSessions;',
			   '      const q = query.toLowerCase();',
			   '      return allSessions.filter(session => {',
			   '        if ((session.title && session.title.toLowerCase().includes(q)) ||',
			   '            (session.notes && session.notes.toLowerCase().includes(q)) ||',
			   '            (session.editors && session.editors.some(e => e.path && e.path.toLowerCase().includes(q))) ||',
			   '            (session.terminals && session.terminals.some(t => (t.name && t.name.toLowerCase().includes(q)) || (t.lastCommand && t.lastCommand.toLowerCase().includes(q))))',
			   '        ) return true;',
			   '        return false;',
			   '      });',
			   '    }',
			   '    function renderSessions(sessions) {',
			   '      const root = document.getElementById("sessions");',
			   '      root.innerHTML = "";',
			   '      if (!sessions || sessions.length === 0) {',
			   '        document.getElementById("empty").style.display = "";',
			   '        return;',
			   '      }',
			   '      document.getElementById("empty").style.display = "none";',
			   '      sessions.forEach(session => {',
			   '        const div = document.createElement("div");',
			   '        div.className = "session";',
			   '        div.innerHTML = ',
			   '          `<div class=\"session-info\">` +',
			   '            `<div class=\"session-title\">${session.title || "Untitled"}</div>` +',
			   '            `<div class=\"session-meta\">${new Date(session.timestamp).toLocaleString()}</div>` +',
			   '            (session.notes ? `<div class=\"session-notes\">${session.notes}</div>` : "") +',
			   '            `<div class=\"session-editors\">${(session.editors||[]).map(e => `${e.path}${e.cursor ? ` (${e.cursor.line+1}:${e.cursor.col+1})` : ""}`).join("<br>")}</div>` +',
			   '          `</div>` +',
			   '          `<div class=\"session-actions\">` +',
			   '            `<vscode-button appearance=\"primary\" data-id=\"${session.id}\" data-action=\"resume\">Resume</vscode-button>` +',
			   '            `<vscode-button appearance=\"secondary\" data-id=\"${session.id}\" data-action=\"delete\">Delete</vscode-button>` +',
			   '          `</div>`;',
			   '        root.appendChild(div);',
			   '      });',
			   '      root.querySelectorAll("vscode-button").forEach(btn => {',
			   '        btn.addEventListener("click", e => {',
			   '          const id = btn.getAttribute("data-id");',
			   '          const action = btn.getAttribute("data-action");',
			   '          vscode.postMessage({ type: action, id });',
			   '        });',
			   '      });',
			   '    }',
			   '    window.addEventListener("message", event => {',
			   '      if (event.data && event.data.type === "sessions") {',
			   '        allSessions = event.data.data;',
			   '        const searchVal = document.getElementById("search").value;',
			   '        renderSessions(filterSessions(searchVal));',
			   '      }',
			   '      if (event.data && event.data.type === "deleted") {',
			   '        // Remove deleted session from UI',
			   '        allSessions = allSessions.filter(s => s.id !== event.data.id);',
			   '        const searchVal = document.getElementById("search").value;',
			   '        renderSessions(filterSessions(searchVal));',
			   '      }',
			   '    });',
			   '    document.getElementById("search").addEventListener("input", e => {',
			   '      const val = e.target.value;',
			   '      renderSessions(filterSessions(val));',
			   '    });',
			   '    // Request sessions on load',
			   '    vscode.postMessage({ type: "ready" });',
			   '  </script>',
			   '</body>',
			   '</html>'
		   ].join('\n');
	}
