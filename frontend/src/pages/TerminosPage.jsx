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
                    display: 'block', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(0,255,100,0.5)', marginBottom: '8px', fontFamily: 'monospace',
                }}>§ {number}</span>
                <h2 style={{
                    fontSize: '13px', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, margin: 0,
                }}>{title}</h2>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.85 }}>
                {children}
            </div>
        </div>
    )
}

function P({ children }) {
    return <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.85 }}>{children}</p>
}

function B({ children }) {
    return <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{children}</strong>
}

function Item({ label, children }) {
    return (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,255,100,0.5)', flexShrink: 0, marginTop: '8px' }} />
            <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
                {label && <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{label} </span>}
                {children}
            </div>
        </div>
    )
}

function SubItem({ children }) {
    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', paddingLeft: '20px' }}>
            <span style={{ color: 'rgba(0,255,100,0.35)', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>–</span>
            <span style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(255,255,255,0.4)' }}>{children}</span>
        </div>
    )
}

function Nota({ children }) {
    return (
        <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,255,255,0.025)', borderLeft: '3px solid rgba(0,255,100,0.3)', borderRadius: '0 8px 8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
            {children}
        </div>
    )
}

function InfoBox({ children }) {
    return (
        <div style={{ background: 'rgba(0,255,100,0.03)', border: '1px solid rgba(0,255,100,0.1)', borderRadius: '12px', padding: '20px 24px', margin: '16px 0' }}>
            {children}
        </div>
    )
}

const SITE = 'tech4uacademy.es'
const SITE_URL = 'https://tech4uacademy.es'
const SITE_NAME = 'Tech4U Academy'

