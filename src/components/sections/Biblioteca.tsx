/**
 * ============================================================
 * ARCHIVO: src/components/sections/Biblioteca.tsx
 * ============================================================
 * Zona privada de partituras PDF. Acceso solo para usuarios logueados.
 * Incluye:
 *  - Sección con scroll natural de la página (sin altura fija)
 *  - 4 vistas intercambiables: Cuadrícula, Lista, Estantería y Mosaico
 *    (las vistas se activan/desactivan desde el Admin y se guardan en Supabase)
 *  - Búsqueda, filtros (voz, dificultad, estilo, época) y orden
 *  - Estados amigables según el servicio: cargando, "aún no hay
 *    partituras", "error con reintentar" y aviso de caché
 *  - Ficha de detalle con visor PDF propio (react-pdf) y descarga condicional
 * ============================================================
 */

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Lock, Search, Filter, Download, Eye, X, Music2, List,
    LayoutGrid, Rows2, Grid3x3, ChevronRight, Loader2, WifiOff, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AvisoTemporal from '../ui/AvisoTemporal';
import { Partitura, VistasBiblioteca, DIFICULTADES_PARTITURA, ESTILOS_PARTITURA, EPOCAS_PARTITURA } from '../../data/mockData';

// Cargamos el visor PDF solo cuando el usuario lo necesita (reduce el bundle inicial)
const VisorPdf = lazy(() => import('../ui/VisorPdf'));

// Colores para los niveles de dificultad
const COLORES_DIFICULTAD: Record<string, string> = {
    'Básico': 'text-emerald-700 dark:text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'Intermedio': 'text-amber-700 dark:text-amber-400 bg-amber-400/10 border-amber-400/30',
    'Avanzado': 'text-red-600 dark:text-red-400 bg-red-400/10 border-red-400/30',
};

// Íconos para cuerdas en indicadores musicales
const ICONOS_CUERDA: Record<string, string> = {
    'Soprano': '𝄢 S',
    'Contralto': '𝄢 A',
    'Tenor': '𝄞 T',
    'Bajo': '𝄞 B',
};

type TipoVista = keyof VistasBiblioteca;

const VISTAS_ORDEN: TipoVista[] = ['grid', 'lista', 'shelf', 'mosaico'];

const INFO_VISTAS: Record<TipoVista, { etiqueta: string; icono: JSX.Element }> = {
    grid: { etiqueta: 'Cuadrícula', icono: <LayoutGrid className="w-4 h-4" /> },
    lista: { etiqueta: 'Lista', icono: <List className="w-4 h-4" /> },
    shelf: { etiqueta: 'Estantería', icono: <Rows2 className="w-4 h-4" /> },
    mosaico: { etiqueta: 'Mosaico', icono: <Grid3x3 className="w-4 h-4" /> },
};

