"""Contenido del blog de Deyscom Motorsport.

Cada artículo sigue el mismo patrón pensado para SEO, GEO (buscadores con IA) y E-E-A-T:
respuesta directa al principio, secciones con preguntas claras, experiencia propia del taller,
FAQ con datos estructurados, fuentes oficiales y autor identificado.
"""

AUTHORS = {
    "nestor": dict(name="Néstor Aguado", role="Fundador y propietario de Deyscom Motorsport", anchor="nestor-aguado",
                   bio="Néstor Aguado dirige Deyscom Motorsport, el taller de preparación de coches de competición, restomod, pintura y banco de potencia de Torrelaguna (Madrid). En 2026 corrió con el equipo el II Rallye Comunidad de Madrid – El Molar."),
    "hector": dict(name="Héctor Guzmán", role="Responsable de marketing de Deyscom Motorsport", anchor="hector-guzman",
                   bio="Héctor Guzmán lleva el marketing y la comunicación de Deyscom Motorsport. Corrió junto a Néstor Aguado el II Rallye Comunidad de Madrid – El Molar 2026."),
}

POSTS = [
    dict(
        slug="blog-como-empezar-en-los-rallies",
        title="Cómo empezar en los rallies: licencia, coche, equipamiento y presupuesto",
        h1="Cómo empezar en los rallies <span class='pink'>paso a paso</span>",
        desc="Guía práctica para correr tu primer rally en España: qué licencia necesitas, qué coche elegir, el equipamiento obligatorio, el copiloto y cómo planificar el presupuesto.",
        keywords="cómo empezar en los rallies, licencia de piloto de rally, primer rally, correr un rally en España, alquilar coche de rally",
        category="Competición", author="nestor", editor="hector", date="2026-10-12", minutes=8,
        img="peugeot-206-rally-polvo-contraluz-deyscom",
        tldr="Para correr tu primer rally en España necesitas cuatro cosas: una <strong>licencia federativa</strong> de piloto (y otra de copiloto para tu acompañante), un <strong>coche que cumpla el reglamento técnico</strong> de la prueba, el <strong>equipamiento de seguridad homologado</strong> y la <strong>inscripción</strong> en la carrera. La forma más sencilla de empezar es alquilar un coche ya preparado o probar antes en un slalom.",
        sections=[
            ("Elige la disciplina con la que vas a empezar", """
<p>«Rally» engloba varias disciplinas con exigencias y costes muy distintos. Antes de comprar nada, decide por dónde quieres entrar:</p>
<ul>
<li><strong>Slalom:</strong> recorrido marcado con conos y cronometrado. Es la puerta de entrada más asequible y segura para aprender a mover el coche con precisión.</li>
<li><strong>Rallysprint:</strong> un tramo corto que se repite varias veces en el mismo día. Ideal para coger ritmo sin la logística de un rally completo.</li>
<li><strong>Rally:</strong> varios tramos cronometrados unidos por enlaces por carretera abierta, con parque de asistencia, controles horarios y reconocimientos. Necesitas piloto y copiloto.</li>
<li><strong>Montaña y circuito:</strong> otras disciplinas de velocidad con reglamentos propios.</li>
</ul>
<p>En nuestra experiencia en el taller, quien empieza por slalom o por un rallysprint llega a su primer rally con mucha más confianza y gasta menos en reparaciones.</p>"""),
            ("Qué licencia necesitas para correr un rally", """
<p>Para participar en una prueba federada necesitas una <strong>licencia federativa</strong> en vigor. En España las expide la federación autonómica de automovilismo de tu comunidad, dentro del marco de la <a href="https://www.rfeda.es" target="_blank" rel="noopener">Real Federación Española de Automovilismo (RFEDA)</a>.</p>
<ul>
<li>Hay licencias distintas para <strong>piloto</strong> y para <strong>copiloto</strong>, y de ámbito autonómico o nacional.</li>
<li>La primera licencia suele requerir un <strong>reconocimiento médico</strong> y, según la federación, algún curso o requisito adicional.</li>
<li>La licencia incluye un seguro asociado a la actividad deportiva.</li>
</ul>
<p>Los requisitos y precios cambian cada temporada, así que consulta siempre la normativa vigente de tu federación antes de inscribirte.</p>"""),
            ("¿Qué coche elegir para tu primer rally?", """
<p>Tienes tres caminos: <strong>comprar un coche ya preparado</strong>, <strong>preparar uno propio</strong> o <strong>alquilar</strong>. Para debutar, nuestra recomendación es un coche ligero, de tracción delantera y mecánica sencilla, como nuestro Peugeot 206 1.6 XS de 118 CV: es noble, fácil de mantener y perdona los errores de aprendizaje.</p>
<p>Si vas a preparar tu propio coche, el reglamento técnico de la categoría marca qué puedes y qué debes montar. Lo imprescindible en seguridad es:</p>
<ul>
<li>Jaula de seguridad conforme al reglamento.</li>
<li>Baquets homologados y arneses en vigor.</li>
<li>Sistema de extinción y extintor.</li>
<li>Cortacorrientes accesible desde dentro y desde fuera.</li>
<li>La documentación técnica que exija tu federación para el coche.</li>
</ul>
<p>Si prefieres no tener coche propio, el <a href="ds-pilot-weekend-rally.html">DS Pilot Weekend – Rally</a> te permite correr un rally federado con nuestro 206 o con nuestro BMW E36 de 135 CV, con asistencia incluida.</p>"""),
            ("El equipamiento obligatorio del piloto y el copiloto", """
<p>Piloto y copiloto deben llevar equipamiento homologado según el reglamento de la prueba. Como norma general:</p>
<ul>
<li><strong>Casco homologado</strong> compatible con sistema de retención frontal de la cabeza (FHR, tipo HANS).</li>
<li><strong>Mono ignífugo</strong> homologado.</li>
<li><strong>Ropa interior, sotocasco, guantes y botines</strong> ignífugos homologados.</li>
</ul>
<p>Revisa siempre las fechas de caducidad de las homologaciones: es una de las causas más habituales de problemas en las verificaciones técnicas.</p>"""),
            ("El copiloto: la mitad del coche", """
<p>En rally no se corre solo. El copiloto canta las notas, controla los tiempos y gestiona el carnet de ruta. Un buen copiloto hace al piloto más rápido y, sobre todo, más seguro. Si quieres formarte en este papel, hemos creado el <a href="ds-copilot-course.html">DS Copilot Course</a>, con certificación y prácticas en un tramo cerrado en Guadalajara. Te explicamos el trabajo del copiloto en detalle en <a href="blog-que-hace-un-copiloto-de-rally.html">qué hace un copiloto de rally</a>.</p>"""),
            ("Cómo planificar el presupuesto de tu primer rally", """
<p>Más que una cifra cerrada, conviene tener claras todas las partidas para que no haya sorpresas:</p>
<ol>
<li><strong>Licencias</strong> de piloto y copiloto.</li>
<li><strong>Inscripción</strong> en la prueba.</li>
<li><strong>Coche:</strong> compra y preparación, o alquiler.</li>
<li><strong>Equipamiento</strong> homologado de piloto y copiloto.</li>
<li><strong>Consumibles:</strong> neumáticos, combustible, frenos y fluidos.</li>
<li><strong>Asistencia:</strong> equipo, herramientas y desplazamientos.</li>
<li><strong>Reserva para imprevistos</strong> y reparaciones.</li>
</ol>
<p>Alquilar un coche preparado concentra casi todas estas partidas en un solo precio y es, con diferencia, la forma más previsible de debutar.</p>"""),
            ("Nuestra experiencia: el primer rally de Deyscom", """
<p>En 2026 Néstor Aguado y Héctor Guzmán corrieron juntos el <strong>II Rallye Comunidad de Madrid – El Molar</strong>, con el Peugeot 206 del equipo. Lo que más aprendimos: la preparación no termina en el taller. Verificaciones, horarios, asistencia y comunicación dentro del coche pesan tanto como la mecánica. Por eso diseñamos nuestras experiencias y nuestro curso de copiloto pensando en lo que nos habría gustado saber antes de nuestra primera salida.</p>"""),
        ],
        faq=[
            ("¿Necesito licencia para correr un rally?", "Sí. Para una prueba federada necesitas licencia federativa en vigor de piloto, y tu acompañante una de copiloto. Se tramita en la federación autonómica de automovilismo."),
            ("¿Puedo correr un rally sin tener coche propio?", "Sí. Puedes alquilar un coche de competición ya preparado. En Deyscom lo ofrecemos con el DS Pilot Weekend – Rally, con asistencia incluida."),
            ("¿Cuál es la mejor disciplina para empezar?", "El slalom y el rallysprint son las formas más asequibles y seguras de empezar antes de un rally completo."),
            ("¿Qué coche es bueno para un primer rally?", "Un coche ligero, de tracción delantera y mecánica sencilla, como un Peugeot 206, es ideal para aprender."),
        ],
        sources=[("Real Federación Española de Automovilismo (RFEDA)", "https://www.rfeda.es"), ("Federación Internacional del Automóvil (FIA)", "https://www.fia.com")],
    ),
    dict(
        slug="blog-que-hace-un-copiloto-de-rally",
        title="Qué hace un copiloto de rally: notas, libro de ruta y controles horarios",
        h1="Qué hace un <span class='pink'>copiloto</span> de rally",
        desc="Todo sobre el trabajo del copiloto de rally: cómo se toman y se cantan las notas, el libro de ruta, el carnet de control, los controles horarios y la seguridad.",
        keywords="qué hace un copiloto de rally, notas de rally, libro de ruta rally, carnet de control, controles horarios rally, curso de copiloto",
        category="Formación", author="nestor", editor="hector", date="2026-10-12", minutes=7,
        img="copiloto-notas-rally-coche-competicion",
        tldr="El copiloto de rally <strong>guía al piloto cantando las notas</strong> del tramo, <strong>gestiona el libro de ruta</strong> en los enlaces y <strong>controla el carnet de control y los horarios</strong> para evitar penalizaciones. También coordina la seguridad y la comunicación con la asistencia. Es tan determinante en el resultado como el propio piloto.",
        sections=[
            ("Las notas: los ojos del piloto", """
<p>Las notas son una descripción codificada del tramo que el copiloto lee en voz alta mientras el coche avanza. Se crean durante los <strong>reconocimientos</strong>, en los que el equipo recorre el tramo a velocidad legal y con un número limitado de pasadas.</p>
<p>Una nota típica indica:</p>
<ul>
<li><strong>Dirección y grado de la curva</strong>, normalmente con una escala numérica o descriptiva.</li>
<li><strong>Distancia</strong> hasta la siguiente indicación.</li>
<li><strong>Peligros</strong>: baches, cambios de rasante, cortes, piso deslizante o curvas que cierran.</li>
</ul>
<p>El sistema debe ser el mismo para piloto y copiloto. Lo más importante no es la cantidad de información, sino cantarla con el <strong>ritmo adecuado</strong>: ni tan pronto que el piloto la olvide, ni tan tarde que no le dé tiempo a reaccionar.</p>"""),
            ("El libro de ruta y los enlaces", """
<p>Entre tramos, el coche circula por carreteras abiertas al tráfico. El <strong>libro de ruta</strong> (road book) que entrega la organización describe ese recorrido con viñetas y distancias parciales y totales. El copiloto lo sigue con el cuentakilómetros del coche para no perderse y llegar a tiempo, siempre respetando las normas de tráfico.</p>"""),
            ("El carnet de control y los controles horarios", """
<p>El rally se organiza con un horario muy preciso. En el <strong>carnet de control</strong> los comisarios anotan la hora de paso por cada control. El copiloto es responsable de presentarlo y de calcular los tiempos:</p>
<ul>
<li><strong>Controles horarios (CH):</strong> hay que presentarse en el minuto asignado. Llegar antes o después se penaliza.</li>
<li><strong>Salida de tramo:</strong> el comisario da la salida a la hora prevista.</li>
<li><strong>Meta y control stop:</strong> se registra el tiempo del tramo cronometrado.</li>
<li><strong>Parque de asistencia y reagrupamientos:</strong> tiempos fijos en los que hay que entrar y salir puntualmente.</li>
</ul>
<p>Un error de cálculo en un control horario puede costar más tiempo que un trompo en el tramo. Por eso el copiloto revisa los horarios constantemente.</p>"""),
            ("Seguridad: el copiloto también protege", """
<p>El copiloto conoce los procedimientos de seguridad del reglamento: en caso de incidente, el equipo debe indicar a los participantes que vienen detrás si necesita ayuda o no, usando las señales que marque la normativa. También vigila el estado del equipamiento y ayuda a mantener la calma dentro del coche.</p>"""),
            ("Cómo formarte como copiloto", """
<p>Se aprende practicando, pero empezar con un buen método ahorra muchos errores. En el <a href="ds-copilot-course.html">DS Copilot Course</a> trabajamos en un fin de semana completo la teoría (notas, libro de ruta, carnet de control, reglamento y seguridad) y la práctica real dentro de un coche de rally, en un tramo cerrado en Guadalajara reservado solo para nuestros alumnos. Lo imparten un profesor y una profesora y al terminar recibes certificación y diploma.</p>
<p>Si todavía estás decidiendo si dar el paso, lee también <a href="blog-como-empezar-en-los-rallies.html">cómo empezar en los rallies</a>.</p>"""),
        ],
        faq=[
            ("¿Qué hace un copiloto de rally?", "Canta las notas del tramo, sigue el libro de ruta en los enlaces, gestiona el carnet de control y los horarios, y coordina la seguridad y la comunicación con la asistencia."),
            ("¿Necesita licencia el copiloto?", "Sí. Para correr una prueba federada el copiloto también necesita licencia federativa en vigor."),
            ("¿Qué son los controles horarios?", "Son puntos del recorrido en los que el equipo debe presentarse en un minuto concreto. Adelantarse o retrasarse se penaliza."),
            ("¿Dónde puedo aprender a ser copiloto?", "En cursos específicos como el DS Copilot Course de Deyscom Motorsport, con teoría, práctica en tramo cerrado en Guadalajara, certificación y diploma."),
        ],
        sources=[("Real Federación Española de Automovilismo (RFEDA)", "https://www.rfeda.es"), ("Federación Internacional del Automóvil (FIA)", "https://www.fia.com")],
    ),
    dict(
        slug="blog-banco-de-potencia-como-leer-la-curva",
        title="Banco de potencia: qué mide y cómo leer la curva de potencia y par",
        h1="Banco de potencia: <span class='pink'>cómo leer la curva</span>",
        desc="Qué es un banco de potencia, qué diferencia hay entre potencia en rueda y en motor, cómo se relacionan par y potencia y qué mirar en una curva antes y después de modificar tu coche.",
        keywords="banco de potencia, curva de potencia y par, potencia en rueda, medir CV coche, banco de rodillos, prueba de potencia Madrid",
        category="Técnica", author="nestor", editor="hector", date="2026-10-12", minutes=7,
        img="banco-de-potencia-curva-potencia-par",
        tldr="Un banco de potencia mide <strong>la potencia y el par reales</strong> de un coche en todo el rango de revoluciones. El resultado es una <strong>curva</strong> que muestra dónde rinde el motor, si hay pérdidas o fallos y qué ha aportado cada modificación. Para comparar mediciones hay que hacerlas en <strong>las mismas condiciones</strong> y con el mismo factor de corrección.",
        sections=[
            ("Qué es un banco de potencia", """
<p>Un banco de potencia (también llamado banco de rodillos o dinamómetro de chasis) permite medir el rendimiento del coche sin salir del taller. El coche se coloca con las ruedas motrices sobre unos rodillos, se sujeta con seguridad y se acelera a fondo en una marcha determinada mientras el equipo registra la fuerza y las revoluciones.</p>"""),
            ("Potencia en rueda y potencia en motor", """
<p>El banco mide lo que llega a las ruedas. Entre el motor y el asfalto hay <strong>pérdidas de transmisión</strong> (caja de cambios, diferencial, palieres, neumáticos), por eso la <strong>potencia en rueda</strong> siempre es menor que la <strong>potencia en motor</strong> que anuncia el fabricante. Algunos bancos estiman la potencia en motor a partir de esas pérdidas, pero lo más fiable para comparar es mirar siempre el mismo dato en el mismo banco.</p>"""),
            ("Cómo se relacionan par y potencia", """
<p>El <strong>par</strong> es la fuerza de giro del motor; la <strong>potencia</strong> es ese par multiplicado por la velocidad de giro. La relación es:</p>
<p><strong>Potencia (kW) = Par (Nm) × rpm ÷ 9.549</strong>, y <strong>1 kW ≈ 1,36 CV</strong>.</p>
<p>Por eso la potencia máxima siempre aparece a más revoluciones que el par máximo.</p>"""),
            ("Qué mirar en una curva de potencia y par", """
<ul>
<li><strong>Valores máximos:</strong> potencia y par máximos y a qué revoluciones llegan.</li>
<li><strong>Forma de la curva:</strong> una curva de par llena y plana hace el coche más fácil y rápido de conducir que un pico aislado.</li>
<li><strong>Área bajo la curva:</strong> en el rango de uso real del motor es lo que más se nota al volante.</li>
<li><strong>Irregularidades:</strong> dientes, caídas o escalones pueden indicar problemas de encendido, mezcla, sobrealimentación o embrague.</li>
<li><strong>Mezcla aire-combustible:</strong> si el banco registra la lambda, permite comprobar que el motor trabaja con seguridad.</li>
</ul>"""),
            ("Cómo comparar antes y después de una modificación", """
<p>Para que la comparación sea válida, la medición se tiene que hacer en las mismas condiciones: misma marcha, presión de neumáticos, temperatura del motor y del aire, y el mismo <strong>factor de corrección</strong> (por ejemplo DIN 70020, SAE J1349 o ISO 1585), que ajusta el resultado a unas condiciones atmosféricas de referencia. Además se hacen varias pasadas para descartar valores aislados.</p>"""),
            ("Cómo lo hacemos en Deyscom", """
<p>Antes de medir revisamos niveles, estado del coche y fijaciones; después hacemos varias pasadas y revisamos las curvas contigo. Te llevas tus gráficas para comparar en el futuro. Más información en nuestra página de <a href="banco-de-potencia.html">banco de potencia en Madrid</a>.</p>"""),
        ],
        faq=[
            ("¿Qué mide un banco de potencia?", "La potencia y el par del coche en todo el rango de revoluciones, normalmente medidos en las ruedas motrices."),
            ("¿Por qué el banco da menos CV que el fabricante?", "Porque el banco mide en rueda y entre el motor y las ruedas hay pérdidas de transmisión; el fabricante declara la potencia en motor."),
            ("¿Cómo se pasa de kW a CV?", "Multiplicando los kW por aproximadamente 1,36."),
            ("¿Es malo para el motor pasar por el banco?", "No, si el coche está en buen estado, bien sujeto y refrigerado. Antes de medir se revisan niveles y fijaciones."),
        ],
        sources=[("Norma SAE J1349 (SAE International)", "https://www.sae.org"), ("Organización Internacional de Normalización (ISO)", "https://www.iso.org")],
    ),
    dict(
        slug="blog-que-es-un-restomod",
        title="Qué es un restomod y cómo plantear el proyecto por fases",
        h1="Qué es un <span class='pink'>restomod</span>",
        desc="Qué es un restomod, en qué se diferencia de una restauración y cómo plantear el proyecto por fases: diagnóstico, mecánica, seguridad, legalización en la ITV y presupuesto.",
        keywords="qué es un restomod, restomod Madrid, restauración de coches clásicos, homologar reformas ITV, restomod por fases",
        category="Restomod", author="nestor", editor="hector", date="2026-10-12", minutes=6,
        img="todoterreno-chasis-restauracion-completa",
        tldr="Un <strong>restomod</strong> combina <strong>restauración y modificación</strong>: conserva el aspecto y el alma de un clásico, pero le da mecánica, frenos, suspensión, seguridad y confort actuales. Se planifica mejor <strong>por fases</strong>, empezando por un diagnóstico de la base, y las reformas importantes deben <strong>legalizarse en la ITV</strong>.",
        sections=[
            ("Restomod, restauración y preparación: diferencias", """
<ul>
<li><strong>Restauración:</strong> devolver el coche a su estado original de fábrica, con piezas y acabados fieles.</li>
<li><strong>Preparación:</strong> mejorar las prestaciones, normalmente con un objetivo deportivo.</li>
<li><strong>Restomod:</strong> mantener la estética clásica y modernizar lo que se conduce: motor, frenos, suspensión, electricidad y confort.</li>
</ul>"""),
            ("Fase 1: diagnóstico de la base", """
<p>Todo empieza por saber qué tenemos. Revisamos chasis, carrocería, óxido y mecánica antes de comprometer un presupuesto. Una base sana ahorra mucho dinero; una base con corrosión estructural puede cambiar el proyecto entero. Si aún no tienes el coche, te ayudamos a revisarlo antes de comprarlo.</p>"""),
            ("Fase 2: chasis, carrocería y seguridad", """
<p>Saneado, tratamiento anticorrosión, refuerzos y pintura. Es la base sobre la que se monta todo lo demás y la parte que menos se ve, pero la más importante.</p>"""),
            ("Fase 3: mecánica, frenos y suspensión", """
<p>Aquí está la «mod»: motores e inyecciones modernos o la reconstrucción del original, frenos actuales, suspensión regulable y geometría pensada para el uso que le vas a dar. El objetivo es que frene, gire y arranque como un coche de hoy sin perder carácter.</p>"""),
            ("Fase 4: electricidad, interior y detalles", """
<p>Cableado nuevo, iluminación, instrumentación, asientos y tapicería a medida. Es la fase que define cómo te sientes al volante.</p>"""),
            ("Legalización: las reformas y la ITV", """
<p>En España, las modificaciones que alteran las características del vehículo se consideran reformas y deben tramitarse según el <strong>Manual de Reformas de Vehículos</strong> del Ministerio de Industria, con la documentación técnica correspondiente y su inspección en la ITV. Plantearlo desde el principio evita sorpresas y permite elegir piezas que se puedan legalizar.</p>"""),
            ("Cómo trabajamos los restomod en Deyscom", """
<p>Diseñamos el proyecto contigo, lo dividimos en fases con presupuesto detallado para cada una y te enviamos fotos y vídeos del avance. Puedes ver ejemplos en nuestra página de <a href="restomod.html">restomod y restauración en Madrid</a>.</p>"""),
        ],
        faq=[
            ("¿Qué significa restomod?", "Es la unión de «restoration» y «modification»: un clásico restaurado y actualizado con mecánica, seguridad y confort modernos."),
            ("¿Un restomod se puede legalizar?", "Sí, tramitando las reformas según el Manual de Reformas de Vehículos y pasando la inspección correspondiente en la ITV."),
            ("¿Cuánto tarda un restomod?", "Depende del estado de la base y del alcance; un proyecto completo suele llevar meses. Trabajar por fases permite repartir tiempo y presupuesto."),
            ("¿Qué coches son buenos para un restomod?", "Clásicos y youngtimers con buena base de chasis y recambios disponibles, como BMW E30, Land Rover Defender o todoterrenos clásicos."),
        ],
        sources=[("Ministerio de Industria y Turismo · Manual de Reformas de Vehículos", "https://industria.gob.es")],
    ),
]

from blog_posts_extra import EXTRA_POSTS  # noqa: E402

POSTS = EXTRA_POSTS + POSTS
