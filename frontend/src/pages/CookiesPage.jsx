import LegalLayout from '../components/LegalLayout'

export default function CookiesPage() {
    return (
        <LegalLayout
            title="Política de Cookies"
            subtitle="Tech4U Academy utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de la plataforma y mejorar tu experiencia. Aquí te explicamos exactamente qué cookies usamos y cómo gestionarlas."
            lastUpdated="Enero 2026"
        >
            <h2>1. ¿Qué son las Cookies?</h2>
            <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web.
                Permiten que el sitio recuerde tus preferencias y acciones durante un tiempo, de modo que no tengas que
                volver a configurarlas cada vez que regresas.
            </p>

            <hr className="section-divider" />

            <h2>2. Tipos de Cookies que Utilizamos</h2>

            <h3>2.1 Cookies Estrictamente Necesarias</h3>
            <p>
                Son imprescindibles para el funcionamiento de la plataforma. Sin ellas no podrías iniciar sesión,
                navegar entre páginas o usar las funcionalidades principales. <strong>No requieren tu consentimiento.</strong>
            </p>
            <ul>
                <li><strong>tech4u_token</strong> — Token JWT de autenticación de sesión. Duración: hasta cierre de sesión o expiración del token. Almacenado en <code>localStorage</code>.</li>
                <li><strong>Cookies de seguridad de Cloudflare</strong> — Protección contra ataques DDoS y bots. Gestionadas por Cloudflare Inc. (<a href="https://www.cloudflare.com/es-es/privacypolicy/" target="_blank" rel="noreferrer">ver política</a>).</li>
            </ul>

            <h3>2.2 Cookies de Funcionalidad</h3>
            <p>
                Permiten recordar tus preferencias y personalizar tu experiencia en la plataforma.
            </p>
            <ul>
                <li>Preferencias de idioma y configuración de la interfaz.</li>
                <li>Estado de progreso en ejercicios (guardado en base de datos del servidor, no en cookies).</li>
            </ul>

            <h3>2.3 Cookies de Terceros — Pagos</h3>
            <p>
                Durante el proceso de pago, <strong>Stripe</strong> puede establecer sus propias cookies para
                gestionar la sesión de pago y prevenir el fraude. Estas cookies son gestionadas íntegramente por
                Stripe y se rigen por su propia política de privacidad:
                <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer"> stripe.com/es/privacy</a>.
            </p>

            <h3>2.4 Cookies Analíticas (Opcionales)</h3>
            <p>
                Actualmente Tech4U Academy <strong>no utiliza herramientas de analítica de terceros</strong> (como
                Google Analytics) que instalen cookies de seguimiento. Si en el futuro se incorporan, esta política
                se actualizará y se solicitará tu consentimiento previo.
            </p>

            <hr className="section-divider" />

            <h2>3. Tabla Resumen de Cookies</h2>
            <div className="callout">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(198,255,51,0.15)' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(198,255,51,0.8)', fontWeight: 800 }}>Nombre</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(198,255,51,0.8)', fontWeight: 800 }}>Tipo</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(198,255,51,0.8)', fontWeight: 800 }}>Duración</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(198,255,51,0.8)', fontWeight: 800 }}>Finalidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['tech4u_token', 'Necesaria', 'Sesión / 24h', 'Autenticación JWT'],
                            ['__cf_bm', 'Necesaria (Cloudflare)', '30 min', 'Anti-bot, seguridad'],
                            ['_cfuvid', 'Necesaria (Cloudflare)', 'Sesión', 'Gestión de tráfico'],
                            ['Stripe cookies', 'Terceros (pago)', 'Sesión pago', 'Prevención de fraude'],
                        ].map(([nombre, tipo, duracion, finalidad], i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>{nombre}</td>
                                <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{tipo}</td>
                                <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{duracion}</td>
                                <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{finalidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr className="section-divider" />

            <h2>4. Cómo Gestionar las Cookies</h2>

            <h3>Desde tu Navegador</h3>
            <p>
                Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies. Ten en cuenta que
                deshabilitar las cookies estrictamente necesarias puede impedir el funcionamiento correcto de la
                plataforma (por ejemplo, no podrás iniciar sesión).
            </p>
            <ul>
                <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
                <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</li>
                <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
            </ul>

            <h3>Cookies de Terceros</h3>
            <p>
                Para las cookies de Cloudflare y Stripe, consulta los mecanismos de opt-out en sus respectivas
                políticas de privacidad.
            </p>

            <hr className="section-divider" />

            <h2>5. Base Legal</h2>
            <p>
                El uso de cookies estrictamente necesarias se fundamenta en el <strong>interés legítimo</strong> de
                garantizar el funcionamiento técnico de la plataforma (<strong>art. 6.1.f RGPD</strong> y directiva
                ePrivacy transpuesta en la Ley 34/2002, LSSI-CE).
            </p>
            <p>
                Para cualquier cookie no estrictamente necesaria que se implemente en el futuro, se solicitará
                el <strong>consentimiento previo</strong> del usuario mediante un banner de configuración de cookies.
            </p>

            <hr className="section-divider" />

            <h2>6. Actualizaciones de esta Política</h2>
            <p>
                Esta política de cookies puede actualizarse para reflejar cambios en las tecnologías que utilizamos.
                Te informaremos de cambios relevantes a través de la plataforma.
            </p>

            <hr className="section-divider" />

            <h2>7. Contacto</h2>
            <div className="callout">
                <p>Para cualquier consulta sobre el uso de cookies en Tech4U Academy:</p>
                <p><a href="mailto:info@tech4u.academy">info@tech4u.academy</a></p>
            </div>
        </LegalLayout>
    )
}
