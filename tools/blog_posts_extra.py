"""Artículos del blog orientados a las búsquedas con más volumen (datos de palabras clave, España).

Mismo patrón E-E-A-T que blog_posts.py: respuesta rápida, H2 en forma de pregunta,
experiencia propia del taller, FAQ, fuentes oficiales y autor identificado.
No se inventan precios ni datos: cuando algo depende del caso, se explica de qué depende.
"""

EXTRA_POSTS = [
    dict(
        slug="blog-coche-de-rally-que-es-y-categorias",
        title="Coche de rally: qué es, categorías (Rally1 a Rally5) y cómo elegir uno",
        h1="Coche de rally: <span class='pink'>qué es y qué categorías hay</span>",
        desc="Qué es un coche de rally, en qué se diferencia de uno de calle, las categorías FIA de Rally1 a Rally5, qué lleva por dentro y cómo elegir uno para empezar.",
        keywords="coche de rally, coches de rally, categorías rally FIA, Rally2, Rally4, Rally5, coche de rally segunda mano, peugeot 206 rally",
        category="Competición", author="nestor", editor="hector", date="2026-10-23", minutes=8,
        img="mitsubishi-lancer-evo-rally-taller-deyscom",
        tldr="Un <strong>coche de rally</strong> es un coche derivado de serie y preparado para competir en tramos cerrados de asfalto o tierra: lleva <strong>jaula de seguridad, baquets, arneses, extinción y suspensión de competición</strong>, y debe cumplir el reglamento técnico de su categoría. La FIA ordena los coches actuales en una pirámide de <strong>Rally1 (la más alta) a Rally5 (la de acceso)</strong>, y las federaciones nacionales y autonómicas añaden sus propias clases. Para empezar, lo más sensato es un coche ligero de tracción delantera, como un Peugeot 206.",
        sections=[
            ("¿Qué es un coche de rally?", """
<p>Es un coche que parte de un modelo de serie y se transforma para competir en <strong>tramos cronometrados cerrados al tráfico</strong>, sobre asfalto, tierra o nieve, y que además tiene que poder circular por carretera abierta en los enlaces entre tramos. Por eso un coche de rally está matriculado, pasa verificaciones técnicas en cada prueba y combina dos mundos: la robustez para aguantar golpes, saltos y polvo, y la seguridad de un coche de competición.</p>
<p>En el taller lo resumimos así: un coche de rally no es un coche de calle con pegatinas, es un coche reconstruido alrededor de la seguridad de quien va dentro.</p>"""),
            ("¿Qué diferencia a un coche de rally de uno de calle?", """
<ul>
<li><strong>Seguridad pasiva:</strong> jaula de seguridad soldada o atornillada según reglamento, baquets y arneses homologados, red de ventanilla, cortacorrientes y sistema de extinción.</li>
<li><strong>Suspensión y bajos:</strong> amortiguadores de competición regulables, protecciones de cárter y depósito, y geometría pensada para el tipo de superficie.</li>
<li><strong>Frenos y transmisión:</strong> pastillas, latiguillos y líquidos de competición; en muchos casos autoblocante y desarrollos más cortos.</li>
<li><strong>Peso:</strong> se elimina todo lo que no es necesario, sin bajar del peso mínimo que marca el reglamento de la categoría.</li>
<li><strong>Documentación:</strong> además de la del vehículo, la ficha o pasaporte técnico que exija la federación correspondiente.</li>
</ul>"""),
            ("¿Qué categorías de coches de rally hay? La pirámide FIA", """
<p>La <a href="https://www.fia.com" target="_blank" rel="noopener">Federación Internacional del Automóvil (FIA)</a> agrupa los coches de rally actuales en una pirámide de cinco niveles:</p>
<ul>
<li><strong>Rally1:</strong> los coches del Campeonato del Mundo (WRC). La cima de la pirámide.</li>
<li><strong>Rally2:</strong> tracción total y motor turbo; es la categoría de referencia en campeonatos nacionales y en WRC2.</li>
<li><strong>Rally3:</strong> tracción total con un planteamiento más asequible que Rally2.</li>
<li><strong>Rally4:</strong> tracción delantera; muy habitual en copas de promoción y campeonatos junior.</li>
<li><strong>Rally5:</strong> el escalón de acceso, con tracción delantera y preparación más contenida.</li>
</ul>
<p>Además, en España conviven coches de grupos anteriores y clases propias de cada federación autonómica. Antes de comprar o preparar un coche, comprueba en el reglamento de la prueba o del campeonato en qué clase encaja y si su homologación sigue vigente.</p>"""),
            ("¿Qué coche de rally elegir para empezar?", """
<p>Para un primer año la prioridad es aprender, no ganar. Por eso recomendamos coches <strong>ligeros, de tracción delantera, mecánica sencilla y recambios fáciles</strong>. Nuestro <strong>Peugeot 206 1.6 XS de 118 CV</strong> es un buen ejemplo: noble, fácil de mantener y muy buscado como base de rally. Si buscas más sensaciones, un coche de propulsión como nuestro <strong>BMW E36 de 135 CV</strong> exige más al volante y enseña mucho.</p>
<p>Si todavía no quieres comprar, puedes <a href="alquiler-coche-de-rally.html">alquilar un coche de rally</a> preparado o correr un rally federado con el <a href="ds-pilot-weekend-rally.html">DS Pilot Weekend – Rally</a>.</p>"""),
            ("Comprar un coche de rally de segunda mano: qué revisar", """
<p>Es la forma más habitual de entrar en el mundo del rally, pero hay que mirar con lupa:</p>
<ol>
<li><strong>Jaula y carrocería:</strong> soldaduras, puntos de anclaje, golpes y estado del chasis.</li>
<li><strong>Homologaciones:</strong> fechas de caducidad de baquets, arneses y extinción.</li>
<li><strong>Documentación:</strong> ficha técnica, pasaporte técnico y si el coche encaja en la categoría en la que quieres correr.</li>
<li><strong>Mecánica:</strong> historial de motor y caja, compresión y, si es posible, una medición en <a href="banco-de-potencia.html">banco de potencia</a>.</li>
<li><strong>Repuestos:</strong> qué se incluye (llantas, neumáticos, piezas de recambio) suele marcar la diferencia en el precio final.</li>
</ol>
<p>En nuestra sección de <a href="coches-de-rally-en-venta.html">coches de rally en venta</a> publicamos los coches que tenemos revisados por el taller.</p>"""),
            ("Nuestra experiencia en el taller", """
<p>En Deyscom preparamos y mantenemos coches de rally, slalom y circuito en Torrelaguna (Madrid). La pregunta que más nos hacen es «¿qué coche me compro?», y la respuesta casi siempre es la misma: el que puedas mantener toda la temporada. Un coche sencillo y fiable que termina todas las carreras enseña mucho más que uno potente que pasa media temporada en el taller. Si quieres ver cómo trabajamos, entra en <a href="competicion.html">preparación de coches de competición</a>.</p>"""),
        ],
        faq=[
            ("¿Qué es un coche de rally?", "Un coche derivado de serie y preparado para competir en tramos cerrados, con jaula de seguridad, baquets, arneses, extinción y suspensión de competición, que cumple el reglamento técnico de su categoría."),
            ("¿Qué categorías de coches de rally hay?", "La FIA las ordena de Rally1 (Mundial) a Rally5 (acceso). Rally2 y Rally3 son de tracción total; Rally4 y Rally5, de tracción delantera. Las federaciones añaden sus propias clases."),
            ("¿Un coche de rally puede circular por la calle?", "Los coches de rally están matriculados porque circulan por carreteras abiertas en los enlaces entre tramos, siempre cumpliendo las normas de tráfico y la documentación exigida."),
            ("¿Qué coche de rally es bueno para empezar?", "Un coche ligero de tracción delantera y mecánica sencilla, como un Peugeot 206, es ideal para aprender y económico de mantener."),
        ],
        sources=[("Federación Internacional del Automóvil (FIA) · Rally", "https://www.fia.com"), ("Real Federación Española de Automovilismo (RFEDA)", "https://www.rfeda.es")],
    ),
    dict(
        slug="blog-slalom-de-coches-que-es",
        title="Slalom de coches: qué es, cómo funciona y cómo empezar a competir",
        h1="Slalom de coches: <span class='pink'>qué es y cómo empezar</span>",
        desc="Qué es el slalom de coches, cómo es una prueba (recorrido con conos, mangas y penalizaciones), qué coche y licencia necesitas y por qué es la mejor forma de empezar.",
        keywords="slalom, slalom coches, slalom de coches, qué es un slalom, campeonato de slalom, slalom Madrid, empezar en el automovilismo",
        category="Competición", author="nestor", editor="hector", date="2026-10-23", minutes=6,
        img="bmw-e36-rotulado-deyscom-motorsport",
        tldr="El <strong>slalom de coches</strong> es una disciplina de automovilismo en la que cada participante recorre, de uno en uno y contra el cronómetro, un <strong>trazado marcado con conos</strong> sobre una superficie cerrada. Se hacen varias <strong>mangas</strong>, tocar o derribar conos suele penalizar con segundos y gana el tiempo más bajo. Es la forma más <strong>asequible y segura</strong> de empezar a competir y de aprender a mover un coche con precisión.",
        sections=[
            ("¿Qué es un slalom de coches?", """
<p>Es una prueba de habilidad y velocidad: un recorrido corto, lleno de cambios de dirección, frenadas y zonas lentas, delimitado con conos o balizas. Los coches salen de uno en uno, así que no hay contacto ni adelantamientos: compites contra el cronómetro y contra ti mismo.</p>
<p>Al ser un trazado lento y técnico, el slalom premia la <strong>precisión, la mirada lejana y la suavidad</strong> por encima de la potencia. Por eso es una escuela fantástica, tanto para quien empieza como para pilotos de rally que quieren pulir su técnica.</p>"""),
            ("¿Cómo funciona una prueba de slalom?", """
<ol>
<li><strong>Verificaciones:</strong> administrativas (licencia, inscripción) y técnicas (seguridad del coche y equipamiento).</li>
<li><strong>Reconocimiento:</strong> normalmente se recorre el trazado a pie para memorizarlo.</li>
<li><strong>Mangas:</strong> varias pasadas cronometradas. Según el reglamento, cuenta la mejor o la suma de varias.</li>
<li><strong>Penalizaciones:</strong> tocar o derribar conos, o saltarse una puerta, añade segundos o puede descalificar la manga.</li>
<li><strong>Clasificación:</strong> por clases según el tipo de coche y la cilindrada, y una general.</li>
</ol>
<p>Cada federación y cada prueba tienen su reglamento; consulta siempre el reglamento particular antes de inscribirte.</p>"""),
            ("¿Qué coche necesitas para hacer slalom?", """
<p>El slalom admite desde coches de serie con medidas de seguridad básicas hasta coches muy preparados, según la clase. Para empezar, un coche <strong>ligero y ágil</strong> funciona mejor que uno potente. Lo esencial:</p>
<ul>
<li>Coche en perfecto estado de frenos, neumáticos, suspensión y fijaciones.</li>
<li>Elementos de seguridad que exija el reglamento de la clase (baquet, arneses, extintor, cortacorrientes…).</li>
<li>Casco homologado y el equipamiento que marque la prueba.</li>
</ul>
<p>Si no tienes coche, en el <a href="ds-pilot-weekend-slalom.html">DS Pilot Weekend – Slalom</a> corres con nuestro Peugeot 206 1.6 XS de 118 CV o con el BMW E36 de 135 CV, preparados en nuestro taller.</p>"""),
            ("¿Necesito licencia para correr un slalom?", """
<p>Para una prueba <strong>federada</strong>, sí: necesitas licencia federativa en vigor, que se tramita en la federación autonómica dentro del marco de la <a href="https://www.rfeda.es" target="_blank" rel="noopener">RFEDA</a>. En la Comunidad de Madrid, la referencia es la Federación Madrileña de Automovilismo. Las jornadas privadas o de formación pueden tener requisitos distintos; te lo indicamos al confirmar fecha.</p>"""),
            ("Slalom, rallysprint y rally: ¿por dónde empiezo?", """
<p>El slalom es el escalón de entrada: poco coste, mucha seguridad y aprendizaje rápido. El <strong>rallysprint</strong> añade un tramo de carretera cerrado que se repite varias veces, y el <strong>rally</strong> completa la experiencia con copiloto, notas, enlaces y asistencia. Lee nuestra guía sobre <a href="blog-como-empezar-en-los-rallies.html">cómo empezar en los rallies</a> si quieres dar el siguiente paso.</p>"""),
            ("Consejos del equipo Deyscom para tu primer slalom", """
<ul>
<li><strong>Mira lejos:</strong> la vista va dos o tres conos por delante, no en el que tienes encima.</li>
<li><strong>Frena recto y suelta suave:</strong> la mayoría del tiempo se pierde en frenadas tardías que te sacan de la trazada.</li>
<li><strong>Memoriza el recorrido:</strong> un error de recorrido cuesta mucho más que ir prudente.</li>
<li><strong>Una manga cada vez:</strong> mejora una cosa por manga y compara tiempos.</li>
</ul>"""),
        ],
        faq=[
            ("¿Qué es un slalom de coches?", "Una prueba cronometrada en la que cada coche recorre, de uno en uno, un trazado marcado con conos. Gana el tiempo más bajo y tocar conos suele penalizar."),
            ("¿Es peligroso el slalom?", "Es una de las disciplinas más seguras del automovilismo: velocidades contenidas, un solo coche en pista y medidas de seguridad obligatorias."),
            ("¿Puedo hacer slalom con mi coche de calle?", "En algunas clases y jornadas sí, siempre que el coche esté en buen estado y cumpla las medidas de seguridad del reglamento."),
            ("¿Necesito licencia para un slalom?", "Para pruebas federadas sí. Las jornadas privadas pueden tener requisitos distintos."),
        ],
        sources=[("Real Federación Española de Automovilismo (RFEDA)", "https://www.rfeda.es")],
    ),
    dict(
        slug="blog-circuito-del-jarama-tandas",
        title="Circuito del Jarama: historia, trazado y cómo rodar en tandas",
        h1="Circuito del Jarama: <span class='pink'>historia y cómo rodar</span>",
        desc="Guía del Circuito del Jarama: historia desde 1967, trazado de 3.850 m, cómo funcionan las tandas, qué necesitas para conducir en el Jarama y cómo vivirlo como piloto.",
        keywords="circuito del jarama, tandas jarama, conducir en el jarama, experiencia circuito jarama, jarama RACE, track day Madrid",
        category="Circuito", author="nestor", editor="hector", date="2026-10-23", minutes=6,
        img="bmw-e36-competicion-circuito-curva",
        tldr="El <strong>Circuito del Jarama</strong> está en San Sebastián de los Reyes (Madrid), lo gestiona el <strong>Real Automóvil Club de España (RACE)</strong> y se inauguró en <strong>1967</strong>. Su trazado actual mide <strong>3.850 metros</strong> y acogió el Gran Premio de España de Fórmula 1 en varias ediciones. Hoy puedes rodar en él con tu coche en <strong>tandas</strong> o vivirlo como piloto con un coche de competición en una experiencia como el DS Pilot Weekend – Circuit.",
        sections=[
            ("Historia del Circuito del Jarama", """
<p>El Jarama se inauguró en 1967 al norte de Madrid y es uno de los circuitos permanentes más antiguos de España. Fue sede del <strong>Gran Premio de España de Fórmula 1</strong> en distintas ediciones entre finales de los años 60 y comienzos de los 80, y desde entonces ha acogido motociclismo, turismos, resistencia y clásicos. Lo gestiona el <a href="https://www.race.es" target="_blank" rel="noopener">RACE</a>.</p>
<p>Es un circuito con mucha historia y mucho carácter: estrecho, técnico y con curvas que exigen precisión. Por eso enseña tanto.</p>"""),
            ("El trazado: 3.850 metros técnicos", """
<p>El trazado actual mide unos <strong>3,85 km</strong> y combina una recta principal con curvas lentas, enlazadas y cambios de rasante. Para quien empieza, la clave es aprender las <strong>referencias de frenada</strong> y la trazada de cada curva antes de buscar velocidad. Nuestro equipo te las explica tanda a tanda en el <a href="ds-pilot-weekend-circuit.html">DS Pilot Weekend – Circuit</a>.</p>"""),
            ("¿Qué son las tandas en el Jarama y cómo funcionan?", """
<p>Las <strong>tandas</strong> (track days) son sesiones de rodaje libre en las que varios coches comparten pista durante un tiempo fijo, sin cronometraje oficial ni clasificación. Las organiza el propio circuito o empresas y clubes que alquilan la pista. Normalmente:</p>
<ul>
<li>Se reservan por sesiones o por jornada, con plazas limitadas.</li>
<li>Hay un <strong>briefing de seguridad</strong> obligatorio y normas de adelantamiento.</li>
<li>Se exige casco y que el coche esté en buen estado (frenos, neumáticos, fluidos, sin fugas).</li>
<li>Los circuitos cercanos a zonas habitadas aplican <strong>límites de ruido</strong>: comprueba que tu escape los cumple.</li>
</ul>
<p>Las condiciones, horarios y requisitos dependen de cada organizador; consúltalos siempre antes de reservar.</p>"""),
            ("¿Qué necesitas para conducir en el Jarama?", """
<ol>
<li><strong>Carnet de conducir</strong> en vigor (para tandas con coche propio).</li>
<li><strong>Casco</strong> y ropa adecuada; en algunos eventos se exige más equipamiento.</li>
<li><strong>Coche revisado:</strong> pastillas y líquido de frenos con margen, neumáticos en buen estado y presiones correctas.</li>
<li><strong>Seguro:</strong> los seguros de calle no suelen cubrir el uso en circuito; revisa tu póliza o la que ofrezca el organizador.</li>
</ol>
<p>Si no quieres arriesgar tu coche, la alternativa es vivir el Jarama con un coche de competición preparado, con briefing, asistencia mecánica y acompañamiento de un equipo.</p>"""),
            ("Tandas con tu coche o experiencia con coche de competición", """
<p>Las tandas son ideales si ya tienes un coche preparado y experiencia. Una <strong>experiencia en el Circuito del Jarama</strong> como el DS Pilot Weekend – Circuit está pensada para vivirlo como un piloto más: paddock, briefing, coche de competición preparado por Deyscom y feedback entre tandas, sin preocuparte del desgaste ni de la mecánica.</p>"""),
            ("Cómo lo vivimos en Deyscom", """
<p>Nuestro taller está en Torrelaguna, a unos 40 minutos del Jarama. Llevamos años preparando coches de circuito y acompañando a pilotos en pista. Lo que más repetimos a quien rueda por primera vez: <strong>las primeras vueltas son para aprender, no para correr</strong>. La velocidad llega sola cuando las referencias están claras.</p>"""),
        ],
        faq=[
            ("¿Dónde está el Circuito del Jarama?", "En San Sebastián de los Reyes, al norte de Madrid. Lo gestiona el Real Automóvil Club de España (RACE)."),
            ("¿Cuánto mide el Circuito del Jarama?", "Su trazado actual mide unos 3.850 metros."),
            ("¿Se puede conducir en el Jarama con tu coche?", "Sí, en tandas o track days organizados por el circuito o por empresas y clubes, cumpliendo sus requisitos de seguridad y ruido."),
            ("¿Hay experiencias de conducción en el Jarama?", "Sí. Con el DS Pilot Weekend – Circuit de Deyscom Motorsport vives un fin de semana como piloto con un coche de competición preparado."),
        ],
        sources=[("Real Automóvil Club de España (RACE)", "https://www.race.es"), ("Circuito del Jarama · Wikipedia", "https://es.wikipedia.org/wiki/Circuito_del_Jarama")],
    ),
    dict(
        slug="blog-cuanto-cuesta-pintar-un-coche",
        title="Cuánto cuesta pintar un coche: factores que cambian el precio",
        h1="¿Cuánto cuesta <span class='pink'>pintar un coche</span>?",
        desc="De qué depende el precio de pintar un coche: tamaño, estado de la chapa, tipo de pintura, cambio de color, cabina de pintura y desmontaje. Cómo pedir un presupuesto fiable.",
        keywords="pintar coche precio, cuánto cuesta pintar un coche, pintar coche, cabina de pintura, taller pintura coches, taller de pintura Madrid",
        category="Pintura", author="nestor", editor="hector", date="2026-10-23", minutes=6,
        img="nissan-patrol-cabina-pintura-verde",
        tldr="El precio de <strong>pintar un coche</strong> depende sobre todo de <strong>cuánta preparación necesita la chapa</strong> (golpes, óxido, masillas), del <strong>tamaño</strong> del coche, del <strong>tipo de pintura</strong> (sólida, metalizada, perlada, mate), de si hay <strong>cambio de color</strong> (con interiores, marcos y vanos) y del nivel de <strong>desmontaje</strong>. La preparación suele llevar más horas que la propia aplicación. Un presupuesto fiable solo se puede dar viendo el coche.",
        sections=[
            ("¿De qué depende el precio de pintar un coche?", """
<ul>
<li><strong>Estado de la chapa:</strong> golpes, abolladuras, óxido o pintura anterior en mal estado multiplican las horas de preparación.</li>
<li><strong>Tamaño y forma:</strong> no es lo mismo un utilitario que un todoterreno o una furgoneta.</li>
<li><strong>Tipo de pintura:</strong> sólida, metalizada, perlada, tricapa o mate; cada una tiene materiales y procesos distintos.</li>
<li><strong>Cambio de color:</strong> si se cambia el color, para un acabado correcto hay que pintar vanos, marcos de puertas, interior del capó y del maletero.</li>
<li><strong>Desmontaje:</strong> desmontar molduras, gomas, faros y manetas da un acabado mucho más limpio que enmascarar.</li>
<li><strong>Acabado final:</strong> lijado y pulido del barniz para eliminar piel de naranja y motas.</li>
</ul>"""),
            ("¿Por qué la preparación es lo que más cuesta?", """
<p>La pintura solo es tan buena como la superficie sobre la que se aplica. Antes de pintar hay que <strong>reparar la chapa, tratar el óxido, aplicar aparejo, lijar por fases y desengrasar</strong>. Saltarse pasos se nota a los pocos meses: aparecen rechupados, burbujas o diferencias de tono. En nuestra experiencia, la mayor parte de las horas de un buen trabajo de pintura se van en esta fase.</p>"""),
            ("¿Qué aporta pintar en cabina de pintura?", """
<p>Una <strong>cabina de pintura</strong> controla el polvo, la temperatura y la extracción. Eso permite aplicar la pintura en un ambiente limpio, <strong>secarla al horno</strong> y conseguir un acabado más duradero y uniforme. Pintar sin cabina aumenta el riesgo de motas, escurridos y un curado deficiente. En Deyscom pintamos en cabina: puedes ver el proceso de un Nissan Patrol en nuestra página de <a href="pintura.html">pintura de coches</a>.</p>"""),
            ("Pintar el coche entero, una pieza o el chasis", """
<p>No siempre hace falta pintar todo. Las opciones más habituales son:</p>
<ol>
<li><strong>Pieza o zona:</strong> tras un golpe o arañazo, igualando el color con las piezas vecinas.</li>
<li><strong>Pintura completa del mismo color:</strong> para recuperar un coche con la pintura quemada o descascarillada.</li>
<li><strong>Cambio de color:</strong> el trabajo más completo si se quiere un acabado de calidad.</li>
<li><strong>Chasis y piezas sueltas:</strong> muy habitual en restauraciones y <a href="restomod.html">restomod</a>, y en coches de competición.</li>
</ol>"""),
            ("¿Un cambio de color hay que comunicarlo a Tráfico?", """
<p>El color figura en la documentación del vehículo, por lo que conviene consultar en la <a href="https://www.dgt.es" target="_blank" rel="noopener">DGT</a> o en tu estación de ITV cómo actualizarlo en tu caso, y avisar también a tu aseguradora. Si además del color hay otras modificaciones, puede tratarse de una reforma; lo explicamos en nuestra guía de <a href="blog-reformas-itv-y-vehiculos-historicos.html">reformas en la ITV y vehículos históricos</a>.</p>"""),
            ("Cómo pedir un presupuesto de pintura fiable", """
<p>Para valorar un trabajo de pintura necesitamos saber el modelo, el estado de la chapa (mejor con fotos con buena luz), el color y tipo de pintura que quieres y si buscas el mismo color o un cambio. Con eso te damos una primera orientación, y el presupuesto definitivo tras ver el coche en nuestro taller de Torrelaguna (Madrid). Pídelo desde la página de <a href="pintura.html#presupuesto">pintura</a> o por WhatsApp.</p>"""),
        ],
        faq=[
            ("¿Cuánto cuesta pintar un coche?", "Depende del estado de la chapa, el tamaño, el tipo de pintura, si hay cambio de color y del desmontaje. La preparación suele ser la parte que más horas lleva; un presupuesto fiable requiere ver el coche."),
            ("¿Cuánto se tarda en pintar un coche?", "Desde unos días para una pieza hasta varias semanas para una pintura completa con cambio de color y chapa, según el estado del coche."),
            ("¿Es mejor pintar en cabina?", "Sí. La cabina controla polvo y temperatura y permite secar al horno, lo que da un acabado más limpio y duradero."),
            ("¿Hacéis decoraciones de coches de rally?", "Sí. Pintamos decoraciones y colores especiales para coches de competición y clásicos."),
        ],
        sources=[("Dirección General de Tráfico (DGT)", "https://www.dgt.es")],
    ),
    dict(
        slug="blog-reformas-itv-y-vehiculos-historicos",
        title="Reformas en la ITV y vehículos históricos: guía práctica 2026",
        h1="Reformas en la ITV y <span class='pink'>vehículos históricos</span>",
        desc="Cómo legalizar reformas en la ITV según el Manual de Reformas de Vehículos y qué cambia con el Reglamento de Vehículos Históricos (Real Decreto 892/2024).",
        keywords="reformas itv, vehiculo historico, coche historico itv, homologar reformas, manual de reformas de vehículos, real decreto 892/2024, restomod itv",
        category="Restomod", author="nestor", editor="hector", date="2026-10-23", minutes=7,
        img="bmw-e30-restauracion-elevador-taller",
        tldr="En España, cualquier modificación que altere las características de un vehículo es una <strong>reforma</strong> y debe tramitarse según el <strong>Real Decreto 866/2010</strong> y el <strong>Manual de Reformas de Vehículos</strong>, normalmente con un informe de conformidad o proyecto técnico, un certificado de taller e inspección en la ITV. Para los clásicos, el <strong>Reglamento de Vehículos Históricos (Real Decreto 892/2024)</strong>, en vigor desde el 1 de octubre de 2024, fija como regla general una antigüedad mínima de <strong>30 años</strong> y que el vehículo conserve su configuración original.",
        sections=[
            ("¿Qué es una reforma de vehículo?", """
<p>Es cualquier cambio que modifique las características con las que se homologó el vehículo: suspensión, frenos, motor, neumáticos de otra medida, enganches, carrocería, número de plazas… La normativa base es el <a href="https://www.boe.es/eli/es/rd/2010/07/02/866" target="_blank" rel="noopener">Real Decreto 866/2010</a>, y el <a href="https://industria.gob.es" target="_blank" rel="noopener">Ministerio de Industria</a> publica el <strong>Manual de Reformas de Vehículos</strong>, que clasifica cada tipo de reforma y dice qué documentación necesita.</p>"""),
            ("¿Cómo se legaliza una reforma en la ITV?", """
<ol>
<li><strong>Identificar la reforma</strong> en el Manual de Reformas y su código.</li>
<li><strong>Documentación técnica:</strong> según el caso, informe de conformidad o proyecto técnico firmado por un técnico competente.</li>
<li><strong>Certificado de taller</strong> que ha realizado la instalación.</li>
<li><strong>Inspección en la ITV</strong>, que actualiza la tarjeta ITV con la reforma.</li>
</ol>
<p>Algunas modificaciones menores no requieren proyecto, pero sí inspección. Por eso conviene planificar la legalización <strong>antes</strong> de montar las piezas, no después.</p>"""),
            ("¿Qué es un vehículo histórico?", """
<p>Es un vehículo que, por su antigüedad y conservación, se considera parte del patrimonio automovilístico. El <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2024-18614" target="_blank" rel="noopener">Real Decreto 892/2024, Reglamento de Vehículos Históricos</a>, sustituye a la normativa anterior y está en vigor desde el 1 de octubre de 2024. Como regla general, exige una <strong>antigüedad mínima de 30 años</strong> y que el vehículo mantenga su <strong>configuración original</strong>, sin modificaciones sustanciales.</p>
<p>Los requisitos concretos, las excepciones y el procedimiento están en el texto del BOE; consúltalo o pregunta en tu ITV antes de iniciar el trámite.</p>"""),
            ("¿Restomod o vehículo histórico?", """
<p>Aquí está la gran decisión de muchos proyectos. Un <strong>restomod</strong> moderniza motor, frenos o suspensión, lo que normalmente implica <strong>reformas</strong> y puede chocar con la idea de configuración original que exige la condición de histórico. Una <strong>restauración fiel</strong>, en cambio, encaja mejor con la catalogación como histórico. Lee <a href="blog-que-es-un-restomod.html">qué es un restomod</a> y decide antes de empezar el proyecto; en Deyscom te ayudamos a plantearlo de forma que sea legalizable.</p>"""),
            ("Consejos para que la ITV no te frene el proyecto", """
<ul>
<li>Elige piezas con <strong>homologación o marcaje</strong> cuando existan.</li>
<li>Guarda <strong>facturas y certificados</strong> de todas las piezas montadas.</li>
<li>Haz las reformas que se tramitan juntas en <strong>un mismo expediente</strong> cuando sea posible.</li>
<li>Pregunta en tu estación de ITV antes de empezar: los criterios técnicos se aplican caso a caso.</li>
</ul>"""),
            ("Cómo lo hacemos en Deyscom", """
<p>En nuestros proyectos de <a href="restomod.html">restomod y restauración de coches clásicos</a> planificamos la legalización desde el principio, coordinamos con ingenieros y laboratorios cuando hace falta proyecto y emitimos el certificado de taller de lo que montamos en Torrelaguna.</p>"""),
        ],
        faq=[
            ("¿Qué es una reforma en la ITV?", "Una modificación que altera las características del vehículo y debe tramitarse según el Real Decreto 866/2010 y el Manual de Reformas de Vehículos, con inspección en la ITV."),
            ("¿Cuántos años tiene que tener un coche para ser histórico?", "Según el Real Decreto 892/2024, como regla general al menos 30 años, y debe conservar su configuración original."),
            ("¿Desde cuándo está en vigor el nuevo reglamento de históricos?", "El Real Decreto 892/2024 está en vigor desde el 1 de octubre de 2024."),
            ("¿Un restomod puede ser vehículo histórico?", "Es difícil si tiene modificaciones sustanciales, porque el reglamento exige configuración original. Lo normal es legalizarlo como reforma."),
        ],
        sources=[("BOE · Real Decreto 892/2024, Reglamento de Vehículos Históricos", "https://www.boe.es/buscar/act.php?id=BOE-A-2024-18614"),
                 ("BOE · Real Decreto 866/2010, tramitación de las reformas de vehículos", "https://www.boe.es/eli/es/rd/2010/07/02/866"),
                 ("Ministerio de Industria y Turismo · Manual de Reformas de Vehículos", "https://industria.gob.es")],
    ),
]
