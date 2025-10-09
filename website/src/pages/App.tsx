import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useRef } from 'preact/hooks'

export function App() {
    const [buttonStateHero, setButtonStateHero] = useState<'idle' | 'joined'>('idle')
    const [buttonStateWaitlist, setButtonStateWaitlist] = useState<'idle' | 'joined'>('idle')
    const [selectedFeature, setSelectedFeature] = useState<'capture' | 'sync' | 'resume'>('capture')
    const [editorLines, setEditorLines] = useState<string[]>([])
    const [activeFile, setActiveFile] = useState('api/routes/user.js')
    const [terminalLines, setTerminalLines] = useState<string[]>([])
    const [progress, setProgress] = useState(0)
    const typingRef = useRef<number | null>(null)
    const [checkedCount, setCheckedCount] = useState(1) // default: first item checked

    useEffect(() => {
        // Smooth scroll for anchor links
        const onClick = (e: Event) => {
            const target = e.currentTarget as HTMLAnchorElement
            const href = target.getAttribute('href')
            if (!href || !href.startsWith('#')) return
            e.preventDefault()
            const el = document.querySelector(href)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }

        const anchors = Array.from(document.querySelectorAll('a[href^="#"]'))
        anchors.forEach(a => a.addEventListener('click', onClick))

        // Parallax for hero
        const hero = document.querySelector('.hero-gradient')
        const onScroll = () => {
            const scrolled = window.pageYOffset
            if (hero) (hero as HTMLElement).style.transform = `translateY(${scrolled * 0.5}px)`
        }
        window.addEventListener('scroll', onScroll)

        // Intersection observer for cards
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement
                    el.style.opacity = '1'
                    el.style.transform = 'translateY(0)'
                }
            })
        }, observerOptions)

        const cards = Array.from(document.querySelectorAll('.card-hover'))
        cards.forEach(card => {
            const el = card as HTMLElement
            el.style.opacity = '0'
            el.style.transform = 'translateY(30px)'
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
            observer.observe(card)
        })

        return () => {
            anchors.forEach(a => a.removeEventListener('click', onClick))
            window.removeEventListener('scroll', onScroll)
            observer.disconnect()
        }
    }, [])

    // helper: type text into an output array, one char at a time
    function typeInto(setter: (v: any) => void, full: string, delay = 30) {
        return new Promise<void>((resolve) => {
            let i = 0
            let current = ''
            function step() {
                if (i <= full.length) {
                    current = full.slice(0, i)
                    setter((prev: string[] | string) => {
                        // if prev is array, replace last line
                        if (Array.isArray(prev)) {
                            const copy = prev.slice()
                            copy[copy.length - 1] = current
                            return copy
                        }
                        return current
                    })
                    i++
                    typingRef.current = window.setTimeout(step, delay)
                } else {
                    resolve()
                }
            }
            step()
        })
    }

    // run preview animations when selectedFeature changes
    useEffect(() => {
        // clear any previous typing timers
        if (typingRef.current) {
            clearTimeout(typingRef.current)
            typingRef.current = null
        }

        // reset states
        setEditorLines([])
        setTerminalLines([])
        setProgress(0)

        async function animate() {
            if (selectedFeature === 'capture') {
                setActiveFile('api/routes/user.js')
                // simulate opening file and typing
                setEditorLines(['// Capturing session metadata...'])
                await new Promise(r => setTimeout(r, 300))
                setEditorLines(prev => [...prev, 'function handleRequest(req, res) {'])
                await new Promise(r => setTimeout(r, 250))
                setEditorLines(prev => [...prev, '    // ...captured cursor position (line 42)'])
                await new Promise(r => setTimeout(r, 500))
                setEditorLines(prev => [...prev, "// Session snapshot saved ✓"])
            }

            if (selectedFeature === 'sync') {
                setActiveFile('session/metadata.json')
                setEditorLines(['{', '  "files": 12,', '  "terminals": 1,', '  "git": "feature/flowlens"', '}'])
                await new Promise(r => setTimeout(r, 400))
                setTerminalLines(['> Encrypting metadata...'])
                await typeInto((v) => setTerminalLines(v), '> Sending to sync service (encrypted)...', 20)
                setTerminalLines(prev => [...prev, '> Sync complete ✓'])
            }

            if (selectedFeature === 'resume') {
                setActiveFile('api/routes/user.js')
                setEditorLines(['// Restoring session...'])
                // simulate progress bar
                for (let p = 10; p <= 100; p += 10) {
                    setProgress(p)
                    // small delay
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise(r => setTimeout(r, 120))
                }
                setEditorLines(prev => [...prev, '// Editors reopened, cursors restored'])
                await new Promise(r => setTimeout(r, 250))
                setTerminalLines(['> npm run test:watch'])
                await typeInto((v) => setTerminalLines(v), '> Watching for changes...', 25)
                setTerminalLines(prev => [...prev, '✔ Tests running'])
            }
        }

        animate()

        return () => {
            if (typingRef.current) {
                clearTimeout(typingRef.current)
                typingRef.current = null
            }
        }
    }, [selectedFeature])

    function handleSubmit(event: Event, scope: 'hero' | 'waitlist') {
        event.preventDefault()
        const form = event.target as HTMLFormElement
        const input = form.querySelector('input[type="email"]') as HTMLInputElement | null
        const email = input?.value || ''

        if (scope === 'hero') setButtonStateHero('joined')
        else setButtonStateWaitlist('joined')

        // reset back to idle after 3s and clear form
        setTimeout(() => {
            if (scope === 'hero') setButtonStateHero('idle')
            else setButtonStateWaitlist('idle')
            form.reset()
        }, 3000)

        // In a real site we'd send the email to a backend here
        // eslint-disable-next-line no-console
        console.log('Email submitted:', email)
    }

    return (
        <main class="min-h-screen bg-black text-white antialiased">
            {/* Navigation */}
            <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800/50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <span class="text-xl font-bold gradient-text">FlowLens</span>
                        </div>
                        <div class="hidden md:flex items-center space-x-8">
                            <a href="#how-it-works" class="text-gray-300 hover:text-white transition">How It Works</a>
                            <a href="#privacy" class="text-gray-300 hover:text-white transition">Privacy</a>
                            <a href="#waitlist" class="btn-primary px-6 py-2 rounded-full text-white font-medium">Join Waitlist</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section class="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-20">
                <div class="network-bg"></div>
                <div class="absolute top-20 left-10 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse-glow"></div>
                <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 1.5s;"></div>

                <div class="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
                    <div class="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <span class="text-sm text-blue-300">✨ Your Coding Time Machine</span>
                    </div>

                    <h1 class="hero-title text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                        Preserve Your Flow.<br />
                        <span class="gradient-text">Resume Where You Left Off.</span>
                    </h1>

                    <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        FlowLens restores your exact coding context — files, tabs, terminals, and even thought trails.
                    </p>

                    {/* Email Form (hero) */}
                    <div class="max-w-md mx-auto mb-12">
                        <form class="flex flex-col sm:flex-row gap-4" onSubmit={(e) => handleSubmit(e, 'hero')}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                class="flex-1 px-6 py-4 rounded-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 transition"
                            />
                            <button type="submit" class={`btn-primary px-8 py-4 rounded-full text-white font-semibold whitespace-nowrap ${buttonStateHero === 'joined' ? 'bg-emerald-600' : ''}`}>
                                {buttonStateHero === 'joined' ? '✓ Joined!' : 'Join Early Access'}
                            </button>
                        </form>
                        <p class="text-sm text-gray-500 mt-4">Join 500+ developers restoring their focus</p>
                    </div>

                    <div class="relative max-w-5xl mx-auto animate-float">
                        <div class="code-snippet rounded-2xl p-8 glow">
                            <div class="flex items-center space-x-2 mb-6">
                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                <span class="ml-4 text-gray-400 text-sm">VS Code - FlowLens Active</span>
                            </div>
                            <div class="space-y-3 text-left font-mono text-sm">
                                <div class="text-gray-500">// <span class="text-blue-400">Context Restored</span> - "Fixing API bug" 🔧</div>
                                <div class="text-gray-300">📁 <span class="text-blue-400">api/routes/user.js</span> <span class="text-gray-600">(Line 42)</span></div>
                                <div class="text-gray-300">📁 <span class="text-emerald-400">tests/user.test.js</span></div>
                                <div class="text-gray-300">⚡ <span class="text-amber-400">Terminal:</span> <span class="text-gray-500">npm run test:watch</span></div>
                                <div class="text-gray-300">🔍 <span class="text-slate-400">Last commit:</span> <span class="text-gray-500">"Add user validation"</span></div>
                                <div class="mt-4 pt-4 border-t border-gray-700">/* Lines omitted */</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section class="relative py-32 bg-black">
                <div class="section-divider mb-20"></div>
                <div class="max-w-7xl mx-auto px-6">
                    <div class="text-center mb-20">
                        <h2 class="text-5xl md:text-6xl font-bold mb-6">You Lose <span class="gradient-text">Hours</span><br />Rebuilding Context.</h2>
                        <p class="text-xl text-gray-400 max-w-2xl mx-auto">Every interruption costs you focus. FlowLens brings it back instantly.</p>
                    </div>

                    <div class="grid md:grid-cols-3 gap-8">
                        <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                            <div class="text-5xl mb-4">🤔</div>
                            <h3 class="text-2xl font-bold mb-4 text-white">Context Lost</h3>
                            <p class="text-gray-400 leading-relaxed">Ever opened VS Code and forgot what you were fixing? That "what was I doing?" moment steals your momentum.</p>
                        </div>

                        <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                            <div class="text-5xl mb-4">📂</div>
                            <h3 class="text-2xl font-bold mb-4 text-white">Tab Chaos</h3>
                            <p class="text-gray-400 leading-relaxed">Lost in 20 tabs after a quick break? Trying to remember which files matter is mental overhead you don't need.</p>
                        </div>

                        <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                            <div class="text-5xl mb-4">💭</div>
                            <h3 class="text-2xl font-bold mb-4 text-white">Memory Fade</h3>
                            <p class="text-gray-400 leading-relaxed">Forgot which terminal command you last ran? Or why you opened that specific file? Your brain isn't a bookmark manager.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
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
                                onClick={() => { setSelectedFeature('capture'); setCheckedCount(1) }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('capture'); setCheckedCount(1) } }}
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
                                onClick={() => { setSelectedFeature('sync'); setCheckedCount(2) }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('sync'); setCheckedCount(2) } }}
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
                                onClick={() => { setSelectedFeature('resume'); setCheckedCount(3) }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFeature('resume'); setCheckedCount(3) } }}
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

            {/* How It Works */}
            <section id="how-it-works" class="relative py-32 bg-black">
                <div class="section-divider mb-20"></div>
                <div class="max-w-7xl mx-auto px-6">
                    <div class="text-center mb-20">
                        <h2 class="text-5xl md:text-6xl font-bold mb-6">How It <span class="gradient-text">Works</span></h2>
                        <p class="text-xl text-gray-400">Three steps to never lose context again</p>
                    </div>

                    <div class="grid md:grid-cols-3 gap-12">
                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                                <span class="text-4xl font-bold gradient-text">1</span>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">📸 Capture</h3>
                            <p class="text-gray-400 leading-relaxed">FlowLens tracks your coding flow locally in real-time. Files, tabs, terminals, git state — everything that matters.</p>
                        </div>

                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                                <span class="text-4xl font-bold gradient-text">2</span>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">🔐 Sync</h3>
                            <p class="text-gray-400 leading-relaxed">It securely saves context metadata (never your code) so you can resume across machines or after restarts.</p>
                        </div>

                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                                <span class="text-4xl font-bold gradient-text">3</span>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">⚡ Resume</h3>
                            <p class="text-gray-400 leading-relaxed">One click reopens exactly how you left off. Your flow state, instantly restored. No mental overhead.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy */}
            <section id="privacy" class="relative py-32 bg-gradient-to-b from-black to-gray-900">
                <div class="max-w-5xl mx-auto px-6 text-center">
                    <div class="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <span class="text-sm text-green-300">🔒 100% Private & Secure</span>
                    </div>

                    <h2 class="text-5xl md:text-6xl font-bold mb-6"><span class="gradient-text">100% Local.</span><br />Private. Yours.</h2>
                    <p class="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">FlowLens never uploads your code or telemetry. All context data stays on your machine, encrypted and secure. We don't see what you're working on — and we don't want to.</p>

                    <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                            <div class="text-3xl mb-3">🔐</div>
                            <h4 class="font-bold mb-2">Local First</h4>
                            <p class="text-sm text-gray-400">All data stored locally on your device</p>
                        </div>
                        <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                            <div class="text-3xl mb-3">🚫</div>
                            <h4 class="font-bold mb-2">No Tracking</h4>
                            <p class="text-sm text-gray-400">Zero telemetry or analytics collected</p>
                        </div>
                        <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                            <div class="text-3xl mb-3">🔑</div>
                            <h4 class="font-bold mb-2">Encrypted</h4>
                            <p class="text-sm text-gray-400">End-to-end encryption for sync</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section class="relative py-32 bg-black">
                <div class="section-divider mb-20"></div>
                <div class="max-w-7xl mx-auto px-6">
                    <div class="text-center mb-20">
                        <h2 class="text-5xl md:text-6xl font-bold mb-6">Loved by <span class="gradient-text">Developers</span></h2>
                        <p class="text-xl text-gray-400">Early testers are already seeing results</p>
                    </div>

                    <div class="grid md:grid-cols-3 gap-8">
                        <div class="testimonial-card p-8 rounded-2xl card-hover">
                            <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                            <p class="text-gray-300 mb-6 leading-relaxed">"FlowLens saved me at least 2 hours this week. No more 'what was I doing?' moments when I context switch."</p>
                            <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500"></div></div>
                        </div>

                        <div class="testimonial-card p-8 rounded-2xl card-hover">
                            <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                            <p class="text-gray-300 mb-6 leading-relaxed">"Finally! A tool that understands how developers actually work. Context switching just became painless."</p>
                            <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500"></div></div>
                        </div>

                        <div class="testimonial-card p-8 rounded-2xl card-hover">
                            <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                            <p class="text-gray-300 mb-6 leading-relaxed">"This is exactly what I needed. Opening VS Code in the morning no longer fills me with dread."</p>
                            <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA / Waitlist */}
            <section id="waitlist" class="relative py-32 bg-gradient-to-b from-black via-blue-900/8 to-black overflow-hidden">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-blue-500/12 via-transparent to-transparent blur-3xl"></div>
                <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 class="text-5xl md:text-7xl font-bold mb-6">Stop Losing Your <span class="gradient-text">Flow</span></h2>
                    <p class="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">Join 500+ developers who are reclaiming their focus.<br />Early access launching soon.</p>

                    <form class="max-w-lg mx-auto mb-8" onSubmit={(e) => handleSubmit(e, 'waitlist')}>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <input type="email" placeholder="your.email@example.com" required class="flex-1 px-6 py-5 rounded-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 transition text-lg" />
                            <button type="submit" class={`btn-primary px-10 py-5 rounded-full text-white font-bold whitespace-nowrap text-lg ${buttonStateWaitlist === 'joined' ? 'bg-emerald-600' : ''}`}>
                                {buttonStateWaitlist === 'joined' ? '✓ Joined!' : 'Join Waitlist →'}
                            </button>
                        </div>
                    </form>

                    <p class="text-sm text-gray-500">✨ Get notified when FlowLens launches • No spam, ever</p>

                    <div class="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
                        <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Free Beta Access</span></div>
                        <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Priority Support</span></div>
                        <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Lifetime Discount</span></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer class="relative py-16 bg-black border-t border-gray-800">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
                            </div>
                            <div>
                                <div class="text-lg font-bold gradient-text">FlowLens</div>
                                <div class="text-xs text-gray-500">Built by developers who hate losing flow.</div>
                            </div>
                        </div>

                        <div class="flex items-center space-x-6">
                            <a href="#" class="text-gray-400 hover:text-white transition">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"></svg>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"></svg>
                            </a>
                        </div>

                        <div class="flex items-center space-x-6 text-sm text-gray-500">
                            <a href="#" class="hover:text-white transition">Privacy</a>
                            <a href="#" class="hover:text-white transition">Terms</a>
                            <a href="#" class="hover:text-white transition">Contact</a>
                        </div>
                    </div>

                    <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                        <p>© 2025 FlowLens. All rights reserved. Your coding time machine. 🚀</p>
                    </div>
                </div>
            </footer>
        </main>
    )
}
