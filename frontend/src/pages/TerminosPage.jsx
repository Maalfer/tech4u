import LegalLayout from '../components/LegalLayout'

export default function TerminosPage() {
    return (
        <LegalLayout
            title="Términos y Condiciones"
            subtitle="Estas condiciones regulan el acceso y uso de la plataforma Tech4U Academy. Al crear una cuenta y utilizar el servicio, aceptas estos términos en su totalidad."
            lastUpdated="Enero 2026"
        >
            <h2>1. Objeto y Partes</h2>
            <p>
                Los presentes Términos y Condiciones regulan la relación contractual entre <strong>Tech4U Academy</strong>
                (en adelante, «la Plataforma»), y cualquier persona que se registre o utilice los servicios disponibles
                en <strong>tech4u.academy</strong> (en adelante, «el Usuario»).
            </p>
            <p>
                La aceptación de estos términos es requisito indispensable para el acceso a los servicios de la Plataforma.
            </p>

            <hr className="section-divider" />

            <h2>2. Descripción del Servicio</h2>
            <p>Tech4U Academy es una plataforma educativa online orientada a estudiantes de ciclos formativos de Informática
            (SMR, ASIR, DAM, DAW) que incluye, entre otros:</p>
            <ul>
                <li><strong>Test Center:</strong> simulacros de examen con corrección automática.</li>
                <li><strong>Skill Labs:</strong> ejercicios interactivos de tipo drag &amp; drop.</li>
                <li><strong>Teoría:</strong> guías y artículos técnicos organizados por asignatura.</li>
                <li><strong>Terminal Skills:</strong> entornos de terminal Linux interactivos (plan Trimestral o Anual).</li>
                <li><strong>SQL Skills:</strong> editor SQL con ejercicios prácticos (plan Premium).</li>
                <li><strong>NetLabs:</strong> laboratorios de configuración de redes (plan Premium).</li>
            </ul>

            <hr className="section-divider" />

            <h2>3. Registro y Cuenta de Usuario</h2>

            <h3>3.1 Requisitos</h3>
            <p>
                Para registrarte debes tener al menos <strong>14 años</strong> (o la mayoría de edad aplicable en tu país).
                Si eres menor de edad, necesitarás el consentimiento de un tutor legal.
            </p>

            <h3>3.2 Veracidad de los Datos</h3>
            <p>
                El Usuario se compromete a facilitar información veraz, completa y actualizada durante el registro.
                La Plataforma no se responsabiliza de los perjuicios derivados de datos incorrectos.
            </p>

            <h3>3.3 Seguridad de la Cuenta</h3>
            <p>
                El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
                Debe notificar de inmediato a <a href="mailto:info@tech4u.academy">info@tech4u.academy</a> ante
                cualquier uso no autorizado de su cuenta.
            </p>

            <h3>3.4 Prohibición de Compartir Cuentas</h3>
            <p>
                <strong>Está expresamente prohibido compartir las credenciales de acceso con terceros.</strong> Cada cuenta
                es personal e intransferible. La detección de uso compartido podrá dar lugar a la suspensión inmediata de la
                cuenta sin derecho a reembolso.
            </p>

            <hr className="section-divider" />

            <h2>4. Suscripciones y Pagos</h2>

            <h3>4.1 Planes Disponibles</h3>
            <p>
                Tech4U Academy ofrece distintos planes de suscripción (Mensual, Trimestral, Anual) con acceso a diferentes
                niveles de contenido. Los precios vigentes se muestran en la página de <a href="/planes">Tarifas</a>.
            </p>

            <h3>4.2 Procesamiento de Pagos</h3>
            <p>
                Los pagos se procesan a través de <strong>Stripe</strong>, plataforma de pagos certificada PCI-DSS.
                Tech4U Academy no almacena datos de tarjetas de crédito o débito.
            </p>

            <h3>4.3 Activación</h3>
            <p>
                El acceso premium se activa automáticamente tras la confirmación del pago. En caso de incidencia técnica,
                contacta con soporte en <a href="mailto:info@tech4u.academy">info@tech4u.academy</a>.
            </p>

            <h3>4.4 Renovación Automática</h3>
            <p>
                Las suscripciones se renuevan automáticamente al final de cada periodo, salvo que el Usuario cancele
                antes de la fecha de renovación desde su panel de gestión.
            </p>

            <h3>4.5 Cancelación y Reembolsos</h3>
            <p>
                El Usuario puede cancelar su suscripción en cualquier momento. La cancelación será efectiva al final
                del periodo de facturación en curso, manteniendo el acceso hasta esa fecha.
            </p>
            <p>
                De conformidad con el <strong>art. 103.a) del Real Decreto Legislativo 1/2007</strong> (TRLGDCU),
                el derecho de desistimiento de 14 días no aplica a contenidos digitales cuya entrega haya comenzado
                con el previo consentimiento expreso del consumidor y el conocimiento de la pérdida del derecho de
                desistimiento. No obstante, se estudiarán individualmente las solicitudes de reembolso en circunstancias
                excepcionales. Escríbenos a <a href="mailto:info@tech4u.academy">info@tech4u.academy</a>.
            </p>

            <hr className="section-divider" />

            <h2>5. Uso Aceptable</h2>

            <h3>5.1 Usos Permitidos</h3>
            <p>
                El acceso a Tech4U Academy está destinado al aprendizaje personal del Usuario. El contenido puede
                usarse con fines formativos no comerciales.
            </p>

            <h3>5.2 Usos Prohibidos</h3>
            <p>Está expresamente prohibido:</p>
            <ul>
                <li>Compartir, revender o redistribuir credenciales de acceso.</li>
                <li>Reproducir, copiar o distribuir los contenidos de la Plataforma sin autorización.</li>
                <li>Utilizar bots, scrapers u otras herramientas automáticas para extraer contenido.</li>
                <li>Intentar vulnerar la seguridad de la Plataforma o acceder a áreas restringidas.</li>
                <li>Publicar contenido difamatorio, ofensivo o que incite al odio en áreas comunitarias.</li>
                <li>Hacer un uso abusivo de los entornos de Terminal Skills o VMs de práctica.</li>
                <li>Realizar ingeniería inversa de cualquier componente del software de la Plataforma.</li>
            </ul>

            <hr className="section-divider" />

            <h2>6. Propiedad Intelectual</h2>
            <p>
                Todos los contenidos de Tech4U Academy — incluyendo textos, código, imágenes, diseño, guías, ejercicios
                y materiales formativos — son propiedad de Tech4U Academy o de sus respectivos autores y están protegidos
                por la legislación de propiedad intelectual aplicable.
            </p>
            <p>
                Se concede al Usuario una <strong>licencia personal, no exclusiva e intransferible</strong> para acceder
                a los contenidos con fines formativos privados durante la vigencia de su suscripción.
            </p>

            <hr className="section-divider" />

            <h2>7. Disponibilidad del Servicio</h2>
            <p>
                Tech4U Academy se esfuerza por mantener una disponibilidad del 99%. No obstante, pueden producirse
                interrupciones por mantenimiento, actualizaciones o causas ajenas a nuestro control. La Plataforma
                no garantiza disponibilidad ininterrumpida y no será responsable por daños derivados de interrupciones
                temporales del servicio.
            </p>

            <hr className="section-divider" />

            <h2>8. Limitación de Responsabilidad</h2>
            <p>
                Tech4U Academy no se responsabiliza de los resultados académicos u ocupacionales del Usuario.
                El contenido es de carácter formativo y no constituye asesoramiento profesional certificado.
                La Plataforma no será responsable por daños indirectos, lucro cesante o pérdida de datos
                derivados del uso del servicio.
            </p>

            <hr className="section-divider" />

            <h2>9. Suspensión y Terminación</h2>
            <p>
                Tech4U Academy se reserva el derecho de suspender o cancelar una cuenta, con o sin previo aviso,
                en caso de incumplimiento de estos términos. En casos graves (fraude, hacking, distribución de contenido),
                la suspensión será inmediata y sin derecho a reembolso.
            </p>

            <hr className="section-divider" />

            <h2>10. Modificaciones</h2>
            <p>
                Tech4U Academy puede modificar estos Términos en cualquier momento. Los cambios relevantes se
                comunicarán por correo electrónico con al menos 15 días de antelación. El uso continuado de la
                Plataforma tras la entrada en vigor de los cambios implica la aceptación de los nuevos términos.
            </p>

            <hr className="section-divider" />

            <h2>11. Legislación Aplicable y Jurisdicción</h2>
            <p>
                Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten
                a los Juzgados y Tribunales competentes conforme a la normativa aplicable. Si el Usuario actúa como
                consumidor, será competente el tribunal de su domicilio.
            </p>

            <hr className="section-divider" />

            <h2>12. Contacto</h2>
            <div className="callout">
                <p>Para consultas sobre estos Términos y Condiciones:</p>
                <p><a href="mailto:info@tech4u.academy">info@tech4u.academy</a></p>
            </div>
        </LegalLayout>
    )
}
