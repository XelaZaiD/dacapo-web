/**
 * ============================================================
 * ARCHIVO: src/context/AppContext.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el "cerebro central" de la aplicación. Aquí guardamos TODA
 * la información que necesitan los componentes y la distribuimos
 * a través de un "Context" (contexto global).
 *
 * Piénsalo así: es como una tienda central donde todos los
 * empleados (componentes) pueden ir a buscar lo que necesitan.
 *
 * También maneja la PERSISTENCIA en LocalStorage, lo que significa
 * que los cambios hechos en el Admin se guardan en el navegador
 * y sobreviven aunque recarges la página.
 *
 * ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
 * - mockData.ts: obtiene los datos iniciales de aquí
 * - main.tsx: envuelve toda la app con este contexto
 * - Todos los componentes usan "useApp()" para leer los datos
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * - Normalmente NO necesitas editar este archivo
 * - Los datos iniciales se modifican en mockData.ts
 * ============================================================
 */

// "React" nos da las herramientas para crear componentes
import React, {
    createContext,    // Crea el "espacio" compartido entre componentes
    useContext,       // Hook para "suscribirse" y leer el contexto
    useState,         // Hook para guardar datos que pueden cambiar
    useEffect,        // Hook para ejecutar código cuando algo cambia
    ReactNode         // Tipo de TypeScript para "cualquier componente hijo"
} from 'react';

// Importamos todos los tipos y datos de ejemplo
import {
    Integrante,
    Partitura,
    Evento,
    PistaAudio,
    SolicitudAudicion,
    MensajeContacto,
    ConfiguracionSecciones,
    InfoGrupo,
    EntradaChatbot,
    integrantesDefault,
    partiturasDefault,
    eventosDefault,
    pistasAudioDefault,
    configuracionSeccionesDefault,
    infoGrupoDefault,
    respuestasChatbotDefault,
} from '../data/mockData';

// ============================================================
// TIPO: Define la "forma" del usuario logueado
// ============================================================
export type Usuario = {
    id: string;
    email: string;
    nombre: string;
    rol: 'admin' | 'user';           // 'admin' puede ver el panel de administración
};

// ============================================================
// TIPO: Define TODOS los datos y funciones del contexto
// ============================================================
// Este tipo es como un "menú" de todo lo que la app ofrece
type AppContextType = {
    // --- Datos ---
    infoGrupo: InfoGrupo;
    integrantes: Integrante[];
    partituras: Partitura[];
    eventos: Evento[];
    pistasAudio: PistaAudio[];
    solicitudesAudicion: SolicitudAudicion[];
    mensajesContacto: MensajeContacto[];
    configuracionSecciones: ConfiguracionSecciones;
    respuestasChatbot: EntradaChatbot[];

    // --- Usuario y Autenticación ---
    usuarioActual: Usuario | null;   // null = no hay nadie logueado
    estaLogueado: boolean;           // true si hay un usuario activo
    esAdmin: boolean;                // true si el usuario es administrador

    // --- Funciones de Autenticación ---
    iniciarSesion: (email: string, password: string) => Promise<boolean>;
    cerrarSesion: () => void;
    registrarUsuario: (email: string, password: string, nombre: string) => Promise<boolean>;

    // --- Modal de autenticación (login/registro) ---
    modalAuthAbierto: boolean;
    abrirModalAuth: () => void;
    cerrarModalAuth: () => void;

    // --- Funciones para Integrantes ---
    agregarIntegrante: (integrante: Omit<Integrante, 'id'>) => void;
    editarIntegrante: (id: string, datos: Partial<Integrante>) => void;
    eliminarIntegrante: (id: string) => void;

    // --- Funciones para Partituras ---
    agregarPartitura: (partitura: Omit<Partitura, 'id' | 'fechaSubida'>) => void;
    editarPartitura: (id: string, datos: Partial<Partitura>) => void;
    eliminarPartitura: (id: string) => void;

    // --- Funciones para Eventos ---
    agregarEvento: (evento: Omit<Evento, 'id'>) => void;
    editarEvento: (id: string, datos: Partial<Evento>) => void;
    eliminarEvento: (id: string) => void;

    // --- Funciones para Pistas de Audio ---
    agregarPista: (pista: Omit<PistaAudio, 'id'>) => void;
    eliminarPista: (id: string) => void;

    // --- Funciones para Info del Grupo ---
    actualizarInfoGrupo: (datos: Partial<InfoGrupo>) => void;

    // --- Funciones para Secciones (activar/desactivar) ---
    toggleSeccion: (seccion: keyof ConfiguracionSecciones) => void;

    // --- Funciones para Formularios Públicos ---
    enviarSolicitudAudicion: (datos: Omit<SolicitudAudicion, 'id' | 'fechaEnvio' | 'estado'>) => void;
    enviarMensajeContacto: (datos: Omit<MensajeContacto, 'id' | 'fechaEnvio' | 'leido'>) => void;

    // --- Funciones para el Admin (Buzón) ---
    marcarSolicitudRevisada: (id: string, estado: SolicitudAudicion['estado']) => void;
    marcarMensajeLeido: (id: string) => void;

    // --- Configuración del Asistente ---
    actualizarAsistente: (config: Partial<{ tipoAsistente: 'ninguno' | 'chatbot' | 'whatsapp'; numeroWhatsapp: string }>) => void;

    // --- Tema (Claro/Oscuro) ---
    modoOscuro: boolean;
    toggleModoOscuro: () => void;
};

