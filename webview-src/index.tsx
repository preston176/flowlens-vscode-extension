// Minimal Preact webview app for FlowLens
import { h } from 'preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

declare const acquireVsCodeApi: any;
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

type EditorSnapshot = { path: string; cursor: { line: number; col: number } | null };
type Session = { id: string; title: string; timestamp: string; editors?: EditorSnapshot[]; notes?: string };

function App() {
    const [sessions, setSessions] = useState<Session[]>([]);
    useEffect(() => {
        const handler = (ev: MessageEvent) => {
            const msg = ev.data;
            if (msg.type === 'sessions') setSessions(msg.data || []);
            if (msg.type === 'deleted') setSessions((s: Session[]) => s.filter((x: Session) => x.id !== msg.id));
        };
        window.addEventListener('message', handler);
        if (vscode) vscode.postMessage({ type: 'ready' });
        return () => window.removeEventListener('message', handler);
    }, []);

    if (!sessions || sessions.length === 0) {
        return <div className="text-gray-400">No sessions yet. Capture a session using the command palette.</div>;
    }

    return (
        <div className="space-y-4">
            {sessions.map((s) => (
                <div key={s.id} className="p-4 rounded-lg bg-gray-800/60">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-lg font-semibold">{s.title || 'Untitled'}</div>
                            <div className="text-sm text-gray-400">{new Date(s.timestamp).toLocaleString()}</div>
                            {s.notes ? <div className="mt-2 text-sm text-gray-300">{s.notes}</div> : null}
                        </div>
                        <div>
                            <button
                                className="mr-2 px-3 py-1 bg-blue-600 rounded"
                                onClick={() => vscode && vscode.postMessage({ type: 'resume', id: s.id })}
                            >
                                Resume
                            </button>
                            <button className="px-3 py-1 bg-red-600 rounded" onClick={() => vscode && vscode.postMessage({ type: 'delete', id: s.id })}>
                                Delete
                            </button>
                        </div>
                    </div>

                    <details className="mt-2 text-sm text-gray-300">
                        <summary>Editors ({(s.editors || []).length})</summary>
                        <ul className="list-disc ml-5 mt-2">
                            {(s.editors || []).map((e) => (
                                <li key={e.path}>{e.path + (e.cursor ? '  - ' + (e.cursor.line + 1) + ':' + (e.cursor.col + 1) : '')}</li>
                            ))}
                        </ul>
                    </details>
                </div>
            ))}
        </div>
    );
}

render(h(App, {}), document.getElementById('root'));
