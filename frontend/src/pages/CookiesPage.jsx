import { Link, useNavigate } from 'react-router-dom'
import brandCombinedImg from '../assets/tech4u_logo.png'

function Section({ number, title, children }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '48px',
            padding: '48px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            <div style={{ paddingTop: '4px' }}>
                <span style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,255,100,0.5)',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                }}>§ {number}</span>
                <h2 style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.4,
                    margin: 0,
                }}>
                    {title}
                </h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.8 }}>
                {children}
            </div>
        </div>
    )
}

function P({ children, style }) {
    return (
        <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, ...style }}>
            {children}
        </p>
    )
}

function B({ children }) {
    return <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{children}</strong>
}

function Item({ label, children }) {
    return (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
            <span style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', background: 'rgba(0,255,100,0.5)',
                flexShrink: 0, marginTop: '8px',
            }} />
            <div style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)' }}>
                {label && <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{label} </span>}
                {children}
            </div>
        </div>
    )
}

function Nota({ children }) {
    return (
        <div style={{
            marginTop: '16px',
            padding: '14px 18px',
            background: 'rgba(255,255,255,0.025)',
            borderLeft: '3px solid rgba(0,255,100,0.3)',
            borderRadius: '0 8px 8px 0',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7,
        }}>
            {children}
        </div>
    )
}

function CookieCard({ tipo, color, icon, children }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${color}22`,
            borderTop: `3px solid ${color}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color }}>{tipo}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{children}</div>
        </div>
    )
}

function BrowserLink({ name, url }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{name}</span>
            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'rgba(0,255,100,0.7)', textDecoration: 'none', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                Ver guía →
            </a>
        </div>
    )
}

