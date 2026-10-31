"""Contenido SEO/GEO de Deyscom Motorsport.

- FACTS: bloque de datos clave por página (respuestas directas, citables por buscadores con IA).
- GUIDES: secciones de contenido con títulos en forma de pregunta para cada servicio.
- RELATED: artículos del blog relacionados con cada página (enlazado interno).
- AREA: zona de influencia del taller (SEO local).
"""

AREA = ["Torrelaguna", "El Molar", "Talamanca de Jarama", "Uceda", "Torremocha de Jarama", "Patones", "Valdetorres de Jarama",
        "San Agustín del Guadalix", "Algete", "San Sebastián de los Reyes", "Alcobendas", "Colmenar Viejo", "Tres Cantos",
        "Madrid capital", "Alcalá de Henares", "Guadalajara", "Buitrago del Lozoya", "la Sierra Norte de Madrid"]

FACTS = {
    "index": [("Qué es", "Taller motorsport: coches de competición, restomod, pintura en cabina y banco de potencia"),
              ("Dónde", "C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid), a unos 60 km al norte de Madrid"),
              ("Desde", "2022 · DEYSCOM MOTORSPORT, S.L."),
              ("Horario", "Lunes a viernes, de 07:00 a 15:00"),
              ("Experiencias", "DS Pilot Weekend en el Circuito del Jarama, rally federado y slalom"),
              ("Formación", "DS Copilot Course: curso de copiloto de rally con certificación")],
    "competicion": [("Disciplinas", "Rally, rallysprint, slalom, montaña y circuito"),
                    ("Servicios", "Preparación integral, jaulas de seguridad, set-up, mantenimiento, asistencia y alquiler"),
                    ("Coches propios", "Peugeot 206 1.6 XS (118 CV) y BMW E36 (135 CV)"),
                    ("Dónde", "Taller en Torrelaguna (Madrid); asistencia en pruebas de toda España")],
    "restomod": [("Qué es", "Restauración + modernización: estética clásica con mecánica, frenos y seguridad actuales"),
                 ("Coches", "Clásicos, youngtimers y todoterrenos: BMW E30, Land Rover Defender, Nissan Patrol…"),
                 ("Método", "Proyecto por fases con presupuesto detallado por fase y diario de obra con fotos"),
                 ("Legalización", "Reformas tramitadas según el Manual de Reformas de Vehículos e ITV")],
    "pintura": [("Servicios", "Pintura completa y parcial en cabina, chapa, chasis y decoraciones de competición"),
                ("Acabados", "Colores originales, especiales, perlados, mates y bitono"),
                ("Precio", "Presupuesto detallado tras ver el coche: depende de superficie, estado de chapa, desmontaje y tipo de pintura"),
                ("Dónde", "Torrelaguna (Madrid), con clientes de la Sierra Norte, Madrid y Guadalajara")],
    "banco-de-potencia": [("Qué mide", "Potencia (CV/kW) y par (Nm) en todo el rango de revoluciones"),
                          ("Para qué", "Diagnóstico, comparativa antes/después de una modificación y puesta a punto"),
                          ("Resultado", "Curvas de potencia y par que te llevas para comparar en el futuro"),
                          ("Coches", "De calle, preparados y de competición")],
    "experiencias": [("Experiencias", "DS Pilot Weekend Circuit (Jarama), Rally (rally federado) y Slalom"),
                     ("Coches", "Peugeot 206 1.6 XS de 118 CV y BMW E36 de 135 CV en rally y slalom"),
                     ("Duración", "Fin de semana"),
                     ("Requisitos", "Carnet de conducir; licencia federativa en pruebas federadas (te ayudamos a tramitarla)")],
    "alquiler-coche-de-rally": [("Coches", "Peugeot 206 1.6 XS (118 CV, tracción delantera) y BMW E36 (135 CV, propulsión)"),
                                ("Incluye", "Coche preparado, asistencia mecánica y ayuda con la inscripción y la licencia"),
                                ("Pruebas", "Rallies, rallysprints y slaloms, según calendario y disponibilidad"),
                                ("Reserva", "Por formulario, WhatsApp o teléfono: (+34) 615 97 22 33")],
    "coches-de-rally-en-venta": [("Stock", "Coches de rally, competición y piezas, sincronizados con nuestro perfil de Wallapop"),
                                 ("Revisión", "Cada coche pasa por nuestro taller antes de venderse"),
                                 ("Si no está", "Te buscamos el coche que necesitas"),
                                 ("Dónde", "Torrelaguna (Madrid), con compradores de toda España")],
}

