import { Link, useNavigate } from 'react-router-dom'
import brandCombinedImg from '../assets/tech4u_logo.png'
import { Mail, ChevronRight } from 'lucide-react'

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">

            {/* ── Navbar ── */}
            <header className="relative z-20 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0D0D0D]/60 backdrop-blur-xl sticky top-0">
                <img
                    src={brandCombinedImg}
                    alt="Tech4U Academy"
                    className="h-9 object-contain drop-shadow-[0_0_12px_rgba(0,255,100,0.3)] hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link
                        to="/login?tab=register"
                        className="px-6 py-2.5 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all"
                    >
                        Crear cuenta
                    </Link>
                </div>
            </header>

            {/* ── Page header ── */}
            <div className="border-b border-white/[0.05] bg-white/[0.01]">
                <div className="max-w-3xl mx-auto px-8 py-16">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon/70 font-mono mb-4">
                        Legal · Tech4U Academy
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-slate-500 font-mono text-sm leading-relaxed">{subtitle}</p>
                    )}
                    {lastUpdated && (
                        <p className="mt-6 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                            Última actualización: {lastUpdated}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <main className="max-w-3xl mx-auto px-8 py-16">
                <div className="prose-legal">
                    {children}
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
                <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Link to="/legal/privacidad" className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Privacidad</Link>
                        <Link to="/legal/terminos" className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Términos</Link>
                        <Link to="/legal/cookies" className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Cookies</Link>
                        <Link to="/legal/aviso-legal" className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Aviso Legal</Link>
                    </div>
                    <p className="text-[10px] font-mono text-slate-700">© 2026 Tech4U Academy</p>
                </div>
            </footer>

            {/* Prose styles */}
            <style>{`
                .prose-legal h2 {
                    font-size: 1.1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                    font-style: italic;
                    color: #fff;
                    margin-top: 2.5rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .prose-legal h3 {
                    font-size: 0.85rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: rgba(198,255,51,0.8);
                    margin-top: 1.75rem;
                    margin-bottom: 0.5rem;
                    font-family: 'JetBrains Mono', monospace;
                }
                .prose-legal p {
                    font-size: 0.875rem;
                    color: #94a3b8;
                    line-height: 1.8;
                    margin-bottom: 1rem;
                    font-family: ui-monospace, monospace;
                }
                .prose-legal ul {
                    list-style: none;
                    padding: 0;
                    margin: 0.75rem 0 1.25rem 0;
                }
                .prose-legal ul li {
                    font-size: 0.875rem;
                    color: #94a3b8;
                    font-family: ui-monospace, monospace;
                    line-height: 1.7;
                    padding: 0.3rem 0 0.3rem 1.25rem;
                    position: relative;
                }
                .prose-legal ul li::before {
                    content: '→';
                    position: absolute;
                    left: 0;
                    color: rgba(198,255,51,0.5);
                    font-size: 0.75rem;
                }
                .prose-legal strong {
                    color: #e2e8f0;
                    font-weight: 700;
                }
                .prose-legal a {
                    color: rgba(198,255,51,0.8);
                    text-decoration: none;
                }
                .prose-legal a:hover {
                    color: #c6ff33;
                }
                .prose-legal .callout {
                    background: rgba(198,255,51,0.03);
                    border: 1px solid rgba(198,255,51,0.1);
                    border-radius: 1rem;
                    padding: 1rem 1.25rem;
                    margin: 1.5rem 0;
                }
                .prose-legal .callout p {
                    margin: 0;
                    color: #94a3b8;
                }
                .prose-legal .section-divider {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.04);
                    margin: 2.5rem 0;
                }
            `}</style>
        </div>
    )
}
