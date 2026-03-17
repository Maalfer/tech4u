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
            {/* Left: label */}
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

            {/* Right: content */}
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.8 }}>
                {children}
            </div>
        </div>
    )
}

function InfoBox({ children }) {
    return (
        <div style={{
            background: 'rgba(0,255,100,0.03)',
            border: '1px solid rgba(0,255,100,0.1)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '16px',
        }}>
            {children}
        </div>
    )
}

function Field({ label, value, link }) {
    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '160px', flexShrink: 0 }}>{label}</span>
            {link
                ? <a href={link} style={{ color: 'rgba(0,255,100,0.8)', textDecoration: 'none' }}>{value}</a>
                : <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{value}</span>
            }
        </div>
    )
}

function Item({ label, children }) {
    return (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
            <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(0,255,100,0.5)',
                flexShrink: 0,
                marginTop: '8px',
            }} />
            <div>
                {label && <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{label} </span>}
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{children}</span>
            </div>
        </div>
    )
}

function Nota({ children }) {
    return (
        <p style={{
            marginTop: '16px',
            padding: '14px 18px',
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '3px solid rgba(0,255,100,0.3)',
            borderRadius: '0 8px 8px 0',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
        }}>
            {children}
        </p>
    )
}

export default function PrivacidadPage() {
    const navigate = useNavigate()

    return (
        <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @media (max-width: 768px) {
                    .priv-section { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .priv-container { padding: 0 20px !important; }
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
                <img
                    src={brandCombinedImg}
                    alt="Tech4U Academy"
                    style={{ height: '30px', cursor: 'pointer', opacity: 0.9 }}
                    onClick={() => navigate('/')}
                />
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
                <div className="priv-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,255,100,0.6)', fontFamily: 'monospace', marginBottom: '20px' }}>
                        Legal · Tech4U Academy
                    </span>
                    <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '20px' }}>
                        Política de Privacidad<br />
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>y Protección de Datos</span>
                    </h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '24px' }}>
                        En Tech4U Academy nos tomamos muy en serio la protección de tus datos personales. Este documento explica qué información recopilamos, cómo la usamos y cuáles son tus derechos.
                    </p>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                        Última actualización: Enero 2026
                    </span>
                </div>
            </div>

            {/* Content */}
            <main className="priv-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px 80px' }}>

                <Section number="01" title="Responsable del Tratamiento">
                    <InfoBox>
                        <Field label="Nombre" value="Alberto Hidalgo Moreno" />
                        <Field label="Dirección" value="Calle Varsovia 5, Talavera de la Reina (Toledo)" />
                        <Field label="Correo electrónico" value="info@tech4uacademy.es" link="mailto:info@tech4uacademy.es" />
                        <Field label="Actividad" value="Plataforma educativa online para ciclos formativos de informática" />
                    </InfoBox>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
                        En cumplimiento de la <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Ley 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales</strong> y el <strong style={{ color: 'rgba(255,255,255,0.7)' }}>artículo 13 del Reglamento (UE) 2016/679</strong>, los datos recabados serán tratados de forma confidencial bajo titularidad de Alberto Hidalgo Moreno.
                    </p>
                </Section>

                <Section number="02" title="Finalidades del Tratamiento">
                    <Item label="Navegación:">Datos tratados únicamente con finalidades estadísticas y de análisis, conforme a la política de cookies.</Item>
                    <Item label="Formulario de contacto:">Responder a consultas recibidas a través del formulario electrónico de la web.</Item>
                    <Item label="Correo electrónico:">Responder a consultas recibidas a través del correo electrónico mostrado en la web.</Item>
                    <Item label="Suscripción a newsletter:">Alta en la newsletter de Alberto Hidalgo Moreno para recibir información sobre ofertas, promociones y actividades.</Item>
                    <Item label="Contratación:">Prestar los servicios contratados y gestionar la facturación fiscal, contable y administrativa.</Item>
                    <Item label="Registro de usuario:">Realizar el registro como usuario en la plataforma.</Item>
                </Section>

                <Section number="03" title="Tipo de Datos Recogidos">
                    <Item label="Navegación:">IP del dispositivo, tipo de navegador, sistema operativo, contenido consultado, momento y tiempo de conexión.</Item>
                    <Item label="Formulario de contacto / Email:">Datos de carácter identificativo (correo electrónico). Estrictamente necesarios.</Item>
                    <Item label="Newsletter:">Nombre, apellidos y correo electrónico.</Item>
                    <Item label="Contratación:">Nombre, apellidos, NIF, teléfono, correo electrónico, domicilio y datos de tarjeta de crédito o débito.</Item>
                    <Item label="Registro de usuario:">Correo electrónico y contraseña (almacenada con hash bcrypt, nunca en texto plano).</Item>
                </Section>

                <Section number="04" title="Legitimación del Tratamiento">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            ['Navegación', 'Interés legítimo', 'art. 6.1.f RGPD'],
                            ['Formulario / Email', 'Consentimiento', 'art. 6.1.a RGPD'],
                            ['Newsletter', 'Consentimiento + interés legítimo', 'art. 6.1.a y 6.1.f RGPD'],
                            ['Contratación', 'Ejecución de contrato', 'art. 6.1.b RGPD'],
                            ['Registro de usuario', 'Consentimiento', 'art. 6.1.a RGPD'],
                        ].map(([act, base, art]) => (
                            <div key={act} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{act}</p>
                                <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{base}</p>
                                <p style={{ margin: 0, fontSize: '10px', color: 'rgba(0,255,100,0.5)', fontFamily: 'monospace' }}>{art}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section number="05" title="Destinatarios de los Datos">
                    <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8 }}>
                        Alberto Hidalgo Moreno puede contratar servicios con proveedores que acceden a datos personales. Con todos ellos se ha suscrito un acuerdo de encargo de tratamiento, limitando su uso a las finalidades del servicio.
                    </p>
                    <Item label="Stripe (Pagos):">Gestiona el cobro de suscripciones con certificación PCI-DSS. <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>stripe.com/es/privacy</a></Item>
                    <Item label="Cloudflare (Seguridad/CDN):">Protección DDoS y aceleración de contenido. <a href="https://www.cloudflare.com/es-es/privacypolicy/" target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>cloudflare.com</a></Item>
                    <Item label="Administración Pública:">Podrán recibir datos cuando lo exija la normativa vigente para el cumplimiento de obligaciones legales.</Item>
                    <Nota>No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.</Nota>
                </Section>

                <Section number="06" title="Transferencia Internacional de Datos">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
                        Sus datos podrán ser tratados fuera de la Unión Europea. En tal caso, Alberto Hidalgo Moreno garantizará un nivel de protección equivalente, en cumplimiento de los <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Arts. 44 y siguientes del RGPD</strong>.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '0' }}>
                        Para transferencias a EE.UU., los proveedores cumplen con las garantías del Escudo de Privacidad UE–EE.UU. (Privacy Shield) y el <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Art. 28 RGPD</strong>.
                    </p>
                </Section>

                <Section number="07" title="Plazo de Conservación">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
                        Los datos se conservarán el tiempo necesario para la prestación del servicio o hasta que se retire el consentimiento.
                    </p>
                    <Item label="Cuenta activa:">Mientras mantengas tu cuenta abierta.</Item>
                    <Item label="Datos de facturación:">5 años por obligaciones fiscales (Ley 58/2003, General Tributaria).</Item>
                    <Item label="Registros técnicos (logs):">Máximo 12 meses.</Item>
                    <Nota>Tras el periodo de conservación, los datos serán bloqueados y disponibles únicamente para jueces, tribunales, Ministerio Fiscal o Administraciones competentes hasta su eliminación definitiva.</Nota>
                </Section>

                <Section number="08" title="Menores de Edad">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
                        Las páginas web y aplicaciones de Alberto Hidalgo Moreno <strong style={{ color: 'rgba(255,255,255,0.7)' }}>no están dirigidas a menores de 14 años</strong>. Si tienes menos de 14 años, necesitarás la autorización escrita de tu tutor legal para registrarte.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                        Si detectamos que se han obtenido datos de un menor de forma accidental, procederemos a su eliminación inmediata.
                    </p>
                </Section>

                <Section number="09" title="Redes Sociales">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
                        Alberto Hidalgo Moreno tiene presencia en <strong style={{ color: 'rgba(255,255,255,0.7)' }}>YouTube, Instagram y TikTok</strong>. Si decides seguirnos, cedes tus datos a dichas plataformas y deberás aceptar sus políticas de privacidad.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                        Para darte de baja, basta con dejar de seguirnos o contactar en <a href="mailto:info@tech4uacademy.es" style={{ color: 'rgba(0,255,100,0.7)' }}>info@tech4uacademy.es</a>.
                    </p>
                </Section>

                <Section number="10" title="Medidas de Seguridad">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
                        Alberto Hidalgo Moreno adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad y privacidad de los datos.
                    </p>
                    <Item>Confidencialidad, integridad y disponibilidad de los sistemas de tratamiento.</Item>
                    <Item>Restauración rápida del acceso a datos en caso de incidente físico o técnico.</Item>
                    <Item>Evaluación periódica de la eficacia de las medidas de seguridad.</Item>
                    <Item>Contraseñas almacenadas con hash <strong style={{ color: 'rgba(255,255,255,0.7)' }}>bcrypt</strong>, nunca en texto plano.</Item>
                    <Item>Transacciones bajo protocolo <strong style={{ color: 'rgba(255,255,255,0.7)' }}>SSL/TLS</strong> con cifrado total entre servidor y usuario.</Item>
                </Section>

                <Section number="11" title="Derechos del Usuario">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
                        Puedes ejercer los siguientes derechos en cualquier momento adjuntando tu DNI o pasaporte:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                        {[
                            ['Acceso', 'Saber qué datos tuyos tratamos'],
                            ['Rectificación', 'Corregir datos inexactos'],
                            ['Supresión', 'Solicitar el «derecho al olvido»'],
                            ['Limitación', 'Restringir el tratamiento'],
                            ['Oposición', 'Oponerte al tratamiento'],
                            ['Portabilidad', 'Recibir tus datos en formato estructurado'],
                        ].map(([d, desc]) => (
                            <div key={d} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 16px' }}>
                                <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{d}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                    <InfoBox>
                        <Field label="Correo postal" value="Calle Varsovia 5, Talavera de la Reina (Toledo)" />
                        <Field label="Correo electrónico" value="info@tech4uacademy.es" link="mailto:info@tech4uacademy.es" />
                    </InfoBox>
                    <Nota>También puedes presentar una reclamación ante la <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>www.aepd.es</a>.</Nota>
                </Section>

                <Section number="12" title="Cambios en esta Política">
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                        Podemos actualizar esta política cuando sea necesario. Si los cambios son significativos, te lo notificaremos por correo electrónico o mediante un aviso en la plataforma antes de que entren en vigor.
                    </p>
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
