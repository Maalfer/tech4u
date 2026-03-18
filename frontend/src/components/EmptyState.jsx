/**
 * EmptyState — componente reutilizable para estados vacíos
 *
 * Uso básico:
 *   <EmptyState
 *     icon="📭"
 *     title="Nada por aquí"
 *     description="Todavía no hay datos que mostrar."
 *   />
 *
 * Con botón de acción:
 *   <EmptyState
 *     icon="🧪"
 *     title="Sin laboratorios"
 *     description="Completa tu primera práctica."
 *     action={{ label: 'Ver laboratorios', onClick: () => navigate('/labs') }}
 *   />
 *
 * Preset "sin resultados de búsqueda":
 *   <EmptyState preset="no-results" searchTerm="linux" onClear={() => setSearch('')} />
 *
 * Props:
 *   icon        — emoji o string (default "📭")
 *   title       — texto del título (default "Sin datos")
 *   description — texto secundario
 *   action      — { label: string, onClick: fn } o { label: string, to: string }
 *   preset      — "no-results" | "coming-soon" | "locked" | "error" (sobreescribe icon/title/description)
 *   searchTerm  — solo para preset "no-results"
 *   onClear     — callback del botón "Limpiar" en preset "no-results"
 *   compact     — boolean, reduce el padding (para usar dentro de cards)
 *   accentColor — color del acento (default "#00ff64")
 */

import { Link } from 'react-router-dom'

const PRESETS = {
    'no-results': (searchTerm) => ({
        icon: '🔍',
        title: `Sin resultados${searchTerm ? ` para "${searchTerm}"` : ''}`,
        description: 'Prueba con otros términos o limpia la búsqueda.',
    }),
    'coming-soon': {
        icon: '🚀',
        title: 'Próximamente',
        description: 'Este contenido está en preparación. ¡Vuelve pronto!',
    },
    'locked': {
        icon: '🔒',
        title: 'Contenido Premium',
        description: 'Activa tu suscripción para acceder a este módulo.',
    },
    'error': {
        icon: '⚠️',
        title: 'Algo salió mal',
        description: 'No pudimos cargar los datos. Intenta de nuevo.',
    },
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    preset,
    searchTerm,
    onClear,
    compact = false,
    accentColor = '#00ff64',
}) {
    // Resolver preset
    let resolvedIcon = icon
    let resolvedTitle = title
    let resolvedDescription = description

    if (preset) {
        const p = preset === 'no-results'
            ? PRESETS['no-results'](searchTerm)
            : PRESETS[preset]
        if (p) {
            resolvedIcon = icon || p.icon
            resolvedTitle = title || p.title
            resolvedDescription = description || p.description
        }
    }

    const padding = compact ? '32px 20px' : '56px 24px'

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding,
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.01)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
            {/* Icono */}
            <div style={{
                fontSize: compact ? '28px' : '36px',
                marginBottom: compact ? '12px' : '16px',
                lineHeight: 1,
            }}>
                {resolvedIcon || '📭'}
            </div>

            {/* Título */}
            <p style={{
                margin: '0 0 6px',
                fontSize: compact ? '13px' : '15px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '-0.01em',
            }}>
                {resolvedTitle || 'Sin datos'}
            </p>

            {/* Descripción */}
            {resolvedDescription && (
                <p style={{
                    margin: '0 0 20px',
                    fontSize: compact ? '11px' : '12px',
                    color: 'rgba(255,255,255,0.25)',
                    lineHeight: 1.6,
                    maxWidth: '280px',
                }}>
                    {resolvedDescription}
                </p>
            )}

            {/* Botón de acción */}
            {action && (
                action.to ? (
                    <Link
                        to={action.to}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 20px',
                            borderRadius: '10px',
                            background: `${accentColor}18`,
                            border: `1px solid ${accentColor}35`,
                            color: accentColor,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${accentColor}28`}
                        onMouseLeave={e => e.currentTarget.style.background = `${accentColor}18`}
                    >
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 20px',
                            borderRadius: '10px',
                            background: `${accentColor}18`,
                            border: `1px solid ${accentColor}35`,
                            color: accentColor,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${accentColor}28`}
                        onMouseLeave={e => e.currentTarget.style.background = `${accentColor}18`}
                    >
                        {action.label}
                    </button>
                )
            )}

            {/* Limpiar búsqueda — solo en preset no-results */}
            {preset === 'no-results' && onClear && !action && (
                <button
                    onClick={onClear}
                    style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Limpiar búsqueda
                </button>
            )}
        </div>
    )
}
