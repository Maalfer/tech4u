import { Flame } from 'lucide-react'

export default function StreakCounter({ streak = 0, size = 'md' }) {
    const big = size === 'lg'

    return (
        <div className={`flex items-center gap-4 ${big ? 'scale-110' : ''}`}>
            <div className="relative group">
                {/* Glow Background */}
                <div className={`absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 ${streak > 0 ? 'group-hover:opacity-100' : ''} transition-opacity duration-700`} />

                <div className={`relative p-3 rounded-2xl bg-gradient-to-br from-stone-900 to-black border ${streak > 0 ? 'border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'border-slate-800 opacity-40'} transition-all duration-500`}>
                    <Flame
                        className={`${big ? 'w-10 h-10' : 'w-7 h-7'} text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] ${streak > 0 ? 'animate-pulse' : ''}`}
                        style={{ filter: streak > 0 ? undefined : 'grayscale(1)' }}
                    />
                </div>

                {/* Visual indicator of "Multiplier" or status */}
                {streak >= 7 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center border border-white/20 shadow-lg shadow-orange-500/40 rotate-12 transition-transform hover:rotate-0">
                        <span className="text-[10px] font-black text-white italic">HOT</span>
                    </div>
                )}
            </div>

            <div className="text-left">
                <div className="flex items-baseline gap-1">
                    <span className={`${big ? 'text-4xl' : 'text-2xl'} font-black font-mono text-white tracking-tighter drop-shadow-md`}>
                        {streak}
                    </span>
                    <span className="text-orange-500 font-mono text-sm font-bold uppercase tracking-widest animate-pulse">
                        Racha
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">
                    {streak === 1 ? 'Día de Infiltración' : 'Días de Superviviencia'}
                </p>
            </div>
        </div>
    )
}
