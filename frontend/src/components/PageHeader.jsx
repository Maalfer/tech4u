import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

// Hook: typewriter para strings
function useTypewriter(text, speed = 28) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)

    useEffect(() => {
        if (!text) { setDisplayed(''); setDone(true); return }
        setDisplayed('')
        setDone(false)
        let i = 0
        const interval = setInterval(() => {
            i++
            setDisplayed(text.slice(0, i))
            if (i >= text.length) {
                clearInterval(interval)
                setDone(true)
            }
        }, speed)
        return () => clearInterval(interval)
    }, [text])

    return { displayed, done }
}

const PageHeader = ({
    title,
    subtitle,
    Icon,
    gradient = "from-white via-green-100 to-[var(--color-neon)]",
    iconColor = "text-neon",
    iconBg = "bg-[var(--color-neon)]/20",
    iconBorder = "border-[var(--color-neon)]/30",
    glowColor = "bg-[var(--color-neon)]/20",
    children
}) => {
    const subtitleStr = typeof subtitle === 'string' ? subtitle : ''
    const { displayed: subDisplayed, done: subDone } = useTypewriter(subtitleStr, 28)

    // Cursor parpadeante
    const [cursor, setCursor] = useState(true)
    useEffect(() => {
        const t = setInterval(() => setCursor(c => !c), 530)
        return () => clearInterval(t)
    }, [])

    return (
        <header className="mb-14 flex justify-between items-end relative z-10 w-full">
            <div>
                <div className="flex items-center gap-5 mb-4">

                    {/* Icono */}
                    <div className="relative group">
                        <div className={`absolute -inset-2 ${glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className={`p-4 bg-gradient-to-br ${iconBg} to-transparent rounded-2xl border-2 ${iconBorder} shadow-lg relative overflow-hidden backdrop-blur-xl`}>
                            {Icon && <Icon className={`w-10 h-10 ${iconColor} group-hover:rotate-[15deg] transition-transform duration-500`} />}
                            <div className="absolute top-0 right-0 p-1">
                                <Sparkles className={`w-3 h-3 ${iconColor} animate-pulse`} />
                            </div>
                        </div>
                    </div>

                    {/* Texto */}
                    <div>

                        {/* Título: reveal de izquierda a derecha (funciona con JSX y strings) */}
                        <div className="overflow-hidden">
                            <h1
                                className={`text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r ${gradient} drop-shadow-sm`}
                                style={{ animation: 'headerReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                            >
                                {title}
                            </h1>
                        </div>

                        {/* Subtítulo: typewriter con estilo terminal */}
                        {subtitle && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`h-[1px] w-8 ${iconColor.replace('text-', 'bg-')}/50`} />
                                <p className={`text-[10px] font-mono ${iconColor}/70 uppercase tracking-[0.3em] font-bold`}>
                                    <span className="opacity-30 mr-1 select-none">&gt;_</span>
                                    {subDisplayed}
                                    <span
                                        className="ml-px select-none"
                                        style={{ opacity: !subDone && cursor ? 1 : 0 }}
                                    >█</span>
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {children && (
                <div className="animate-in fade-in slide-in-from-right duration-700">
                    {children}
                </div>
            )}

            <style>{`
                @keyframes headerReveal {
                    0%   { clip-path: inset(0 100% 0 0); opacity: 0.3; }
                    15%  { opacity: 1; }
                    100% { clip-path: inset(0 0% 0 0); opacity: 1; }
                }
            `}</style>
        </header>
    );
};

export default PageHeader;
