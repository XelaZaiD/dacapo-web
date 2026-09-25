/**
 * ============================================================
 * ARCHIVO: src/components/sections/HeroSection.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es la primera sección que ve el usuario al entrar a la web.
 * Grande, impactante y con animaciones. Contiene el título
 * principal, subtítulo, botones de acción y un fondo animado
 * con partículas/notas musicales flotantes.
 *
 * ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
 * - AppContext.tsx: para obtener el nombre y descripción del grupo
 * - index.css: usa las clases CSS personalizadas definidas allí
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * - Para cambiar el texto del título: busca "tituloPrincipal" y edítalo
 * - Para cambiar los botones: busca los elementos <button> y cambia el texto
 * - Para cambiar el número de notas flotantes: modifica el array de "notas"
 * ============================================================
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Play, Calendar, Music2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AuroraFondo from './AuroraFondo';
import ViniloViajero from './ViniloViajero';
import MarqueeMusical from './MarqueeMusical';

// ============================================================
// NOTAS MUSICALES PARA EL FONDO ANIMADO
// ============================================================
// Cada nota tiene: el símbolo musical, y propiedades de animación
// (posición horizontal, tamaño, velocidad y retraso)
const NOTAS_FLOTANTES = [
    { simbolo: '♩', x: '10%', tamanio: 42, duracion: 8, retraso: 0 },
    { simbolo: '♪', x: '25%', tamanio: 28, duracion: 12, retraso: 2 },
    { simbolo: '♫', x: '40%', tamanio: 35, duracion: 10, retraso: 4 },
    { simbolo: '♩', x: '55%', tamanio: 32, duracion: 9, retraso: 1 },
    { simbolo: '♬', x: '70%', tamanio: 39, duracion: 11, retraso: 3 },
    { simbolo: '♪', x: '85%', tamanio: 25, duracion: 7, retraso: 5 },
    { simbolo: '𝄞', x: '15%', tamanio: 49, duracion: 15, retraso: 6 }, // Clave de Sol
    { simbolo: '♫', x: '90%', tamanio: 28, duracion: 10, retraso: 2 },
    { simbolo: '♩', x: '60%', tamanio: 21, duracion: 8, retraso: 7 },
    { simbolo: '♬', x: '35%', tamanio: 35, duracion: 13, retraso: 3 },
];

// ============================================================
// COMPONENTE DE CANVAS: Pentagrama animado
// ============================================================
// Este componente dibuja líneas horizontales como un pentagrama musical
const PentagramaAnimado = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ajusta el tamaño del canvas al tamaño de la ventana
        const ajustarTamanio = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        ajustarTamanio();
        window.addEventListener('resize', ajustarTamanio);

        let anguloAnimacion = 0;

        // Función que dibuja un frame del pentagrama
        const dibujar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

            // Dibuja 5 líneas de pentagrama por grupo, con 3 grupos
            for (let grupo = 0; grupo < 3; grupo++) {
                const offsetY = canvas.height * 0.2 + grupo * (canvas.height * 0.3);

                for (let linea = 0; linea < 5; linea++) {
                    const y = offsetY + linea * 16;
                    // Efecto de onda sinusoidal en las líneas
                    const onda = Math.sin(anguloAnimacion + linea * 0.3 + grupo * 1.2) * 3;

                    ctx.beginPath();
                    ctx.moveTo(0, y + onda);

                    // Dibuja la línea con curvas suaves
                    for (let x = 0; x < canvas.width; x += 20) {
                        const ondaX = Math.sin(anguloAnimacion * 0.5 + x * 0.005 + linea * 0.5) * 2;
                        ctx.lineTo(x, y + onda + ondaX);
                    }

                    // Color muy sutil (casi transparente)
                    ctx.strokeStyle = `rgba(240, 230, 140, ${0.02 + linea * 0.005})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            anguloAnimacion += 0.005; // Velocidad de la animación
            requestAnimationFrame(dibujar); // Llama a la función de nuevo en el próximo frame
        };

        dibujar(); // Inicia el bucle de animación

        return () => window.removeEventListener('resize', ajustarTamanio);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: HeroSection
// ============================================================
const HeroSection = () => {
    const { infoGrupo, configuracionSecciones, integrantes, eventos, partituras } = useApp();

    // Calcula los años de trayectoria desde la fecha de fundación
    const aniosTrayectoria = new Date().getFullYear() - infoGrupo.anioFundacion;
    const conciertosRealizados = eventos.filter(e => e.activo && new Date(e.fecha).getTime() <= Date.now()).length;

    // Función para hacer scroll suave a una sección
    const irASeccion = (id: string) => {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            id="inicio"
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-fondo-oscuro"
        >
            {/* ---- FONDO: Aurora animada (dinámica por tema) ---- */}
            <AuroraFondo />

            {/* ---- VINILO VIAJERO DE FONDO (salvapantallas DVD) ---- */}
            <ViniloViajero />

            {/* ---- FONDO: Pentagrama animado ---- */}
            <PentagramaAnimado />

            {/* ---- NOTAS MUSICALES FLOTANTES ---- */}
            {NOTAS_FLOTANTES.map((nota, indice) => (
                <motion.span
                    key={indice}
                    className="absolute pointer-events-none select-none font-display
                               text-[var(--nota-hero)] drop-shadow-[0_0_8px_var(--nota-hero-glow)]"
                    style={{
                        left: nota.x,        // Posición horizontal
                        bottom: '-10%',      // Empieza por debajo de la pantalla
                        fontSize: nota.tamanio,
                    }}
                    animate={{
                        y: [0, -(window.innerHeight * 1.2)], // Sube hacia arriba
                        opacity: [0, 0.8, 0],                // Aparece y desaparece
                        rotate: [0, 360],                    // Rota mientras sube
                    }}
                    transition={{
                        duration: nota.duracion,    // Duración del viaje
                        delay: nota.retraso,        // Cuánto espera antes de empezar
                        repeat: Infinity,           // Se repite infinitamente
                        ease: 'linear',
                    }}
                >
                    {nota.simbolo}
                </motion.span>
            ))}

            {/* ---- CONTENIDO PRINCIPAL ---- */}
            <div className="contenedor relative z-10 text-center py-28">

                {/* Badge superior */}
                <motion.div
                    className="inline-flex items-center gap-2 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                >
                    <div className="badge-khaki flex items-center gap-2">
                        <Music2 className="w-3 h-3" />
                        {aniosTrayectoria}+ Años de Trayectoria Artística
                    </div>
                </motion.div>

                {/* Título principal con revelado letra a letra */}
                <motion.h1
                    className="font-display font-black text-secundario leading-none mb-6"
                    style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }} // Tamaño fluido
                    initial="oculto"
                    animate="visible"
                >
                    {/* "DaCapo": cada letra aparece con desenfoque -> nitidez */}
                    <motion.span
                        className="block"
                        variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.55 } } }}
                    >
                        {infoGrupo.nombre.split('').map((letra, i) => (
                            <motion.span
                                key={i}
                                className="inline-block texto-gradiente"
                                variants={{
                                    oculto: { opacity: 0, y: '0.6em', filter: 'blur(12px)' },
                                    visible: {
                                        opacity: 1, y: 0, filter: 'blur(0px)',
                                        transition: { duration: 0.55, ease: 'easeOut' },
                                    },
                                }}
                            >
                                {letra}
                            </motion.span>
                        ))}
                    </motion.span>
                    {/* "Grupo Vocal" con un pequeño retraso */}
                    <motion.span
                        className="block text-secundario/90 text-[0.45em] font-sans font-light tracking-[0.3em] uppercase mt-[0.35em]"
                        variants={{
                            oculto: { opacity: 0, y: 16 },
                            visible: { opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.6 } },
                        }}
                    >
                        {infoGrupo.subtitulo}
                    </motion.span>
                </motion.h1>

                {/* Línea decorativa */}
                <motion.div
                    className="flex justify-center mb-8"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-vinotinto to-khaki" />
                    <div className="w-2 h-2 rounded-full bg-khaki mx-3 -mt-[3px]" />
                    <div className="h-px w-32 bg-gradient-to-r from-khaki via-vinotinto to-transparent" />
                </motion.div>

                {/* Descripción */}
                <motion.p
                    className="t-muted-high text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    {infoGrupo.descripcion}
                </motion.p>

                {/* Botones de acción */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                >
                    {/* Botón principal: Ver conciertos */}
                    {configuracionSecciones.mostrarEventos && (
                        <button
                            onClick={() => irASeccion('#eventos')}
                            className="btn-primario text-base px-8 py-4"
                        >
                            <Calendar className="w-5 h-5" />
                            Próximos Conciertos
                        </button>
                    )}

                    {/* Botón secundario: Escuchar demos */}
                    <button
                        onClick={() => irASeccion('#presentaciones')}
                        className="btn-secundario text-base px-8 py-4"
                    >
                        <Play className="w-5 h-5" />
                        Escuchar Demos
                    </button>
                </motion.div>

                {/* Estadísticas rápidas */}
                <motion.div
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    {[
                        { valor: `${aniosTrayectoria}+`, etiqueta: 'Años' },
                        { valor: `${conciertosRealizados}+`, etiqueta: 'Conciertos' },
                        { valor: `${integrantes.length}`, etiqueta: 'Coristas' },
                        { valor: `${partituras.length}+`, etiqueta: 'Partituras' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-4 rounded-xl bg-sutil border borde-subtle">
                            <div className="text-3xl font-display font-bold texto-gradiente">{stat.valor}</div>
                            <div className="text-xs t-muted uppercase tracking-widest mt-1">{stat.etiqueta}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ---- MARQUEE MUSICAL (banda infinita) ---- */}
            <MarqueeMusical />

            {/* ---- INDICADOR DE SCROLL (flecha hacia abajo) ---- */}
            <motion.button
                onClick={() => irASeccion('#nosotros')}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 t-muted-low hover:text-khaki
                   transition-colors duration-300 z-[5]"
                animate={{ y: [0, 10, 0] }}          // Animación de rebote vertical
                transition={{ duration: 2, repeat: Infinity }} // Se repite infinitamente
            >
                <ChevronDown className="w-8 h-8" />
            </motion.button>
        </section>
    );
};

export default HeroSection;
