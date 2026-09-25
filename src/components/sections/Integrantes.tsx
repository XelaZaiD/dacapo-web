/**
 * ============================================================
 * ARCHIVO: src/components/sections/Integrantes.tsx
 * ============================================================
 * Sección pública de integrantes del coro con 4 diseños
 * configurables desde el Panel Admin:
 *   grid    → tarjetas en columnas con filtros por cuerda
 *   satb    → paneles temáticos por cuerda (Soprano/Contralto/Tenor/Bajo)
 *   lista   → directorio elegante estilo programa de concierto
 *   mosaico → vitrina de fotos de altura variable
 *
 * El administrador activa/desactiva cada diseño; el visitante
 * elige entre los habilitados (preferencia guardada en su navegador).
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    X, ZoomIn, Music, Award, LayoutGrid, List, Grid3x3, Rows2,
    AlertCircle, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Integrante, VistasIntegrantes } from '../../data/mockData';
import CarruselMovil from '../ui/CarruselMovil';
import AvisoTemporal from '../ui/AvisoTemporal';
import { IconoInstagram } from '../ui/IconosRedes';

type TipoVistaIntegrantes = keyof VistasIntegrantes;
const VISTAS_ORDEN_INTEGRANTES: TipoVistaIntegrantes[] = ['grid', 'satb', 'lista', 'mosaico'];
const CUERDAS_ORDEN = ['Soprano', 'Contralto', 'Tenor', 'Bajo'] as const;

// Colores para distinguir cada cuerda vocal
const COLORES_CUERDA: Record<string, { bg: string; text: string; border: string }> = {
    'Soprano': { bg: 'bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30' },
    'Contralto': { bg: 'bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30' },
    'Tenor': { bg: 'bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
    'Bajo': { bg: 'bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
};

// Plural correcto de cada cuerda (ej: Tenor → Tenores)
const PLURAL_CUERDA: Record<string, string> = {
    Soprano: 'Sopranos',
    Contralto: 'Contraltos',
    Tenor: 'Tenores',
    Bajo: 'Bajos',
};
const pluralCuerda = (cuerda: string) => PLURAL_CUERDA[cuerda] ?? `${cuerda}s`;

const INFO_VISTAS: Record<TipoVistaIntegrantes, { etiqueta: string; icono: JSX.Element }> = {
    grid: { etiqueta: 'Cuadrícula', icono: <LayoutGrid className="w-4 h-4" /> },
    satb: { etiqueta: 'Paneles', icono: <Rows2 className="w-4 h-4" /> },
    lista: { etiqueta: 'Directorio', icono: <List className="w-4 h-4" /> },
    mosaico: { etiqueta: 'Mosaico', icono: <Grid3x3 className="w-4 h-4" /> },
};

// Iniciales del nombre para mostrar cuando no hay foto o la foto falla
const inicialesDe = (nombre: string) =>
    nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');

// Foto del integrante con respaldo de iniciales (si no hay foto o falla la carga)
const AvatarIntegrante = ({ integrante, className, circulo }: {
    integrante: Integrante;
    className: string;
    circulo: boolean;
}) => {
    const [error, setError] = useState(false);
    const colores = COLORES_CUERDA[integrante.cuerda];

    if (!integrante.foto || error) {
        return (
            <div className={`${className} flex items-center justify-center ${colores.bg} ${colores.text}`}>
                <span className="font-display font-bold text-2xl">{inicialesDe(integrante.nombre)}</span>
            </div>
        );
    }
    const redondeo = circulo ? 'rounded-full' : 'rounded-none';
    return (
        <img
            src={integrante.foto}
            alt={integrante.nombre}
            className={`${className} object-cover ${redondeo}`}
            onError={() => setError(true)}
        />
    );
};

// ============================================================
// COMPONENTE: Modal de Integrante
// ============================================================
const ModalIntegrante = ({ integrante, alCerrar }: { integrante: Integrante; alCerrar: () => void }) => {
    const colores = COLORES_CUERDA[integrante.cuerda];
    const esFoto = !!integrante.foto;
    const [fotoCompleta, setFotoCompleta] = useState(false);

    const cerrarFoto = () => setFotoCompleta(false);

    // Cierra el lightbox (o el modal) con la tecla Escape
    useEffect(() => {
        const alPulsar = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (fotoCompleta) cerrarFoto();
            else alCerrar();
        };
        window.addEventListener('keydown', alPulsar);
        return () => window.removeEventListener('keydown', alPulsar);
    }, [fotoCompleta, alCerrar]);

    return createPortal(
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
        >
            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />

            <motion.div
                className="relative card-modal max-w-md w-full p-6 sm:p-8 z-10 rounded-3xl overflow-hidden flex flex-col max-h-[85dvh]"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Franja de acento según cuerda */}
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${colores.bg} via-transparent to-transparent`} />

                <button
                    onClick={alCerrar}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-sutil-hover hover:bg-black/10 dark:hover:bg-white/20 text-black/60 dark:text-white/70 hover:text-secundario transition-all duration-200"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Cabecera fija: foto, nombre, badges y datos */}
                <div className="flex flex-col items-center mb-5 shrink-0">
                    {esFoto ? (
                        <button
                            onClick={() => setFotoCompleta(true)}
                            aria-label="Ver foto completa"
                            className={`w-24 h-24 rounded-full overflow-hidden border-2 ${colores.border} mb-4 shadow-card relative group cursor-zoom-in`}
                        >
                            <AvatarIntegrante integrante={integrante} className="w-full h-full" circulo />
                            <span className="absolute inset-0 flex items-center justify-center
                                      bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100
                                           transition-opacity duration-300 drop-shadow-lg" />
                            </span>
                        </button>
                    ) : (
                        <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${colores.border} mb-4 shadow-card`}>
                            <AvatarIntegrante integrante={integrante} className="w-full h-full" circulo />
                        </div>
                    )}

                    <h3 className="text-2xl font-display font-bold text-secundario text-center">
                        {integrante.nombre}
                    </h3>

                    <span className={`badge mt-2 ${colores.bg} ${colores.text} ${colores.border}`}>
                        <Music className="w-3 h-3" />
                        {integrante.cuerda}
                    </span>

                    {integrante.esDirectivo && integrante.cargo && (
                        <span className="badge mt-2 badge-khaki">
                            <Award className="w-3 h-3" />
                            {integrante.cargo}
                        </span>
                    )}

                    {integrante.urlInstagram && (
                        <a
                            href={integrante.urlInstagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 hover:underline"
                        >
                            <IconoInstagram className="w-3.5 h-3.5" />
                            Instagram
                        </a>
                    )}

                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                        <div className="px-4 py-2 rounded-full bg-sutil border borde-subtle">
                            <span className="text-xs t-muted uppercase tracking-wider">Rango Vocal: </span>
                            <span className="text-sm font-medium text-khaki">{integrante.rangoVocal}</span>
                        </div>
                        {integrante.anioIngreso !== undefined && (
                            <div className="px-4 py-2 rounded-full bg-vinotinto/10 border border-vinotinto/20">
                                <span className="text-xs t-muted uppercase tracking-wider">En el coro desde: </span>
                                <span className="text-sm font-medium text-vinotinto dark:text-vinotinto-claro">{integrante.anioIngreso}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Biografía: espacio fijo con scroll interno */}
                <div className="shrink-0 mb-1 flex items-center gap-2">
                    <span className="text-[10px] t-muted-low uppercase tracking-widest">Sobre {integrante.nombre.split(' ')[0]}</span>
                    <div className="flex-1 h-px bg-white/10 dark:bg-white/5" />
                </div>
                <div className="bg-fondo-card rounded-2xl border borde-subtle p-5 min-h-0">
                    <div className="h-36 sm:h-40 overflow-y-auto pr-2">
                        <p className="t-muted-high text-sm leading-relaxed italic">
                            “{integrante.biografia}”
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Lightbox: foto completa sin recorte */}
            {esFoto && fotoCompleta && (
                <motion.div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={cerrarFoto}
                >
                    <button
                        onClick={cerrarFoto}
                        aria-label="Cerrar foto"
                        className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full
                                  bg-white/10 hover:bg-white/25 text-white transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <motion.img
                        src={integrante.foto}
                        alt={integrante.nombre}
                        className="max-h-[86vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl"
                        onClick={e => e.stopPropagation()}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            )}
        </motion.div>,
        document.body
    );
};

