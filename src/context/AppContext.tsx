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
    useCallback,      // Hook para memorizar funciones (estables entre renders)
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
    VistasBiblioteca,
    VistasIntegrantes,
    VideoMedia,
    FotoGaleria,
    vistasBibliotecaDefault,
    vistasIntegrantesDefault,
    eventosDefault,
    configuracionSeccionesInicial,
    infoGrupoDefault,
    respuestasChatbotDefault,
} from '../data/mockData';
import {
    supabase,
    obtenerIntegrantesDB,
    agregarIntegranteDB,
    editarIntegranteDB,
    eliminarIntegranteDB,
    obtenerPistasDB,
    agregarPistaDB,
    editarPistaDB,
    eliminarPistaDB,
    obtenerPartiturasDB,
    agregarPartituraDB,
    editarPartituraDB,
    eliminarPartituraDB,
    eliminarArchivoStorageSupabase,
    obtenerConfiguracionDB,
    guardarConfiguracionDB,
    obtenerVideosDB,
    agregarVideoDB,
    editarVideoDB,
    eliminarVideoDB,
    obtenerFotosGaleriaDB,
    agregarFotoGaleriaDB,
    editarFotoGaleriaDB,
    eliminarFotoGaleriaDB,
} from '../services/supabase';

// ============================================================
// TIPO: Estado de carga de los datos que vienen de Supabase
// ============================================================
// 'cargando' → consulta en curso
// 'listo'    → el servicio respondió (con o sin datos)
// 'error'    → el servicio no respondió (falló la conexión)
export type EstadoCarga = 'cargando' | 'listo' | 'error';

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
    // Estado de la carga desde Supabase: 'cargando' | 'listo' | 'error'.
    // La app lo usa para mostrar estados amigables (cargando / sin datos / error).
    estadoPartituras: EstadoCarga;
    estadoPistas: EstadoCarga;
    estadoIntegrantes: EstadoCarga;
    reintentarIntegrantes: () => void;
    reintentarPartituras: () => void;
    solicitudesAudicion: SolicitudAudicion[];
    mensajesContacto: MensajeContacto[];
    videosMedia: VideoMedia[];
    fotosGaleria: FotoGaleria[];
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

    // --- Vistas de Integrantes (configuración pública desde Supabase) ---
    vistasIntegrantes: VistasIntegrantes;
    toggleVistaIntegrante: (vista: keyof VistasIntegrantes) => void;

    // --- Funciones para Partituras ---
    agregarPartitura: (partitura: Omit<Partitura, 'id' | 'fechaSubida'>) => void;
    editarPartitura: (id: string, datos: Partial<Partitura>) => void;
    eliminarPartitura: (id: string) => void;

    // --- Vistas de la Biblioteca (configuración pública desde Supabase) ---
    vistasBiblioteca: VistasBiblioteca;
    toggleVistaBiblioteca: (vista: keyof VistasBiblioteca) => void;

    // --- Funciones para Eventos ---
    agregarEvento: (evento: Omit<Evento, 'id'>) => void;
    editarEvento: (id: string, datos: Partial<Evento>) => void;
    eliminarEvento: (id: string) => void;

    // --- Funciones para Pistas de Audio ---
    agregarPista: (pista: Omit<PistaAudio, 'id'>) => void;
    editarPista: (id: string, datos: Partial<PistaAudio>) => void;
    eliminarPista: (id: string) => void;

    // --- Funciones para Videos y Fotos (Presentaciones & Media) ---
    agregarVideoMedia: (video: Omit<VideoMedia, 'id' | 'fechaSubida'>) => void;
    editarVideoMedia: (id: string, datos: Partial<VideoMedia>) => void;
    eliminarVideoMedia: (id: string) => void;
    agregarFotoGaleria: (foto: Omit<FotoGaleria, 'id' | 'fechaSubida'>) => void;
    editarFotoGaleria: (id: string, datos: Partial<FotoGaleria>) => void;
    eliminarFotoGaleria: (id: string) => void;

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
    VIDEOS_MEDIA: 'dacapo_videos_media',
    FOTOS_GALERIA: 'dacapo_fotos_galeria',
    CONFIG_SECCIONES: 'dacapo_config_secciones',
    USUARIO: 'dacapo_usuario',
    MODO_OSCURO: 'dacapo_modo_oscuro',
    USUARIOS_REGISTRADOS: 'dacapo_usuarios_registrados',
    ASISTENTE: 'dacapo_config_asistente',
    VISTAS_BIBLIOTECA: 'dacapo_vistas_biblioteca',
    CLAVE_CONFIG_VISTAS: 'vistas_biblioteca',
    CLAVE_CONFIG_SECCIONES: 'config_secciones',
    VISTAS_INTEGRANTES: 'dacapo_vistas_integrantes',
    CLAVE_CONFIG_VISTAS_INTEGRANTES: 'vistas_integrantes',
    CLAVE_CONFIG_INFO_GRUPO: 'info_general',
    CLAVE_CONFIG_BANNER: 'banner_frases',
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
        leerDesdeLocalStorage(CLAVES_LS.INTEGRANTES, [])
    );

    const [partituras, setPartituras] = useState<Partitura[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.PARTITURAS, [])
    );

    const [eventos, setEventos] = useState<Evento[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.EVENTOS, eventosDefault)
    );

    const [pistasAudio, setPistasAudio] = useState<PistaAudio[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.PISTAS, [])
    );

    // Estado de la última carga contra Supabase
    const [estadoPartituras, setEstadoPartituras] = useState<EstadoCarga>(() => (supabase ? 'cargando' : 'error'));
    const [estadoPistas, setEstadoPistas] = useState<EstadoCarga>(() => (supabase ? 'cargando' : 'error'));
    const [estadoIntegrantes, setEstadoIntegrantes] = useState<EstadoCarga>(() => (supabase ? 'cargando' : 'error'));

    const [solicitudesAudicion, setSolicitudesAudicion] = useState<SolicitudAudicion[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.SOLICITUDES, [])
    );

    const [mensajesContacto, setMensajesContacto] = useState<MensajeContacto[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.MENSAJES, [])
    );

    const [videosMedia, setVideosMedia] = useState<VideoMedia[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.VIDEOS_MEDIA, [])
    );

    const [fotosGaleria, setFotosGaleria] = useState<FotoGaleria[]>(() =>
        leerDesdeLocalStorage(CLAVES_LS.FOTOS_GALERIA, [])
    );

    const [configuracionSecciones, setConfiguracionSecciones] = useState<ConfiguracionSecciones>(() =>
        leerDesdeLocalStorage(CLAVES_LS.CONFIG_SECCIONES, configuracionSeccionesInicial)
    );

    // Vistas disponibles en la Biblioteca pública (Grid/Lista/Shelf/Mosaico).
    // El administrador puede activar/desactivarlas; se persiste en Supabase.
    const [vistasBiblioteca, setVistasBiblioteca] = useState<VistasBiblioteca>(() => {
        const guardadas = leerDesdeLocalStorage<VistasBiblioteca | null>(CLAVES_LS.VISTAS_BIBLIOTECA, null);
        if (guardadas) return { ...vistasBibliotecaDefault, ...guardadas };
        return vistasBibliotecaDefault;
    });

    // Vistas disponibles en la sección pública de Integrantes (Grid/SATB/Lista/Mosaico).
    // El administrador puede activar/desactivarlas; se persiste en Supabase.
    const [vistasIntegrantes, setVistasIntegrantes] = useState<VistasIntegrantes>(() => {
        const guardadas = leerDesdeLocalStorage<VistasIntegrantes | null>(CLAVES_LS.VISTAS_INTEGRANTES, null);
        if (guardadas) return { ...vistasIntegrantesDefault, ...guardadas };
        return vistasIntegrantesDefault;
    });

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
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.VIDEOS_MEDIA, videosMedia); }, [videosMedia]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.FOTOS_GALERIA, fotosGaleria); }, [fotosGaleria]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.CONFIG_SECCIONES, configuracionSecciones); }, [configuracionSecciones]);
    useEffect(() => { guardarEnLocalStorage(CLAVES_LS.USUARIO, usuarioActual); }, [usuarioActual]);

    // Carga las pistas de audio desde Supabase.
    // Si la consulta falla, conservamos lo guardado en el navegador (caché local).
    const cargarPistas = useCallback(() => {
        if (!supabase) {
            setEstadoPistas('error');
            return;
        }
        setEstadoPistas('cargando');
        obtenerPistasDB()
            .then(pistas => {
                // Respuesta exitosa: siempre sincronizamos (aunque venga vacía),
                // así se limpian los datos de ejemplo antiguos del navegador.
                setPistasAudio(pistas ?? []);
                setEstadoPistas('listo');
            })
            .catch(err => {
                console.warn('ℹ️ No se pudieron actualizar las pistas (se mantienen las guardadas):', err);
                setEstadoPistas('error');
            });
    }, []);

    // Carga las partituras desde Supabase.
    // Si la consulta falla, conservamos lo guardado en el navegador (caché local).
    const cargarPartituras = useCallback(() => {
        if (!supabase) {
            setEstadoPartituras('error');
            return;
        }
        setEstadoPartituras('cargando');
        obtenerPartiturasDB()
            .then(lista => {
                // Respuesta exitosa: siempre sincronizamos (aunque venga vacía)
                setPartituras(lista ?? []);
                setEstadoPartituras('listo');
            })
            .catch(err => {
                console.warn('ℹ️ No se pudieron actualizar las partituras (se mantienen las guardadas):', err);
                setEstadoPartituras('error');
            });
    }, []);

    // Carga los integrantes desde Supabase.
    // Si la consulta falla, conservamos lo guardado en el navegador (caché local).
    const cargarIntegrantes = useCallback(() => {
        if (!supabase) {
            setEstadoIntegrantes('error');
            return;
        }
        setEstadoIntegrantes('cargando');
        obtenerIntegrantesDB()
            .then(lista => {
                // Respuesta exitosa: siempre sincronizamos (aunque venga vacía),
                // así se limpian los datos de ejemplo antiguos del navegador.
                setIntegrantes(lista ?? []);
                setEstadoIntegrantes('listo');
            })
            .catch(err => {
                console.warn('ℹ️ No se pudieron actualizar los integrantes (se mantienen los guardados):', err);
                setEstadoIntegrantes('error');
            });
    }, []);

    // Carga los videos desde Supabase.
    // Si la consulta falla, conservamos lo guardado en el navegador (caché local).
    const cargarVideos = useCallback(() => {
        if (!supabase) return;
        obtenerVideosDB()
            .then(lista => {
                // Respuesta exitosa: siempre sincronizamos (aunque venga vacía)
                setVideosMedia(lista ?? []);
            })
            .catch(err => {
                console.warn('ℹ️ No se pudieron actualizar los videos (se mantienen los guardados):', err);
            });
    }, []);

    // Carga las fotos de galería desde Supabase.
    const cargarFotosGaleria = useCallback(() => {
        if (!supabase) return;
        obtenerFotosGaleriaDB()
            .then(lista => {
                // Respuesta exitosa: siempre sincronizamos (aunque venga vacía)
                setFotosGaleria(lista ?? []);
            })
            .catch(err => {
                console.warn('ℹ️ No se pudieron actualizar las fotos de galería (se mantienen las guardadas):', err);
            });
    }, []);

    // Al cargar la app: obtenemos partituras, pistas de audio, integrantes y vistas del Admin
    useEffect(() => {
        cargarPartituras();
        cargarPistas();
        cargarIntegrantes();
        cargarVideos();
        cargarFotosGaleria();

        if (supabase) {
            obtenerConfiguracionDB<VistasBiblioteca>(CLAVES_LS.CLAVE_CONFIG_VISTAS)
                .then(config => {
                    if (config) {
                        setVistasBiblioteca(prev => ({ ...prev, ...config }));
                        guardarEnLocalStorage(CLAVES_LS.VISTAS_BIBLIOTECA, { ...vistasBibliotecaDefault, ...config });
                    }
                })
                .catch(err => {
                    console.warn('ℹ️ Usando vistas locales (Supabase no disponible o error):', err);
                });

            obtenerConfiguracionDB<VistasIntegrantes>(CLAVES_LS.CLAVE_CONFIG_VISTAS_INTEGRANTES)
                .then(config => {
                    if (config) {
                        setVistasIntegrantes(prev => ({ ...prev, ...config }));
                        guardarEnLocalStorage(CLAVES_LS.VISTAS_INTEGRANTES, { ...vistasIntegrantesDefault, ...config });
                    }
                })
                .catch(err => {
                    console.warn('ℹ️ Usando vistas de integrantes locales (Supabase no disponible o error):', err);
                });

            obtenerConfiguracionDB<ConfiguracionSecciones>(CLAVES_LS.CLAVE_CONFIG_SECCIONES)
                .then(config => {
                    if (config) {
                        setConfiguracionSecciones({ ...configuracionSeccionesInicial, ...config });
                        guardarEnLocalStorage(CLAVES_LS.CONFIG_SECCIONES, { ...configuracionSeccionesInicial, ...config });
                    }
                })
                .catch(err => {
                    console.warn('ℹ️ Usando secciones locales (Supabase no disponible o error):', err);
                });

            obtenerConfiguracionDB<InfoGrupo>(CLAVES_LS.CLAVE_CONFIG_INFO_GRUPO)
                .then(datos => {
                    if (datos) {
                        // Combinamos con el default para no perder campos futuros
                        setInfoGrupo(prev => ({ ...prev, ...datos, redesSociales: { ...prev.redesSociales, ...(datos.redesSociales || {}) } }));
                        guardarEnLocalStorage(CLAVES_LS.INFO_GRUPO, datos);
                    }
                })
                .catch(err => {
                    console.warn('ℹ️ Usando información del grupo local (Supabase no disponible o error):', err);
                });

            obtenerConfiguracionDB<string[]>(CLAVES_LS.CLAVE_CONFIG_BANNER)
                .then(frases => {
                    if (Array.isArray(frases) && frases.length) {
                        setInfoGrupo(prev => ({ ...prev, frasesBanner: frases }));
                    }
                })
                .catch(err => {
                    console.warn('ℹ️ Usando frases del banner local (Supabase no disponible o error):', err);
                });
        }
    }, [cargarPartituras, cargarPistas, cargarIntegrantes, cargarVideos, cargarFotosGaleria]);

    // Reintentar manualmente la carga de integrantes (botón de los estados de error)
    const reintentarIntegrantes = () => {
        cargarIntegrantes();
    };

    // Reintentar manualmente la carga de partituras (botón de los estados de error)
    const reintentarPartituras = () => {
        cargarPartituras();
    };

    // ============================================================
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
        const idTemp = `int-${Date.now()}`;
        const nuevoIntegrante: Integrante = { ...datos, id: idTemp };
        setIntegrantes(prev => [...prev, nuevoIntegrante]);

        if (supabase) {
            agregarIntegranteDB(datos).then(integranteDB => {
                if (integranteDB) {
                    setIntegrantes(prev => prev.map(i => i.id === idTemp ? integranteDB : i));
                }
            }).catch(err => {
                console.warn('⚠️ No se pudo guardar el integrante en Supabase (se mantiene local):', err);
            });
        }
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

        if (supabase) {
            editarIntegranteDB(id, datos).catch(err => {
                console.warn('⚠️ No se pudo actualizar el integrante en Supabase (se mantiene local):', err);
            });
        }
    };

    const eliminarIntegrante = (id: string) => {
        const integrante = integrantes.find(i => i.id === id);
        // "filter" devuelve un nuevo array sin el elemento eliminado
        setIntegrantes(prev => prev.filter(i => i.id !== id));

        if (supabase && integrante) {
            eliminarIntegranteDB(id).catch(err => {
                console.warn('⚠️ No se pudo eliminar el integrante en Supabase:', err);
            });
            // Mejor esfuerzo: borrar también la foto del Storage si se subió ahí
            if (integrante.foto && integrante.foto.includes('/object/public/integrantes/')) {
                eliminarArchivoStorageSupabase('integrantes', integrante.foto);
            }
        }
    };

    // Activa/desactiva una vista de la sección Integrantes (Grid/SATB/Lista/Mosaico)
    const toggleVistaIntegrante = (vista: keyof VistasIntegrantes) => {
        const siguiente: VistasIntegrantes = { ...vistasIntegrantes, [vista]: !vistasIntegrantes[vista] };
        setVistasIntegrantes(siguiente);
        guardarEnLocalStorage(CLAVES_LS.VISTAS_INTEGRANTES, siguiente);
        if (supabase) {
            guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_VISTAS_INTEGRANTES, siguiente);
        }
    };

    // ============================================================
    // FUNCIONES CRUD: Partituras
    // ============================================================

    const agregarPartitura = (datos: Omit<Partitura, 'id' | 'fechaSubida'>) => {
        const idTemp = `par-${Date.now()}`;
        const nuevaPartitura: Partitura = {
            ...datos,
            id: idTemp,
            fechaSubida: new Date().toISOString(),
        };
        setPartituras(prev => [...prev, nuevaPartitura]);

        if (supabase) {
            agregarPartituraDB(datos).then(partituraDB => {
                if (partituraDB) {
                    setPartituras(prev => prev.map(p => p.id === idTemp ? partituraDB : p));
                }
            }).catch(err => {
                console.warn('⚠️ No se pudo guardar la partitura en Supabase (se mantiene local):', err);
            });
        }
    };

    const editarPartitura = (id: string, datos: Partial<Partitura>) => {
        setPartituras(prev =>
            prev.map(p => p.id === id ? { ...p, ...datos } : p)
        );

        if (supabase) {
            editarPartituraDB(id, datos).catch(err => {
                console.warn('⚠️ No se pudo actualizar la partitura en Supabase (se mantiene local):', err);
            });
        }
    };

    const eliminarPartitura = (id: string) => {
        const partitura = partituras.find(p => p.id === id);
        setPartituras(prev => prev.filter(p => p.id !== id));

        if (supabase && partitura) {
            // Borrado definitivo de la base de datos
            eliminarPartituraDB(id).catch(err => {
                console.warn('⚠️ No se pudo eliminar la partitura en Supabase:', err);
            });
            // Mejor esfuerzo: borrar también el PDF del Storage si se guardó ahí
            if (partitura.urlPdf) {
                eliminarArchivoStorageSupabase('partituras', partitura.urlPdf);
            }
            if (partitura.urlPortada && partitura.urlPortada.includes('/object/public/')) {
                eliminarArchivoStorageSupabase('partituras', partitura.urlPortada);
            }
        }
    };

    // Activa/desactiva una vista de la Biblioteca (Grid/Lista/Shelf/Mosaico)
    const toggleVistaBiblioteca = (vista: keyof VistasBiblioteca) => {
        const siguiente: VistasBiblioteca = { ...vistasBiblioteca, [vista]: !vistasBiblioteca[vista] };
        setVistasBiblioteca(siguiente);
        guardarEnLocalStorage(CLAVES_LS.VISTAS_BIBLIOTECA, siguiente);
        if (supabase) {
            guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_VISTAS, siguiente);
        }
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
        const idTemp = `pis-${Date.now()}`;
        const nuevaPista: PistaAudio = { ...datos, id: idTemp };
        setPistasAudio(prev => [...prev, nuevaPista]);

        if (supabase) {
            agregarPistaDB(datos).then(pistaDB => {
                if (pistaDB) {
                    setPistasAudio(prev => prev.map(p => p.id === idTemp ? pistaDB : p));
                }
            }).catch(err => {
                console.warn('⚠️ No se pudo guardar la pista en Supabase (se mantiene local):', err);
            });
        }
    };

    const editarPista = (id: string, datos: Partial<PistaAudio>) => {
        setPistasAudio(prev => prev.map(p => p.id === id ? { ...p, ...datos } : p));

        if (supabase) {
            editarPistaDB(id, datos).catch(err => {
                console.warn('⚠️ No se pudo actualizar la pista en Supabase (se mantiene local):', err);
            });
        }
    };

    const eliminarPista = (id: string) => {
        setPistasAudio(prev => prev.filter(p => p.id !== id));

        if (supabase) {
            eliminarPistaDB(id).catch(err => {
                console.warn('⚠️ No se pudo eliminar la pista en Supabase:', err);
            });
        }
    };

    // ============================================================
    // FUNCIONES CRUD: Videos y Fotos (Presentaciones & Media)
    // ============================================================

    const agregarVideoMedia = (datos: Omit<VideoMedia, 'id' | 'fechaSubida'>) => {
        const idTemp = `vid-${Date.now()}`;
        const nuevoVideo: VideoMedia = {
            ...datos,
            id: idTemp,
            fechaSubida: new Date().toISOString(),
        };
        setVideosMedia(prev => [...prev, nuevoVideo]);

        if (supabase) {
            agregarVideoDB(datos).then(videoDB => {
                if (videoDB) {
                    setVideosMedia(prev => prev.map(v => v.id === idTemp ? videoDB : v));
                }
            }).catch(err => {
                console.warn('⚠️ No se pudo guardar el video en Supabase (se mantiene local):', err);
            });
        }
    };

    const editarVideoMedia = (id: string, datos: Partial<VideoMedia>) => {
        setVideosMedia(prev => prev.map(v => v.id === id ? { ...v, ...datos } : v));

        if (supabase) {
            editarVideoDB(id, datos).catch(err => {
                console.warn('⚠️ No se pudo actualizar el video en Supabase (se mantiene local):', err);
            });
        }
    };

    const eliminarVideoMedia = (id: string) => {
        const video = videosMedia.find(v => v.id === id);
        setVideosMedia(prev => prev.filter(v => v.id !== id));

        if (supabase && video) {
            eliminarVideoDB(id).catch(err => {
                console.warn('⚠️ No se pudo eliminar el video en Supabase:', err);
            });
        }
    };

    const agregarFotoGaleria = (datos: Omit<FotoGaleria, 'id' | 'fechaSubida'>) => {
        const idTemp = `foto-${Date.now()}`;
        const nuevaFoto: FotoGaleria = {
            ...datos,
            id: idTemp,
            fechaSubida: new Date().toISOString(),
        };
        setFotosGaleria(prev => [...prev, nuevaFoto]);

        if (supabase) {
            agregarFotoGaleriaDB(datos).then(fotoDB => {
                if (fotoDB) {
                    setFotosGaleria(prev => prev.map(f => f.id === idTemp ? fotoDB : f));
                }
            }).catch(err => {
                console.warn('⚠️ No se pudo guardar la foto en Supabase (se mantiene local):', err);
            });
        }
    };

    const editarFotoGaleria = (id: string, datos: Partial<FotoGaleria>) => {
        setFotosGaleria(prev => prev.map(f => f.id === id ? { ...f, ...datos } : f));

        if (supabase) {
            editarFotoGaleriaDB(id, datos).catch(err => {
                console.warn('⚠️ No se pudo actualizar la foto en Supabase (se mantiene local):', err);
            });
        }
    };

    const eliminarFotoGaleria = (id: string) => {
        const foto = fotosGaleria.find(f => f.id === id);
        setFotosGaleria(prev => prev.filter(f => f.id !== id));

        if (supabase && foto) {
            eliminarFotoGaleriaDB(id).catch(err => {
                console.warn('⚠️ No se pudo eliminar la foto en Supabase:', err);
            });
        }
    };

    // ============================================================
    // OTRAS FUNCIONES
    // ============================================================

    const actualizarInfoGrupo = (datos: Partial<InfoGrupo>) => {
        const siguiente = { ...infoGrupo, ...datos };
        setInfoGrupo(siguiente);
        guardarEnLocalStorage(CLAVES_LS.INFO_GRUPO, siguiente);

        if (supabase) {
            guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_INFO_GRUPO, siguiente).catch(err => {
                console.warn('⚠️ No se pudo guardar la información del grupo en Supabase (se mantiene local):', err);
            });
            if (datos.frasesBanner) {
                guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_BANNER, datos.frasesBanner).catch(err => {
                    console.warn('⚠️ No se pudieron guardar las frases del banner en Supabase:', err);
                });
            }
        }
    };

    const toggleSeccion = (seccion: keyof ConfiguracionSecciones) => {
        const siguiente: ConfiguracionSecciones = {
            ...configuracionSecciones,
            [seccion]: !configuracionSecciones[seccion], // Invierte el valor booleano (true -> false, false -> true)
        };
        setConfiguracionSecciones(siguiente);
        if (supabase) {
            guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_SECCIONES, siguiente);
        }
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
        const siguiente: ConfiguracionSecciones = { ...configuracionSecciones };
        if (nuevasConfig.tipoAsistente !== undefined) {
            siguiente.tipoAsistente = nuevasConfig.tipoAsistente;
        }
        if (nuevasConfig.numeroWhatsapp !== undefined) {
            siguiente.numeroWhatsapp = nuevasConfig.numeroWhatsapp;
        }
        setConfiguracionSecciones(siguiente);
        if (supabase) {
            guardarConfiguracionDB(CLAVES_LS.CLAVE_CONFIG_SECCIONES, siguiente);
        }
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
        estadoPartituras,
        estadoPistas,
        estadoIntegrantes,
        reintentarIntegrantes,
        reintentarPartituras,
        solicitudesAudicion,
        mensajesContacto,
        videosMedia,
        fotosGaleria,
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
        vistasIntegrantes,
        toggleVistaIntegrante,
        agregarPartitura,
        editarPartitura,
        eliminarPartitura,
        vistasBiblioteca,
        toggleVistaBiblioteca,
        agregarEvento,
        editarEvento,
        eliminarEvento,
        agregarPista,
        editarPista,
        eliminarPista,
        agregarVideoMedia,
        editarVideoMedia,
        eliminarVideoMedia,
        agregarFotoGaleria,
        editarFotoGaleria,
        eliminarFotoGaleria,
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