GUIDES = {
    "competicion": [
        ("¿Qué incluye la preparación de un coche de rally?", """
<p>Preparar un coche de rally es mucho más que montar piezas. En Deyscom lo planteamos en este orden, porque es el que mejor protege al piloto y el presupuesto:</p>
<ol>
<li><strong>Seguridad:</strong> jaula de seguridad conforme al reglamento, baquets y arneses homologados, extinción, cortacorrientes y redes.</li>
<li><strong>Fiabilidad:</strong> refrigeración, transmisión, frenos y cableado preparados para el esfuerzo de un tramo.</li>
<li><strong>Chasis y suspensión:</strong> refuerzos, amortiguación y geometría según superficie (tierra o asfalto).</li>
<li><strong>Prestaciones:</strong> motor, admisión y escape, siempre dentro de lo que permite la categoría.</li>
</ol>
<p>Si todavía no tienes coche, valora <a href="alquiler-coche-de-rally.html">alquilar un coche de rally</a> o revisar nuestros <a href="coches-de-rally-en-venta.html">coches de rally en venta</a>.</p>"""),
        ("¿Qué coche elegir para empezar a competir?", """
<p>Para empezar recomendamos coches ligeros, de mecánica sencilla y con buena disponibilidad de recambios. Dos ejemplos que conocemos muy bien porque forman parte de nuestro equipo:</p>
<ul>
<li><strong>Peugeot 206 1.6 XS (118 CV):</strong> tracción delantera, noble y económico de mantener. Ideal para aprender.</li>
<li><strong>BMW E36 (135 CV):</strong> propulsión trasera, más exigente y muy divertido. Para quien busca sensaciones.</li>
</ul>
<p>Te contamos más en la guía <a href="blog-coche-de-rally-que-es-y-categorias.html">coche de rally: qué es y qué categorías hay</a>.</p>"""),
        ("¿Hacéis asistencia en carrera fuera de Madrid?", """
<p>Sí. Además de preparar y mantener el coche en nuestro taller de Torrelaguna, nos desplazamos al parque de asistencia de rallies, rallysprints y slaloms para resolver incidencias entre tramos. Lo vivimos en primera persona en carreras como el II Rallye Comunidad de Madrid – El Molar 2026.</p>"""),
    ],
    "restomod": [
        ("¿Qué es exactamente un restomod?", """
<p>Un <strong>restomod</strong> une <em>restoration</em> y <em>modification</em>: se conserva el aspecto y el carácter del clásico, pero se actualiza lo que se conduce —motor, frenos, suspensión, electricidad y confort—. A diferencia de una restauración, no busca la fidelidad total a fábrica, sino un clásico que se pueda disfrutar a diario. Lo explicamos a fondo en <a href="blog-que-es-un-restomod.html">qué es un restomod y cómo plantearlo por fases</a>.</p>"""),
        ("¿Cuánto cuesta un restomod o una restauración?", """
<p>Depende sobre todo de tres cosas: el <strong>estado de la base</strong> (chasis y óxido), el <strong>alcance de la modificación</strong> (mecánica original reconstruida o actualizada) y los <strong>acabados</strong> (pintura, interior). Por eso trabajamos por fases, con presupuesto detallado para cada una y un diagnóstico previo de la base antes de comprometer nada.</p>"""),
        ("¿Se puede legalizar un restomod en la ITV?", """
<p>Sí. Las modificaciones que cambian las características del vehículo son <strong>reformas</strong> y se tramitan según el Manual de Reformas de Vehículos, con su documentación técnica e inspección en la ITV. Si el coche tiene más de 30 años, conviene valorar también su catalogación como vehículo histórico. Tienes todos los detalles en <a href="blog-reformas-itv-y-vehiculos-historicos.html">reformas en la ITV y vehículos históricos</a>.</p>"""),
    ],
    "pintura": [
        ("¿Cuánto cuesta pintar un coche?", """
<p>El precio de pintar un coche depende de la <strong>superficie</strong> (una pieza o el coche completo), del <strong>estado de la chapa</strong>, del <strong>desmontaje</strong> necesario y del <strong>tipo de pintura</strong> (monocapa, bicapa, tricapa, perlada o mate). Un cambio de color completo, con vanos y marcos, no es comparable a igualar un paragolpes. Te damos presupuesto detallado tras ver el coche y te explicamos cada partida en <a href="blog-cuanto-cuesta-pintar-un-coche.html">cuánto cuesta pintar un coche</a>.</p>"""),
        ("¿Por qué pintar en cabina de pintura?", """
<p>La cabina de pintura controla el polvo, la temperatura y la ventilación durante la aplicación y el secado. El resultado es un acabado más limpio y duradero que pintar al aire libre. En nuestra cabina pintamos carrocerías completas, piezas sueltas y también <strong>chasis, subchasis y brazos</strong>, como los que ves en las fotos.</p>"""),
        ("¿Hacéis decoraciones y rotulación de coches de rally?", """
<p>Sí. Diseñamos y aplicamos decoraciones de competición en pintura o vinilo, con los logos de patrocinadores y el estilo de cada equipo. Es lo que llevan nuestros propios coches de rally y slalom.</p>"""),
    ],
    "banco-de-potencia": [
        ("¿Qué es un banco de potencia y qué mide?", """
<p>Un banco de potencia (o banco de rodillos) mide la <strong>potencia y el par</strong> de un coche en todo el rango de revoluciones con las ruedas motrices sobre unos rodillos. El resultado es una curva que muestra dónde rinde el motor y si hay pérdidas o fallos. Si quieres entender cómo leerla, mira <a href="blog-banco-de-potencia-como-leer-la-curva.html">cómo leer la curva de potencia y par</a>.</p>"""),
        ("¿Por qué el banco da menos CV que la ficha técnica?", """
<p>Porque el banco mide <strong>en rueda</strong> y entre el motor y el asfalto hay pérdidas de transmisión. El fabricante declara la potencia <strong>en motor</strong>. Para comparar resultados lo importante es medir siempre en las mismas condiciones y con el mismo factor de corrección (DIN 70020, SAE J1349 o ISO 1585).</p>"""),
        ("¿Cuándo merece la pena pasar por el banco?", """
<ul>
<li><strong>Antes y después de una modificación:</strong> para saber qué ha aportado de verdad.</li>
<li><strong>Diagnóstico:</strong> cuando notas pérdida de potencia, tirones o un comportamiento irregular.</li>
<li><strong>Competición:</strong> para verificar la preparación antes de la temporada o de una prueba.</li>
<li><strong>Compra de un coche preparado:</strong> para confirmar que rinde lo que promete.</li>
</ul>"""),
    ],
    "experiencias": [
        ("¿Qué experiencia de conducción elegir?", """
<ul>
<li><strong><a href="ds-pilot-weekend-circuit.html">Circuit</a>:</strong> si quieres sentir la velocidad en el Circuito del Jarama, con tandas y explicaciones de trazada.</li>
<li><strong><a href="ds-pilot-weekend-rally.html">Rally</a>:</strong> si quieres correr un rally federado de verdad, con tramos, asistencia y copiloto.</li>
<li><strong><a href="ds-pilot-weekend-slalom.html">Slalom</a>:</strong> si buscas la puerta de entrada más accesible a la competición: conos, cronómetro y precisión.</li>
</ul>"""),
        ("¿Es un buen regalo para un aficionado al motor?", """
<p>Sí, es uno de los regalos más especiales para quien vive el motor: no es una vuelta en un coche, es un fin de semana completo como piloto con un equipo de competición. Indica en la reserva que es un regalo y lo preparamos a nombre de quien quieras.</p>"""),
    ],
    "alquiler-coche-de-rally": [
        ("¿Cómo funciona el alquiler de un coche de rally?", """
<ol>
<li><strong>Nos dices la prueba</strong> en la que quieres correr (rally, rallysprint o slalom) y la fecha.</li>
<li><strong>Confirmamos disponibilidad</strong> del coche y te explicamos condiciones, seguro y fianza.</li>
<li><strong>Te ayudamos con la licencia</strong> federativa y la inscripción.</li>
<li><strong>Preparamos el coche</strong> en nuestro taller de Torrelaguna y lo llevamos a la prueba.</li>
<li><strong>Corres con asistencia</strong> de nuestro equipo durante todo el fin de semana.</li>
</ol>"""),
        ("¿Qué necesito para alquilar un coche de rally?", """
<ul>
<li>Ser mayor de edad y tener carnet de conducir en vigor.</li>
<li>Licencia federativa de piloto para pruebas federadas (y de copiloto para tu acompañante en rally).</li>
<li>Equipamiento de seguridad homologado: casco con sistema de retención frontal de la cabeza, mono, ropa interior, guantes y botines ignífugos.</li>
</ul>
<p>Si nunca has competido, empieza por <a href="blog-como-empezar-en-los-rallies.html">cómo empezar en los rallies</a> o por la <a href="ds-pilot-weekend-slalom.html">experiencia de slalom</a>.</p>"""),
        ("¿Qué diferencia hay con el DS Pilot Weekend Rally?", """
<p>El <a href="ds-pilot-weekend-rally.html">DS Pilot Weekend – Rally</a> es nuestra experiencia «llave en mano» para debutar: nosotros elegimos contigo la prueba, gestionamos la inscripción y te acompañamos todo el fin de semana. El alquiler es más flexible y pensado para pilotos que ya tienen experiencia y quieren correr una prueba concreta.</p>"""),
    ],
    "coches-de-rally-en-venta": [
        ("¿Qué revisar antes de comprar un coche de rally de segunda mano?", """
<ul>
<li><strong>Jaula de seguridad:</strong> que esté homologada o certificada según el reglamento y sin reparaciones dudosas.</li>
<li><strong>Caducidad del equipamiento:</strong> baquets, arneses y extintores tienen fecha de homologación.</li>
<li><strong>Documentación técnica:</strong> pasaporte técnico o ficha que exija tu federación, y documentación del vehículo.</li>
<li><strong>Chasis y carrocería:</strong> golpes estructurales, óxido y reparaciones de la jaula.</li>
<li><strong>Mecánica:</strong> historial de mantenimiento, horas de motor y caja, y si es posible una prueba en <a href="banco-de-potencia.html">banco de potencia</a>.</li>
<li><strong>Recambios incluidos:</strong> llantas, neumáticos y piezas de repuesto suman mucho valor.</li>
</ul>"""),
        ("¿Por qué comprar un coche de rally revisado por un taller?", """
<p>Porque un coche de rally ha trabajado mucho más que uno de calle. Antes de ponerlo a la venta lo revisamos en nuestro taller de Torrelaguna y te contamos su estado real. Si no encuentras lo que buscas, déjanos tus datos y te avisamos cuando llegue.</p>"""),
        ("Peugeot 206 y BMW E36: dos bases muy buscadas", """
<p>El <strong>Peugeot 206</strong> es una de las bases más populares para empezar en rally por su ligereza y su mecánica sencilla. El <strong>BMW E36</strong>, de propulsión, es la opción para quien busca un coche con más carácter. Ambos forman parte de nuestro equipo, así que los conocemos a fondo.</p>"""),
    ],
}

