import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Music, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const EcualizadorAnimado = ({ reproduciendo }: { reproduciendo: boolean }) => {
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
                        scaleY: [0.3, 1, 0.3],
                        height: ['30%', barra.alturaNormal, '30%'],
                    } : { scaleY: 0.3, height: '30%' }}
                    transition={{
                        duration: barra.duracion,
                        delay: barra.retraso,
                        repeat: reproduciendo ? Infinity : 0,
                        ease: 'easeInOut',
                    }}
                    style={{ originY: 1 }}
                />
            ))}
        </div>
    );
};

const BarraProgreso = ({
    progreso, duracion, alCambiarProgreso
}: {
    progreso: number; duracion: number; alCambiarProgreso: (n: number) => void;
}) => {
    const barraRef = useRef<HTMLDivElement>(null);
    const manejarClic = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!barraRef.current) return;
        const rect = barraRef.current.getBoundingClientRect();
        const fraccion = (e.clientX - rect.left) / rect.width;
        alCambiarProgreso(fraccion * duracion);
    };
    const formatearTiempo = (segundos: number): string => {
        const mins = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        return `${mins}:${segs.toString().padStart(2, '0')}`;
    };
    const porcentaje = duracion > 0 ? (progreso / duracion) * 100 : 0;
    return (
        <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] t-muted w-8 text-right tabular-nums">{formatearTiempo(progreso)}</span>
            <div ref={barraRef} className="flex-1 h-1 bg-sutil-hover rounded-full cursor-pointer group relative" onClick={manejarClic}>
                <div className="h-full bg-gradient-to-r from-vinotinto to-khaki rounded-full" style={{ width: `${porcentaje}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${porcentaje}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
            <span className="text-[10px] t-muted w-8 tabular-nums">{formatearTiempo(duracion)}</span>
        </div>
    );
};

const ReproductorAudio = () => {
    const { pistasAudio } = useApp();
    const [indicePistaActual, setIndicePistaActual] = useState(0);
    const [estaReproduciendo, setEstaReproduciendo] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [duracion, setDuracion] = useState(0);
    const [abierto, setAbierto] = useState(false);
    const [hoverVinilo, setHoverVinilo] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const pistaActual = pistasAudio[indicePistaActual];

    useEffect(() => {
        setProgreso(0);
        if (audioRef.current && estaReproduciendo) {
            audioRef.current.play().catch(() => { });
        }
        // Intencional: solo reproducir al cambiar de pista
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indicePistaActual]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (estaReproduciendo) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => console.log('Bloqueó autoplay.'));
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
            {/* Elemento <audio> oculto que maneja la reproducción real */}
            <audio
                ref={audioRef}
                src={pistaActual.urlAudio}
                onTimeUpdate={() => setProgreso(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuracion(audioRef.current?.duration || 0)}
                onEnded={pistaSiguiente}
            />

            {/* ---- REPRODUCTOR EXPANDIDO (modal centrado) ---- */}
            <AnimatePresence>
                {abierto && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setAbierto(false)}
                    >
                        <motion.div
                            className="bg-fondo-oscuro/95 backdrop-blur-xl border borde-subtle rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Cabecera */}
                            <div className="flex items-center justify-between p-4 border-b borde-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-vinotinto flex items-center justify-center">
                                        <Music className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-secundario">DaCapo Player</p>
                                        <p className="text-[10px] t-muted">Reproductor Musical</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAbierto(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-red-500/10 t-muted hover:text-red-400 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Contenido */}
                            <div className="p-6 space-y-5">
                                {/* Info pista */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-vinotinto/30 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                                        {pistaActual.portada ? (
                                            <img src={pistaActual.portada} alt={pistaActual.titulo} className="w-full h-full object-cover" />
                                        ) : (
                                            <Music className="w-7 h-7 text-vinotinto-claro" />
                                        )}
                                        {estaReproduciendo && (
                                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                                <EcualizadorAnimado reproduciendo={estaReproduciendo} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-secundario truncate">{pistaActual.titulo}</p>
                                        <p className="text-xs t-muted truncate">{pistaActual.compositor}</p>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <BarraProgreso progreso={progreso} duracion={duracion} alCambiarProgreso={cambiarProgreso} />

                                {/* Controles */}
                                <div className="flex items-center justify-center gap-6">
                                    <button onClick={pistaAnterior} className="w-10 h-10 flex items-center justify-center t-muted hover:text-secundario transition-colors rounded-full hover:bg-sutil-hover">
                                        <SkipBack className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="w-14 h-14 rounded-full bg-vinotinto hover:bg-vinotinto-claro flex items-center justify-center transition-all duration-300 shadow-glow-vinotinto"
                                    >
                                        {estaReproduciendo
                                            ? <Pause className="w-6 h-6 text-white fill-white" />
                                            : <Play className="w-6 h-6 text-white fill-white ml-1" />
                                        }
                                    </button>
                                    <button onClick={pistaSiguiente} className="w-10 h-10 flex items-center justify-center t-muted hover:text-secundario transition-colors rounded-full hover:bg-sutil-hover">
                                        <SkipForward className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Lista de pistas */}
                                <div className="flex gap-1.5 overflow-x-auto sin-scrollbar pt-2 border-t borde-subtle">
                                    {pistasAudio.map((pista, i) => (
                                        <button
                                            key={pista.id}
                                            onClick={() => { setIndicePistaActual(i); setEstaReproduciendo(true); }}
                                            className={`flex-shrink-0 text-[9px] px-2 py-1 rounded-md transition-all ${i === indicePistaActual
                                                    ? 'bg-vinotinto text-white'
                                                    : 'bg-sutil t-muted hover:bg-sutil-hover'
                                                }`}
                                        >
                                            {pista.titulo.substring(0, 12)}{pista.titulo.length > 12 ? '...' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- ICONO DE VINILO (siempre visible, esquina inferior izquierda) ---- */}
            <div className="fixed bottom-4 left-4 z-40">
                <motion.button
                    onClick={() => setAbierto(!abierto)}
                    onMouseEnter={() => setHoverVinilo(true)}
                    onMouseLeave={() => setHoverVinilo(false)}
                    className="w-14 h-14 rounded-full bg-vinotinto hover:bg-vinotinto-claro shadow-glow-vinotinto
                        flex items-center justify-center transition-all duration-300 relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Disco de vinilo */}
                    <motion.div
                        animate={estaReproduciendo ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                            border-2 borde-medium flex items-center justify-center relative overflow-hidden"
                        style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
                    >
                        {/* Surcos del vinilo */}
                        <div className="absolute inset-2 rounded-full border borde-subtle" />
                        <div className="absolute inset-3 rounded-full border borde-subtle" />
                        <div className="absolute inset-4 rounded-full border borde-subtle" />
                        
                        {/* Brillo reflectante que se mueve */}
                        {estaReproduciendo && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        )}

                        {/* Centro del vinilo (etiqueta) */}
                        <div className="w-5 h-5 rounded-full bg-vinotinto flex items-center justify-center z-10 ring-1 ring-white/20">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    </motion.div>

                    {/* Efecto pulsante cuando reproduce */}
                    {estaReproduciendo && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{ boxShadow: ['0 0 0 0 rgba(117, 24, 24, 0.4)', '0 0 0 10px rgba(117, 24, 24, 0)'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}

                    {/* Tooltip "Escúchanos!" en hover */}
                    <AnimatePresence>
                        {hoverVinilo && (
                            <motion.div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="text-[9px] bg-vinotinto text-white px-2 py-1 rounded-full shadow-glow-vinotinto">
                                    ♪ Escúchanos! ♪
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
};

export default ReproductorAudio;
