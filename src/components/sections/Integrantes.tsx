/**
 * ============================================================
 * ARCHIVO: src/components/sections/Integrantes.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Muestra la grid de integrantes del coro con filtro por cuerda
 * (Soprano, Contralto, Tenor, Bajo). Al hacer clic en una
 * tarjeta de integrante, se abre un modal con su biografía.
 *
 * ¿CÓMO EDITARLO?
 * - Los integrantes se gestionan desde el Panel Admin (/admin)
 *   o editando directamente la lista en mockData.ts
 * ============================================================
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, Music, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Integrante } from '../../data/mockData';

// Colores para distinguir cada cuerda vocal
const COLORES_CUERDA: Record<string, { bg: string; text: string; border: string }> = {
    'Soprano': { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
    'Contralto': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
    'Tenor': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    'Bajo': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
};

// ============================================================
// COMPONENTE: Modal de Integrante
// ============================================================
const ModalIntegrante = ({ integrante, alCerrar }: { integrante: Integrante; alCerrar: () => void }) => {
    const colores = COLORES_CUERDA[integrante.cuerda];

    return (
        // Overlay oscuro detrás del modal
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar} // Cierra al hacer clic fuera
        >
            {/* Fondo oscuro semitransparente */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Contenido del modal */}
            <motion.div
                className="relative card-glass rounded-2xl max-w-md w-full p-8 z-10"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()} // Evita cerrar al hacer clic DENTRO del modal
            >
                {/* Botón de cerrar */}
                <button
                    onClick={alCerrar}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     rounded-full bg-white/10 hover:bg-white/20 text-white/70
                     hover:text-white transition-all duration-200"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Avatar / Foto */}
                <div className="flex flex-col items-center mb-6">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${colores.border} mb-4`}>
                        <img
                            src={integrante.foto}
                            alt={integrante.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Si la imagen falla, mostramos las iniciales del nombre
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Nombre */}
                    <h3 className="text-2xl font-display font-bold text-secundario text-center">
                        {integrante.nombre}
                    </h3>

                    {/* Badge de cuerda */}
                    <span className={`badge mt-2 ${colores.bg} ${colores.text} ${colores.border}`}>
                        <Music className="w-3 h-3" />
                        {integrante.cuerda}
                    </span>

                    {/* Cargo si es directivo */}
                    {integrante.esDirectivo && integrante.cargo && (
                        <span className="badge mt-2 badge-khaki">
                            <Award className="w-3 h-3" />
                            {integrante.cargo}
                        </span>
                    )}
                </div>

                {/* Rango vocal */}
                <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <span className="text-xs text-white/50 uppercase tracking-wider">Rango Vocal: </span>
                        <span className="text-sm font-medium text-khaki">{integrante.rangoVocal}</span>
                    </div>
                </div>

                {/* Separador */}
                <div className="linea-decorativa mx-auto mb-6" />

                {/* Biografía */}
                <p className="text-white/60 text-sm leading-relaxed text-center">
                    {integrante.biografia}
                </p>
            </motion.div>
        </motion.div>
    );
};

// ============================================================
// COMPONENTE: Tarjeta de Integrante
// ============================================================
const TarjetaIntegrante = ({ integrante, alHacerClic }: {
    integrante: Integrante;
    alHacerClic: () => void;
}) => {
    const colores = COLORES_CUERDA[integrante.cuerda];

    return (
        <motion.div
            className="card-glass card-3d rounded-xl overflow-hidden cursor-pointer group border border-white/10
                 hover:border-vinotinto/40 transition-all duration-300"
            onClick={alHacerClic}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            {/* Foto del integrante */}
            <div className="aspect-square relative overflow-hidden bg-fondo-medio">
                <img
                    src={integrante.foto}
                    alt={integrante.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay con información al hacer hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        flex items-end p-4">
                    <span className="text-xs text-white/80">Ver biografía →</span>
                </div>

                {/* Badge de cuerda en la esquina */}
                <div className="absolute top-3 left-3">
                    <span className={`badge text-[9px] ${colores.bg} ${colores.text} border ${colores.border}`}>
                        {integrante.cuerda}
                    </span>
                </div>

                {/* Ícono de directivo */}
                {integrante.esDirectivo && (
                    <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-khaki/20 border border-khaki/40
                            flex items-center justify-center">
                            <Award className="w-3 h-3 text-khaki" />
                        </div>
                    </div>
                )}
            </div>

            {/* Información debajo de la foto */}
            <div className="p-4">
                <h4 className="font-semibold text-secundario text-sm leading-tight mb-1">
                    {integrante.nombre}
                </h4>
                {integrante.esDirectivo && integrante.cargo && (
                    <p className="text-xs text-khaki/80">{integrante.cargo}</p>
                )}
                <p className="text-xs text-white/40 mt-1">
                    Rango: <span className="text-white/60">{integrante.rangoVocal}</span>
                </p>
            </div>
        </motion.div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionIntegrantes
// ============================================================
const SeccionIntegrantes = () => {
    const { integrantes } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    // Estado: filtro de cuerda activo ('Todos' muestra todos)
    const [filtroActivo, setFiltroActivo] = useState<'Todos' | 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo'>('Todos');
    // Estado: integrante seleccionado para mostrar en el modal
    const [integranteSeleccionado, setIntegranteSeleccionado] = useState<Integrante | null>(null);

    // Filtra los integrantes según el filtro activo
    const integrantesFiltrados = filtroActivo === 'Todos'
        ? integrantes
        : integrantes.filter(i => i.cuerda === filtroActivo);

    const filtros: Array<'Todos' | 'Soprano' | 'Contralto' | 'Tenor' | 'Bajo'> =
        ['Todos', 'Soprano', 'Contralto', 'Tenor', 'Bajo'];

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
                    <p className="text-white/50 max-w-2xl mx-auto">
                        Descubre las voces que dan vida a DaCapo Grupo Vocal.
                        Haz clic en cualquier integrante para conocer su historia.
                    </p>
                </motion.div>

                {/* Filtros de cuerda */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {filtros.map(filtro => (
                        <button
                            key={filtro}
                            onClick={() => setFiltroActivo(filtro)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filtroActivo === filtro
                                    ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                        >
                            {filtro === 'Todos' ? `Todos (${integrantes.length})` : `${filtro}s`}
                        </button>
                    ))}
                </motion.div>

                {/* Grid de tarjetas */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    layout // Permite animar el reordenamiento cuando cambia el filtro
                >
                    <AnimatePresence mode="popLayout">
                        {integrantesFiltrados.map((integrante, indice) => (
                            <motion.div
                                key={integrante.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3, delay: indice * 0.05 }}
                            >
                                <TarjetaIntegrante
                                    integrante={integrante}
                                    alHacerClic={() => setIntegranteSeleccionado(integrante)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Mensaje si no hay integrantes con el filtro */}
                {integrantesFiltrados.length === 0 && (
                    <div className="text-center py-16 text-white/40">
                        No hay integrantes registrados en esta cuerda.
                    </div>
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
        </section>
    );
};

export default SeccionIntegrantes;