// ============================================================
// CREAR EL CONTEXTO
// ============================================================
// Creamos el contexto. El "undefined as any" es solo para que
// TypeScript no se queje; el valor real se asigna en AppProvider.
const AppContext = createContext<AppContextType>(undefined as unknown as AppContextType);

// ============================================================
// HOOK PERSONALIZADO: useApp()
// ============================================================
// Este hook es lo que usan los componentes para acceder al contexto.
// En lugar de escribir useContext(AppContext) cada vez,
// simplemente escribimos useApp() y es más legible.
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
    const contexto = useContext(AppContext);
    // Si alguien usa useApp() fuera del Provider, lanzamos un error claro
    if (!contexto) {
        throw new Error('useApp() debe usarse dentro de <AppProvider>');
    }
    return contexto;
};

// ============================================================
// CLAVES DE LOCALSTORATE
// ============================================================
// Estas son las "etiquetas" con las que guardamos cada cosa
// en el LocalStorage del navegador.
const CLAVES_LS = {
    INFO_GRUPO: 'dacapo_info_grupo',
    INTEGRANTES: 'dacapo_integrantes',
    PARTITURAS: 'dacapo_partituras',
    EVENTOS: 'dacapo_eventos',
    PISTAS: 'dacapo_pistas_audio',
    SOLICITUDES: 'dacapo_solicitudes_audicion',
    MENSAJES: 'dacapo_mensajes_contacto',
    CONFIG_SECCIONES: 'dacapo_config_secciones',
    USUARIO: 'dacapo_usuario',
    MODO_OSCURO: 'dacapo_modo_oscuro',
    USUARIOS_REGISTRADOS: 'dacapo_usuarios_registrados',
    ASISTENTE: 'dacapo_config_asistente',
};

// ============================================================
// FUNCIÓN HELPER: Leer de LocalStorage con valor por defecto
// ============================================================
function leerDesdeLocalStorage<T>(clave: string, valorDefecto: T): T {
    try {
        const guardado = localStorage.getItem(clave);
        // Si existe algo guardado, lo convertimos de texto JSON a objeto JS
        return guardado ? JSON.parse(guardado) : valorDefecto;
    } catch {
        // Si hay algún error al leer, usamos el valor por defecto
        return valorDefecto;
    }
}

// ============================================================
// FUNCIÓN HELPER: Guardar en LocalStorage
// ============================================================
function guardarEnLocalStorage<T>(clave: string, valor: T): void {
    try {
        // Convertimos el objeto JS a texto JSON para guardarlo
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
        console.warn('No se pudo guardar en LocalStorage:', clave);
    }
}

// ============================================================
// CONFIGURACIÓN DEL ASISTENTE
// ============================================================
export const WHATSAPP_PHONE_NUMBER = '584241721311';

// ============================================================
// USUARIOS DE PRUEBA (en Fase 1 sin Supabase)
// ============================================================
const USUARIOS_PRUEBA = [
    {
        id: 'admin-001',
        email: 'admin@dacapo.com',
        password: 'admin123',
        nombre: 'Administrador',
        rol: 'admin' as const,
    },
    {
        id: 'user-001',
        email: 'usuario@dacapo.com',
        password: 'user123',
        nombre: 'Usuario DaCapo',
        rol: 'user' as const,
    },
];

