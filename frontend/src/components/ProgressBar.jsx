export default function ProgressBar({ percent = 0, label, subject, showCircle = false }) {
    const clipped = Math.min(100, Math.max(0, percent))
    const r = 40
    const circumference = 2 * Math.PI * r
    const dash = circumference - (clipped / 100) * circumference

    if (showCircle) {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 transform drop-shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* track */}
                        <circle cx="50" cy="50" r={r} fill="none" stroke="#111" strokeWidth="8" />
                        {/* progress */}
                        <circle
                            cx="50" cy="50" r={r} fill="none"
                            stroke="var(--color-neon)"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={dash}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: 'drop-shadow(0 0 8px var(--color-neon))'
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black font-mono text-neon glow-text tracking-tighter">{clipped}%</span>
                    </div>
                </div>
                {label && <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center font-bold px-2">{label}</p>}
            </div>
        )
    }

    return (
        <div className="w-full">
            {(label || subject) && (
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black leading-none">{subject || label}</span>
                    <span className="text-[11px] font-mono text-neon font-black leading-none">{clipped}%</span>
                </div>
            )}
            <div className="h-2.5 rounded-full bg-[#0D0D0D] border border-white/5 overflow-hidden p-[1px]">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative group"
                    style={{
                        width: `${clipped}%`,
                        background: 'linear-gradient(90deg, #00FF41, #00D1FF)',
                        boxShadow: clipped > 0 ? '0 0 12px rgba(0,255,65,0.4)' : 'none',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full transform -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            </div>
        </div>
    )
}
