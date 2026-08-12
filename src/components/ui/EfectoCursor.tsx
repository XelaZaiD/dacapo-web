import { useEffect, useRef, useCallback } from 'react';

type Particula = {
    id: number;
    x: number;
    y: number;
    nota: string;
    angulo: number;
    vida: number;
    maxVida: number;
    velocidad: number;
    tamanio: number;
};

const NOTAS = ['♩', '♪', '♫', '♬', '🎵', '🎶'];
const MAX_PARTICULAS = 16;
const INTERVALO = 90;

// Lee el color y el brillo de las variables CSS del tema activo
// (cambian con el modo oscuro/claro)
const leerColorTema = (variable: string, fallback: string): string => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return valor || fallback;
};

const EfectoCursor = () => {
    const particulasRef = useRef<Particula[]>([]);
    const idRef = useRef(0);
    const ultimoRef = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    const dibujar = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const colorNota = leerColorTema('--cursor-nota', '#9B4450');
        const colorBrillo = leerColorTema('--cursor-glow', 'rgba(155,68,80,0.45)');

        particulasRef.current = particulasRef.current.filter(p => {
            p.vida -= 0.02;
            if (p.vida <= 0) return false;

            p.x += Math.cos(p.angulo) * p.velocidad;
            p.y += Math.sin(p.angulo) * p.velocidad - 0.5;
            p.angulo += 0.02;

            const opacidad = p.vida / p.maxVida;
            ctx.save();
            ctx.globalAlpha = opacidad * 0.85;
            // Brillo neón alrededor de la nota
            ctx.shadowColor = colorBrillo;
            ctx.shadowBlur = 14;
            ctx.font = `${p.tamanio}px serif`;
            ctx.fillStyle = colorNota;
            ctx.fillText(p.nota, p.x, p.y);
            ctx.restore();

            return true;
        });

        animRef.current = requestAnimationFrame(dibujar);
    }, []);

    useEffect(() => {
        const alMover = (e: MouseEvent) => {
            const ahora = Date.now();
            if (ahora - ultimoRef.current < INTERVALO) return;
            ultimoRef.current = ahora;

            if (particulasRef.current.length >= MAX_PARTICULAS) {
                particulasRef.current.shift();
            }

            particulasRef.current.push({
                id: idRef.current++,
                x: e.clientX,
                y: e.clientY,
                nota: NOTAS[Math.floor(Math.random() * NOTAS.length)],
                angulo: (Math.random() - 0.5) * 0.5,
                vida: 1,
                maxVida: 1,
                velocidad: 0.5 + Math.random() * 0.5,
                tamanio: 18 + Math.random() * 16,
            });
        };

        window.addEventListener('mousemove', alMover);
        animRef.current = requestAnimationFrame(dibujar);

        return () => {
            window.removeEventListener('mousemove', alMover);
            cancelAnimationFrame(animRef.current);
        };
    }, [dibujar]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[60]"
            aria-hidden="true"
        />
    );
};

export default EfectoCursor;
