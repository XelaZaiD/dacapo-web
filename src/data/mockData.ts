/**
 * ============================================================
 * ARCHIVO: src/data/mockData.ts
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Contiene TODOS los datos de prueba (simulados) de la aplicación.
 * Mientras no tengas Supabase configurado, la app usa estos datos
 * para mostrar la información en la página web.
 *
 * ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
 * - AppContext.tsx: lee estos datos y los distribuye a toda la app
 * - Todos los componentes reciben estos datos a través del contexto
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * - Cambia los textos dentro de las comillas para personalizar el contenido
 * - Para añadir un integrante, copia un objeto dentro del array
 *   y cambia sus valores
 * - Las fechas usan formato ISO: "AAAA-MM-DDTHH:MM:SS"
 * ============================================================
 */

// "export" significa que otros archivos pueden importar esta información
// "const" declara una variable que no cambia (es constante)

// ============================================================
// TIPO: Integrante del coro
// ============================================================
// Un "type" define la FORMA exacta que debe tener un objeto.
// Es como una plantilla que garantiza que todos los integrantes
// tengan las mismas propiedades.
export type Integrante = {
    id: string;              // Identificador único (no visible en la web)
    nombre: string;          // Nombre completo del integrante
    cuerda: 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo'; // Tipo de voz
    rangoVocal: string;      // Ej: "C4 - G5"
    foto: string;            // URL de la foto (imagen de perfil)
    biografia: string;       // Mini-biografía del integrante
    esDirectivo: boolean;    // ¿Es parte de la directiva?
    cargo?: string;          // Cargo si es directivo (opcional, por eso el "?")
};

// ============================================================
// TIPO: Partitura en la Biblioteca
// ============================================================
export type Partitura = {
    id: string;
    titulo: string;          // Nombre de la canción/obra
    compositor: string;      // Quién compuso la música
    arreglista?: string;     // Quién hizo el arreglo coral (opcional)
    cuerdas: string[];       // Qué cuerdas la cantan: ["Soprano", "Contralto", "Tenor", "Bajo"]
    dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
    estilo: string;          // Ej: "Barroco", "Contemporáneo", "Gospel"
    epoca: string;           // Ej: "Siglo XVII", "Contemporáneo"
    descripcion: string;
    urlPdf?: string;         // URL del archivo PDF (opcional hasta que tengas Storage)
    urlPortada?: string;     // URL de imagen de portada (opcional)
    fechaSubida: string;
};

// ============================================================
// TIPO: Evento / Concierto
// ============================================================
export type Evento = {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: string;           // Fecha en formato "AAAA-MM-DDTHH:MM:SS"
    lugar: string;
    direccion: string;
    tipoEntrada: 'Libre' | 'Con entrada' | 'Donación voluntaria';
    urlEntradas?: string;    // Link para comprar entradas (opcional)
    urlMapa?: string;        // Link de Google Maps (opcional)
    imagen?: string;
    activo: boolean;         // Si es false, no aparece en la web
};

// ============================================================
// DATOS: Chatbot y Asistente
// ============================================================
export type PistaAudio = {
    id: string;
    titulo: string;
    compositor: string;
    duracion: string;        // Formato "mm:ss"
    urlAudio: string;        // URL del archivo de audio
    portada?: string;
};

// ============================================================
// TIPO: Solicitud de Audición
// ============================================================
export type SolicitudAudicion = {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    tipoVoz: string;
    experiencia: string;
    urlAudioPrueba?: string;
    fechaEnvio: string;
    estado: 'Pendiente' | 'Revisada' | 'Aceptada' | 'Rechazada';
};

// ============================================================
// TIPO: Mensaje de Contacto
// ============================================================
export type MensajeContacto = {
    id: string;
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
    fechaEnvio: string;
    leido: boolean;
};

// ============================================================
// TIPO: Configuración de Secciones (qué secciones están activas)
// ============================================================
export type ConfiguracionSecciones = {
    mostrarAudiciones: boolean;
    mostrarEventos: boolean;
    mostrarDonaciones: boolean;
    mostrarBiblioteca: boolean;
    tipoAsistente: 'ninguno' | 'chatbot' | 'whatsapp';
    numeroWhatsapp: string;
};