// ============================================================
// COMPONENTE: AppProvider
// ============================================================
// Este componente "envuelve" toda la aplicación y provee
// el contexto a todos los componentes hijos.
// Props: { children } son los componentes que envuelve
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // --- ESTADO: Todo lo que puede cambiar y necesita re-pintar la UI ---
    // "useState" guarda un valor y provee una función para cambiarlo.
    // Sintaxis: const [valor, setValor] = useState(valorInicial)

    const [infoGrupo, setInfoGrupo] = useState<InfoGrupo>(() => {
        const stored = leerDesdeLocalStorage<InfoGrupo | null>(CLAVES_LS.INFO_GRUPO, null);
        if (!stored) return infoGrupoDefault;
        return {
            ...stored,
            emailContacto: infoGrupoDefault.emailContacto,
            redesSociales: infoGrupoDefault.redesSociales,
        };
    });

    const [integrantes, setIntegrantes] = useState<Integrante[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.INTEGRANTES, integrantesDefault)
    );

    const [partituras, setPartituras] = useState<Partitura[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.PARTITURAS, partiturasDefault)
    );

    const [eventos, setEventos] = useState<Evento[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.EVENTOS, eventosDefault)
    );

    const [pistasAudio, setPistasAudio] = useState<PistaAudio[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.PISTAS, pistasAudioDefault)
    );

    const [solicitudesAudicion, setSolicitudesAudicion] = useState<SolicitudAudicion[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.SOLICITUDES, [])
    );

    const [mensajesContacto, setMensajesContacto] = useState<MensajeContacto[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.MENSAJES, [])
    );

    const [configuracionSecciones, setConfiguracionSecciones] = useState<ConfiguracionSecciones>(() =>
        leerDesdeLocalStorage(CLAVES_LS.CONFIG_SECCIONES, configuracionSeccionesDefault)
    );

    const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(() =>
        leerDesdeLocalStorage(CLAVES_LS.USUARIO, null)
    );

    const [modoOscuro, setModoOscuro] = useState<boolean>(() =>
        leerDesdeLocalStorage(CLAVES_LS.MODO_OSCURO, true)
    );

    // Modal de autenticación: un solo estado global para que cualquier
    // botón de "Iniciar sesión" (Navbar, Biblioteca, etc.) abra el mismo modal
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
    const abrirModalAuth = () => setModalAuthAbierto(true);
    const cerrarModalAuth = () => setModalAuthAbierto(false);

    // ============================================================
    // EFECTOS: Se ejecutan cuando los datos cambian
    // ============================================================
    // "useEffect" ejecuta código cuando algo cambia.
    // El array al final "[valor]" indica QUÉ debe cambiar para que se ejecute.
    // Si el array está vacío "[]", se ejecuta solo una vez al cargar.

    // Aplica el modo oscuro al elemento <html> cuando cambia
    useEffect(() => {
        if (modoOscuro) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        guardarEnLocalStorage(CLAVES_LS.MODO_OSCURO, modoOscuro);
    }, [modoOscuro]); // Se ejecuta cada vez que "modoOscuro" cambia

    // Guarda los datos en LocalStorage cuando cambian
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.INFO_GRUPO, infoGrupo); }, [infoGrupo]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.INTEGRANTES, integrantes); }, [integrantes]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.PARTITURAS, partituras); }, [partituras]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.EVENTOS, eventos); }, [eventos]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.PISTAS, pistasAudio); }, [pistasAudio]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.SOLICITUDES, solicitudesAudicion); }, [solicitudesAudicion]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.MENSAJES, mensajesContacto); }, [mensajesContacto]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.CONFIG_SECCIONES, configuracionSecciones); }, [configuracionSecciones]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.USUARIO, usuarioActual); }, [usuarioActual]);

    // ============================================================
    // FUNCIONES DE AUTENTICACIÓN (simuladas en Fase 1)
    // ============================================================

    /**
     * Inicia sesión con email y contraseña.
     * En Fase 1: compara con la lista de usuarios de prueba.
     * En Fase 2: usará Supabase Auth (ver /services/supabase.ts)
     */
    const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
        // Buscar el usuario registrado con ese email
        const todosLosUsuarios = [
            ...USUARIOS_PRUEBA,
            ...leerDesdeLocalStorage<typeof USUARIOS_PRUEBA>(CLAVES_LS.USUARIOS_REGISTRADOS, [])
        ];

        const usuarioEncontrado = todosLosUsuarios.find(
            u => u.email === email && u.password === password
        );

        if (usuarioEncontrado) {
            // Si lo encontramos, guardamos el usuario logueado (sin la contraseña)
            const { password: _pass, ...usuarioSinPassword } = usuarioEncontrado;
            setUsuarioActual(usuarioSinPassword);
            return true; // Login exitoso
        }

        return false; // Login fallido
    };

    /**
     * Cierra la sesión del usuario actual
     */
    const cerrarSesion = () => {
        setUsuarioActual(null);
    };

    /**
     * Registra un nuevo usuario (solo rol 'user' por defecto)
     */
    const registrarUsuario = async (email: string, password: string, nombre: string): Promise<boolean> => {
        const usuariosRegistrados = leerDesdeLocalStorage<typeof USUARIOS_PRUEBA>(
            CLAVES_LS.USUARIOS_REGISTRADOS, []
        );

        // Verificar que el email no esté ya registrado
        const yaExiste = [...USUARIOS_PRUEBA, ...usuariosRegistrados].some(u => u.email === email);
        if (yaExiste) return false;

        const nuevoUsuario = {
            id: `user-${Date.now()}`,
            email,
            password,
            nombre,
            rol: 'user' as const,
        };

        const actualizados = [...usuariosRegistrados, nuevoUsuario];
        guardarEnLocalStorage(CLAVES_LS.USUARIOS_REGISTRADOS, actualizados);

        // Logueamos al usuario recién registrado automáticamente
        const { password: _pass, ...sinPassword } = nuevoUsuario;
        setUsuarioActual(sinPassword);
        return true;
    };

    // ============================================================
    // FUNCIONES CRUD: Integrantes
    // ============================================================

    const agregarIntegrante = (datos: Omit<Integrante, 'id'>) => {
        const nuevoIntegrante: Integrante = {
            ...datos,
            id: `int-${Date.now()}`, // ID único basado en el tiempo actual
        };
        setIntegrantes(prev => [...prev, nuevoIntegrante]);
    };

    const editarIntegrante = (id: string, datos: Partial<Integrante>) => {
        setIntegrantes(prev =>
            // "map" recorre el array y transforma cada elemento
            prev.map(integrante =>
                integrante.id === id
                    ? { ...integrante, ...datos } // Si es el que buscamos, actualiza los campos
                    : integrante                   // Si no, devuelve el mismo sin cambios
            )
        );
    };

    const eliminarIntegrante = (id: string) => {
        // "filter" devuelve un nuevo array sin el elemento eliminado
        setIntegrantes(prev => prev.filter(i => i.id !== id));
    };

    // ============================================================
    // FUNCIONES CRUD: Partituras
    // ============================================================

    const agregarPartitura = (datos: Omit<Partitura, 'id' | 'fechaSubida'>) => {
        const nuevaPartitura: Partitura = {
            ...datos,
            id: `par-${Date.now()}`,
            fechaSubida: new Date().toISOString(),
        };
        setPartituras(prev => [...prev, nuevaPartitura]);
    };

    const editarPartitura = (id: string, datos: Partial<Partitura>) => {
        setPartituras(prev =>
            prev.map(p => p.id === id ? { ...p, ...datos } : p)
        );
    };

    const eliminarPartitura = (id: string) => {
        setPartituras(prev => prev.filter(p => p.id !== id));
    };

    // ============================================================
    // FUNCIONES CRUD: Eventos
    // ============================================================

    const agregarEvento = (datos: Omit<Evento, 'id'>) => {
        const nuevoEvento: Evento = { ...datos, id: `evt-${Date.now()}` };
        setEventos(prev => [...prev, nuevoEvento]);
    };

    const editarEvento = (id: string, datos: Partial<Evento>) => {
        setEventos(prev => prev.map(e => e.id === id ? { ...e, ...datos } : e));
    };

    const eliminarEvento = (id: string) => {
        setEventos(prev => prev.filter(e => e.id !== id));
    };

    // ============================================================
    // FUNCIONES CRUD: Pistas de Audio
    // ============================================================

    const agregarPista = (datos: Omit<PistaAudio, 'id'>) => {
        const nuevaPista: PistaAudio = { ...datos, id: `pis-${Date.now()}` };
        setPistasAudio(prev => [...prev, nuevaPista]);
    };

    const eliminarPista = (id: string) => {
        setPistasAudio(prev => prev.filter(p => p.id !== id));
    };

    // ============================================================
    // OTRAS FUNCIONES
    // ============================================================

    const actualizarInfoGrupo = (datos: Partial<InfoGrupo>) => {
        setInfoGrupo(prev => ({ ...prev, ...datos }));
    };

    const toggleSeccion = (seccion: keyof ConfiguracionSecciones) => {
        setConfiguracionSecciones(prev => ({
            ...prev,
            [seccion]: !prev[seccion], // Invierte el valor booleano (true -> false, false -> true)
        }));
    };

    const enviarSolicitudAudicion = (datos: Omit<SolicitudAudicion, 'id' | 'fechaEnvio' | 'estado'>) => {
        const solicitud: SolicitudAudicion = {
            ...datos,
            id: `sol-${Date.now()}`,
            fechaEnvio: new Date().toISOString(),
            estado: 'Pendiente',
        };
        setSolicitudesAudicion(prev => [...prev, solicitud]);
    };

    const enviarMensajeContacto = (datos: Omit<MensajeContacto, 'id' | 'fechaEnvio' | 'leido'>) => {
        const mensaje: MensajeContacto = {
            ...datos,
            id: `msg-${Date.now()}`,
            fechaEnvio: new Date().toISOString(),
            leido: false,
        };
        setMensajesContacto(prev => [...prev, mensaje]);
    };

    const marcarSolicitudRevisada = (id: string, estado: SolicitudAudicion['estado']) => {
        setSolicitudesAudicion(prev =>
            prev.map(s => s.id === id ? { ...s, estado } : s)
        );
    };

    const marcarMensajeLeido = (id: string) => {
        setMensajesContacto(prev =>
            prev.map(m => m.id === id ? { ...m, leido: true } : m)
        );
    };

    const toggleModoOscuro = () => {
        setModoOscuro(prev => !prev);
    };

    const actualizarAsistente = (nuevasConfig: Partial<{ tipoAsistente: 'ninguno' | 'chatbot' | 'whatsapp'; numeroWhatsapp: string }>) => {
        setConfiguracionSecciones(prev => {
            const actualizado = { ...prev };
            if (nuevasConfig.tipoAsistente !== undefined) {
                actualizado.tipoAsistente = nuevasConfig.tipoAsistente;
                if (nuevasConfig.tipoAsistente === 'whatsapp' && !actualizado.numeroWhatsapp) {
                    actualizado.numeroWhatsapp = WHATSAPP_PHONE_NUMBER;
                }
            }
            if (nuevasConfig.numeroWhatsapp !== undefined) {
                actualizado.numeroWhatsapp = nuevasConfig.numeroWhatsapp;
            }
            return actualizado;
        });
    };

    // ============================================================
    // VALORES DERIVADOS
    // ============================================================
    // Estos se calculan automáticamente a partir del estado,
    // no necesitan estado propio.
    const estaLogueado = usuarioActual !== null;
    const esAdmin = usuarioActual?.rol === 'admin';

    // ============================================================
    // EL VALOR QUE PROVEEMOS AL CONTEXTO
    // ============================================================
    // Todo lo que ponemos aquí estará disponible para cualquier
    // componente que use useApp()
    const valorContexto: AppContextType = {
        infoGrupo,
        integrantes,
        partituras,
        eventos,
        pistasAudio,
        solicitudesAudicion,
        mensajesContacto,
        configuracionSecciones,
        respuestasChatbot: respuestasChatbotDefault,
        usuarioActual,
        estaLogueado,
        esAdmin,
        iniciarSesion,
        cerrarSesion,
        registrarUsuario,
        agregarIntegrante,
        editarIntegrante,
        eliminarIntegrante,
        agregarPartitura,
        editarPartitura,
        eliminarPartitura,
        agregarEvento,
        editarEvento,
        eliminarEvento,
        agregarPista,
        eliminarPista,
        actualizarInfoGrupo,
        toggleSeccion,
        enviarSolicitudAudicion,
        enviarMensajeContacto,
        marcarSolicitudRevisada,
        marcarMensajeLeido,
        actualizarAsistente,
        modoOscuro,
        toggleModoOscuro,
        modalAuthAbierto,
        abrirModalAuth,
        cerrarModalAuth,
    };

    // El "Provider" hace que el contexto esté disponible para todos
    // los componentes dentro de él (los "children")
    return (
        <AppContext.Provider value={valorContexto}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
