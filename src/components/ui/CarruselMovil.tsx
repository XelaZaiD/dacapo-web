/**
 * ============================================================
 * ARCHIVO: src/components/ui/CarruselMovil.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Un carrusel de tarjetas diseñado para MÓVIL: se desliza con
 * el dedo (scroll-snap nativo, estilo Spotify/App Store), con
 * "peek" del siguiente elemento para que el usuario intuya que
 * hay más contenido.
 *
 * Incluye flechas ‹ › y un indicador de posición que cambia
 * según la cantidad de elementos:
 *  - Pocos (≤8): puntos (dots) clicable s
 *  - Muchos (>8): contador compacto "3/15"
 * Ambos se ocultan si no hay desbordamiento (1 solo elemento)
 * y desaparecen en pantallas medianas o grandes.
 *
 * En md+ el componente regresa EXACTAMENTE al grid actual del
 * proyecto mediante la prop "gridDesktop" (o a columna apilada
 * con "apiladoSm").
 * ============================================================
 */

import { useRef, useState, useEffect, useCallback, isValidElement, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    slides: ReactNode[];
    // Ancho de cada tarjeta en móvil (ej: "w-[72%]") → deja ver el siguiente (peek)
    claseSlide?: string;
    // Clases de grid para md+ (ej: "md:grid md:grid-cols-3")
    gridDesktop?: string;
    // En sm+ vuelve a columna apilada (caso: lista de eventos)
    apiladoSm?: boolean;
    // Gap (separación) para md+ si difiere del de móvil (ej: "md:gap-6")
    gapDesktop?: string;
    ariaLabel?: string;
};

const GAP_MOVIL = 16; // 1rem (gap-4)

const CarruselMovil = ({
    slides,
    claseSlide = 'w-[78%]',
    gridDesktop = '',
    apiladoSm = false,
    gapDesktop = '',
    ariaLabel = 'Carrusel',
}: Props) => {
    const scrollerRef = useRef<HTMLDivElement>(null);

    // Índice de la tarjeta visible actualmente
    const [indice, setIndice] = useState(0);
    // true si el contenido se desborda (hay más tarjetas que las visibles)
    const [hayOverflow, setHayOverflow] = useState(false);

    const medir = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        setHayOverflow(scroller.scrollWidth > scroller.clientWidth + 4);
    }, []);

    // Re-mide si cambia el tamaño de la ventana (rotación de pantalla, etc.)
    useEffect(() => {
        medir();
        window.addEventListener('resize', medir);
        return () => window.removeEventListener('resize', medir);
    }, [medir]);

    // "Firma" del contenido: si cambia (filtros, búsquedas, orden),
    // devolvemos el carrusel al inicio y recalculamos el indicador
    const firmaContenido = slides
        .map(s => (isValidElement(s) ? String(s.key ?? '') : ''))
        .join('|');

    // Al cambiar los slides (filtros, búsquedas): volver al inicio y re-medir
    useEffect(() => {
        scrollerRef.current?.scrollTo({ left: 0 });
        setIndice(0);
        medir();
    }, [firmaContenido, medir]);

    // Calcula qué tarjeta está centrada según la posición del scroll
    const calcularIndice = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller || scroller.children.length === 0) return 0;
        const primerSlide = scroller.children[0] as HTMLElement;
        const anchoPaso = primerSlide.offsetWidth + GAP_MOVIL;
        const indiceCrudo = Math.round(scroller.scrollLeft / anchoPaso);
        return Math.min(Math.max(indiceCrudo, 0), slides.length - 1);
    }, [slides.length]);

    const alHacerScroll = () => setIndice(calcularIndice());

    // Desplaza suavemente hasta la tarjeta "n"
    const irA = (n: number) => {
        const scroller = scrollerRef.current;
        if (!scroller || scroller.children.length === 0) return;
        const primerSlide = scroller.children[0] as HTMLElement;
        const anchoPaso = primerSlide.offsetWidth + GAP_MOVIL;
        scroller.scrollTo({ left: anchoPaso * n, behavior: 'smooth' });
        setIndice(n);
    };

    const alAnterior = () => irA(Math.max(0, indice - 1));
    const alSiguiente = () => irA(Math.min(slides.length - 1, indice + 1));

    // Controles solo si hay más de un elemento y hay desbordamiento
    const mostrarControles = hayOverflow && slides.length > 1;
    const usarContador = slides.length > 8;

    return (
        <div className="relative" aria-label={ariaLabel}>
            {/* Zona de desplazamiento (táctil) */}
            <div
                ref={scrollerRef}
                onScroll={alHacerScroll}
                className={[
                    'flex gap-4 overflow-x-auto snap-x snap-mandatory sin-scrollbar pb-2',
                    apiladoSm ? 'sm:flex-wrap sm:overflow-visible sm:pb-0' : '',
                    gridDesktop,
                    gapDesktop,
                ].filter(Boolean).join(' ')}
            >
                {slides.map((slide, i) => (
                    <div
                        key={isValidElement(slide) ? (slide.key ?? i) : i}
                        className={[
                            'snap-start snap-always shrink-0',
                            claseSlide,
                            apiladoSm ? 'sm:w-full' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        {slide}
                    </div>
                ))}
            </div>

            {/* Flechas de navegación (solo móvil) */}
            {mostrarControles && (
                <>
                    <button
                        onClick={alAnterior}
                        disabled={indice === 0}
                        aria-label="Anterior"
                        className="md:hidden absolute left-0 top-[38%] -translate-y-1/2 z-10
                            w-10 h-10 rounded-full bg-fondo-card/85 backdrop-blur-sm
                            border borde-medium text-secundario shadow-card
                            flex items-center justify-center transition-all duration-200
                            disabled:opacity-30 enabled:hover:scale-105"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={alSiguiente}
                        disabled={indice >= slides.length - 1}
                        aria-label="Siguiente"
                        className="md:hidden absolute right-0 top-[38%] -translate-y-1/2 z-10
                            w-10 h-10 rounded-full bg-fondo-card/85 backdrop-blur-sm
                            border borde-medium text-secundario shadow-card
                            flex items-center justify-center transition-all duration-200
                            disabled:opacity-30 enabled:hover:scale-105"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Indicador de posición (solo móvil) */}
            {mostrarControles && (
                <div className="md:hidden flex items-center justify-center mt-4 gap-1.5">
                    {usarContador ? (
                        // Contador compacto para muchas tarjetas
                        <span className="text-xs t-muted-high tabular-nums bg-sutil border borde-subtle
                                       rounded-full px-3 py-1">
                            {indice + 1} / {slides.length}
                        </span>
                    ) : (
                        // Puntos (dots) para pocas tarjetas
                        slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => irA(i)}
                                aria-label={`Ir al elemento ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === indice
                                        ? 'w-5 bg-vinotinto'
                                        : 'w-2 bg-sutil-hover hover:bg-vinotinto/40'
                                }`}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CarruselMovil;