// ============================================================
// TIPO: Información General del Grupo
// ============================================================
export type InfoGrupo = {
    nombre: string;
    subtitulo: string;
    descripcion: string;
    mision: string;
    vision: string;
    anioFundacion: number;
    totalConciertos: number;
    totalIntegrantes: number;
    totalPartituras: number;
    emailContacto: string;
    redesSociales: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
        tiktok?: string;
    };
};

// ============================================================
// DATOS DE EJEMPLO: Información del Grupo
// ============================================================
export const infoGrupoDefault: InfoGrupo = {
    nombre: 'DaCapo',
    subtitulo: 'Grupo Vocal',
    descripcion: 'DaCapo Grupo Vocal es un ensamble vocal dedicado a la excelencia artística y la exploración de los más diversos estilos musicales, desde el repertorio clásico hasta las más innovadoras propuestas contemporáneas.',
    mision: 'Difundir la música coral de alta calidad, formando puentes culturales y emocionando a cada audiencia con interpretaciones que trascienden el tiempo.',
    vision: 'Ser un referente de la música coral en nuestra región, reconocido por su excelencia interpretativa, su compromiso pedagógico y su capacidad de conectar emocionalmente con el público.',
    anioFundacion: 2019,
    totalConciertos: 48,
    totalIntegrantes: 24,
    totalPartituras: 120,
    emailContacto: 'dcgrupovocal@gmail.com',
    redesSociales: {
        instagram: 'https://www.instagram.com/dacapo_ve/',
        facebook: 'https://www.facebook.com/D.C.GrupoVocal.ve/',
        youtube: 'https://www.youtube.com/@dacapogrupovocal',
        tiktok: 'https://www.tiktok.com/@dacapo_ve',
    },
};

// ============================================================
// DATOS DE EJEMPLO: Integrantes del Coro
// ============================================================
// Formato: https://api.dicebear.com/7.x/avataaars/svg?seed=NOMBRE
// (Genera avatars únicos y gratuitos basados en el nombre)
export const integrantesDefault: Integrante[] = [
    // --- SOPRANOS ---
    {
        id: 'sop-001',
        nombre: 'María Alejandra Rodríguez',
        cuerda: 'Soprano',
        rangoVocal: 'C4 - G5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaAlejandra&backgroundColor=b6e3f4',
        biografia: 'Graduada con honores del Conservatorio Nacional. Solista invitada en más de 20 producciones nacionales. Su timbre cálido y su técnica impecable la convierten en uno de los pilares de la sección.',
        esDirectivo: false,
    },
    {
        id: 'sop-002',
        nombre: 'Valentina Castro Méndez',
        cuerda: 'Soprano',
        rangoVocal: 'D4 - A5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina&backgroundColor=ffdfbf',
        biografia: 'Con formación en canto lírico y popular, Valentina aporta una versatilidad única. Ha participado en festivales corales internacionales en Argentina y España.',
        esDirectivo: true,
        cargo: 'Presidenta',
    },
    {
        id: 'sop-003',
        nombre: 'Daniela Moreno Pérez',
        cuerda: 'Soprano',
        rangoVocal: 'B3 - F#5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniela&backgroundColor=c0aede',
        biografia: 'Docente de música y directora coral con 8 años de experiencia. Su formación pedagógica enriquece los ensayos con ejercicios técnicos innovadores.',
        esDirectivo: false,
    },
    // --- CONTRALTOS ---
    {
        id: 'con-001',
        nombre: 'Laura Sofía Gómez',
        cuerda: 'Contralto',
        rangoVocal: 'G3 - D5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LauraSofia&backgroundColor=d1d4f9',
        biografia: 'Su voz profunda y aterciopelada ha cautivado audiencias en más de 30 presentaciones. Especialista en repertorio renacentista y barroco.',
        esDirectivo: false,
    },
    {
        id: 'con-002',
        nombre: 'Ana Isabel Torres',
        cuerda: 'Contralto',
        rangoVocal: 'F3 - C5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaIsabel&backgroundColor=ffd5dc',
        biografia: 'Especialista en música latinoamericana y folclórica, Ana aporta una riqueza cultural invaluable al repertorio de DaCapo. Compositora y arreglista aficionada.',
        esDirectivo: true,
        cargo: 'Secretaria',
    },
    {
        id: 'con-003',
        nombre: 'Carmen Lucía Vargas',
        cuerda: 'Contralto',
        rangoVocal: 'A3 - E5',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarmenLucia&backgroundColor=b6e3f4',
        biografia: 'Con formación en teatro musical y ópera, Carmen lleva una expresividad escénica que eleva cada presentación. Miembro fundadora de DaCapo.',
        esDirectivo: false,
    },
    // --- TENORES ---
    {
        id: 'ten-001',
        nombre: 'Diego Alejandro Martínez',
        cuerda: 'Tenor',
        rangoVocal: 'C3 - A4',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiegoAlejandro&backgroundColor=ffdfbf',
        biografia: 'Tenor lírico con 12 años de trayectoria profesional. Ha cantado en las principales salas de concierto del país y es referente en el repertorio operático.',
        esDirectivo: false,
    },
    {
        id: 'ten-002',
        nombre: 'Carlos Eduardo López',
        cuerda: 'Tenor',
        rangoVocal: 'B2 - G4',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosEduardo&backgroundColor=c0aede',
        biografia: 'Director Musical de DaCapo. Graduado en Musicología con maestría en Dirección Coral. Su visión artística define la identidad sonora del grupo.',
        esDirectivo: true,
        cargo: 'Director Musical',
    },
    {
        id: 'ten-003',
        nombre: 'Andrés Felipe Ruiz',
        cuerda: 'Tenor',
        rangoVocal: 'C3 - F4',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AndresFelipe&backgroundColor=d1d4f9',
        biografia: 'Ingeniero de sonido y cantante. Su conocimiento técnico de la acústica aporta una perspectiva única en los ensayos y grabaciones del grupo.',
        esDirectivo: false,
    },
    // --- BAJOS ---
    {
        id: 'baj-001',
        nombre: 'Roberto Carlos Herrera',
        cuerda: 'Bajo',
        rangoVocal: 'E2 - D4',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertoCarlos&backgroundColor=ffd5dc',
        biografia: 'Su imponente voz grave es el cimiento sonoro de DaCapo. Concertista con experiencia en más de 15 países y referente del canto profundo en la región.',
        esDirectivo: false,
    },
    {
        id: 'baj-002',
        nombre: 'Manuel Jesús Sánchez',
        cuerda: 'Bajo',
        rangoVocal: 'C2 - B3',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ManuelJesus&backgroundColor=b6e3f4',
        biografia: 'Bilingüe (español-inglés), Manuel amplía el repertorio coral con obras anglosajonas y latinas. Apasionado por el jazz coral y el barbershop.',
        esDirectivo: true,
        cargo: 'Tesorero',
    },
    {
        id: 'baj-003',
        nombre: 'José Antonio Díaz',
        cuerda: 'Bajo',
        rangoVocal: 'D2 - C4',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JoseAntonio&backgroundColor=ffdfbf',
        biografia: 'Miembro fundador y uno de los pilares históricos del grupo. Con más de 20 años en distintos coros, aporta experiencia y sabiduría musical insustituibles.',
        esDirectivo: false,
    },
];