// ============================================================
// COMPONENTE: Portada de partitura (imagen o portada CSS generada)
// ============================================================
const PortadaPartitura = ({ partitura, claseImagen, mostrarDificultad = false }: {
    partitura: Partitura;
    claseImagen: string;
    mostrarDificultad?: boolean;
}) => (
    <div className={`relative w-full overflow-hidden ${claseImagen}`}>
        {partitura.urlPortada ? (
            <img
                src={partitura.urlPortada}
                alt={partitura.titulo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-vinotinto/60 via-fondo-medio to-khaki/60 dark:from-vinotinto/40 dark:via-fondo-medio dark:to-khaki/40
                        flex items-center justify-center">
                <span className="text-5xl sm:text-6xl font-display text-white/90 dark:text-khaki/80 drop-shadow-lg">
                    𝄞
                </span>
            </div>
        )}
        {/* Velo inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Chips de cuerdas */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {partitura.cuerdas.map(cuerda => (
                <span key={cuerda} className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white/90 border border-white/20">
                    {ICONOS_CUERDA[cuerda] || cuerda}
                </span>
            ))}
        </div>
        {mostrarDificultad && (
            <span className={`absolute top-2 right-2 badge border text-[10px] ${COLORES_DIFICULTAD[partitura.dificultad]}`}>
                {partitura.dificultad}
            </span>
        )}
    </div>
);

// ============================================================
// COMPONENTE: Tarjeta (para cuadrícula y mosaico)
// ============================================================
const TarjetaPartitura = ({ partitura, alVerDetalle, claseImagen }: {
    partitura: Partitura;
    alVerDetalle: () => void;
    claseImagen: string;
}) => (
    <motion.div
        className="card-glass rounded-xl group cursor-pointer border borde-subtle
               hover:border-vinotinto/40 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
        onClick={alVerDetalle}
        whileHover={{ y: -3 }}
    >
        <PortadaPartitura partitura={partitura} claseImagen={claseImagen} mostrarDificultad />

        {/* Cuerpo */}
        <div className="p-4 flex flex-col flex-1">
            <h4 className="font-semibold text-secundario text-sm line-clamp-2 group-hover:text-vinotinto-claro
                       transition-colors duration-300 mb-0.5">
                {partitura.titulo}
            </h4>
            <p className="text-xs t-muted mb-2">{partitura.compositor}</p>
            <div className="flex items-center gap-1.5 text-[11px] t-muted-low mb-3 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-sutil t-muted border borde-subtle">{partitura.estilo}</span>
                {partitura.tonalidad && <span className="px-2 py-0.5 rounded-full bg-sutil t-muted border borde-subtle">{partitura.tonalidad}</span>}
            </div>

            {/* Pie */}
            <div className="mt-auto pt-3 border-t borde-subtle flex items-center justify-between">
                <span className="text-xs text-vinotinto-claro font-medium flex items-center gap-1">
                    Ver detalles <ChevronRight className="w-3 h-3" />
                </span>
                {partitura.descargable && partitura.urlPdf && (
                    <span className="text-vinotinto-claro opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-3.5 h-3.5" />
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

// ============================================================
// COMPONENTE: Fila compacta (vista Lista)
// ============================================================
const FilaPartitura = ({ partitura, alVerDetalle }: {
    partitura: Partitura;
    alVerDetalle: () => void;
}) => (
    <motion.button
        className="w-full text-left card-glass rounded-xl p-3.5 flex items-center gap-4 group cursor-pointer
               border borde-subtle hover:border-vinotinto/40 hover:shadow-card-hover transition-all duration-300"
        onClick={alVerDetalle}
        whileHover={{ x: 3 }}
    >
        {partitura.urlPortada ? (
            <img src={partitura.urlPortada} alt={partitura.titulo} loading="lazy"
                className="w-11 h-14 rounded-lg object-cover bg-fondo-medio flex-shrink-0 border border-black/10 dark:border-white/10" />
        ) : (
            <div className="w-11 h-14 rounded-lg bg-gradient-to-br from-vinotinto/40 to-khaki/40 flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/10">
                <span className="text-xl text-secundario">𝄞</span>
            </div>
        )}

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-secundario text-sm truncate group-hover:text-vinotinto-claro transition-colors">
                    {partitura.titulo}
                </p>
                <span className={`badge border text-[10px] !px-2 ${COLORES_DIFICULTAD[partitura.dificultad]}`}>
                    {partitura.dificultad}
                </span>
            </div>
            <p className="text-xs t-muted truncate mt-0.5">
                {partitura.compositor}
                {partitura.arreglista ? ` · Arr: ${partitura.arreglista}` : ''}
                {partitura.tonalidad ? ` · ${partitura.tonalidad}` : ''}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {partitura.cuerdas.map(c => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full bg-sutil t-muted border borde-subtle">
                        {ICONOS_CUERDA[c] || c}
                    </span>
                ))}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sutil t-muted border borde-subtle">{partitura.estilo}</span>
                {partitura.paginas !== undefined && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sutil t-muted border borde-subtle font-mono">
                        {partitura.paginas} pág.
                    </span>
                )}
            </div>
        </div>

        <ChevronRight className="w-4 h-4 text-vinotinto-claro flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </motion.button>
);

// ============================================================
// COMPONENTE: Tarjeta de estantería (vista Shelf, horizontal)
// ============================================================
const TarjetaEstante = ({ partitura, alVerDetalle }: {
    partitura: Partitura;
    alVerDetalle: () => void;
}) => (
    <motion.div
        className="card-glass rounded-xl group cursor-pointer border borde-subtle
               hover:border-vinotinto/40 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex-shrink-0 w-40 sm:w-44 flex flex-col"
        onClick={alVerDetalle}
        whileHover={{ y: -4 }}
    >
        <PortadaPartitura partitura={partitura} claseImagen="aspect-[3/4]" mostrarDificultad />
        <div className="p-3">
            <h4 className="font-semibold text-secundario text-xs leading-snug line-clamp-2 group-hover:text-vinotinto-claro transition-colors">
                {partitura.titulo}
            </h4>
            <p className="text-[11px] t-muted truncate mt-0.5">{partitura.compositor}</p>
        </div>
    </motion.div>
);

// ============================================================
// COMPONENTE: Modal de detalle de partitura
// ============================================================
const ModalPartitura = ({ partitura, alCerrar, alPrevisualizar }: {
    partitura: Partitura;
    alCerrar: () => void;
    alPrevisualizar: () => void;
}) => createPortal(
    <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={alCerrar}
    >
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />
        <motion.div
            className="relative card-modal max-w-lg w-full p-8 z-10"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
        >
            <button onClick={alCerrar} className="absolute top-4 right-4 btn-ghost">
                <X className="w-5 h-5" />
            </button>

            {/* Encabezado */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-vinotinto/20 border border-vinotinto/30
                          flex items-center justify-center text-2xl font-display text-vinotinto-claro">
                        𝄞
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold text-secundario">{partitura.titulo}</h3>
                        <p className="t-muted text-sm">{partitura.compositor}</p>
                        {partitura.arreglista && (
                            <p className="t-muted text-xs">Arreglo: {partitura.arreglista}</p>
                        )}
                    </div>
                </div>

                {/* Metadatos */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-sutil rounded-lg p-3">
                        <p className="text-xs t-muted mb-1">Estilo</p>
                        <p className="text-sm t-muted-high">{partitura.estilo}</p>
                    </div>
                    <div className="bg-sutil rounded-lg p-3">
                        <p className="text-xs t-muted mb-1">Época</p>
                        <p className="text-sm t-muted-high">{partitura.epoca}</p>
                    </div>
                    {partitura.tonalidad && (
                        <div className="bg-sutil rounded-lg p-3">
                            <p className="text-xs t-muted mb-1">Tonalidad</p>
                            <p className="text-sm t-muted-high">{partitura.tonalidad}</p>
                        </div>
                    )}
                    <div className="bg-sutil rounded-lg p-3">
                        <p className="text-xs t-muted mb-1">Dificultad</p>
                        <span className={`badge border text-xs ${COLORES_DIFICULTAD[partitura.dificultad]}`}>
                            {partitura.dificultad}
                        </span>
                    </div>
                    {partitura.compas && (
                        <div className="bg-sutil rounded-lg p-3">
                            <p className="text-xs t-muted mb-1">Compás</p>
                            <p className="text-sm t-muted-high">{partitura.compas}</p>
                        </div>
                    )}
                    {partitura.paginas !== undefined && (
                        <div className="bg-sutil rounded-lg p-3">
                            <p className="text-xs t-muted mb-1">Páginas</p>
                            <p className="text-sm t-muted-high">{partitura.paginas} pág.</p>
                        </div>
                    )}
                </div>

                {/* Cuerdas */}
                <div className="mb-4">
                    <p className="text-xs t-muted mb-2">Voces:</p>
                    <div className="flex flex-wrap gap-2">
                        {partitura.cuerdas.map(cuerda => (
                            <span key={cuerda} className="badge badge-vinotinto text-xs">
                                {ICONOS_CUERDA[cuerda] || cuerda}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Descripción */}
                <div className="linea-decorativa mb-4" />
                <p className="t-muted-high text-sm leading-relaxed mb-6">{partitura.descripcion}</p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 flex-col sm:flex-row">
                {partitura.urlPdf ? (
                    <>
                        <button onClick={alPrevisualizar} className="btn-primario flex-1 justify-center text-sm">
                            <Eye className="w-4 h-4" />
                            Previsualizar
                        </button>
                        {partitura.descargable && (
                            <a href={partitura.urlPdf} download className="btn-secundario flex-1 justify-center text-sm">
                                <Download className="w-4 h-4" />
                                Descargar
                            </a>
                        )}
                    </>
                ) : (
                    <p className="t-muted text-sm">PDF no disponible aún</p>
                )}
            </div>
            {partitura.urlPdf && !partitura.descargable && (
                <p className="text-[11px] t-muted mt-3 text-center">
                    ⚠️ El administrador no ha habilitado la descarga de esta partitura.
                </p>
            )}
        </motion.div>
    </motion.div>,
    document.body
);

// ============================================================
// COMPONENTE PRINCIPAL: SeccionBiblioteca
// ============================================================
const SeccionBiblioteca = () => {
    const { partituras, configuracionSecciones, vistasBiblioteca, estaLogueado, abrirModalAuth, estadoPartituras, reintentarPartituras } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const [busqueda, setBusqueda] = useState('');
    const [filtroVoz, setFiltroVoz] = useState('Todas');
    const [filtroDificultad, setFiltroDificultad] = useState('Todas');
    const [filtroEstilo, setFiltroEstilo] = useState('Todos');
    const [filtroEpoca, setFiltroEpoca] = useState('Todas');
    const [orden, setOrden] = useState<'recientes' | 'titulo' | 'dificultad'>('recientes');
    const [filtrosMovilAbiertos, setFiltrosMovilAbiertos] = useState(false);
    const [vistaActual, setVistaActual] = useState<TipoVista>(() => {
        const guardada = localStorage.getItem('dacapo_vista_biblioteca_usuario') as TipoVista | null;
        return guardada && VISTAS_ORDEN.includes(guardada) ? guardada : 'grid';
    });
    const [partituraSeleccionada, setPartituraSeleccionada] = useState<Partitura | null>(null);
    const [partituraVisor, setPartituraVisor] = useState<Partitura | null>(null);

    // Persistir la vista elegida por el visitante en su navegador
    useEffect(() => {
        localStorage.setItem('dacapo_vista_biblioteca_usuario', vistaActual);
    }, [vistaActual]);

    // La vista efectiva respeta las habilitadas por el admin (guarda: cuadrícula)
    const primeraVistaDisponible: TipoVista = VISTAS_ORDEN.find(v => vistasBiblioteca[v]) ?? 'grid';
    const vistaEfectiva: TipoVista = vistasBiblioteca[vistaActual] ? vistaActual : primeraVistaDisponible;
    const vistasHabilitadas = VISTAS_ORDEN.filter(v => vistasBiblioteca[v]);

    // true = el servicio falló pero hay datos guardados en el navegador (caché)
    const usandoCachePartituras = estadoPartituras === 'error' && partituras.length > 0;

    // No mostramos si está desactivada desde el Admin
    if (!configuracionSecciones.mostrarBiblioteca) return null;

    // Solo mostramos partituras activas (no ocultas)
    const partiturasVisibles = partituras.filter(p => p.activo !== false);

    // Filtra partituras según búsqueda y filtros activos
    const partiturasFiltradas = partiturasVisibles.filter(p => {
        const coincideBusqueda =
            p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.compositor.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.estilo.toLowerCase().includes(busqueda.toLowerCase());

        const coincideVoz = filtroVoz === 'Todas' || p.cuerdas.includes(filtroVoz);
        const coincideDificultad = filtroDificultad === 'Todas' || p.dificultad === filtroDificultad;
        const coincideEstilo = filtroEstilo === 'Todos' || p.estilo === filtroEstilo;
        const coincideEpoca = filtroEpoca === 'Todas' || p.epoca === filtroEpoca;

        return coincideBusqueda && coincideVoz && coincideDificultad && coincideEstilo && coincideEpoca;
    }).sort((a, b) => {
        if (orden === 'titulo') return a.titulo.localeCompare(b.titulo);
        if (orden === 'dificultad') {
            const peso: Record<string, number> = { 'Básico': 1, 'Intermedio': 2, 'Avanzado': 3 };
            return (peso[a.dificultad] || 0) - (peso[b.dificultad] || 0);
        }
        return new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime();
    });

    // Altura determinística por partitura para el mosaico
    const alturaMosaica = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 100;
        if (hash < 34) return 'h-44 sm:h-52';
        if (hash < 67) return 'h-52 sm:h-64';
        return 'h-36 sm:h-44';
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroVoz('Todas');
        setFiltroDificultad('Todas');
        setFiltroEstilo('Todos');
        setFiltroEpoca('Todas');
        setOrden('recientes');
    };
    const hayFiltrosActivos = busqueda !== '' || filtroVoz !== 'Todas' || filtroDificultad !== 'Todas'
        || filtroEstilo !== 'Todos' || filtroEpoca !== 'Todas' || orden !== 'recientes';

    // Cada select recibe la clase según dónde se renderice:
    // - Móvil (panel 2x2): "input-campo" (ocupa todo el ancho de su celda)
    // - Escritorio (barra compacta): "select-campo" (ancho según su contenido)
    const filtrosSelects = (clase: string) => (
        <>
            <select value={filtroDificultad} onChange={e => setFiltroDificultad(e.target.value)} className={`${clase} cursor-pointer`}>
                <option value="Todas">Todas las dificultades</option>
                {DIFICULTADES_PARTITURA.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={filtroEstilo} onChange={e => setFiltroEstilo(e.target.value)} className={`${clase} cursor-pointer`}>
                <option value="Todos">Todos los estilos</option>
                {ESTILOS_PARTITURA.map(e => <option key={e}>{e}</option>)}
            </select>
            <select value={filtroEpoca} onChange={e => setFiltroEpoca(e.target.value)} className={`${clase} cursor-pointer`}>
                <option value="Todas">Todas las épocas</option>
                {EPOCAS_PARTITURA.map(ep => <option key={ep}>{ep}</option>)}
            </select>
            <select value={orden} onChange={e => setOrden(e.target.value as typeof orden)} className={`${clase} cursor-pointer`}>
                <option value="recientes">Más recientes</option>
                <option value="titulo">Título (A-Z)</option>
                <option value="dificultad">Por dificultad</option>
            </select>
        </>
    );

    return (
        <section id="biblioteca" className="bg-fondo-oscuro py-24">
            <div className="contenedor w-full flex flex-col" ref={ref}>

                {/* Encabezado */}
                <motion.div
                    className="text-center mb-6 lg:mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <span className="badge-khaki mb-3 inline-flex">
                        <BookOpen className="w-3 h-3" />
                        Zona Exclusiva
                    </span>
                    <h2 className="titulo-seccion !text-3xl md:!text-4xl mb-3">Biblioteca de Partituras</h2>
                    <div className="linea-decorativa mx-auto mb-4" />
                    <p className="t-muted max-w-2xl mx-auto text-sm lg:text-base">
                        Acceso exclusivo a nuestro repertorio coral. Estudia y prepara las partituras del grupo.
                    </p>
                </motion.div>

                {/* Si NO está logueado, mostrar pantalla de acceso restringido */}
                {!estaLogueado ? (
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    >
                        <div className="max-w-md text-center py-10">
                            <div className="w-20 h-20 rounded-full bg-vinotinto/20 border border-vinotinto/30
                                flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-10 h-10 text-vinotinto-claro" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-secundario mb-4">
                                Área Restringida
                            </h3>
                            <p className="t-muted mb-8 leading-relaxed">
                                La biblioteca de partituras es exclusiva para integrantes y colaboradores de DaCapo.
                                Inicia sesión o regístrate para acceder.
                            </p>
                            <button onClick={abrirModalAuth} className="btn-primario mx-auto">
                                <Lock className="w-4 h-4" />
                                Iniciar Sesión para Acceder
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // Si SÍ está logueado, mostrar la biblioteca completa
                    <div className="flex flex-col">

                        {/* Barra de herramientas: búsqueda + vistas */}
                        <div className="space-y-3 mb-5">
                            {/* Fila 1: buscador + vistas */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 t-muted" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por título, compositor, estilo..."
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        className="input-campo pl-10"
                                    />
                                </div>

                                {/* Botón filtros (móvil) */}
                                <button
                                    onClick={() => setFiltrosMovilAbiertos(p => !p)}
                                    className={`lg:hidden btn-secundario py-2.5 px-3 text-sm shrink-0`}
                                    title="Más filtros"
                                >
                                    <Filter className={`w-4 h-4 ${filtrosMovilAbiertos ? 'text-vinotinto-claro' : ''}`} />
                                </button>

                                {/* Switcher de vistas (solo las habilitadas por el admin) */}
                                {vistasHabilitadas.length > 0 && (
                                    <div className="flex items-center gap-1 bg-sutil rounded-xl p-1 border borde-subtle shrink-0">
                                        {vistasHabilitadas.map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setVistaActual(v)}
                                                title={INFO_VISTAS[v].etiqueta}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                                                    vistaEfectiva === v
                                                        ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                                        : 't-muted hover:text-secundario hover:bg-sutil-hover'
                                                }`}
                                            >
                                                {INFO_VISTAS[v].icono}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fila 2: chips de voz (siempre visibles, deslizan en móvil) */}
                            <div className="flex items-center gap-1.5 overflow-x-auto sin-scrollbar">
                                {['Todas', 'Soprano', 'Contralto', 'Tenor', 'Bajo'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setFiltroVoz(v)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                                            filtroVoz === v
                                                ? 'bg-vinotinto text-white border-vinotinto shadow-glow-vinotinto'
                                                : 'bg-sutil t-muted border-borde-subtle hover:border-vinotinto/40'
                                        }`}
                                    >
                                        {v === 'Todas' ? 'Todas las voces' : ICONOS_CUERDA[v]}
                                    </button>
                                ))}
                            </div>

                            {/* Filtros extra: móvil (panel colapsable de 2 columnas) */}
                            {filtrosMovilAbiertos && (
                                <motion.div
                                    className="lg:hidden grid grid-cols-2 gap-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    {filtrosSelects('input-campo')}
                                    <button
                                        onClick={limpiarFiltros}
                                        className="btn-secundario py-2 px-3 text-xs"
                                    >
                                        Limpiar filtros
                                    </button>
                                </motion.div>
                            )}

                            {/* Filtros extra: escritorio (una sola línea compacta) */}
                            <div className="hidden lg:flex items-center gap-2 pt-3 border-t borde-subtle flex-wrap">
                                <p className="t-muted text-xs whitespace-nowrap">Filtrar por:</p>
                                {filtrosSelects('select-campo')}
                                <div className="flex-1" />
                                <p className="t-muted text-sm whitespace-nowrap">
                                    {partiturasFiltradas.length} partitura{partiturasFiltradas.length !== 1 ? 's' : ''}
                                </p>
                                {hayFiltrosActivos && (
                                    <button
                                        onClick={limpiarFiltros}
                                        className="text-xs text-vinotinto-claro flex items-center gap-1 hover:underline"
                                    >
                                        <X className="w-3 h-3" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Contador de resultados (móvil) */}
                        <p className="lg:hidden t-muted text-sm mb-3 px-1">
                            {partiturasFiltradas.length} partitura{partiturasFiltradas.length !== 1 ? 's' : ''}
                        </p>

                        {/* Área de resultados según el estado de la carga */}
                        <div className="relative">
                            {estadoPartituras === 'cargando' ? (
                                /* 1) El servicio aún está respondiendo */
                                <div className="flex flex-col items-center justify-center text-center px-4 py-16">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-vinotinto-claro" />
                                    <p className="t-muted text-sm">Cargando partituras...</p>
                                </div>
                            ) : estadoPartituras === 'error' && partiturasVisibles.length === 0 ? (
                                /* 2) El servicio falló y no hay nada guardado */
                                <div className="flex flex-col items-center justify-center text-center px-4 py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                                        <WifiOff className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h4 className="text-lg font-display font-semibold text-secundario mb-2">Ups, algo salió mal</h4>
                                    <p className="t-muted text-sm max-w-sm mb-6">
                                        No pudimos cargar la biblioteca en este momento. Revisa tu conexión y vuelve a intentarlo.
                                    </p>
                                    <button onClick={reintentarPartituras} className="btn-primario text-sm">
                                        <RefreshCw className="w-4 h-4" /> Reintentar
                                    </button>
                                </div>
                            ) : partiturasVisibles.length === 0 ? (
                                /* 3) El servicio respondió pero aún no hay partituras */
                                <div className="flex flex-col items-center justify-center text-center px-4 py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-vinotinto/10 border border-vinotinto/20 flex items-center justify-center mb-5">
                                        <Music2 className="w-8 h-8 text-vinotinto-claro" />
                                    </div>
                                    <h4 className="text-lg font-display font-semibold text-secundario mb-2">Aún no hay partituras disponibles</h4>
                                    <p className="t-muted text-sm max-w-sm">
                                        Estamos preparando el repertorio para compartirlo contigo. Vuelve pronto.
                                    </p>
                                </div>
                            ) : partiturasFiltradas.length === 0 ? (
                                /* 4) Hay partituras pero ningún filtro coincide */
                                <div className="flex flex-col items-center justify-center text-center px-4 py-16">
                                    <Music2 className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="t-muted">No se encontraron partituras con esos filtros.</p>
                                    {hayFiltrosActivos && (
                                        <button onClick={limpiarFiltros} className="text-sm text-vinotinto-claro hover:underline mt-2">
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={vistaEfectiva}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* VISTA 1: Cuadrícula */}
                                        {vistaEfectiva === 'grid' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {partiturasFiltradas.map(partitura => (
                                                    <TarjetaPartitura
                                                        key={partitura.id}
                                                        partitura={partitura}
                                                        claseImagen="aspect-[4/3]"
                                                        alVerDetalle={() => setPartituraSeleccionada(partitura)}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* VISTA 2: Lista compacta */}
                                        {vistaEfectiva === 'lista' && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                                {partiturasFiltradas.map(partitura => (
                                                    <FilaPartitura
                                                        key={partitura.id}
                                                        partitura={partitura}
                                                        alVerDetalle={() => setPartituraSeleccionada(partitura)}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* VISTA 3: Estantería (carrusel horizontal con scroll propio) */}
                                        {vistaEfectiva === 'shelf' && (
                                            <div className="w-full overflow-x-auto overflow-y-visible sin-scrollbar py-4 px-0.5 flex items-start gap-4 snap-x">
                                                {partiturasFiltradas.map(partitura => (
                                                    <div key={partitura.id} className="snap-start flex-shrink-0 pb-1">
                                                        <TarjetaEstante
                                                            partitura={partitura}
                                                            alVerDetalle={() => setPartituraSeleccionada(partitura)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* VISTA 4: Mosaico (masonry, scroll natural) */}
                                        {vistaEfectiva === 'mosaico' && (
                                            <div className="columns-2 xl:columns-3 gap-4 px-0.5 py-1">
                                                {partiturasFiltradas.map(partitura => (
                                                    <div key={partitura.id} className="break-inside-avoid mb-4">
                                                        <TarjetaPartitura
                                                            partitura={partitura}
                                                            claseImagen={alturaMosaica(partitura.id)}
                                                            alVerDetalle={() => setPartituraSeleccionada(partitura)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Aviso cuando el servicio falló pero mostramos lo guardado */}
            <AvisoTemporal
                visibilidad={usandoCachePartituras && estaLogueado}
                mensaje="No se pudieron actualizar los datos. Estás viendo los guardados en tu dispositivo."
            />

            {/* Modales */}
            <AnimatePresence>
                {partituraSeleccionada && (
                    <ModalPartitura
                        partitura={partituraSeleccionada}
                        alCerrar={() => setPartituraSeleccionada(null)}
                        alPrevisualizar={() => {
                            setPartituraVisor(partituraSeleccionada);
                            setPartituraSeleccionada(null);
                        }}
                    />
                )}
                {partituraVisor && (
                    <Suspense fallback={null}>
                        <VisorPdf
                            urlPdf={partituraVisor.urlPdf || ''}
                            titulo={partituraVisor.titulo}
                            descargable={!!partituraVisor.descargable && !!partituraVisor.urlPdf}
                            alCerrar={() => setPartituraVisor(null)}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </section>
    );
};

export default SeccionBiblioteca;