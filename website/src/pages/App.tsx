
import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { Navigation } from '../components/Navigation';
import { HeroSection } from '../components/HeroSection';
import { WaitlistSection } from '../components/WaitlistSection';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { PrivacySection } from '../components/PrivacySection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { Footer } from '../components/Footer';

export function App() {
    // Dynamic waitlist number logic
    function getWaitlistCount() {
        const base = 29;
        const target = 100;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        if (year > 2025 || (year === 2025 && month >= 11)) return target;
        if (year < 2025 || (year === 2025 && month <= 0)) return base;
        const months = 11;
        const progress = month / months;
        return Math.round(base + (target - base) * progress);
    }

    const [buttonStateHero, setButtonStateHero] = useState<'idle' | 'joined'>('idle');
    const [buttonStateWaitlist, setButtonStateWaitlist] = useState<'idle' | 'joined'>('idle');
    const [selectedFeature, setSelectedFeature] = useState<'capture' | 'sync' | 'resume'>('capture');
    const [editorLines, setEditorLines] = useState<string[]>([]);
    const [activeFile, setActiveFile] = useState('api/routes/user.js');
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const typingRef = useRef<number | null>(null);
    const [checkedCount, setCheckedCount] = useState(1); // default: first item checked

    useEffect(() => {
        // Smooth scroll for anchor links
        const onClick = (e: Event) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const href = target.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
        anchors.forEach(a => a.addEventListener('click', onClick));
        // Intersection observer for cards
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        const cards = Array.from(document.querySelectorAll('.card-hover'));
        cards.forEach(card => {
            const el = card as HTMLElement;
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
        return () => {
            anchors.forEach(a => a.removeEventListener('click', onClick));
            observer.disconnect();
        };
    }, []);

    // helper: type text into an output array, one char at a time
    function typeInto(setter: (v: any) => void, full: string, delay = 30) {
        return new Promise<void>((resolve) => {
            let i = 0;
            let current = '';
            function step() {
                if (i <= full.length) {
                    current = full.slice(0, i);
                    setter((prev: string[] | string) => {
                        if (Array.isArray(prev)) {
                            const copy = prev.slice();
                            copy[copy.length - 1] = current;
                            return copy;
                        }
                        return current;
                    });
                    i++;
                    typingRef.current = window.setTimeout(step, delay);
                } else {
                    resolve();
                }
            }
            step();
        });
    }

    // run preview animations when selectedFeature changes
    useEffect(() => {
        if (typingRef.current) {
            clearTimeout(typingRef.current);
            typingRef.current = null;
        }
        setEditorLines([]);
        setTerminalLines([]);
        setProgress(0);
        async function animate() {
            if (selectedFeature === 'capture') {
                setActiveFile('api/routes/user.js');
                setEditorLines(['// Capturing session metadata...']);
                await new Promise(r => setTimeout(r, 300));
                setEditorLines(prev => [...prev, 'function handleRequest(req, res) {']);
                await new Promise(r => setTimeout(r, 250));
                setEditorLines(prev => [...prev, '    // ...captured cursor position (line 42)']);
                await new Promise(r => setTimeout(r, 500));
                setEditorLines(prev => [...prev, "// Session snapshot saved ✓"]);
            }
            if (selectedFeature === 'sync') {
                setActiveFile('session/metadata.json');
                setEditorLines(['{', '  "files": 12,', '  "terminals": 1,', '  "git": "feature/flowlens"', '}']);
                await new Promise(r => setTimeout(r, 400));
                setTerminalLines(['> Encrypting metadata...']);
                await typeInto((v) => setTerminalLines(v), '> Sending to sync service (encrypted)...', 20);
                setTerminalLines(prev => [...prev, '> Sync complete ✓']);
            }
            if (selectedFeature === 'resume') {
                setActiveFile('api/routes/user.js');
                setEditorLines(['// Restoring session...']);
                for (let p = 10; p <= 100; p += 10) {
                    setProgress(p);
                    await new Promise(r => setTimeout(r, 120));
                }
                setEditorLines(prev => [...prev, '// Editors reopened, cursors restored']);
                await new Promise(r => setTimeout(r, 250));
                setTerminalLines(['> npm run test:watch']);
                await typeInto((v) => setTerminalLines(v), '> Watching for changes...', 25);
                setTerminalLines(prev => [...prev, '✔ Tests running']);
            }
        }
        animate();
        return () => {
            if (typingRef.current) {
                clearTimeout(typingRef.current);
                typingRef.current = null;
            }
        };
    }, [selectedFeature]);

    function handleSubmit(event: Event, scope: 'hero' | 'waitlist') {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const input = form.querySelector('input[type="email"]') as HTMLInputElement | null;
        const email = input?.value || '';
        if (scope === 'hero') {
            setButtonStateHero('joined');
            setTimeout(() => {
                setButtonStateHero('idle');
                form.reset();
            }, 3000);
            return;
        }
        setButtonStateWaitlist('joined');
        const joined_at = new Date().toISOString();
        fetch(import.meta.env.VITE_SHEETDB_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [{ email, joined_at }] })
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to join waitlist');
                setButtonStateWaitlist('joined');
                setTimeout(() => {
                    setButtonStateWaitlist('idle');
                    form.reset();
                }, 3000);
            })
            .catch(() => {
                setButtonStateWaitlist('idle');
                alert('There was a problem joining the waitlist. Please try again!');
            });
    }

    return (
        <main class="min-h-screen bg-black text-white antialiased">
            <Navigation />
            <HeroSection
                buttonStateHero={buttonStateHero}
                handleSubmit={handleSubmit}
                getWaitlistCount={getWaitlistCount}
            />
            <ProblemSection />
            <SolutionSection
                selectedFeature={selectedFeature}
                setSelectedFeature={setSelectedFeature}
                checkedCount={checkedCount}
                setCheckedCount={setCheckedCount}
                activeFile={activeFile}
                editorLines={editorLines}
                terminalLines={terminalLines}
                progress={progress}
            />
            <HowItWorksSection />
            <PrivacySection />
            <TestimonialsSection />
            <WaitlistSection
                buttonStateWaitlist={buttonStateWaitlist}
                handleSubmit={handleSubmit}
                getWaitlistCount={getWaitlistCount}
            />
            <Footer />
        </main>
    );
}