export default function CookiesPage() {
    const navigate = useNavigate()

    return (
        <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @media (max-width: 768px) {
                    .ck-section { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .ck-container { padding: 0 20px !important; }
                }
            `}</style>

            {/* Navbar */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 48px', height: '64px',
                background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <img src={brandCombinedImg} alt="Tech4U Academy" style={{ height: '30px', cursor: 'pointer', opacity: 0.9 }} onClick={() => navigate('/')} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link to="/login" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', padding: '8px 16px' }}>
                        Acceder
                    </Link>
                    <Link to="/login?tab=register" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', textDecoration: 'none', padding: '9px 20px', background: '#00ff64', borderRadius: '8px' }}>
                        Crear cuenta
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '72px 0 56px' }}>
                <div className="ck-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,255,100,0.6)', fontFamily: 'monospace', marginBottom: '20px' }}>
                        Legal · Tech4U Academy
                    </span>
                    <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '20px' }}>
                        Política de Cookies
                    </h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '24px' }}>
                        Tech4U Academy utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de la plataforma y mejorar tu experiencia. Aquí te explicamos exactamente qué son, qué cookies usamos y cómo gestionarlas.
                    </p>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                        Última actualización: Enero 2026
                    </span>
                </div>
            </div>

            {/* Content */}
            <main className="ck-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px 80px' }}>

                <Section number="01" title="Entidad Responsable">
                    <P>
                        La entidad responsable de la recogida, procesamiento y utilización de tus datos personales, en el sentido establecido por la Ley de Protección de Datos, es <B>Tech4U Academy</B>, propiedad de <B>Alberto Hidalgo Moreno</B>.
                    </P>
                    <P>
                        En esta web se utilizan cookies propias y de terceros para conseguir una mejor experiencia de navegación, posibilitar compartir contenido en redes sociales y obtener estadísticas de uso anónimas.
                    </P>
                    <Nota>
                        <B>Importante:</B> Si continúas navegando, consideramos que aceptas el uso de cookies conforme al artículo 22.2 de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE). No utilizamos ninguna información personal procedente de cookies — solo realizamos estadísticas generales de visitas.
                    </Nota>
                </Section>

                <Section number="02" title="¿Qué son las cookies?">
                    <P>
                        Las cookies son pequeños archivos de texto que un servidor deposita en el navegador del usuario al visitar una página web. Quedan almacenados en el disco duro del dispositivo y sirven para identificar al usuario cuando vuelve a conectarse al sitio.
                    </P>
                    <P>
                        Su uso es habitual en la web porque permite que las páginas funcionen de manera más eficiente, consigan una mayor personalización y ofrezcan análisis del comportamiento del usuario para mejoras continuas.
                    </P>
                    <P style={{ marginBottom: 0 }}>
                        En función de su permanencia, las cookies pueden ser de <B>sesión</B> (expiran al cerrar el navegador) o <B>permanentes</B> (expiran cuando se cumple su objetivo o se eliminan manualmente).
                    </P>
                </Section>

                <Section number="03" title="Tipos de cookies que utilizamos">
                    <CookieCard tipo="Cookies necesarias" color="#00ff64" icon="🔒">
                        Son imprescindibles para el funcionamiento de la plataforma. Sin ellas no podrías iniciar sesión ni usar las funcionalidades principales. <B>No requieren consentimiento.</B>
                        <div style={{ marginTop: '10px' }}>
                            <Item>Token JWT de autenticación de sesión — <B>httpOnly + Secure + SameSite</B> (no accesible desde JavaScript)</Item>
                            <Item>Cookies de seguridad de <B>Cloudflare</B> — protección DDoS y anti-bot</Item>
                        </div>
                    </CookieCard>

                    <CookieCard tipo="Cookies de rendimiento" color="#6366f1" icon="⚙️">
                        Recuerdan tus preferencias para que no tengas que configurar el servicio cada vez que lo visitas: ajustes de interfaz, preferencias de idioma y estado de elementos personalizados.
                    </CookieCard>

                    <CookieCard tipo="Cookies de geolocalización" color="#0ea5e9" icon="🌍">
                        Utilizadas de forma totalmente anónima para orientar el contenido a tu ubicación geográfica. No almacenan ningún dato personal identificable.
                    </CookieCard>

                    <CookieCard tipo="Cookies de registro" color="#f59e0b" icon="👤">
                        Se generan cuando el usuario inicia sesión. Mantienen la sesión activa entre visitas para que no tengas que volver a identificarte. Se eliminan al cerrar sesión o al expirar el token.
                        <div style={{ marginTop: '10px' }}>
                            <Item>Identificación del usuario entre visitas sin necesidad de re-autenticación.</Item>
                            <Item>Comprobación de autorización de acceso a contenidos restringidos.</Item>
                            <Item>Integración con redes sociales (Google OAuth) si el usuario lo autoriza.</Item>
                        </div>
                    </CookieCard>

                    <CookieCard tipo="Cookies analíticas" color="#8b5cf6" icon="📊">
                        Generadas en cada visita, permiten identificar de forma anónima al navegador (no a la persona) para estadísticas de uso. <B>Nunca se asocian a datos personales identificables.</B>
                        <div style={{ marginTop: '10px' }}>
                            <Item>Contabilización aproximada de visitantes únicos y su evolución en el tiempo.</Item>
                            <Item>Identificación de los contenidos más visitados.</Item>
                            <Item>Distinción entre visitas nuevas y recurrentes.</Item>
                        </div>
                    </CookieCard>

                    <CookieCard tipo="Cookies de terceros — Pagos" color="#ef4444" icon="💳">
                        Durante el proceso de pago, <B>Stripe</B> puede establecer sus propias cookies para gestionar la sesión y prevenir el fraude. Se rigen por su propia política:{' '}
                        <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>stripe.com/es/privacy</a>.
                    </CookieCard>
                </Section>

                <Section number="04" title="Tabla resumen de cookies">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(0,255,100,0.15)' }}>
                                    {['Nombre', 'Tipo', 'Duración', 'Finalidad'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,255,100,0.7)', fontFamily: 'monospace' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['tech4u_token', 'Necesaria (propia)', 'Sesión / 24h', 'Autenticación JWT (httpOnly)'],
                                    ['__cf_bm', 'Necesaria (Cloudflare)', '30 min', 'Protección anti-bot'],
                                    ['_cfuvid', 'Necesaria (Cloudflare)', 'Sesión', 'Gestión de tráfico'],
                                    ['Stripe cookies', 'Terceros (pago)', 'Sesión de pago', 'Prevención de fraude'],
                                    ['Analítica (anon.)', 'Analítica', 'Visita', 'Estadísticas anónimas'],
                                ].map(([nombre, tipo, duracion, finalidad], i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', fontSize: '12px' }}>{nombre}</td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{tipo}</td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.45)', fontSize: '12px', whiteSpace: 'nowrap' }}>{duracion}</td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{finalidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section number="05" title="¿Cómo deshabilitar las cookies?">
                    <P>
                        Puedes configurar tu navegador para recibir un aviso antes de aceptar cookies, rechazarlas o eliminarlas. Ten en cuenta que deshabilitar las cookies estrictamente necesarias puede impedir el inicio de sesión y el uso de la plataforma.
                    </P>
                    <div style={{ marginBottom: '24px' }}>
                        <BrowserLink name="Google Chrome" url="https://support.google.com/chrome/answer/95647?hl=es" />
                        <BrowserLink name="Mozilla Firefox" url="http://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-que-los-sitios-we" />
                        <BrowserLink name="Safari" url="http://www.apple.com/es/privacy/use-of-cookies/" />
                        <BrowserLink name="Internet Explorer / Edge" url="http://windows.microsoft.com/es-es/windows-vista/cookies-frequently-asked-questions" />
                        <BrowserLink name="Opera" url="http://help.opera.com/Windows/11.50/es-ES/cookies.html" />
                    </div>
                    <Nota>
                        Si deseas dejar de ser seguido por Google Analytics, puedes instalar el complemento oficial:{' '}
                        <a href="http://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>tools.google.com/dlpage/gaoptout</a>
                    </Nota>
                </Section>

                <Section number="06" title="Base Legal">
                    <P>
                        El uso de cookies estrictamente necesarias se fundamenta en el <B>interés legítimo</B> para garantizar el funcionamiento técnico de la plataforma (<B>art. 6.1.f RGPD</B> y Ley 34/2002, LSSI-CE, art. 22.2).
                    </P>
                    <P style={{ marginBottom: 0 }}>
                        Para cualquier cookie no estrictamente necesaria que se implemente en el futuro, se solicitará el <B>consentimiento previo</B> del usuario mediante un banner de configuración de cookies antes de su activación.
                    </P>
                </Section>

                <Section number="07" title="Actualizaciones de esta Política">
                    <P style={{ marginBottom: 0 }}>
                        Esta política puede actualizarse para reflejar cambios en las tecnologías que utilizamos o en la normativa vigente. Te informaremos de cualquier cambio relevante a través de la plataforma o por correo electrónico.
                    </P>
                </Section>

                <Section number="08" title="Contacto">
                    <P>Para cualquier consulta sobre el uso de cookies en Tech4U Academy:</P>
                    <div style={{ background: 'rgba(0,255,100,0.03)', border: '1px solid rgba(0,255,100,0.1)', borderRadius: '12px', padding: '20px 24px' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '14px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '160px' }}>Responsable</span>
                            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Alberto Hidalgo Moreno</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '160px' }}>Correo electrónico</span>
                            <a href="mailto:info@tech4uacademy.es" style={{ color: 'rgba(0,255,100,0.8)', textDecoration: 'none' }}>info@tech4uacademy.es</a>
                        </div>
                    </div>
                </Section>

            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050508' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                        © 2026 Tech4U Academy
                    </p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {[['Privacidad', '/privacidad'], ['Términos', '/terminos'], ['Cookies', '/cookies']].map(([l, h]) => (
                            <Link key={l} to={h} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
                            >{l}</Link>
                        ))}
                    </div>
                </div>
            </footer>

        </div>
    )
}