// ============================================================
// DATOS DE EJEMPLO: Partituras
// ============================================================
export const partiturasDefault: Partitura[] = [
    {
        id: 'par-001',
        titulo: 'Cantate Domino',
        compositor: 'Claudio Monteverdi',
        cuerdas: ['Soprano', 'Contralto', 'Tenor', 'Bajo'],
        dificultad: 'Intermedio',
        estilo: 'Barroco',
        epoca: 'Siglo XVII',
        descripcion: 'Motete a cuatro voces de uno de los maestros del período barroco. Requiere buena afinación y control del legato.',
        fechaSubida: '2024-01-15T10:00:00',
    },
    {
        id: 'par-002',
        titulo: 'Ave Verum Corpus',
        compositor: 'Wolfgang Amadeus Mozart',
        cuerdas: ['Soprano', 'Contralto', 'Tenor', 'Bajo'],
        dificultad: 'Básico',
        estilo: 'Clásico',
        epoca: 'Siglo XVIII',
        descripcion: 'Una de las obras corales más bellas del repertorio clásico. Perfecta para comenzar con Mozart.',
        fechaSubida: '2024-02-01T10:00:00',
    },
    {
        id: 'par-003',
        titulo: 'Hallelujah',
        compositor: 'George F. Händel',
        arreglista: 'Carlos López',
        cuerdas: ['Soprano', 'Contralto', 'Tenor', 'Bajo'],
        dificultad: 'Avanzado',
        estilo: 'Barroco',
        epoca: 'Siglo XVIII',
        descripcion: 'El icónico coro del Mesías. Arreglo especial con cadencias adicionales para conjuntos pequeños.',
        fechaSubida: '2024-03-10T10:00:00',
    },
    {
        id: 'par-004',
        titulo: 'Bésame Mucho',
        compositor: 'Consuelo Velázquez',
        arreglista: 'María Rodríguez',
        cuerdas: ['Soprano', 'Contralto'],
        dificultad: 'Básico',
        estilo: 'Popular Latinoamericano',
        epoca: 'Siglo XX',
        descripcion: 'Arreglo a dos voces femeninas de esta icónica canción del bolero latinoamericano.',
        fechaSubida: '2024-04-05T10:00:00',
    },
    {
        id: 'par-005',
        titulo: 'Gloria in Excelsis Deo',
        compositor: 'Antonio Vivaldi',
        cuerdas: ['Soprano', 'Contralto', 'Tenor', 'Bajo'],
        dificultad: 'Avanzado',
        estilo: 'Barroco',
        epoca: 'Siglo XVIII',
        descripcion: 'Movimiento del Gloria RV 589. Exige velocidad técnica y precisión rítmica en todas las cuerdas.',
        fechaSubida: '2024-05-20T10:00:00',
    },
    {
        id: 'par-006',
        titulo: 'Swing Low, Sweet Chariot',
        compositor: 'Tradicional (Espiritual Afroamericano)',
        arreglista: 'Andrés Ruiz',
        cuerdas: ['Tenor', 'Bajo'],
        dificultad: 'Básico',
        estilo: 'Gospel / Espiritual',
        epoca: 'Siglo XIX',
        descripcion: 'Arreglo a dos voces masculinas de este clásico espiritual. Énfasis en la expresividad y el ritmo.',
        fechaSubida: '2024-06-01T10:00:00',
    },
];

