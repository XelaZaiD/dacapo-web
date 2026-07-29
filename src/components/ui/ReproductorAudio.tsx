/**
 * ============================================================
 * ARCHIVO: src/components/ui/ReproductorAudio.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el reproductor de música que flota en la parte inferior
 * de la pantalla. Siempre está visible mientras navegas.
 * Tiene controles de play/pausa, pista anterior/siguiente,
 * barra de progreso y un ecualizador animado.
 *
 * ¿CÓMO EDITARLO?
 * - Las pistas de audio se gestionan desde el Panel Admin
 * - Para cambiar las pistas de ejemplo, edita pistasAudioDefault
 *   en mockData.ts
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ============================================================
// COMPONENTE: Ecualizador Animado
// ============================================================
// Muestra 4 barras que suben y bajan cuando hay música reproduciéndose
const EcualizadorAnimado = ({ reproduciendo }: { reproduciendo: boolean }) => {
    // Las barras tienen diferentes alturas y velocidades para verse dinámico
    const barras = [
        { alturaNormal: '40%', duracion: 0.5, retraso: 0 },
        { alturaNormal: '80%', duracion: 0.7, retraso: 0.1 },
        { alturaNormal: '55%', duracion: 0.6, retraso: 0.2 },
        { alturaNormal: '90%', duracion: 0.4, retraso: 0.15 },
    ];

    return (
        <div className="flex items-end gap-0.5 h-4 w-4">
            {barras.map((barra, i) => (
                <motion.div
                    key={i}
                    className="flex-1 bg-khaki rounded-sm"
                    animate={reproduciendo ? {
                        scaleY: [0.3, 1, 0.3],        // Escala vertical: sube y baja
                        height: ['30%', barra.alturaNormal, '30%'],
                    } : { scaleY: 0.3, height: '30%' }} // Quieto cuando no reproduce
                    transition={{
                        duration: barra.duracion,
                        delay: barra.retraso,
                        repeat: reproduciendo ? Infinity : 0, // Se repite solo si reproduce
                        ease: 'easeInOut',
                    }}
                    style={{ originY: 1 }} // La escala se hace desde abajo
                />
            ))}
        </div>
    );
};

// ============================================================
// COMPONENTE: Barra de Progreso
// ============================================================
const BarraProgreso = ({
    progreso,
    duracion,
    alCambiarProgreso
}: {
    progreso: number;
    duracion: number;
    alCambiarProgreso: (nuevoProgreso: number) => void;
}) => {
    const barraRef = useRef<HTMLDivElement>(null);

    // Al hacer clic en la barra, calcula en qué punto se hizo clic
    const manejarClic = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!barraRef.current) return;
        const rect = barraRef.current.getBoundingClientRect();
        const fraccion = (e.clientX - rect.left) / rect.width;
        alCambiarProgreso(fraccion * duracion); // Nuevo tiempo de reproducción
    };

    // Convierte segundos a formato "mm:ss"
    const formatearTiempo = (segundos: number): string => {
        const mins = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        return `${mins}:${segs.toString().padStart(2, '0')}`;
    };

    const porcentaje = duracion > 0 ? (progreso / duracion) * 100 : 0;

    return (
        <div className="flex items-center gap-2 w-full">
            {/* Tiempo transcurrido */}
            <span className="text-[10px] text-white/40 w-8 text-right tabular-nums">
                {formatearTiempo(progreso)}
            </span>

            {/* Barra de progreso clickeable */}
            <div
                ref={barraRef}
                className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
                onClick={manejarClic}
            >
                {/* Parte rellena */}
                <div
                    className="h-full bg-gradient-to-r from-vinotinto to-khaki rounded-full"
                    style={{ width: `${porcentaje}%` }}
                />
                {/* Punto de control (thumb) que aparece al hacer hover */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white
                     opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${porcentaje}%`, transform: 'translate(-50%, -50%)' }}
                />
            </div>

            {/* Tiempo total */}
            <span className="text-[10px] text-white/40 w-8 tabular-nums">
                {formatearTiempo(duracion)}
            </span>
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: ReproductorAudio
// ============================================================
const ReproductorAudio = () => {
    const { pistasAudio } = useApp();

    // Estado: índice de la pista actual en el array
    const [indicePistaActual, setIndicePistaActual] = useState(0);
    // Estado: si está reproduciéndose
    const [estaReproduciendo, setEstaReproduciendo] = useState(false);
    // Estado: tiempo de progreso en segundos
    const [progreso, setProgreso] = useState(0);
    // Estado: duración total de la canción en segundos
    const [duracion, setDuracion] = useState(0);
    // Estado: si el audio está silenciado
    const [silenciado, setSilenciado] = useState(false);
    // Estado: si el reproductor está expandido (visible completo) o minimizado
    const [expandido, setExpandido] = useState(true);
    // Referencia al elemento <audio> HTML nativo
    const audioRef = useRef<HTMLAudioElement>(null);

    // La pista que se está reproduciendo ahora mismo
    const pistaActual = pistasAudio[indicePistaActual];

    // Efecto: cuando cambia la pista, reinicia el progreso
    useEffect(() => {
        setProgreso(0);
        if (audioRef.current && estaReproduciendo) {
            audioRef.current.play().catch(() => { });
        }
    }, [indicePistaActual]);

    // Funciones de control del reproductor
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (estaReproduciendo) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {
                console.log('El navegador bloqueó la reproducción automática.');
            });
        }
        setEstaReproduciendo(!estaReproduciendo);
    };

    const pistaAnterior = () => {
        setIndicePistaActual(prev => prev === 0 ? pistasAudio.length - 1 : prev - 1);
    };

    const pistaSiguiente = () => {
        setIndicePistaActual(prev => prev === pistasAudio.length - 1 ? 0 : prev + 1);
    };

    const cambiarProgreso = (nuevoTiempo: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = nuevoTiempo;
        setProgreso(nuevoTiempo);
    };

    if (!pistaActual) return null;

    return (
        <>
            {/* Elemento de audio HTML nativo (invisible, maneja el audio real) */}
            <audio
                ref={audioRef}
                src={pistaActual.urlAudio}
                onTimeUpdate={() => setProgreso(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuracion(audioRef.current?.duration || 0)}
                onEnded={pistaSiguiente} // Al terminar una pista, pasa a la siguiente
                muted={silenciado}
            />

            {/* ---- REPRODUCTOR FLOTANTE ---- */}
            <motion.div
                className="fixed bottom-4 left-1/2 z-40"
                style={{ translateX: '-50%' }}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
            >
                <div className={`bg-fondo-oscuro/95 backdrop-blur-xl border border-white/10 rounded-2xl
                         shadow-2xl transition-all duration-300 ${expandido ? 'w-[360px] sm:w-[440px]' : 'w-auto'}`}>

                    {/* ---- CABECERA DEL REPRODUCTOR ---- */}
                    <div className="flex items-center gap-3 p-3">

                        {/* Portada / Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-vinotinto/30 flex items-center justify-center overflow-hidden">
                                {pistaActual.portada ? (
                                    <img src={pistaActual.portada} alt={pistaActual.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <Music className="w-5 h-5 text-vinotinto-claro" />
                                )}
                            </div>
                            {/* Ecualizador encima de la portada cuando reproduce */}
                            {estaReproduciendo && (
                                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                    <EcualizadorAnimado reproduciendo={estaReproduciendo} />
                                </div>
                            )}
                        </div>

                        {/* Título y compositor */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-secundario truncate">{pistaActual.titulo}</p>
                            <p className="text-[10px] text-white/40 truncate">{pistaActual.compositor}</p>
                        </div>

                        {/* Controles principales */}
                        <div className="flex items-center gap-1">
                            <button onClick={pistaAnterior} className="w-7 h-7 flex items-center justify-center
                             text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                                <SkipBack className="w-3.5 h-3.5" />
                            </button>

                            {/* Botón principal Play/Pausa */}
                            <button
                                onClick={togglePlay}
                                className="w-9 h-9 rounded-full bg-vinotinto hover:bg-vinotinto-claro
                           flex items-center justify-center transition-all duration-300
                           shadow-glow-vinotinto hover:shadow-lg"
                            >
                                {estaReproduciendo
                                    ? <Pause className="w-4 h-4 text-white fill-white" />
                                    : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                }
                            </button>

                            <button onClick={pistaSiguiente} className="w-7 h-7 flex items-center justify-center
                             text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                                <SkipForward className="w-3.5 h-3.5" />
                            </button>

                            {/* Silenciar */}
                            <button onClick={() => setSilenciado(!silenciado)}
                                className="w-7 h-7 flex items-center justify-center
                           text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                                {silenciado ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>

                            {/* Expandir/Contraer */}
                            <button onClick={() => setExpandido(!expandido)}
                                className="w-7 h-7 flex items-center justify-center
                           text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                                {expandido ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    {/* ---- BARRA DE PROGRESO (solo si expandido) ---- */}
                    <AnimatePresence>
                        {expandido && (
                            <motion.div
                                className="px-4 pb-3"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <BarraProgreso
                                    progreso={progreso}
                                    duracion={duracion}
                                    alCambiarProgreso={cambiarProgreso}
                                />

                                {/* Lista de pistas */}
                                <div className="mt-3 flex gap-1.5 overflow-x-auto sin-scrollbar">
                                    {pistasAudio.map((pista, i) => (
                                        <button
                                            key={pista.id}
                                            onClick={() => { setIndicePistaActual(i); setEstaReproduciendo(true); }}
                                            className={`flex-shrink-0 text-[9px] px-2 py-1 rounded-md transition-all ${i === indicePistaActual
                                                    ? 'bg-vinotinto text-white'
                                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {pista.titulo.substring(0, 15)}{pista.titulo.length > 15 ? '...' : ''}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    );
};

export default ReproductorAudio;