// ============================================================
// COMPONENTE: Tarjeta de Integrante (vista grid)
// ============================================================
const TarjetaGrid = ({ integrante, alHacerClic }: { integrante: Integrante; alHacerClic: () => void }) => {
    const colores = COLORES_CUERDA[integrante.cuerda];

    return (
        <motion.div
            className="card-glass card-3d rounded-xl overflow-hidden cursor-pointer group border borde-subtle hover:border-vinotinto/40 transition-all duration-300"
            onClick={alHacerClic}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className="aspect-square relative overflow-hidden bg-fondo-medio">
                <AvatarIntegrante integrante={integrante} className="w-full h-full transition-transform duration-500 group-hover:scale-110" circulo={false} />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-xs t-muted-high">Ver biografía →</span>
                </div>

                <div className="absolute top-3 left-3">
                    <span className={`badge text-[9px] backdrop-blur-sm ${colores.bg} ${colores.text} border ${colores.border}`}>
                        {integrante.cuerda}
                    </span>
                </div>

                {integrante.esDirectivo && (
                    <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-khaki/20 border border-khaki/40 flex items-center justify-center backdrop-blur-sm">
                            <Award className="w-3 h-3 text-khaki" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h4 className="font-semibold text-secundario text-sm leading-tight mb-1">
                    {integrante.nombre}
                </h4>
                {integrante.esDirectivo && integrante.cargo && (
                    <p className="text-xs text-khaki/80">{integrante.cargo}</p>
                )}
                <p className="text-xs t-muted mt-1">
                    Rango: <span className="t-muted-high">{integrante.rangoVocal}</span>
                    {integrante.anioIngreso !== undefined && (
                        <span className="t-muted-low"> · Desde {integrante.anioIngreso}</span>
                    )}
                </p>
            </div>
        </motion.div>
    );
};

// Tarjeta compacta (vistas satb / lista)
const TarjetaCompacta = ({ integrante, alHacerClic }: { integrante: Integrante; alHacerClic: () => void }) => {
    const colores = COLORES_CUERDA[integrante.cuerda];

    return (
        <button
            onClick={alHacerClic}
            className="w-full text-left card-glass rounded-xl p-3 flex items-center gap-3 border borde-subtle hover:border-vinotinto/40 hover:-translate-y-0.5 transition-all duration-300"
        >
            <AvatarIntegrante integrante={integrante} className="w-12 h-12 flex-shrink-0" circulo />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-secundario leading-tight truncate">{integrante.nombre}</p>
                <p className="text-xs t-muted truncate">
                    {integrante.esDirectivo && integrante.cargo ? integrante.cargo : integrante.rangoVocal}
                    {integrante.anioIngreso !== undefined && <span className="t-muted-low"> · {integrante.anioIngreso}</span>}
                </p>
            </div>
            <span className={`badge text-[9px] ${colores.bg} ${colores.text} border ${colores.border}`}>
                {integrante.cuerda}
            </span>
        </button>
    );
};

// ============================================================
// VISTA: Cuadrícula (filtros por cuerda + carrusel móvil)
// ============================================================
const VistaGrid = ({ integrantes, alAbrir }: { integrantes: Integrante[]; alAbrir: (i: Integrante) => void }) => {
    const [filtroActivo, setFiltroActivo] = useState<'Todos' | 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo'>('Todos');

    const integrantesFiltrados = filtroActivo === 'Todos'
        ? integrantes
        : integrantes.filter(i => i.cuerda === filtroActivo);

    const filtros: Array<'Todos' | 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo'> =
        ['Todos', 'Soprano', 'Contralto', 'Tenor', 'Bajo'];

    return (
        <div className="space-y-10">
            {/* Filtros de cuerda */}
            <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {filtros.map(filtro => (
                    <button
                        key={filtro}
                        onClick={() => setFiltroActivo(filtro)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filtroActivo === filtro
                            ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                            : 'bg-sutil t-muted-high hover:bg-sutil-hover hover:text-secundario border borde-subtle'
                            }`}
                    >
                        {filtro === 'Todos' ? `Todos (${integrantes.length})` : pluralCuerda(filtro)}
                    </button>
                ))}
            </motion.div>

            {/* Carrusel en móvil; en md+ CarruselMovil regresa al grid fijo (gridDesktop) */}
            <CarruselMovil
                slides={integrantesFiltrados.map((integrante, indice) => (
                    <motion.div
                        key={integrante.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: indice * 0.05 }}
                    >
                        <TarjetaGrid
                            integrante={integrante}
                            alHacerClic={() => alAbrir(integrante)}
                        />
                    </motion.div>
                ))}
                claseSlide="w-[72%] md:w-auto"
                gridDesktop="md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-4"
                ariaLabel="Carrusel de integrantes"
            />

            {integrantesFiltrados.length === 0 && (
                <div className="text-center py-16 t-muted">
                    No hay integrantes registrados en esta cuerda.
                </div>
            )}
        </div>
    );
};

// ============================================================
// VISTA: Paneles SATB (bloques temáticos por cuerda)
// ============================================================
const VistaSatb = ({ integrantes, alAbrir }: { integrantes: Integrante[]; alAbrir: (i: Integrante) => void }) => {
    const cuerdasPresentes = CUERDAS_ORDEN.filter(c => integrantes.some(i => i.cuerda === c));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cuerdasPresentes.map((cuerda, indice) => {
                const colores = COLORES_CUERDA[cuerda];
                const miembrosCuerda = integrantes.filter(i => i.cuerda === cuerda);
                const sufijo = indice % 2 === 0 ? 'translate-x-full right-0' : '-translate-x-full left-0';

                return (
                    <motion.div
                        key={cuerda}
                        className={`card-glass rounded-2xl p-6 border borde-subtle relative overflow-hidden`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.5, delay: indice * 0.08 }}
                    >
                        {/* Acento decorativo */}
                        <div className={`absolute top-0 bottom-0 w-1/2 ${sufijo} bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none`} />

                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-10 h-10 rounded-xl ${colores.bg} ${colores.text} flex items-center justify-center`}>
                                <Music className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg text-secundario leading-none">{pluralCuerda(cuerda)}</h3>
                                <p className="text-[11px] t-muted mt-1">{miembrosCuerda.length} {miembrosCuerda.length === 1 ? 'voz' : 'voces'}</p>
                            </div>
                            <span className={`badge ml-auto ${colores.bg} ${colores.text} border ${colores.border}`}>
                                {cuerda}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {miembrosCuerda.map((i, j) => (
                                <motion.div
                                    key={i.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: j * 0.06 }}
                                >
                                    <TarjetaCompacta integrante={i} alHacerClic={() => alAbrir(i)} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ============================================================
// VISTA: Directorio (roster elegante estilo programa de concierto)
// ============================================================
const VistaLista = ({ integrantes, alAbrir }: { integrantes: Integrante[]; alAbrir: (i: Integrante) => void }) => {
    const cuerdasPresentes = CUERDAS_ORDEN.filter(c => integrantes.some(i => i.cuerda === c));

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            {cuerdasPresentes.map((cuerda, indice) => {
                const colores = COLORES_CUERDA[cuerda];
                const miembrosCuerda = integrantes.filter(i => i.cuerda === cuerda);

                return (
                    <motion.div
                        key={cuerda}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5, delay: indice * 0.06 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${colores.bg} border ${colores.border}`} />
                            <h3 className="font-display font-bold uppercase tracking-[0.2em] text-sm text-secundario">{pluralCuerda(cuerda)}</h3>
                            <span className="text-xs t-muted-low">{miembrosCuerda.length}</span>
                            <div className="flex-1 h-px bg-white/10 dark:bg-white/5" />
                        </div>

                        <div className="card-glass rounded-2xl border borde-subtle divide-y divide-white/5 dark:divide-white/5 overflow-hidden">
                            {miembrosCuerda.map((i) => (
                                <button
                                    key={i.id}
                                    onClick={() => alAbrir(i)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-sutil hover:bg-opacity-50 transition-colors duration-200"
                                >
                                    <AvatarIntegrante integrante={i} className="w-11 h-11 flex-shrink-0" circulo />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-secundario truncate">
                                            {i.nombre}
                                            {i.esDirectivo && i.cargo && (
                                                <span className="ml-2 badge badge-khaki text-[9px]">{i.cargo}</span>
                                            )}
                                        </p>
                                        <p className="text-xs t-muted truncate">
                                            {i.rangoVocal}
                                            {i.anioIngreso !== undefined && <span className="t-muted-low"> · Desde {i.anioIngreso}</span>}
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline text-xs t-muted-low">Ver historia →</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ============================================================
// VISTA: Mosaico (vitrina de fotos de altura variable)
// ============================================================
const alturaMosaica = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 100;
    if (hash < 34) return 'h-44 sm:h-52';
    if (hash < 67) return 'h-52 sm:h-64';
    return 'h-36 sm:h-44';
};

const VistaMosaico = ({ integrantes, alAbrir }: { integrantes: Integrante[]; alAbrir: (i: Integrante) => void }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {integrantes.map((integrante, indice) => {
            const colores = COLORES_CUERDA[integrante.cuerda];
            return (
                <motion.button
                    key={integrante.id}
                    onClick={() => alAbrir(integrante)}
                    className={`relative overflow-hidden rounded-xl group border borde-subtle text-left ${alturaMosaica(integrante.id)}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (indice % 4) * 0.06 }}
                >
                    <AvatarIntegrante integrante={integrante} className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500" circulo={false} />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-8 pb-3">
                        <p className="text-xs font-medium text-white truncate">{integrante.nombre}</p>
                        <p className={`text-[10px] ${colores.text}`}>
                            {integrante.esDirectivo && integrante.cargo ? integrante.cargo : integrante.cuerda}
                        </p>
                    </div>
                </motion.button>
            );
        })}
    </div>
);

// ============================================================
// COMPONENTE PRINCIPAL: SeccionIntegrantes
// ============================================================
const SeccionIntegrantes = () => {
    const { integrantes, vistasIntegrantes, estadoIntegrantes, reintentarIntegrantes } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const [vistaActual, setVistaActual] = useState<TipoVistaIntegrantes>(() => {
        const guardada = localStorage.getItem('dacapo_vista_integrantes_usuario') as TipoVistaIntegrantes | null;
        return guardada && VISTAS_ORDEN_INTEGRANTES.includes(guardada) ? guardada : 'grid';
    });
    const [integranteSeleccionado, setIntegranteSeleccionado] = useState<Integrante | null>(null);

    // Persistir la vista elegida por el visitante en su navegador
    useEffect(() => {
        localStorage.setItem('dacapo_vista_integrantes_usuario', vistaActual);
    }, [vistaActual]);

    // La vista efectiva respeta las habilitadas por el admin
    const primeraDisponible: TipoVistaIntegrantes = VISTAS_ORDEN_INTEGRANTES.find(v => vistasIntegrantes[v]) ?? 'grid';
    const vistaEfectiva: TipoVistaIntegrantes = vistasIntegrantes[vistaActual] ? vistaActual : primeraDisponible;
    const vistasHabilitadas = VISTAS_ORDEN_INTEGRANTES.filter(v => vistasIntegrantes[v]);

    // true = el servicio falló pero hay datos guardados en el navegador (caché)
    const usandoCacheIntegrantes = estadoIntegrantes === 'error' && integrantes.length > 0;

    const abrirIntegrante = (integrante: Integrante) => setIntegranteSeleccionado(integrante);

    const cuerpoVista = () => {
        switch (vistaEfectiva) {
            case 'satb': return <VistaSatb integrantes={integrantes} alAbrir={abrirIntegrante} />;
            case 'lista': return <VistaLista integrantes={integrantes} alAbrir={abrirIntegrante} />;
            case 'mosaico': return <VistaMosaico integrantes={integrantes} alAbrir={abrirIntegrante} />;
            default: return <VistaGrid integrantes={integrantes} alAbrir={abrirIntegrante} />;
        }
    };

    return (
        <section id="integrantes" className="py-24 bg-fondo-oscuro relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[30rem] font-display
                      text-white/[0.02] leading-none select-none pointer-events-none">
                SATB
            </div>

            <div className="contenedor relative z-10" ref={ref}>

                {/* Encabezado */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Music className="w-3 h-3" />
                        Nuestras Voces
                    </span>
                    <h2 className="titulo-seccion mb-4">Los Integrantes</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="t-muted max-w-2xl mx-auto">
                        Descubre las voces que dan vida a DaCapo Grupo Vocal.
                        Haz clic en cualquier integrante para conocer su historia.
                    </p>
                </motion.div>

                {/* Selector de diseño (solo si hay más de uno habilitado) */}
                {vistasHabilitadas.length > 1 && integrantes.length > 0 && (
                    <motion.div
                        className="flex flex-wrap justify-center gap-2 mb-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        {vistasHabilitadas.map(v => (
                            <button
                                key={v}
                                onClick={() => setVistaActual(v)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${vistaEfectiva === v
                                        ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                        : 'bg-sutil t-muted-high hover:bg-sutil-hover hover:text-secundario border borde-subtle'
                                    }`}
                            >
                                {INFO_VISTAS[v].icono}
                                {INFO_VISTAS[v].etiqueta}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Estados de carga / vacío / error */}
                {estadoIntegrantes === 'cargando' && integrantes.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="card-glass rounded-xl overflow-hidden border borde-subtle">
                                <div className="aspect-square bg-sutil-hover animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 w-3/4 bg-sutil-hover rounded animate-pulse" />
                                    <div className="h-2 w-1/2 bg-sutil-hover rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : estadoIntegrantes === 'error' && integrantes.length === 0 ? (
                    <div className="card-glass rounded-xl p-10 text-center max-w-lg mx-auto">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3 t-muted" />
                        <h3 className="font-display font-bold text-lg text-secundario mb-1">Ups, algo salió mal</h3>
                        <p className="text-sm t-muted mb-5">
                            No se pudieron actualizar los integrantes. Inténtalo de nuevo en un momento.
                        </p>
                        <button onClick={reintentarIntegrantes} className="btn-primario justify-center text-sm">
                            <RefreshCw className="w-4 h-4" /> Reintentar
                        </button>
                    </div>
                ) : integrantes.length === 0 ? (
                    <div className="card-glass rounded-xl p-10 text-center max-w-lg mx-auto">
                        <Music className="w-10 h-10 mx-auto mb-3 t-muted" />
                        <h3 className="font-display font-bold text-lg text-secundario mb-1">Pronto más voces</h3>
                        <p className="text-sm t-muted">
                            Todavía no hay integrantes registrados. Nuestras voces están afinando para presentarse.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        key={vistaEfectiva}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {cuerpoVista()}
                    </motion.div>
                )}
            </div>

            {/* Modal del integrante seleccionado */}
            <AnimatePresence>
                {integranteSeleccionado && (
                    <ModalIntegrante
                        integrante={integranteSeleccionado}
                        alCerrar={() => setIntegranteSeleccionado(null)}
                    />
                )}
            </AnimatePresence>

            {/* Aviso cuando el servicio falló pero mostramos lo guardado */}
            <AvisoTemporal
                visibilidad={usandoCacheIntegrantes}
                mensaje="No se pudieron actualizar los integrantes. Estás viendo los guardados en tu dispositivo."
            />
        </section>
    );
};

export default SeccionIntegrantes;