/**
 * ============================================================
 * ARCHIVO: src/utils/scroll.ts
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Mueve la página hasta una posición concreta con una animación
 * suave hecha a mano con 'requestAnimationFrame'.
 *
 * ¿POR QUÉ NO USAMOS scrollIntoView NI scroll-behavior: smooth?
 * Porque en el móvil (Chrome) el salto a una sección se quedaba
 * sin moverse: la URL cambiaba pero la página no se desplazaba.
 * Animarlo nosotros con 'window.scrollTo' no depende de ninguna
 * rareza del navegador.
 */

/** Número de píxeles que ocupa la barra de navegación fija. */
const ALTURA_NAVBAR = 80;

/** Limita un valor entre un mínimo y un máximo. */
const acotar = (valor: number, min: number, max: number) =>
    Math.max(min, Math.min(valor, max));

/**
 * Desplaza la página hasta 'destino' (píxeles desde arriba)
 * con una animación suave de 'duracion' milisegundos.
 */
export const scrollSuave = (destino: number, duracion = 700): void => {
    // Nunca por debajo de 0 ni por debajo del final de la página
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    const objetivo = acotar(destino, 0, Math.max(0, maximo));

    // Si el usuario pidió menos movimiento, saltamos sin animar
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, objetivo);
        return;
    }

    const inicio = window.scrollY;
    const distancia = objetivo - inicio;
    if (Math.abs(distancia) < 2) return;

    // Curva de aceleración y frenado (easeInOutQuad)
    const suavizar = (p: number) =>
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    const arrancar = performance.now();

    const paso = (ahora: number) => {
        const avance = Math.min((ahora - arrancar) / duracion, 1);
        window.scrollTo(0, inicio + distancia * suavizar(avance));
        if (avance < 1) requestAnimationFrame(paso);
    };

    requestAnimationFrame(paso);
};

/**
 * Lleva la página hasta la sección indicada, dejando su título
 * por debajo de la barra de navegación.
 * Devuelve 'false' si la sección no existe en la página.
 */
export const scrollASeccion = (id: string): boolean => {
    const seccion = document.getElementById(id);
    if (!seccion) return false;

    const arriba = seccion.getBoundingClientRect().top + window.scrollY;
    scrollSuave(arriba - ALTURA_NAVBAR);
    return true;
};