// ============================================================
// DATOS DE EJEMPLO: Eventos y Conciertos
// ============================================================
export const eventosDefault: Evento[] = [
    {
        id: 'evt-001',
        titulo: 'Noche de Boleros y Música Latinoamericana',
        descripcion: 'Una velada íntima donde DaCapo Grupo Vocal interpretará las joyas más preciadas del bolero latinoamericano. Un viaje musical por México, Cuba, Venezuela y Colombia.',
        fecha: '2025-09-15T19:30:00',
        lugar: 'Teatro Municipal',
        direccion: 'Calle Principal 123, Centro Histórico',
        tipoEntrada: 'Con entrada',
        urlEntradas: 'https://tickets.ejemplo.com/dacapo-boleros',
        urlMapa: 'https://maps.google.com',
        activo: true,
    },
    {
        id: 'evt-002',
        titulo: 'DaCapo en el Parque: Concierto al Aire Libre',
        descripcion: 'Concierto gratuito al aire libre en el Parque Central. ¡Trae una manta y disfruta de la música coral bajo las estrellas!',
        fecha: '2025-10-05T17:00:00',
        lugar: 'Parque Central',
        direccion: 'Parque Central, zona verde principal',
        tipoEntrada: 'Libre',
        urlMapa: 'https://maps.google.com',
        activo: true,
    },
    {
        id: 'evt-003',
        titulo: 'Concierto de Navidad: "Luz en la Oscuridad"',
        descripcion: 'El tradicional concierto navideño de DaCapo, con un programa que mezcla lo sacro con lo popular. Colaboración especial con la Orquesta de Cámara local.',
        fecha: '2025-12-20T20:00:00',
        lugar: 'Catedral Metropolitana',
        direccion: 'Plaza Mayor, frente a la alcaldía',
        tipoEntrada: 'Donación voluntaria',
        activo: true,
    },
];

// ============================================================
// DATOS DE EJEMPLO: Pistas de Audio
// ============================================================
// Nota: Usamos URLs de audio de ejemplo. En el proyecto real,
// estas serán URLs de archivos en Supabase Storage.
export const pistasAudioDefault: PistaAudio[] = [
    {
        id: 'pis-001',
        titulo: 'Ave Verum Corpus',
        compositor: 'W.A. Mozart',
        duracion: '3:24',
        // Audio de ejemplo gratuito (libres de derechos)
        urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        portada: 'https://api.dicebear.com/7.x/shapes/svg?seed=Mozart',
    },
    {
        id: 'pis-002',
        titulo: 'Cantate Domino',
        compositor: 'C. Monteverdi',
        duracion: '4:12',
        urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        portada: 'https://api.dicebear.com/7.x/shapes/svg?seed=Monteverdi',
    },
    {
        id: 'pis-003',
        titulo: 'Bésame Mucho',
        compositor: 'C. Velázquez',
        duracion: '3:45',
        urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        portada: 'https://api.dicebear.com/7.x/shapes/svg?seed=Besame',
    },
];

