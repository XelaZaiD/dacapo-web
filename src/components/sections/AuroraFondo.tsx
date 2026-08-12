/**
 * ============================================================
 * ARCHIVO: src/components/sections/AuroraFondo.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Fondo animado con manchas de color (aurora) que flotan
 * lentamente. Sustituye a los gradientes estáticos del Hero.
 *
 * Los colores usan variables CSS (--aurora-*) definidas en
 * index.css, así que cambian con el modo oscuro/claro.
 *
 * Movimiento solo de transform (escala/posición) para que
 * corra en la GPU y no compita con el canvas del pentagrama.
 * ============================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

const MANCHAS = [
    {
        colorVar: 'var(--aurora-1)',
        posicion: { top: '12%', left: '-8%' },
        tamanio: 'w-[28rem] h-[28rem] md:w-[36rem] md:h-[36rem]',
        duracion: 20,
        retraso: 0,
    },
    {
        colorVar: 'var(--aurora-2)',
        posicion: { top: '26%', right: '-10%' },
        tamanio: 'w-[24rem] h-[24rem] md:w-[32rem] md:h-[32rem]',
        duracion: 26,
        retraso: 3,
    },
    {
        colorVar: 'var(--aurora-3)',
        posicion: { bottom: '6%', left: '18%' },
        tamanio: 'w-[26rem] h-[26rem] md:w-[34rem] md:h-[34rem]',
        duracion: 18,
        retraso: 6,
    },
];

const AuroraFondo = () => {
    // Respetar prefers-reduced-motion: sin movimiento
    const [animar] = useState(
        () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {MANCHAS.map((mancha, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[90px] will-change-transform ${mancha.tamanio}`}
                    style={{ ...mancha.posicion, backgroundColor: mancha.colorVar }}
                    animate={animar ? {
                        x: [0, 45, -35, 0],
                        y: [0, -40, 25, 0],
                        scale: [1, 1.12, 0.96, 1],
                    } : undefined}
                    transition={{
                        duration: mancha.duracion,
                        delay: mancha.retraso,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

export default AuroraFondo;