/**
 * ============================================================
 * ARCHIVO: src/components/ui/CarruselPaginado.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Carrusel paginado para ESCRITORIO (md+): muestra 2 tarjetas
 * por "pliego" y navega con flechas ‹ ›, un contador "1/N" y
 * puntos (dots) clicables. Pensado para listas de tarjetas de
 * altura variable (eventos, más destacados...).
 *
 * - Si una página queda con UNA sola tarjeta, esta ocupa toda
 *   la fila (md:col-span-2) para no dejar un hueco vacío.
 * - Se usa junto con CarruselMovil (táctil) para las secciones
 *   que necesitan carrusel tanto en móvil como en escritorio.
 * ============================================================
 */

import { useMemo, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TARJETAS_POR_PAGINA = 2;

type Props = {
    slides: ReactNode[];
    ariaLabel?: string;
};

const CarruselPaginado = ({ slides, ariaLabel = 'Carrusel paginado' }: Props) => {
    const [pagina, setPagina] = useState(0);

    const totalPaginas = useMemo(
        () => Math.max(1, Math.ceil(slides.length / TARJETAS_POR_PAGINA)),
        [slides.length]
    );
    const paginaSegura = Math.min(pagina, totalPaginas - 1);
    const inicio = paginaSegura * TARJETAS_POR_PAGINA;
    const visibles = slides.slice(inicio, inicio + TARJETAS_POR_PAGINA);

    return (
        <div aria-label={ariaLabel}>
            <div className="md:min-h-[420px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={paginaSegura}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, x: 48 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -48 }}
                        transition={{ duration: 0.4 }}
                    >
                        {visibles.map((slide, i) => (
                            <div
                                key={i}
                                className={visibles.length === 1 ? 'md:col-span-2' : ''}
                            >
                                {slide}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPagina(Math.max(0, paginaSegura - 1))}
                        disabled={paginaSegura === 0}
                        aria-label="Anteriores"
                        className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border borde-medium
                                   flex items-center justify-center text-white
                                   hover:bg-vinotinto transition-all duration-300
                                   disabled:opacity-30 disabled:hover:bg-black/50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs t-muted-high tabular-nums bg-sutil border borde-subtle inline-block rounded-full px-3 py-1">
                            {paginaSegura + 1} / {totalPaginas}
                        </span>
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPaginas }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagina(i)}
                                    aria-label={`Ir a la página ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === paginaSegura
                                            ? 'w-5 bg-vinotinto'
                                            : 'w-2 bg-sutil-hover hover:bg-vinotinto/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setPagina(Math.min(totalPaginas - 1, paginaSegura + 1))}
                        disabled={paginaSegura >= totalPaginas - 1}
                        aria-label="Siguientes"
                        className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border borde-medium
                                   flex items-center justify-center text-white
                                   hover:bg-vinotinto transition-all duration-300
                                   disabled:opacity-30 disabled:hover:bg-black/50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CarruselPaginado;