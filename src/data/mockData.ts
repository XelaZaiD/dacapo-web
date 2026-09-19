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
    orden?: number;          // Control de exhibición (menor primero)
    anioIngreso?: number;    // Ej: 2019 → "Desde 2019" en las tarjetas
    urlInstagram?: string;   // Perfil de Instagram (opcional)
};

// Cuerdas vocales del coro (reutilizable para filtros y formularios)
export const CUERDAS_INTEGRANTE = ['Soprano', 'Contralto', 'Tenor', 'Bajo'] as const;

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
    tonalidad?: string;      // Ej: "Sol mayor", "Re menor"
    compas?: string;         // Ej: "4/4", "3/4", "6/8"
    paginas?: number;        // Número de páginas del PDF
    descripcion: string;
    urlPdf?: string;         // URL del archivo PDF (opcional hasta que tengas Storage)
    urlPortada?: string;     // URL de imagen de portada (opcional)
    descargable: boolean;    // Administrador activa/desactiva el botón "Descargar"
    activo: boolean;         // "Ocultar" temporalmente sin borrar (false = no aparece en la web)
    fechaSubida: string;
};

// Valores posibles y listas reutilizables de la Biblioteca de Partituras
export const CUERDAS_PARTITURA = ['Soprano', 'Contralto', 'Tenor', 'Bajo'] as const;
export const DIFICULTADES_PARTITURA = ['Básico', 'Intermedio', 'Avanzado'] as const;
export const ESTILOS_PARTITURA = [
    'Barroco',
    'Renacentista',
    'Clásico',
    'Romántico',
    'Gospel / Espiritual',
    'Contemporáneo',
    'Popular Latinoamericano',
    'Popular',
    'Folclórico',
    'Sacro / Litúrgico',
    'Jazz',
    'Otro',
];
export const EPOCAS_PARTITURA = [
    'Renacimiento',
    'Barroco',
    'Siglo XVIII',
    'Siglo XIX',
    'Siglo XX',
    'Contemporáneo',
];

// ============================================================
// TIPO: Configuración de vistas de la Biblioteca (persistida en Supabase)
// ============================================================
export type VistasBiblioteca = {
    grid: boolean;
    lista: boolean;
    shelf: boolean;
    mosaico: boolean;
};

export const vistasBibliotecaDefault: VistasBiblioteca = {
    grid: true,
    lista: true,
    shelf: true,
    mosaico: true,
};

// ============================================================
// TIPO: Configuración de vistas de Integrantes (persistida en Supabase)
// ============================================================
export type VistasIntegrantes = {
    grid: boolean;      // Tarjetas en columnas con filtros por cuerda
    satb: boolean;      // Paneles temáticos por cuerda (S/A/T/B)
    lista: boolean;     // Directorio/roster elegante estilo programa de concierto
    mosaico: boolean;   // Vitrina de fotos de altura variable
};

export const vistasIntegrantesDefault: VistasIntegrantes = {
    grid: true,
    satb: true,
    lista: true,
    mosaico: true,
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
// ESTADO INICIAL DE SECCIONES (sin datos en Supabase)
// ============================================================
// La fuente de verdad es la tabla `configuracion` (clave `config_secciones`).
// Este estado solo se usa como respaldo vacío mientras Supabase no responde.
export const configuracionSeccionesInicial: ConfiguracionSecciones = {
    mostrarAudiciones: false,
    mostrarEventos: false,
    mostrarDonaciones: false,
    mostrarBiblioteca: false,
    tipoAsistente: 'ninguno',
    numeroWhatsapp: '',
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
