/**
 * ============================================================
 * ARCHIVO: src/components/sections/ViniloViajero.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * El vinilo de DaCapo viaja por la pantalla como el clásico
 * salvapantallas del DVD: avanza en diagonal, rebota en los
 * bordes y al tocar "las paredes" deja un destello de luz.
 *
 * Variantes:
 * - PC:   vinilo grande (510px), velocidad tranquila, opacidad
 *         baja para que el contenido de primer plano respire.
 * - Móvil: vinilo pequeño (aprox. 58% del ancho), más lento y
 *         con menos brillo para que no domine la pantalla.
 *
 * Detalles:
 * - El giro del disco lo maneja el propio bucle (una sola fuente
 *   de animación para no pelear con la rotación por CSS).
 * - Destello: al chocar con un borde se enciende un glow en el
 *   vinilo y una onda de luz en el punto del rebote.
 * - Accesibilidad: con prefers-reduced-motion se queda quieto y
 *   centrado (como el vinilo estático de siempre).
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import LogoDaCapo from '../ui/LogoDaCapo';

const ViniloViajero = () => {
    const contenedorRef = useRef<HTMLDivElement>(null);
    const discoRef = useRef<HTMLDivElement>(null);
    const estrellaRef = useRef<HTMLDivElement>(null);
    const timerDestello = useRef<number>();

    const [destello, setDestello] = useState(false);

    useEffect(() => {
        const disco = discoRef.current;
        const estrella = estrellaRef.current;
        if (!disco || !estrella) return;

        const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
        const tactil = window.matchMedia('(pointer: coarse)');
        const esMovil = () => tactil.matches || window.innerWidth < 768;

        if (movimientoReducido.matches) return;

        let raf = 0;
        let ancho = window.innerWidth;
        let alto = window.innerHeight;
        let detener = false;

        const iniciar = () => {
            const movil = esMovil();
            const tam = movil ? Math.min(ancho * 0.585, 312) : 510;
            disco.style.width = `${tam}px`;
            disco.style.height = `${tam}px`;

            // Posición inicial: al centro, para no iniciar chocando
            let x = ancho / 2 - tam / 2;
            let y = alto * 0.38 - tam / 2;
            // Velocidad en px/fotograma (60fps): lenta en PC, aún más lenta en móvil
            const dirX = Math.random() > 0.5 ? 1 : -1;
            let vx = (movil ? 0.85 : 1.2) * dirX;
            let vy = (movil ? 0.68 : 1.0) * dirX;
            let rot = 0;

            let ultimo = performance.now();

            const destellar = (px: number, py: number) => {
                setDestello(true);
                estrella.style.left = `${px}px`;
                estrella.style.top = `${py}px`;
                estrella.classList.remove('vinilo-estrella-activa');
                // Fuerza el reflow para reiniciar la animación CSS de la estrella
                void estrella.offsetWidth;
                estrella.classList.add('vinilo-estrella-activa');
                window.clearTimeout(timerDestello.current);
                timerDestello.current = window.setTimeout(() => setDestello(false), 420);
            };

            const paso = (t: number) => {
                if (detener) return;
                const dt = Math.min((t - ultimo) / 16.667, 3);
                ultimo = t;

                x += vx * dt;
                y += vy * dt;
                rot += (esMovil() ? 0.55 : 0.9) * dt;

                // Rebote contra las paredes (margen para que la etiqueta nunca se corte)
                if (x <= 8) { x = 8; vx = Math.abs(vx); destellar(x, y + tam / 2); }
                else if (x + tam >= ancho - 8) { x = ancho - tam - 8; vx = -Math.abs(vx); destellar(x + tam, y + tam / 2); }
                if (y <= 8) { y = 8; vy = Math.abs(vy); destellar(x + tam / 2, y); }
                else if (y + tam >= alto - 8) { y = alto - tam - 8; vy = -Math.abs(vy); destellar(x + tam / 2, y + tam); }

                disco.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
                raf = requestAnimationFrame(paso);
            };

            raf = requestAnimationFrame(paso);
        };

        const alRedimensionar = () => {
            ancho = window.innerWidth;
            alto = window.innerHeight;
        };

        window.addEventListener('resize', alRedimensionar);

        // Espera un instante para montar el disco con su tamaño correcto
        const id = window.setTimeout(iniciar, 60);

        return () => {
            detener = true;
            window.clearTimeout(id);
            window.clearTimeout(timerDestello.current);
            window.removeEventListener('resize', alRedimensionar);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            ref={contenedorRef}
            aria-hidden
            className="absolute inset-0 pointer-events-none select-none"
        >
            {/* Vinilo viajero */}
            <div
                ref={discoRef}
                className={`vinilo-viajero absolute top-0 left-0 ${destello ? 'vinilo-destello' : ''}`}
            >
                <div className="vinilo-disco absolute inset-0 rounded-full">
                    <div className="vinilo-surcos absolute inset-0 rounded-full" />
                    <div className="vinilo-reflejo absolute inset-0 rounded-full" />
                    <div className="vinilo-etiqueta absolute inset-[26%] rounded-full flex items-center justify-center">
                        <LogoDaCapo className="w-[72%] h-[72%]" colorClase="text-white" />
                    </div>
                </div>
            </div>

            {/* Estrella de luz en el punto de rebote */}
            <div ref={estrellaRef} className="vinilo-estrella absolute w-20 h-20" />
        </div>
    );
};

export default ViniloViajero;