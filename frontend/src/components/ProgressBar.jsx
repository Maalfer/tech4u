export default function ProgressBar({ percent = 0, label, subject, showCircle = false }) {
    const clipped = Math.min(100, Math.max(0, percent))
    const r = 40
    const circumference = 2 * Math.PI * r
    const dash = circumference - (clipped / 100) * circumference

    if (showCircle) {
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* track */}
                        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(57,255,20,0.1)" strokeWidth="8" />
                        {/* progress */}
                        <circle
                            cx="50" cy="50" r={r} fill="none"
                            stroke="#39FF14"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={dash}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease', filter: 'drop-shadow(0 0 6px #39FF14)' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black font-mono text-[#39FF14]">{clipped}%</span>
                    </div>
                </div>
                {label && <p className="text-xs text-slate-400 font-mono text-center">{label}</p>}
            </div>
        )
    }

    return (
        <div className="w-full">
            {(label || subject) && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono text-slate-400">{subject || label}</span>
                    <span className="text-xs font-mono text-[#39FF14]">{clipped}%</span>
                </div>
            )}
            <div className="h-2 rounded-full bg-[rgba(57,255,20,0.08)] overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${clipped}%`,
                        background: 'linear-gradient(90deg, #00FF41, #39FF14)',
                        boxShadow: clipped > 0 ? '0 0 10px rgba(57,255,20,0.6)' : 'none',
                    }}
                />
            </div>
        </div>
    )
}
