import { h } from 'preact';

interface SolutionSectionProps {
    selectedFeature: 'capture' | 'sync' | 'resume';
    setSelectedFeature: (feature: 'capture' | 'sync' | 'resume') => void;
    checkedCount: number;
    setCheckedCount: (count: number) => void;
    activeFile: string;
    editorLines: string[];
    terminalLines: string[];
    progress: number;
}

export function SolutionSection({
    selectedFeature,
    setSelectedFeature,
    checkedCount,
    setCheckedCount,
    activeFile,
    editorLines,
    terminalLines,
    progress,
}: SolutionSectionProps) {
    return (
        <section class="relative py-32 bg-gradient-to-b from-black to-gray-900">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-6"><span class="gradient-text">FlowLens</span> Remembers<br />What Your Brain Shouldn't.</h2>
                    <p class="text-xl text-gray-400 max-w-3xl mx-auto">Stop starting over every morning. Your coding context, preserved and restored with one click.</p>
                </div>
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="space-y-6">
                        {/* Feature item - interactive */}
                        <div
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedFeature === 'capture'}
                            onClick={() => { setSelectedFeature('capture'); setCheckedCount(1); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('capture'); setCheckedCount(1); } }}
                            class={`card-hover p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 flex gap-4 items-start cursor-pointer ${selectedFeature === 'capture' ? 'ring-2 ring-blue-500/30' : ''}`}
                        >
                            <div class="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <div class={`check-box ${checkedCount >= 1 ? 'checked' : ''}`} aria-hidden>
                                    {checkedCount >= 1 && (
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold mb-2">Session Capture</h3>
                                <p class="text-gray-400">Automatically tracks open files, tabs, terminal commands, and even your last cursor position.</p>
                            </div>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedFeature === 'sync'}
                            onClick={() => { setSelectedFeature('sync'); setCheckedCount(2); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('sync'); setCheckedCount(2); } }}
                            class={`card-hover p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 flex gap-4 items-start cursor-pointer ${selectedFeature === 'sync' ? 'ring-2 ring-blue-500/30' : ''}`}
                        >
                            <div class="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <div class={`check-box ${checkedCount >= 2 ? 'checked' : ''}`} aria-hidden>
                                    {checkedCount >= 2 && (
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold mb-2">Sync</h3>
                                <p class="text-gray-400">Securely saves context metadata (never your code) so you can resume across machines or after restarts.</p>
                            </div>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedFeature === 'resume'}
                            onClick={() => { setSelectedFeature('resume'); setCheckedCount(3); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('resume'); setCheckedCount(3); } }}
                            class={`card-hover p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 flex gap-4 items-start cursor-pointer ${selectedFeature === 'resume' ? 'ring-2 ring-blue-500/30' : ''}`}
                        >
                            <div class="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <div class={`check-box ${checkedCount >= 3 ? 'checked' : ''}`} aria-hidden>
                                    {checkedCount >= 3 && (
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold mb-2">Resume</h3>
                                <p class="text-gray-400">One click reopens exactly how you left off. Your flow state, instantly restored.</p>
                            </div>
                        </div>
                    </div>
                    <div class="relative">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/12 to-blue-600/10 rounded-3xl blur-3xl"></div>
                        <div class="relative code-snippet rounded-2xl p-6 min-h-[180px]">
                            {/* Mock editor area */}
                            <div class="vscode-mock">
                                <div class="tabs flex items-center gap-2 mb-3">
                                    <div class={`tab px-3 py-1 rounded ${activeFile === 'api/routes/user.js' ? 'tab-active' : ''}`}>api/routes/user.js</div>
                                    <div class={`tab px-3 py-1 rounded ${activeFile === 'session/metadata.json' ? 'tab-active' : ''}`}>session/metadata.json</div>
                                    <div class="tab px-3 py-1 rounded">tests/user.test.js</div>
                                </div>
                                <div class="editor-window bg-gray-900 p-4 rounded text-sm font-mono text-gray-200">
                                    {editorLines.map((line, idx) => (
                                        <div class="code-line" key={idx}>
                                            <span dangerouslySetInnerHTML={{ __html: line.replace(/ /g, '&nbsp;') }} />
                                        </div>
                                    ))}
                                </div>
                                <div class="mt-3">
                                    <div class="terminal-mock bg-black/70 p-3 rounded text-xs text-gray-300 font-mono">
                                        {terminalLines.length === 0 && (
                                            <div class="text-gray-500">$ <span class="text-gray-600">No terminal output</span></div>
                                        )}
                                        {terminalLines.map((t, i) => (
                                            <div key={i}><span class="text-green-400">$</span> {t}</div>
                                        ))}
                                    </div>
                                </div>
                                {selectedFeature === 'resume' && (
                                    <div class="mt-3">
                                        <div class="h-2 bg-gray-800 rounded overflow-hidden">
                                            <div class="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div class="text-xs text-gray-500 mt-2">Restoring files & terminals… {progress}%</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
