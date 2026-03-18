import LegalLayout from '../components/LegalLayout'

export default function AvisoLegalPage() {
    return (
        <LegalLayout
            title="Aviso Legal"
            subtitle="Información legal sobre el titular y condiciones de uso del sitio web tech4uacademy.es, en cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)."
            lastUpdated="Enero 2026"
        >
            <h2>1. Datos del Titular del Sitio Web</h2>
            <p>
                En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información
                y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos identificativos:
            </p>
            <div className="callout">
                <p><strong>Denominación:</strong> Tech4U Academy</p>
                <p><strong>Titular:</strong> Alberto Hidalgo Moreno</p>
                <p><strong>NIF/CIF:</strong> 04856664F</p>
                <p><strong>Correo electrónico:</strong> <a href="mailto:info@tech4uacademy.es">info@tech4uacademy.es</a></p>
                <p><strong>Actividad:</strong> Plataforma educativa online para ciclos formativos de Informática</p>
                <p><strong>Ámbito:</strong> España y Unión Europea</p>
            </div>

            <hr className="section-divider" />

            <h2>2. Objeto y Ámbito de Aplicación</h2>
            <p>
                El presente Aviso Legal regula el acceso, navegación y uso del sitio web <strong>tech4uacademy.es</strong>
                y sus subdominios. El simple acceso al sitio web atribuye la condición de usuario e implica la aceptación
                plena de las condiciones aquí establecidas.
            </p>

            <hr className="section-divider" />

            <h2>3. Descripción de la Actividad</h2>
            <p>
                Tech4U Academy es una plataforma educativa online cuyo objeto es la formación de estudiantes y
                profesionales en el ámbito de la informática y las comunicaciones, especialmente orientada a los
                ciclos formativos de grado medio y superior (SMR, ASIR, DAM, DAW).
            </p>
            <p>Los servicios ofrecidos incluyen:</p>
            <ul>
                <li>Simulacros de examen y tests adaptativos.</li>
                <li>Laboratorios prácticos interactivos (Skill Labs, SQL Skills, NetLabs, Terminal Skills).</li>
                <li>Contenido teórico estructurado por asignaturas.</li>
                <li>Sistema de gamificación (XP, logros, ranking).</li>
                <li>Suscripciones de pago gestionadas mediante Stripe.</li>
            </ul>

            <hr className="section-divider" />

            <h2>4. Propiedad Intelectual e Industrial</h2>
            <p>
                Todos los contenidos del sitio web — incluyendo, a título enunciativo y no limitativo: textos,
                fotografías, gráficos, imágenes, iconos, tecnología, software, diseño gráfico, código fuente,
                ejercicios, guías y material audiovisual — son propiedad de Tech4U Academy o de sus legítimos
                titulares y están protegidos por los derechos de propiedad intelectual e industrial reconocidos
                por la legislación española y los tratados internacionales suscritos por España.
            </p>
            <p>
                Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación
                o cualquier otra forma de explotación de los contenidos, total o parcial, sin la autorización
                expresa y por escrito de Tech4U Academy.
            </p>
            <p>
                Los signos distintivos (marca, logotipo, denominación «Tech4U Academy») son propiedad de su titular
                y no pueden ser utilizados sin autorización.
            </p>

            <hr className="section-divider" />

            <h2>5. Responsabilidad</h2>

            <h3>5.1 Exactitud de la Información</h3>
            <p>
                Tech4U Academy se esfuerza por mantener actualizada la información publicada en el sitio web,
                pero no garantiza que sea completamente exacta, completa o actualizada en todo momento.
                La Plataforma no se responsabiliza de los daños o perjuicios que pudieran derivarse del uso
                de información inexacta u obsoleta.
            </p>

            <h3>5.2 Disponibilidad del Servicio</h3>
            <p>
                Tech4U Academy no garantiza la disponibilidad continua e ininterrumpida del sitio web. Pueden
                producirse interrupciones por mantenimiento, actualizaciones técnicas o causas de fuerza mayor.
                La Plataforma no será responsable por los daños derivados de tales interrupciones.
            </p>

            <h3>5.3 Contenido Externo</h3>
            <p>
                El sitio web puede contener enlaces a páginas de terceros. Tech4U Academy no controla dichos
                sitios ni se responsabiliza de su contenido, disponibilidad o políticas de privacidad.
                Los enlaces se ofrecen únicamente como referencia informativa.
            </p>

            <h3>5.4 Virus y Seguridad</h3>
            <p>
                Tech4U Academy adopta medidas de seguridad adecuadas, pero no puede garantizar la ausencia
                total de virus u otros elementos que puedan producir daños en el sistema informático del usuario.
                El usuario debe disponer de herramientas adecuadas para detectar y neutralizar estos elementos.
            </p>

            <hr className="section-divider" />

            <h2>6. Protección de Datos</h2>
            <p>
                El tratamiento de datos personales que Tech4U Academy realiza a través de este sitio web está
                regulado por la <strong>Política de Privacidad</strong>, accesible desde el footer de la web,
                y cumple con lo dispuesto en el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018,
                de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>

            <hr className="section-divider" />

            <h2>7. Cookies</h2>
            <p>
                El sitio web utiliza cookies propias y de terceros. Para más información, consulta nuestra
                <a href="/legal/cookies"> Política de Cookies</a>.
            </p>

            <hr className="section-divider" />

            <h2>8. Legislación Aplicable y Jurisdicción</h2>
            <p>
                El presente Aviso Legal se rige e interpreta de conformidad con la legislación española.
                Para la resolución de cualquier controversia derivada del acceso o uso del sitio web,
                las partes se someten expresamente a los Juzgados y Tribunales del domicilio del titular,
                renunciando a cualquier otro fuero que pudiera corresponderles, salvo que la normativa
                aplicable establezca otro fuero imperativo (por ejemplo, en materia de consumidores).
            </p>

            <hr className="section-divider" />

            <h2>9. Contacto</h2>
            <div className="callout">
                <p>
                    Para cualquier consulta legal o reclamación relacionada con el sitio web:
                </p>
                <p><a href="mailto:info@tech4uacademy.es">info@tech4uacademy.es</a></p>
            </div>
        </LegalLayout>
    )
}