RELATED = {
    "competicion": ["blog-como-empezar-en-los-rallies", "blog-coche-de-rally-que-es-y-categorias", "blog-slalom-de-coches-que-es"],
    "restomod": ["blog-que-es-un-restomod", "blog-reformas-itv-y-vehiculos-historicos"],
    "pintura": ["blog-cuanto-cuesta-pintar-un-coche", "blog-que-es-un-restomod"],
    "banco-de-potencia": ["blog-banco-de-potencia-como-leer-la-curva"],
    "experiencias": ["blog-circuito-del-jarama-tandas", "blog-slalom-de-coches-que-es", "blog-como-empezar-en-los-rallies"],
    "ds-pilot-weekend-circuit": ["blog-circuito-del-jarama-tandas"],
    "ds-pilot-weekend-rally": ["blog-como-empezar-en-los-rallies", "blog-que-hace-un-copiloto-de-rally"],
    "ds-pilot-weekend-slalom": ["blog-slalom-de-coches-que-es"],
    "ds-copilot-course": ["blog-que-hace-un-copiloto-de-rally", "blog-como-empezar-en-los-rallies"],
    "alquiler-coche-de-rally": ["blog-como-empezar-en-los-rallies", "blog-coche-de-rally-que-es-y-categorias"],
    "coches-de-rally-en-venta": ["blog-coche-de-rally-que-es-y-categorias", "blog-banco-de-potencia-como-leer-la-curva"],
}
