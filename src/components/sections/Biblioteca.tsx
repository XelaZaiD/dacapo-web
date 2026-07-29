/**
 * ============================================================
 * ARCHIVO: src/components/sections/Biblioteca.tsx
 * ============================================================
 * Zona privada de partituras PDF. Acceso solo para usuarios logueados.
 * Incluye búsqueda, filtros por cuerda/dificultad y modal de detalle.
 * ============================================================
 */

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { BookOpen, Lock, Search, Filter, Download, Eye, X, Music2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Partitura } from '../../data/mockData';

// Colores para los niveles de dificultad
const COLORES_DIFICULTAD: Record<string, string> = {
    'Básico': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'Intermedio': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    'Avanzado': 'text-red-400 bg-red-400/10 border-red-400/30',
};

// Íconos para cuerdas en indicadores musicales
const ICONOS_CUERDA: Record<string, string> = {
    'Soprano': '𝄢 S',
    'Contralto': '𝄢 A',
    'Tenor': '𝄞 T',
    'Bajo': '𝄞 B',
};

// ============================================================
// COMPONENTE: Modal de detalle de partitura
// ============================================================
const ModalPartitura = ({ partitura, alCerrar }: { partitura: Partitura; alCerrar: () => void }) => (
    <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={alCerrar}
    >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
            className="relative card-glass rounded-2xl max-w-lg w-full p-8 z-10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
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
                        <p className="text-white/50 text-sm">{partitura.compositor}</p>
                    </div>
                </div>

                {/* Metadatos */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Estilo</p>
                        <p className="text-sm text-white/80">{partitura.estilo}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Época</p>
                        <p className="text-sm text-white/80">{partitura.epoca}</p>
                    </div>
                    {partitura.arreglista && (
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/40 mb-1">Arreglista</p>
                            <p className="text-sm text-white/80">{partitura.arreglista}</p>
                        </div>
                    )}
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Dificultad</p>
                        <span className={`badge border text-xs ${COLORES_DIFICULTAD[partitura.dificultad]}`}>
                            {partitura.dificultad}
                        </span>
                    </div>
                </div>

                {/* Cuerdas */}
                <div className="mb-4">
                    <p className="text-xs text-white/40 mb-2">Voces:</p>
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
                <p className="text-white/60 text-sm leading-relaxed">{partitura.descripcion}</p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
                {partitura.urlPdf ? (
                    <>
                        <a href={partitura.urlPdf} target="_blank" rel="noopener noreferrer" className="btn-primario flex-1 justify-center text-sm">
                            <Eye className="w-4 h-4" />
                            Ver PDF
                        </a>
                        <a href={partitura.urlPdf} download className="btn-secundario flex-1 justify-center text-sm">
                            <Download className="w-4 h-4" />
                            Descargar
                        </a>
                    </>
                ) : (
                    <p className="text-white/40 text-sm">PDF no disponible aún</p>
                )}
            </div>
        </motion.div>
    </motion.div>
);

// ============================================================
// COMPONENTE: Tarjeta de Partitura
// ============================================================
const TarjetaPartitura = ({ partitura, alVerDetalle }: {
    partitura: Partitura;
    alVerDetalle: () => void;
}) => (
    <motion.div
        className="card-glass rounded-xl p-5 group cursor-pointer border border-white/10
               hover:border-vinotinto/40 transition-all duration-300"
        onClick={alVerDetalle}
        whileHover={{ y: -2 }}
    >
        {/* Ícono de partitura */}
        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-vinotinto/20 border border-vinotinto/30
                      flex items-center justify-center text-xl font-display text-vinotinto-claro
                      group-hover:bg-vinotinto group-hover:text-white transition-all duration-300">
                𝄞
            </div>
            <span className={`badge border text-xs ${COLORES_DIFICULTAD[partitura.dificultad]}`}>
                {partitura.dificultad}
            </span>
        </div>

        {/* Título */}
        <h4 className="font-semibold text-secundario text-sm mb-1 line-clamp-2 group-hover:text-khaki
                   transition-colors duration-300">
            {partitura.titulo}
        </h4>
        <p className="text-xs text-white/40 mb-3">{partitura.compositor}</p>

        {/* Estilo y época */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
            <span>{partitura.estilo}</span>
            <span>·</span>
            <span>{partitura.epoca}</span>
        </div>

        {/* Cuerdas requeridas */}
        <div className="flex flex-wrap gap-1">
            {partitura.cuerdas.map(cuerda => (
                <span key={cuerda} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                    {cuerda.substring(0, 3)}
                </span>
            ))}
        </div>

        {/* Hover: botón de ver */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-0
                    group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-vinotinto-claro">Ver detalles y PDF →</span>
        </div>
    </motion.div>
);

// ============================================================
// COMPONENTE PRINCIPAL: SeccionBiblioteca
// ============================================================
const SeccionBiblioteca = () => {
    const { partituras, configuracionSecciones, estaLogueado } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const [busqueda, setBusqueda] = useState('');
    const [filtroVoz, setFiltroVoz] = useState('Todas');
    const [filtroDificultad, setFiltroDificultad] = useState('Todas');
    const [partituraSeleccionada, setPartituraSeleccionada] = useState<Partitura | null>(null);

    // No mostramos si está desactivada desde el Admin
    if (!configuracionSecciones.mostrarBiblioteca) return null;

    // Filtra partituras según búsqueda y filtros activos
    const partiturasFiltradas = partituras.filter(p => {
        const coincideBusqueda =
            p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.compositor.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.estilo.toLowerCase().includes(busqueda.toLowerCase());

        const coincideVoz = filtroVoz === 'Todas' || p.cuerdas.includes(filtroVoz);
        const coincideDificultad = filtroDificultad === 'Todas' || p.dificultad === filtroDificultad;

        return coincideBusqueda && coincideVoz && coincideDificultad;
    });

    return (
        <section id="biblioteca" className="py-24 bg-fondo-oscuro">
            <div className="contenedor" ref={ref}>

                {/* Encabezado */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-khaki mb-4 inline-flex">
                        <BookOpen className="w-3 h-3" />
                        Zona Exclusiva
                    </span>
                    <h2 className="titulo-seccion mb-4">Biblioteca de Partituras</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="text-white/50 max-w-2xl mx-auto">
                        Acceso exclusivo a nuestro repertorio coral. Descarga y estudia las partituras del grupo.
                    </p>
                </motion.div>

                {/* Si NO está logueado, mostrar pantalla de acceso restringido */}
                {!estaLogueado ? (
                    <motion.div
                        className="max-w-md mx-auto text-center py-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    >
                        <div className="w-20 h-20 rounded-full bg-vinotinto/20 border border-vinotinto/30
                            flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-vinotinto-claro" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-secundario mb-4">
                            Área Restringida
                        </h3>
                        <p className="text-white/50 mb-8 leading-relaxed">
                            La biblioteca de partituras es exclusiva para integrantes y colaboradores de DaCapo.
                            Inicia sesión o regístrate para acceder.
                        </p>
                        <button
                            onClick={() => document.dispatchEvent(new CustomEvent('abrir-modal-auth'))}
                            className="btn-primario mx-auto"
                        >
                            <Lock className="w-4 h-4" />
                            Iniciar Sesión para Acceder
                        </button>
                    </motion.div>
                ) : (
                    // Si SÍ está logueado, mostrar la biblioteca completa
                    <>
                        {/* Filtros y búsqueda */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Campo de búsqueda */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título, compositor, estilo..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="input-campo pl-10"
                                />
                            </div>

                            {/* Filtro por voz */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <select
                                    value={filtroVoz}
                                    onChange={e => setFiltroVoz(e.target.value)}
                                    className="input-campo pl-10 pr-4 appearance-none cursor-pointer"
                                >
                                    <option value="Todas">Todas las voces</option>
                                    <option value="Soprano">Soprano</option>
                                    <option value="Contralto">Contralto</option>
                                    <option value="Tenor">Tenor</option>
                                    <option value="Bajo">Bajo</option>
                                </select>
                            </div>

                            {/* Filtro por dificultad */}
                            <select
                                value={filtroDificultad}
                                onChange={e => setFiltroDificultad(e.target.value)}
                                className="input-campo cursor-pointer"
                            >
                                <option value="Todas">Todas las dificultades</option>
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </motion.div>

                        {/* Contador de resultados */}
                        <p className="text-white/40 text-sm mb-6">
                            {partiturasFiltradas.length} partitura{partiturasFiltradas.length !== 1 ? 's' : ''} encontrada{partiturasFiltradas.length !== 1 ? 's' : ''}
                        </p>

                        {/* Grid de partituras */}
                        {partiturasFiltradas.length > 0 ? (
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {partiturasFiltradas.map(partitura => (
                                        <TarjetaPartitura
                                            key={partitura.id}
                                            partitura={partitura}
                                            alVerDetalle={() => setPartituraSeleccionada(partitura)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-white/40">
                                <Music2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>No se encontraron partituras con esos filtros.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de partitura */}
            <AnimatePresence>
                {partituraSeleccionada && (
                    <ModalPartitura
                        partitura={partituraSeleccionada}
                        alCerrar={() => setPartituraSeleccionada(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export default SeccionBiblioteca;