export default function TerminosPage() {
    const navigate = useNavigate()

    return (
        <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @media (max-width: 768px) {
                    .tm-section { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .tm-container { padding: 0 20px !important; }
                }
            `}</style>

            {/* Navbar */}
            <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '64px', background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={brandCombinedImg} alt={SITE_NAME} style={{ height: '30px', cursor: 'pointer', opacity: 0.9 }} onClick={() => navigate('/')} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link to="/login" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', padding: '8px 16px' }}>Acceder</Link>
                    <Link to="/login?tab=register" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', textDecoration: 'none', padding: '9px 20px', background: '#00ff64', borderRadius: '8px' }}>Crear cuenta</Link>
                </div>
            </header>

            {/* Hero */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '72px 0 56px' }}>
                <div className="tm-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,255,100,0.6)', fontFamily: 'monospace', marginBottom: '20px' }}>
                        Legal · Tech4U Academy
                    </span>
                    <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '20px' }}>
                        Condiciones Generales<br />
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>de Venta</span>
                    </h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '24px' }}>
                        Estas condiciones regulan el acceso, uso y contratación de productos y servicios en Tech4U Academy. Al navegar o realizar una compra, aceptas los términos aquí establecidos.
                    </p>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>Última actualización: Enero 2026</span>
                </div>
            </div>

            {/* Content */}
            <main className="tm-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px 80px' }}>

                <Section number="01" title="Vinculación">
                    <P>El acceso, la navegación y uso del Sitio Web confiere la condición de <B>Usuario</B>, aceptando desde el inicio de la navegación todas las Condiciones aquí establecidas y sus ulteriores modificaciones, sin perjuicio de la normativa legal de obligado cumplimiento.</P>
                    <P>El Usuario asume su responsabilidad de un uso correcto del Sitio Web. Esta responsabilidad comprende:</P>
                    <Item>Hacer uso del Sitio Web únicamente para realizar consultas y compras legalmente válidas.</Item>
                    <Item>No realizar ninguna compra falsa o fraudulenta. De detectarse, podrá ser anulada e informarse a las autoridades pertinentes.</Item>
                    <Item>Facilitar datos de contacto veraces y lícitos (correo electrónico, dirección postal y otros).</Item>
                    <Nota>El Usuario declara ser <B>mayor de 18 años</B> y tener capacidad legal para celebrar contratos a través de este Sitio Web. El contrato podrá formalizarse en cualquiera de los idiomas disponibles en <a href={SITE_URL} target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>{SITE}</a>.</Nota>
                </Section>

                <Section number="02" title="Introducción">
                    <P>Este documento, junto con otros documentos mencionados aquí, establece las condiciones para el uso de <B>{SITE_NAME}</B> y la compra o adquisición de productos y/o servicios en él.</P>
                    <P>La actividad llevada a cabo por <a href={SITE_URL} target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>{SITE}</a> incluye:</P>
                    <Item>Academia de formación en ciberseguridad, programación, hacking ético e informática en general.</Item>
                    <P>Antes de acceder, navegar y/o utilizar esta página web, el Usuario debe haber leído el Aviso Legal, las Condiciones Generales de Uso, la <Link to="/cookies" style={{ color: 'rgba(0,255,100,0.7)' }}>Política de Cookies</Link> y la <Link to="/privacidad" style={{ color: 'rgba(0,255,100,0.7)' }}>Política de Privacidad</Link>.</P>
                    <Nota>Estas Condiciones pueden ser modificadas. El Usuario es responsable de consultarlas cada vez que acceda al Sitio Web, ya que serán aplicables las que estén vigentes en el momento de la adquisición.</Nota>
                </Section>

                <Section number="03" title="Pagos y Facturación">
                    <P>Los Usuarios registrados pueden realizar compras siguiendo el proceso de compra en línea, seleccionando productos y/o servicios y haciendo clic en <B>"Comprar Ahora"</B>.</P>
                    <P>Una vez completado el proceso, el Usuario recibirá un correo electrónico de confirmación del pedido. Se generará automáticamente una <B>factura electrónica</B> que se enviará por correo; también puede solicitarse copia en papel contactando con {SITE_NAME}.</P>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
                        {[
                            ['Acceso al Curso', 'La compra otorga acceso al contenido grabado mientras la academia permanezca operativa.'],
                            ['Duración del Acceso', 'Acceso permanente al contenido grabado, salvo cierre de la academia u otras causas de fuerza mayor.'],
                            ['Pagos', 'Las tarifas son las vigentes en el momento de la compra. Los cambios de precio aplican solo a compras futuras.'],
                            ['Devoluciones', 'No se aceptan devoluciones ni reembolsos para cursos grabados en diferido.'],
                            ['Modificaciones', 'La academia puede actualizar o retirar contenido sin previo aviso. No afecta derechos de acceso adquiridos.'],
                            ['Cierre', 'En caso de cierre, se informará a los alumnos con antelación razonable sobre las opciones disponibles.'],
                        ].map(([t, d]) => (
                            <div key={t} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 16px' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{t}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{d}</p>
                            </div>
                        ))}
                    </div>

                    <InfoBox>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Medios de pago aceptados</p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Tarjeta de crédito, tarjeta de débito y PayPal. Los precios mostrados son finales en Euros (€) e incluyen impuestos aplicables. Las tarjetas están sujetas a autorización por la entidad bancaria emisora.</p>
                    </InfoBox>
                </Section>

                <Section number="04" title="Medios Técnicos para Corregir Errores">
                    <P>Si detectas un error al introducir datos en tu solicitud de compra, puedes modificarlos contactando con {SITE_NAME} a través de los canales de contacto habilitados o desde tu espacio personal en el Sitio Web.</P>
                    <P>Antes de hacer clic en <B>"Comprar Ahora"</B>, el Usuario tiene acceso al carrito donde puede revisar y modificar su selección.</P>
                    <Nota>Al utilizar este Sitio Web de forma electrónica, aceptas que las comunicaciones electrónicas cumplen con los requisitos legales de forma escrita, incluyendo acuerdos, avisos y divulgaciones.</Nota>
                </Section>

                <Section number="05" title="Propiedad Intelectual">
                    <P><B>{SITE_NAME}</B> o sus licenciantes ostentan todos los derechos de autor y demás derechos de propiedad intelectual relacionados con el Sitio Web, sus datos, información y recursos.</P>
                    <P>Salvo indicación contraria del contenido específico, <B>no se otorga licencia</B> ni derecho alguno sobre derechos de autor, marcas comerciales, patentes u otros derechos de propiedad intelectual. Queda prohibido, sin permiso previo por escrito:</P>
                    <Item>Copiar, reproducir, ejecutar o distribuir cualquier recurso del Sitio Web.</Item>
                    <Item>Incrustar en medios electrónicos, alterar o realizar ingeniería inversa de los contenidos.</Item>
                    <Item>Descompilar, transferir, descargar, monetizar, vender o comercializar cualquier recurso.</Item>
                </Section>

                <Section number="06" title="Propiedad de Terceros">
                    <P>El Sitio Web puede contener enlaces o referencias a sitios de terceros. <B>{SITE_NAME} no controla ni revisa</B> el contenido de dichos sitios, y los productos o servicios ofrecidos en ellos están sujetos a sus propios Términos y Condiciones.</P>
                    <Nota>No asumimos responsabilidad por las prácticas de privacidad o el contenido de sitios de terceros. El Usuario asume todos los riesgos asociados con su uso.</Nota>
                </Section>

                <Section number="07" title="Uso Responsable">
                    <P>Al acceder al Sitio Web, te comprometes a utilizarlo exclusivamente para los propósitos previstos y de acuerdo con la normativa aplicable. Queda prohibido:</P>
                    <Item>Cargar, publicar o distribuir software malicioso o material ilegal.</Item>
                    <Item>Utilizar los datos recopilados para actividades de marketing directo no autorizado.</Item>
                    <Item>Llevar a cabo actividades de recopilación de datos sistemática o automatizada.</Item>
                    <Item>Realizar cualquier actividad que pueda causar daños o interferir en el funcionamiento, disponibilidad o accesibilidad del Sitio Web.</Item>
                </Section>

                <Section number="08" title="Registro">
                    <P>Al crear una cuenta, eres responsable de mantener la <B>confidencialidad de tu contraseña</B> e información de acceso. No debes compartir estos datos ni permitir que terceros usen tu cuenta.</P>
                    <P>Si descubres que tu contraseña ha sido comprometida, debes <B>notificárnoslo de inmediato</B>.</P>
                    <Nota>Tras cancelar tu cuenta, te comprometes a no intentar registrarte de nuevo sin nuestro permiso expreso.</Nota>
                </Section>

                <Section number="09" title="Exclusión de Garantías y Responsabilidad">
                    <P><a href={SITE_URL} target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>{SITE}</a> no asume responsabilidad por los posibles daños derivados de:</P>
                    <Item>La falta de disponibilidad, mantenimiento o funcionamiento del Sitio Web y sus contenidos.</Item>
                    <Item>La presencia de malware o programas maliciosos en los contenidos.</Item>
                    <Item>El uso ilícito, negligente, fraudulento o contrario a este Aviso Legal.</Item>
                    <Item>La falta de licitud, calidad, confiabilidad o disponibilidad de servicios ofrecidos por terceros.</Item>
                </Section>

                <Section number="10" title="Garantías y Responsabilidad">
                    <P>Este Sitio Web y su contenido se proporcionan <B>"tal cual"</B> y <B>"según disponibilidad"</B>. Se renuncia expresamente a toda garantía respecto a la disponibilidad, precisión o integridad del contenido. No garantizamos que:</P>
                    <Item>El Sitio Web o nuestros productos cumplan con todos tus requisitos específicos.</Item>
                    <Item>El Sitio Web esté disponible de forma ininterrumpida, oportuna o sin errores.</Item>
                    <Item>La calidad de cualquier producto o servicio adquirido satisfaga todas tus expectativas.</Item>
                    <Nota>Nuestra responsabilidad máxima se limitará al precio total que el Usuario haya pagado por los productos o servicios adquiridos. Este límite aplica en conjunto a todas las reclamaciones de cualquier naturaleza.</Nota>
                </Section>

                <Section number="11" title="Privacidad">
                    <P>Los datos personales proporcionados durante transacciones en el Sitio Web serán tratados conforme a nuestra <Link to="/privacidad" style={{ color: 'rgba(0,255,100,0.7)' }}>Política de Privacidad</Link>. Al usar el Sitio Web, otorgas tu consentimiento para dicho tratamiento.</P>
                    <P>Tu dirección de correo electrónico no será utilizada para enviar mensajes no solicitados. Las comunicaciones por correo estarán exclusivamente relacionadas con los productos o servicios contratados.</P>
                    <P>Para garantizar la seguridad de los datos de pago, <B>{SITE_NAME}</B> emplea un sistema de pago seguro con protocolo <B>SSL/TLS</B>.</P>
                </Section>

                <Section number="12" title="Incumplimientos">
                    <P>En caso de incumplimiento de estos Términos y Condiciones, nos reservamos el derecho de tomar las acciones que consideremos apropiadas, incluyendo:</P>
                    <Item>Suspensión temporal o permanente del acceso al Sitio Web.</Item>
                    <Item>Comunicación con el proveedor de servicios de Internet para restringir el acceso.</Item>
                    <Item>Inicio de acciones legales contra el Usuario infractor.</Item>
                </Section>

                <Section number="13" title="Derecho de Desistimiento">
                    <P>Conforme al <B>Real Decreto Legislativo 1/2007</B>, como consumidor tienes derecho a desistir de tu compra en un plazo de <B>14 días naturales</B> sin necesidad de justificación.</P>
                    <InfoBox>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>⚠️ Excepción importante — Contenido digital</p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Según el artículo 103.m) del citado Real Decreto, <B style={{ color: 'rgba(255,255,255,0.7)' }}>no existe derecho de desistimiento</B> para el suministro de contenido digital sin soporte material (cursos online) una vez iniciada su ejecución con el consentimiento expreso del consumidor. Los pagos realizados no son reembolsables, ni se ofrecen devoluciones por períodos parciales o contenidos no utilizados.</p>
                    </InfoBox>
                    <P>Para ejercer el derecho de desistimiento (cuando aplique), el Usuario debe notificarlo a {SITE_NAME} a través de los canales de contacto del Sitio Web en el plazo establecido. Se reembolsarán todos los pagos recibidos en un máximo de <B>14 días naturales</B>, por el mismo método de pago empleado.</P>
                    <Nota>No se realizará reembolso si el producto ha sido usado más allá de la mera apertura o no se encuentra en las mismas condiciones de entrega.</Nota>
                </Section>

                <Section number="14" title="Exoneración de Responsabilidad">
                    <P>Salvo disposición legal en contrario, <a href={SITE_URL} target="_blank" rel="noreferrer" style={{ color: 'rgba(0,255,100,0.7)' }}>{SITE}</a> no asumirá responsabilidad por:</P>
                    <Item>Pérdidas que no sean atribuibles a un incumplimiento directo de {SITE_NAME}.</Item>
                    <Item>Pérdidas comerciales: lucro cesante, ingresos, contratos, datos o fondo de comercio.</Item>
                    <Item>Pérdidas indirectas no razonablemente previsibles al formalizar el contrato.</Item>
                    <P style={{ marginTop: '16px' }}>Tampoco se asume responsabilidad por <B>causas de fuerza mayor</B>, incluyendo de forma enunciativa:</P>
                    <SubItem>Huelgas, cierres patronales u otras medidas reivindicativas.</SubItem>
                    <SubItem>Conmoción civil, revuelta, invasión, amenaza terrorista o guerra.</SubItem>
                    <SubItem>Incendio, inundación, terremoto, epidemia u otros desastres naturales.</SubItem>
                    <SubItem>Imposibilidad de uso de transportes públicos o privados.</SubItem>
                    <SubItem>Imposibilidad de uso de sistemas de telecomunicaciones públicos o privados.</SubItem>
                    <SubItem>Actos, decretos, legislación o restricciones de autoridades públicas.</SubItem>
                    <Nota>En caso de fuerza mayor, las obligaciones se suspenden durante el periodo que esta continúe, y {SITE_NAME} dispondrá de una extensión equivalente en el plazo para cumplirlas.</Nota>
                </Section>

                <Section number="15" title="Actualización de Términos">
                    <P>Podemos actualizar periódicamente estos Términos y Condiciones. La fecha de revisión indicada al inicio refleja la última actualización. Se informará por escrito sobre cualquier cambio relevante antes de su entrada en vigor.</P>
                    <Nota>El uso continuado del Sitio Web tras la publicación de cambios se considerará aceptación de los nuevos Términos y Condiciones.</Nota>
                </Section>

                <Section number="16" title="Ley y Jurisdicción">
                    <P>Estos Términos y Condiciones estarán sujetos a las <B>leyes de España</B>. Cualquier disputa derivada estará bajo la jurisdicción de los <B>tribunales españoles</B>.</P>
                    <P>Si cualquier tribunal determinase que alguna disposición es inválida o inaplicable, esta será modificada o eliminada en la medida necesaria, sin afectar al resto de disposiciones.</P>
                </Section>

                <Section number="17" title="Quejas y Reclamaciones">
                    <P>El Usuario puede transmitir quejas, reclamaciones o comentarios a {SITE_NAME} utilizando los datos de contacto proporcionados. También ponemos a disposición <B>hojas oficiales de reclamación</B> solicitables a través de los canales de contacto.</P>
                    <P>Para resolución extrajudicial de controversias en materia de consumo, conforme al <B>Reglamento (UE) 524/2013</B>, puedes acceder a la plataforma europea de resolución de litigios en línea:</P>
                    <InfoBox>
                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(0,255,100,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00ff64' }} />
                            https://ec.europa.eu/consumers/odr/
                        </a>
                    </InfoBox>
                    <div style={{ background: 'rgba(0,255,100,0.03)', border: '1px solid rgba(0,255,100,0.1)', borderRadius: '12px', padding: '20px 24px', marginTop: '16px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Contacto</p>
                        <a href="mailto:info@tech4uacademy.es" style={{ fontSize: '13px', color: 'rgba(0,255,100,0.8)', textDecoration: 'none' }}>info@tech4uacademy.es</a>
                    </div>
                </Section>

            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050508' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>© 2026 Tech4U Academy</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {[['Privacidad', '/privacidad'], ['Cookies', '/cookies'], ['Términos', '/terminos']].map(([l, h]) => (
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
