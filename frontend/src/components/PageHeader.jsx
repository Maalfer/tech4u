import React from 'react';
import { Sparkles } from 'lucide-react';

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
    return (
        <header className="mb-14 flex justify-between items-end relative z-10 w-full">
            <div className="animate-in fade-in slide-in-from-left duration-700">
                <div className="flex items-center gap-5 mb-4">
                    <div className="relative group">
                        <div className={`absolute -inset-2 ${glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className={`p-4 bg-gradient-to-br ${iconBg} to-transparent rounded-2xl border-2 ${iconBorder} shadow-lg relative overflow-hidden backdrop-blur-xl`}>
                            {Icon && <Icon className={`w-10 h-10 ${iconColor} group-hover:rotate-[15deg] transition-transform duration-500`} />}
                            <div className="absolute top-0 right-0 p-1">
                                <Sparkles className={`w-3 h-3 ${iconColor} animate-pulse`} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className={`text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r ${gradient} drop-shadow-sm`}>
                            {title}
                        </h1>
                        {subtitle && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`h-[1px] w-8 ${iconColor.replace('text-', 'bg-')}/50`} />
                                <p className={`text-[10px] font-mono ${iconColor.replace('text-', 'text-')}/70 uppercase tracking-[0.3em] font-bold`}>
                                    {subtitle}
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
        </header>
    );
};

export default PageHeader;
