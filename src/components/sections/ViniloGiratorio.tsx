/**
 * ============================================================
 * ARCHIVO: src/components/sections/ViniloGiratorio.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Un vinilo (disco de vinilo) que gira continuamente con el logo
 * de DaCapo como etiqueta central. Sigue al mouse con inclinación
 * 3D (tilt) suave, como un tocadiscos flotante.
 *
 * Los colores del disco vienen de variables CSS (--vinilo-*)
 * definidas en index.css, por lo que se adaptan automáticamente
 * al modo oscuro y al modo claro.
 *
 * Accesibilidad:
 * - En móviles (sin mouse) el tilt se desactiva, solo gira.
 * - Con prefers-reduced-motion el disco se detiene.
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import LogoDaCapo from '../ui/LogoDaCapo';

const ViniloGiratorio = () => {
    const contenedorRef = useRef<HTMLDivElement>(null);

    // Rotación de inclinación 3D (valores crudos)
    const rotX = useMotionValue(0);
    const rotY = useMotionValue(0);
    // Versiones suavizadas (amortiguación estilo resorte)
    const rotXSuave = useSpring(rotX, { stiffness: 150, damping: 20 });
    const rotYSuave = useSpring(rotY, { stiffness: 150, damping: 20 });

    const [tiltActivo, setTiltActivo] = useState(false);

    // Detecta si el dispositivo tiene mouse y si el usuario
    // prefiere menos movimiento
    useEffect(() => {
        const tactil = window.matchMedia('(pointer: coarse)');
        const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
        const actualizar = () => {
            setTiltActivo(!tactil.matches && !movimientoReducido.matches);
        };
        actualizar();
        tactil.addEventListener('change', actualizar);
        movimientoReducido.addEventListener('change', actualizar);
        return () => {
            tactil.removeEventListener('change', actualizar);
            movimientoReducido.removeEventListener('change', actualizar);
        };
    }, []);

    // Escucha el mouse globalmente y calcula la inclinación
    // según la posición del puntero respecto al centro del disco
    useEffect(() => {
        if (!tiltActivo) return;
        const alMover = (e: PointerEvent) => {
            const el = contenedorRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const centroX = rect.left + rect.width / 2;
            const centroY = rect.top + rect.height / 2;
            const relX = (e.clientX - centroX) / (rect.width / 2);
            const relY = (e.clientY - centroY) / (rect.height / 2);
            rotX.set(-relY * 12);
            rotY.set(relX * 12);
        };
        window.addEventListener('pointermove', alMover);
        return () => window.removeEventListener('pointermove', alMover);
    }, [tiltActivo, rotX, rotY]);

    return (
        <motion.div
            ref={contenedorRef}
            className="relative w-[20.25rem] h-[20.25rem] sm:w-[27rem] sm:h-[27rem] md:w-[33.75rem] md:h-[33.75rem] lg:w-[36rem] lg:h-[36rem] mx-auto"
            style={{ perspective: 1200 }}
        >
            {/* Cuerpo del vinilo con inclinación 3D */}
            <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                style={{ rotateX: rotXSuave, rotateY: rotYSuave }}
            >
                {/* Disco que gira (la animación es CSS pura, muy ligera) */}
                <div className="vinilo-gira absolute inset-0 rounded-full vinilo-disco">
                    {/* Surcos del vinilo */}
                    <div className="vinilo-surcos absolute inset-0 rounded-full" />
                    {/* Reflejo de luz */}
                    <div className="vinilo-reflejo absolute inset-0 rounded-full" />
                    {/* Etiqueta central con el logo, con profundidad 3D */}
                    <div
                        className="vinilo-etiqueta absolute inset-[26%] rounded-full flex items-center justify-center"
                        style={{ transform: 'translateZ(24px)' }}
                    >
                        <LogoDaCapo className="w-[72%] h-[72%]" colorClase="text-white" />
                    </div>
                </div>
            </motion.div>

            {/* Luz de escenario bajo el disco (brillo dinámico por tema) */}
            <div className="vinilo-brillo absolute -bottom-8 left-1/2 -translate-x-1/2
                            w-[70%] h-8 rounded-full blur-2xl opacity-70" />
        </motion.div>
    );
};

export default ViniloGiratorio;