// ============================================================
// CONFIGURACIÓN DEFAULT DE SECCIONES
// ============================================================
export const configuracionSeccionesDefault: ConfiguracionSecciones = {
    mostrarAudiciones: true,
    mostrarEventos: true,
    mostrarDonaciones: true,
    mostrarBiblioteca: true,
    tipoAsistente: 'chatbot',
    numeroWhatsapp: '584241721311',
};

// ============================================================
// PREGUNTAS PREDEFINIDAS DEL CHATBOT
// ============================================================
export type EntradaChatbot = {
    pregunta: string;
    respuesta: string;
    categorias: string[];
};

export const respuestasChatbotDefault: EntradaChatbot[] = [
    {
        pregunta: '¿Cuándo son los ensayos?',
        respuesta: '🎵 Los ensayos de DaCapo Grupo Vocal son los martes y jueves de 7:00 PM a 9:30 PM, en la Sala de Música del Centro Cultural. ¡Todos somos muy puntuales! 😊',
        categorias: ['ensayos', 'horario', 'práctica', 'cuándo'],
    },
    {
        pregunta: '¿Cómo puedo audicionar?',
        respuesta: '🎤 ¡Nos encanta que quieras ser parte de DaCapo! El proceso es sencillo:\n1. Rellena el formulario en la sección "Únete a DaCapo"\n2. Adjunta un audio o video cantando (puede ser a capella)\n3. Te contactaremos en máximo 5 días hábiles para organizar la audición presencial\n¡El repertorio es variado y hay lugar para todas las voces! 🎶',
        categorias: ['audición', 'unirse', 'coro', 'cómo entrar'],
    },
    {
        pregunta: '¿Qué es un Soprano?',
        respuesta: '🎵 El Soprano es el tipo de voz femenina más aguda. Su rango habitual es de C4 (Do central) a G5 o incluso más arriba.\n\nEn un coro SATB (Soprano, Alto/Contralto, Tenor, Bajo), las Sopranos llevan generalmente la melodía principal.\n\nFamosas sopranos: María Callas, Renée Fleming, Anna Netrebko 🌟',
        categorias: ['soprano', 'voz', 'tipo de voz', 'qué es'],
    },
    {
        pregunta: '¿Qué significa DaCapo?',
        respuesta: '📖 "Da Capo" es una expresión italiana del lenguaje musical que significa literalmente "desde la cabeza" o "desde el principio". En una partitura, cuando ves "D.C." o "Da Capo", significa que debes repetir la pieza desde el inicio.\n\nPara nosotros representa nuestro compromiso de siempre comenzar con frescura, emoción y dedicación en cada presentación. ¡Es volver a empezar siempre con pasión! 🎼',
        categorias: ['dacapo', 'nombre', 'significado', 'qué significa'],
    },
    {
        pregunta: '¿Cuál es la diferencia entre Tenor y Bajo?',
        respuesta: '🎵 Ambas son voces masculinas, pero con rangos diferentes:\n\n**Tenor** 🔴: La voz masculina más aguda. Rango típico: C3 a C5. Suele llevar melodías brillantes y emocionantes.\n\n**Bajo** 🔵: La voz masculina más grave. Rango típico: E2 a E4. Es el cimiento armónico del coro, proporciona profundidad y estabilidad.\n\nTambién existe el **Barítono**, que está entre el Tenor y el Bajo.',
        categorias: ['tenor', 'bajo', 'voz masculina', 'diferencia'],
    },
    {
        pregunta: '¿Dónde puedo escuchar su música?',
        respuesta: '🎧 Puedes escucharnos en varias plataformas:\n\n🎵 Reproductor en esta misma página (botón flotante inferior)\n📺 Canal de YouTube: @dacapogrupovocal\n📱 Instagram: @dacapogrupovocal\n\nTambién revisa nuestra sección de Eventos para el próximo concierto en vivo. ¡Nada como escucharnos en persona! 🎶',
        categorias: ['escuchar', 'música', 'dónde', 'plataformas'],
    },
];
