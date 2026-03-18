/**
 * SkeletonCard — placeholder de carga reutilizable con animación pulse
 *
 * Uso como sustituto de una card genérica:
 *   <SkeletonCard />
 *
 * Grid de 4 skeletons mientras carga:
 *   {isLoading && (
 *     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 *       {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
 *     </div>
 *   )}
 *
 * Variante de lista (más ancha, menos alta):
 *   <SkeletonCard variant="list" lines={2} />
 *
 * Variante de stat box (cuadrada con número grande):
 *   <SkeletonCard variant="stat" />
 *
 * Props:
 *   variant   — "card" (default) | "list" | "stat" | "text"
 *   lines     — número de líneas de texto skeleton (default 3)
 *   height    — altura fija en px para variant "card" (default 180)
 *   className — clase CSS adicional
 */

export default function SkeletonCard({
    variant = 'card',
    lines = 3,
    height = 180,
    className = '',
}) {
    const base = {
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '8px',
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
    }

    if (variant === 'stat') {
        return (
            <>
                <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
                <div className={className} style={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    <div style={{ ...base, height: '12px', width: '50%' }} />
                    <div style={{ ...base, height: '32px', width: '70%' }} />
                    <div style={{ ...base, height: '10px', width: '40%' }} />
                </div>
            </>
        )
    }

    if (variant === 'list') {
        return (
            <>
                <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
                <div className={className} style={{
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    {/* avatar/icono */}
                    <div style={{ ...base, width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
                    {/* líneas */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...Array(lines)].map((_, i) => (
                            <div key={i} style={{
                                ...base,
                                height: '11px',
                                width: i === 0 ? '60%' : `${30 + (i * 15) % 30}%`,
                            }} />
                        ))}
                    </div>
                    {/* badge derecho */}
                    <div style={{ ...base, width: '52px', height: '22px', borderRadius: '20px', flexShrink: 0 }} />
                </div>
            </>
        )
    }

    if (variant === 'text') {
        return (
            <>
                <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
                <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[...Array(lines)].map((_, i) => (
                        <div key={i} style={{
                            ...base,
                            height: '12px',
                            width: i === lines - 1 ? '55%' : `${80 + (i * 7) % 20}%`,
                        }} />
                    ))}
                </div>
            </>
        )
    }

    // variant === 'card' (default)
    return (
        <>
            <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
            <div className={className} style={{
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '0',
            }}>
                {/* imagen/preview */}
                <div style={{ ...base, height: `${height}px`, borderRadius: '0', margin: 0 }} />
                {/* contenido */}
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[...Array(lines)].map((_, i) => (
                        <div key={i} style={{
                            ...base,
                            height: i === 0 ? '14px' : '11px',
                            width: i === 0 ? '75%' : `${40 + (i * 13) % 40}%`,
                        }} />
                    ))}
                </div>
            </div>
        </>
    )
}
