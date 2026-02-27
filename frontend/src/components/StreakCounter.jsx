import { Flame } from 'lucide-react'

export default function StreakCounter({ streak = 0, size = 'md' }) {
    const big = size === 'lg'
    return (
        <div className={`flex items-center gap-2 ${big ? 'gap-3' : ''}`}>
            <div className="relative">
                <Flame
                    className={`${big ? 'w-10 h-10' : 'w-7 h-7'} text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]`}
                    style={{ filter: streak > 0 ? undefined : 'grayscale(1) opacity(0.4)' }}
                />
                {streak > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#39FF14] text-[#0D0D0D] text-[9px] font-black rounded-full flex items-center justify-center">
                        {streak > 99 ? '99+' : streak}
                    </span>
                )}
            </div>
            <div>
                <p className={`${big ? 'text-3xl' : 'text-xl'} font-black font-mono text-[#39FF14] glow-text leading-none`}>
                    {streak}
                </p>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                    {streak === 1 ? 'día seguido' : 'días seguidos'}
                </p>
            </div>
        </div>
    )
}
