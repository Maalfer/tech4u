import LegalLayout from '../components/LegalLayout'

export default function PrivacidadPage() {
    return (
        <LegalLayout
            title="Política de Privacidad"
            subtitle="En Tech4U Academy nos tomamos muy en serio la protección de tus datos personales. Este documento explica qué información recopilamos, cómo la usamos y cuáles son tus derechos."
            lastUpdated="Enero 2026"
        >
            <h2>1. Responsable del Tratamiento</h2>
            <p>
                El responsable del tratamiento de los datos personales recogidos a través de la plataforma <strong>tech4u.academy</strong> es:
            </p>
            <div className="callout">
                <p><strong>Titular:</strong> [NOMBRE DEL TITULAR]</p>
                <p><strong>NIF/CIF:</strong> [NIF/CIF]</p>
                <p><strong>Correo electrónico:</strong> <a href="mailto:info@tech4u.academy">info@tech4u.academy</a></p>
                <p><strong>Actividad:</strong> Plataforma educativa online para ciclos formativos de informática</p>
            </div>

            <hr className="section-divider" />

            <h2>2. Datos que Recopilamos</h2>
            <p>Al registrarte y utilizar Tech4U Academy, recopilamos los siguientes datos:</p>

            <h3>2.1 Datos de Registro</h3>
            <ul>
                <li>Nombre de usuario</li>
                <li>Dirección de correo electrónico</li>
                <li>Contraseña (almacenada en formato hash mediante bcrypt, nunca en texto plano)</li>
            </ul>

            <h3>2.2 Datos de Actividad Académica</h3>
            <ul>
                <li>Progreso en tests, ejercicios y simulacros</li>
                <li>Puntuaciones, XP y logros obtenidos</li>
                <li>Historial de acceso a contenidos</li>
                <li>Resultados en Skill Labs, SQL Skills, NetLabs y Terminal Skills</li>
            </ul>

            <h3>2.3 Datos de Suscripción y Pagos</h3>
            <ul>
                <li>Plan contratado y fechas de vigencia</li>
                <li>Historial de transacciones (procesadas por <strong>Stripe</strong>; no almacenamos datos de tarjeta)</li>
                <li>Cupones o descuentos utilizados</li>
            </ul>

            <h3>2.4 Datos Técnicos</h3>
            <ul>
                <li>Dirección IP de acceso</li>
                <li>Navegador y sistema operativo (user agent)</li>
                <li>Registros de errores y rendimiento de la plataforma</li>
            </ul>

            <hr className="section-divider" />

            <h2>3. Finalidad y Base Legal del Tratamiento</h2>

            <h3>3.1 Ejecución del Contrato</h3>
            <p>
                Tratamos tus datos para gestionar tu cuenta, proporcionar acceso a los contenidos según el plan contratado
                y procesar pagos. Base legal: <strong>art. 6.1.b RGPD</strong> (ejecución de un contrato).
            </p>

            <h3>3.2 Interés Legítimo</h3>
            <p>
                Utilizamos datos de actividad para mejorar la experiencia de aprendizaje, detectar errores técnicos y
                garantizar la seguridad de la plataforma. Base legal: <strong>art. 6.1.f RGPD</strong> (interés legítimo).
            </p>

            <h3>3.3 Cumplimiento de Obligaciones Legales</h3>
            <p>
                Conservamos registros de transacciones para cumplir con obligaciones fiscales y contables.
                Base legal: <strong>art. 6.1.c RGPD</strong>.
            </p>

            <h3>3.4 Consentimiento</h3>
            <p>
                Para el envío de comunicaciones promocionales o newsletters, solicitaremos tu consentimiento expreso.
                Puedes retirarlo en cualquier momento. Base legal: <strong>art. 6.1.a RGPD</strong>.
            </p>

            <hr className="section-divider" />

            <h2>4. Plazos de Conservación</h2>
            <ul>
                <li><strong>Cuenta activa:</strong> mientras mantengas tu cuenta abierta.</li>
                <li><strong>Cuenta cancelada:</strong> los datos de progreso académico se eliminarán a los 12 meses tras la cancelación, salvo que solicites la eliminación antes.</li>
                <li><strong>Datos de facturación:</strong> conservados durante 5 años por obligaciones fiscales (Ley 58/2003, General Tributaria).</li>
                <li><strong>Registros técnicos (logs):</strong> máximo 12 meses.</li>
            </ul>

            <hr className="section-divider" />

            <h2>5. Terceros con Acceso a tus Datos</h2>
            <p>Compartimos datos únicamente con los siguientes proveedores de servicios:</p>

            <h3>Stripe (Procesador de Pagos)</h3>
            <p>
                Gestiona el cobro de suscripciones. Stripe actúa como encargado de tratamiento y cuenta con certificación
                PCI-DSS. Consulta su política en <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer">stripe.com/es/privacy</a>.
            </p>

            <h3>Cloudflare (Seguridad y CDN)</h3>
            <p>
                Protege la plataforma contra ataques DDoS y acelera la entrega de contenido. Procesa IPs de acceso.
                Consulta su política en <a href="https://www.cloudflare.com/es-es/privacypolicy/" target="_blank" rel="noreferrer">cloudflare.com</a>.
            </p>

            <h3>Proveedor de Infraestructura (Hosting)</h3>
            <p>Los servidores de Tech4U Academy se alojan en la Unión Europea o en territorios con nivel de protección adecuado.</p>

            <p>
                <strong>No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.</strong>
            </p>

            <hr className="section-divider" />

            <h2>6. Tus Derechos (RGPD)</h2>
            <p>Puedes ejercer los siguientes derechos en cualquier momento escribiendo a <a href="mailto:info@tech4u.academy">info@tech4u.academy</a>:</p>
            <ul>
                <li><strong>Acceso:</strong> obtener confirmación de qué datos tuyos tratamos.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                <li><strong>Supresión:</strong> solicitar el borrado de tus datos ("derecho al olvido").</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible.</li>
                <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
                <li><strong>Limitación:</strong> solicitar la restricción del tratamiento en determinados casos.</li>
            </ul>
            <p>
                Si consideras que el tratamiento de tus datos no es conforme a la normativa, puedes presentar una
                reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" target="_blank" rel="noreferrer">aepd.es</a>.
            </p>

            <hr className="section-divider" />

            <h2>7. Seguridad</h2>
            <p>
                Tech4U Academy aplica medidas técnicas y organizativas para proteger tus datos: cifrado TLS en todas las
                comunicaciones, almacenamiento de contraseñas con hash bcrypt, acceso restringido a datos sensibles,
                copias de seguridad periódicas y monitorización de accesos.
            </p>

            <hr className="section-divider" />

            <h2>8. Cambios en esta Política</h2>
            <p>
                Podemos actualizar esta política cuando sea necesario. Si los cambios son significativos, te lo notificaremos
                por correo electrónico o mediante un aviso en la plataforma antes de que entren en vigor.
            </p>

            <hr className="section-divider" />

            <h2>9. Contacto</h2>
            <div className="callout">
                <p>Para cualquier consulta sobre privacidad o ejercicio de derechos:</p>
                <p><a href="mailto:info@tech4u.academy">info@tech4u.academy</a></p>
            </div>
        </LegalLayout>
    )
}
