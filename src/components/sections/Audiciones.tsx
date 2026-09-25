/**
 * ============================================================
 * ARCHIVO: src/components/sections/Audiciones.tsx
 * ============================================================
 * Formulario de inscripción para nuevos coristas.
 * Solo visible si configuracionSecciones.mostrarAudiciones = true
 *
 * El audio/video de prueba ofrece 3 formas (pestañas):
 *  - Enlace: pegar una URL (YouTube, Drive, Instagram...)
 *  - Adjuntar: subir un archivo de audio/video desde el equipo
 *  - Grabar: grabar en vivo desde el navegador (audio o video),
 *    con previsualización antes de conservarlo o repetirlo.
 *
 * Al enviar, si hay archivo grabado/adjuntado se sube al bucket
 * PRIVADO 'audiciones' de Supabase y se guarda la ruta.
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Mic, Send, CheckCircle, Music2, AlertCircle, Link2, Paperclip, Camera, Square, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { subirAudicionSupabase } from '../../services/supabase';

// Estado inicial vacío del formulario
const FORMULARIO_VACIO = {
    nombre: '',
    email: '',
    telefono: '',
    tipoVoz: '',
    experiencia: '',
    urlAudioPrueba: '',
};

// ============================================================
// SELECTOR DE AUDIO / VIDEO (Enlace | Adjuntar | Grabar)
// ============================================================

// Lo que el usuario aporta: una URL (enlace o enlace temporal) más
// el blob original si fue grabado o adjuntado (para subirlo a Supabase).
type EstadoAdjunto = {
    url: string;
    blob: Blob | null;
    esVideo: boolean;
};

const ADJUNTO_VACIO: EstadoAdjunto = { url: '', blob: null, esVideo: false };

// Límites razonables para no generar archivos gigantes
const LIMITE_GRABACION_SEG = 90;
const LIMITE_ADJUNTAR_MB = 50;
const TAMAJO_MAX_ADJUNTAR = LIMITE_ADJUNTAR_MB * 1024 * 1024;

// ¿Es un archivo de audio/video directo (reproducible en <audio>/<video>)?
const esMultimediaDirecta = (valor: string) =>
    valor.startsWith('blob:') || valor.startsWith('data:') ||
    /\.(mp[34]|m4a|wav|ogg|webm|mov)(#|\?|$)/i.test(valor);

const esArchivoVideo = (valor: string, esVideo: boolean) => {
    if (valor.startsWith('blob:') || valor.startsWith('data:')) return esVideo;
    return /\.(mp4|webm|mov)(#|\?|$)/i.test(valor);
};

const formatearTiempo = (segundos: number) =>
    `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

const SelectorAudioVideo = ({
    valor,
    esVideo,
    onCambio,
}: {
    valor: string;
    esVideo: boolean;
    onCambio: (adjunto: EstadoAdjunto) => void;
}) => {
    const [vista, setVista] = useState<'url' | 'adjuntar' | 'grabar'>('url');

    // --- Adjuntar ---
    const [archivoPropuesto, setArchivoPropuesto] = useState<EstadoAdjunto>(ADJUNTO_VACIO);
    const [errorArchivo, setErrorArchivo] = useState('');
    const inputArchivoRef = useRef<HTMLInputElement>(null);

    // --- Grabar ---
    const [modo, setModo] = useState<'audio' | 'video'>('audio');
    const [grabando, setGrabando] = useState(false);
    const [duracion, setDuracion] = useState(0);
    const [grabacionPropuesta, setGrabacionPropuesta] = useState<EstadoAdjunto>(ADJUNTO_VACIO);
    const [errorGrabacion, setErrorGrabacion] = useState('');
    const [haGrabado, setHaGrabado] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const grabadoraRef = useRef<{
        stream: MediaStream | null;
        recorder: MediaRecorder | null;
        intervalo: number | null;
    }>({ stream: null, recorder: null, intervalo: null });

    // Libera recursos del MediaRecorder/Stream
    const limpiarUnionGrabadora = () => {
        const { stream, recorder, intervalo } = grabadoraRef.current;
        if (intervalo !== null) {
            clearInterval(intervalo);
            grabadoraRef.current.intervalo = null;
        }
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        stream?.getTracks().forEach(t => t.stop());
        grabadoraRef.current.stream = null;
        grabadoraRef.current.recorder = null;
    };

    // Vista previa en vivo mientras se graba video
    useEffect(() => {
        const video = videoRef.current;
        if (video && grabadoraRef.current.stream) {
            video.srcObject = grabadoraRef.current.stream;
        }
    }, [grabando, modo]);

    // Auto-detener al llegar al límite de tiempo
    useEffect(() => {
        if (grabando && duracion >= LIMITE_GRABACION_SEG) detenerGrabacion();
    }, [duracion, grabando]);

    // Limpieza total al desmontar el componente
    useEffect(() => () => limpiarUnionGrabadora(), []);

    const arrancarGrabacion = async () => {
        setErrorGrabacion('');
        setHaGrabado(false);

        if (!navigator.mediaDevices?.getUserMedia) {
            setErrorGrabacion('Este navegador no permite grabar. Prueba con "Adjuntar" o "Enlace".');
            return;
        }

        try {
            // Descartamos una grabación previa sin conservar
            setGrabacionPropuesta(prev => {
                if (prev.url) URL.revokeObjectURL(prev.url);
                return ADJUNTO_VACIO;
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: modo === 'video',
            });
            limpiarUnionGrabadora();
            grabadoraRef.current.stream = stream;

            const mimeCandidato = modo === 'video'
                ? (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=vp8,opus')
                : 'audio/webm;codecs=opus';

            const mimeUsado = MediaRecorder.isTypeSupported(mimeCandidato)
                ? mimeCandidato
                : '';

            const recorder = new MediaRecorder(stream, mimeUsado ? { mimeType: mimeUsado } : undefined);
            grabadoraRef.current.recorder = recorder;

            const trozos: BlobPart[] = [];
            recorder.ondataavailable = e => {
                if (e.data.size > 0) trozos.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(trozos, {
                    type: recorder.mimeType || (modo === 'video' ? 'video/webm' : 'audio/webm'),
                });
                const url = URL.createObjectURL(blob);
                setGrabacionPropuesta({ url, blob, esVideo: modo === 'video' });
                setDuracion(0);
                setHaGrabado(true);
                grabadoraRef.current.stream?.getTracks().forEach(t => t.stop());
                grabadoraRef.current.stream = null;
            };

            recorder.start();
            setGrabando(true);
            setDuracion(0);
            grabadoraRef.current.intervalo = window.setInterval(() => {
                setDuracion(d => d + 1);
            }, 1000);
        } catch (err) {
            console.warn('No se pudo iniciar la grabación:', err);
            setErrorGrabacion(
                'No pudimos acceder al micrófono o la cámara. Revisa los permisos del navegador o usa "Adjuntar"/"Enlace".'
            );
        }
    };

    const detenerGrabacion = () => {
        const { recorder, intervalo } = grabadoraRef.current;
        if (intervalo !== null) {
            clearInterval(intervalo);
            grabadoraRef.current.intervalo = null;
        }
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        setGrabando(false);
    };

    const manejarArchivo = (archivo: File | undefined) => {
        setErrorArchivo('');
        if (!archivo) return;

        if (!/^(audio|video)\//.test(archivo.type)) {
            setErrorArchivo('El archivo debe ser de audio o video.');
            return;
        }
        if (archivo.size > TAMAJO_MAX_ADJUNTAR) {
            setErrorArchivo(`El archivo supera el límite de ${LIMITE_ADJUNTAR_MB} MB.`);
            return;
        }

        setArchivoPropuesto(prev => {
            if (prev.url) URL.revokeObjectURL(prev.url);
            return ADJUNTO_VACIO;
        });

        const url = URL.createObjectURL(archivo);
        setArchivoPropuesto({
            url,
            blob: archivo,
            esVideo: archivo.type.startsWith('video/'),
        });
    };

    const PESTANAS = [
        { id: 'url', etiqueta: 'Enlace', icono: Link2 },
        { id: 'adjuntar', etiqueta: 'Adjuntar', icono: Paperclip },
        { id: 'grabar', etiqueta: 'Grabar', icono: Mic },
    ] as const;

    return (
        <div className="border borde-subtle rounded-2xl overflow-hidden bg-fondo-card">
            {/* Pestañas */}
            <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] border-b borde-subtle">
                {PESTANAS.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                            if (grabando) detenerGrabacion();
                            setVista(p.id);
                        }}
                        className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-300 ${vista === p.id ? 'bg-vinotinto text-white' : 't-muted hover:bg-sutil'
                            }`}
                    >
                        <p.icono className="w-4 h-4" />
                        {p.etiqueta}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {vista === 'url' && (
                        <motion.div
                            key="url"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <input
                                type="url"
                                className="input-campo"
                                placeholder="https://youtube.com/... o https://drive.google.com/..."
                                value={valor}
                                onChange={e => onCambio({ url: e.target.value, blob: null, esVideo: false })}
                            />
                            <p className="t-muted-low text-xs mt-1">
                                Pega un enlace de YouTube, Google Drive, Instagram o cualquier plataforma.
                            </p>
                        </motion.div>
                    )}

                    {vista === 'adjuntar' && (
                        <motion.div
                            key="adjuntar"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    manejarArchivo(e.dataTransfer.files?.[0]);
                                }}
                                onClick={() => inputArchivoRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${errorArchivo ? 'border-red-500/50' : 'border-borde-medium hover:border-vinotinto/50 hover:bg-vinotinto/5'
                                    }`}
                            >
                                <Upload className="w-8 h-8 mx-auto mb-2 t-muted" />
                                <p className="t-muted-high text-sm mb-1">
                                    Haz clic o arrastra tu audio/video aquí
                                </p>
                                <p className="t-muted-low text-xs">
                                    MP3, WAV, OGG, M4A, MP4, WEBM, MOV · máx. {LIMITE_ADJUNTAR_MB} MB
                                </p>
                                <input
                                    ref={inputArchivoRef}
                                    type="file"
                                    accept="audio/*,video/*"
                                    className="hidden"
                                    onChange={e => manejarArchivo(e.target.files?.[0])}
                                />
                            </div>

                            {errorArchivo && (
                                <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errorArchivo}
                                </p>
                            )}

                            {archivoPropuesto.url && (
                                <div className="mt-3 border borde-subtle rounded-xl p-3 space-y-3">
                                    {archivoPropuesto.esVideo ? (
                                        <video src={archivoPropuesto.url} controls className="w-full rounded-lg aspect-video bg-black" />
                                    ) : (
                                        <audio src={archivoPropuesto.url} controls className="w-full" />
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => onCambio(archivoPropuesto)}
                                            className="btn-primario flex-1 justify-center text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Usar este archivo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => inputArchivoRef.current?.click()}
                                            className="btn-secundario text-sm"
                                        >
                                            <Paperclip className="w-4 h-4" /> Elegir otro
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArchivoPropuesto(prev => {
                                                    if (prev.url) URL.revokeObjectURL(prev.url);
                                                    return ADJUNTO_VACIO;
                                                });
                                            }}
                                            className="btn-ghost text-sm t-muted hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" /> Quitar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {vista === 'grabar' && (
                        <motion.div
                            key="grabar"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Elección de audio o video */}
                            {!grabando && (
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setModo('audio')}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${modo === 'audio'
                                                ? 'bg-khaki/15 text-khaki border-khaki/40'
                                                : 'borde-subtle t-muted hover:text-secundario'
                                            }`}
                                    >
                                        <Mic className="w-3.5 h-3.5" /> Audio (micrófono)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModo('video')}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${modo === 'video'
                                                ? 'bg-khaki/15 text-khaki border-khaki/40'
                                                : 'borde-subtle t-muted hover:text-secundario'
                                            }`}
                                    >
                                        <Camera className="w-3.5 h-3.5" /> Video (cámara)
                                    </button>
                                </div>
                            )}

                            {/* Vista previa en vivo durante la grabación */}
                            {grabando && modo === 'video' && (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full aspect-video rounded-lg bg-black object-cover mb-3"
                                />
                            )}
                            {grabando && modo === 'audio' && (
                                <div className="mb-3 flex items-center gap-3 rounded-lg bg-sutil border borde-subtle p-4">
                                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                    <span className="t-muted-high text-sm">
                                        Grabando audio... {formatearTiempo(duracion)}
                                    </span>
                                </div>
                            )}

                            {errorGrabacion && (
                                <div className="mb-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span>{errorGrabacion}</span>
                                </div>
                            )}

                            {!grabando && !grabacionPropuesta.url && (
                                <button
                                    type="button"
                                    onClick={arrancarGrabacion}
                                    className="btn-primario justify-center w-full"
                                >
                                    <Mic className="w-4 h-4" /> Empezar a grabar
                                </button>
                            )}

                            {grabando && (
                                <>
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="flex items-center gap-2 t-muted-high text-sm">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                            {formatearTiempo(duracion)} / {LIMITE_GRABACION_SEG} s
                                        </span>
                                        <button type="button" onClick={detenerGrabacion} className="btn-secundario">
                                            <Square className="w-4 h-4" /> Detener
                                        </button>
                                    </div>
                                    <p className="t-muted-low text-xs text-center mt-2">
                                        La grabación se detiene sola a los {LIMITE_GRABACION_SEG} segundos.
                                    </p>
                                </>
                            )}

                            {!grabando && grabacionPropuesta.url && (
                                <div className="space-y-3">
                                    {grabacionPropuesta.esVideo ? (
                                        <video src={grabacionPropuesta.url} controls className="w-full rounded-lg aspect-video bg-black" />
                                    ) : (
                                        <audio src={grabacionPropuesta.url} controls className="w-full" />
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => onCambio(grabacionPropuesta)}
                                            className="btn-primario flex-1 justify-center text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Conservar grabación
                                        </button>
                                        <button
                                            type="button"
                                            onClick={arrancarGrabacion}
                                            className="btn-secundario text-sm"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Grabar de nuevo
                                        </button>
                                    </div>
                                    {haGrabado && (
                                        <p className="t-muted-low text-xs">
                                            Escucha/observa tu grabación antes de conservarla. Puedes repetirla si no te gustó.
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Resumen del aporte actual */}
            <div className="px-4 pb-4">
                {valor ? (
                    <div className="border borde-subtle rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 min-w-0 w-full">
                            {esMultimediaDirecta(valor) ? (
                                esArchivoVideo(valor, esVideo) ? (
                                    <video src={valor} controls className="w-full rounded-lg max-h-44 bg-black" />
                                ) : (
                                    <audio src={valor} controls className="w-full" />
                                )
                            ) : (
                                <span className="t-muted-high text-xs flex items-center gap-2 min-w-0">
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-khaki" />
                                    <span className="truncate">{valor}</span>
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onCambio(ADJUNTO_VACIO)}
                            className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                    </div>
                ) : (
                    <p className="t-muted-low text-xs text-center">
                        Aún no has añadido audio o video de prueba. Es opcional.
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionAudiciones
// ============================================================

const SeccionAudiciones = () => {
    const { configuracionSecciones, enviarSolicitudAudicion } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    // Estado del formulario: un objeto con todos los campos
    const [datosFormulario, setDatosFormulario] = useState(FORMULARIO_VACIO);
    // Audio/video elegido (enlace, archivo adjuntado o grabación)
    const [adjunto, setAdjunto] = useState<EstadoAdjunto>(ADJUNTO_VACIO);
    // Estado: el formulario fue enviado exitosamente
    const [enviadoExitosamente, setEnviadoExitosamente] = useState(false);
    // Estado: si el formulario está siendo enviado (para deshabilitar el botón)
    const [enviando, setEnviando] = useState(false);
    // Estado: errores de validación
    const [errores, setErrores] = useState<Record<string, string>>({});

    // Ocultar si está desactivado desde el admin
    if (!configuracionSecciones.mostrarAudiciones) return null;

    // Función para actualizar un campo del formulario
    // Con TypeScript, especificamos que el campo debe ser una clave del formulario
    const actualizarCampo = (campo: keyof typeof FORMULARIO_VACIO, valor: string) => {
        setDatosFormulario(prev => ({ ...prev, [campo]: valor }));
        // Limpiamos el error de ese campo al empezar a escribir
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    // Función de validación del formulario
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};

        if (!datosFormulario.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
        if (!datosFormulario.email.trim()) nuevosErrores.email = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosFormulario.email)) {
            nuevosErrores.email = 'El email no tiene un formato válido';
        }
        if (!datosFormulario.tipoVoz) nuevosErrores.tipoVoz = 'Selecciona tu tipo de voz';
        if (!datosFormulario.experiencia.trim()) nuevosErrores.experiencia = 'Cuéntanos sobre tu experiencia';

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0; // True si no hay errores
    };

    // Función que se ejecuta al enviar el formulario
    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue (comportamiento por defecto del form)

        if (!validarFormulario()) return; // Si hay errores, no enviamos

        setEnviando(true);

        // Pequeña pausa para dar sensación de procesamiento
        await new Promise(resolve => setTimeout(resolve, 300));

        let urlFinal = datosFormulario.urlAudioPrueba || '';

        // Si hay un archivo grabado/adjuntado, lo subimos al bucket privado 'audiciones'
        if (adjunto.blob && urlFinal) {
            const rutaSubida = await subirAudicionSupabase(
                adjunto.blob,
                `audio_${(datosFormulario.nombre.trim() || 'corista').replace(/\s+/g, '_')}`
            );
            if (rutaSubida) {
                // Con subida exitosa usamos la ruta del bucket (privada; el admin la firma al verla)
                urlFinal = rutaSubida;
                // Liberamos el enlace temporal local ya subido
                if (adjunto.url.startsWith('blob:')) URL.revokeObjectURL(adjunto.url);
            }
            // Si falla la subida, conservamos el enlace temporal local como respaldo
        }

        // Enviamos la solicitud al contexto (que la guarda en LocalStorage y Supabase)
        enviarSolicitudAudicion({
            nombre: datosFormulario.nombre,
            email: datosFormulario.email,
            telefono: datosFormulario.telefono,
            tipoVoz: datosFormulario.tipoVoz,
            experiencia: datosFormulario.experiencia,
            urlAudioPrueba: urlFinal || undefined,
        });

        setEnviando(false);
        setEnviadoExitosamente(true);
        setDatosFormulario(FORMULARIO_VACIO);
        setAdjunto(ADJUNTO_VACIO);
    };

    return (
        <section id="audiciones" className="py-24 bg-fondo-medio">
            <div className="contenedor" ref={ref}>

                <div className="max-w-2xl mx-auto">
                    {/* Encabezado */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 40 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="badge-vinotinto mb-4 inline-flex">
                            <Mic className="w-3 h-3" />
                            Convocatoria
                        </span>
                        <h2 className="titulo-seccion mb-4">Únete a DaCapo</h2>
                        <div className="linea-decorativa mx-auto mb-6" />
                        <p className="t-muted leading-relaxed">
                            ¿Tienes pasión por el canto coral? Postúlate y sé parte de nuestra familia vocal.
                            Aceptamos todos los niveles de experiencia.
                        </p>
                    </motion.div>

                    {/* Si ya se envió, mostrar mensaje de éxito */}
                    {enviadoExitosamente ? (
                        <motion.div
                            className="card-glass rounded-2xl p-12 text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30
                              flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-secundario mb-3">
                                ¡Solicitud Enviada!
                            </h3>
                            <p className="t-muted-high mb-8">
                                Recibimos tu solicitud de audición. Nos pondremos en contacto contigo
                                en los próximos 5 días hábiles.
                            </p>
                            <button
                                onClick={() => setEnviadoExitosamente(false)}
                                className="btn-primario mx-auto"
                            >
                                <Music2 className="w-4 h-4" />
                                Enviar otra solicitud
                            </button>
                        </motion.div>
                    ) : (
                        // Formulario de audición
                        <motion.form
                            onSubmit={manejarEnvio}
                            className="card-glass rounded-2xl p-8 space-y-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            {/* Grid de dos columnas para los primeros campos */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Campo: Nombre */}
                                <div>
                                    <label className="label-campo" htmlFor="audicion-nombre">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        id="audicion-nombre"
                                        type="text"
                                        className={`input-campo ${errores.nombre ? 'border-red-500/50' : ''}`}
                                        placeholder="Tu nombre completo"
                                        value={datosFormulario.nombre}
                                        onChange={e => actualizarCampo('nombre', e.target.value)}
                                    />
                                    {errores.nombre && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errores.nombre}
                                        </p>
                                    )}
                                </div>

                                {/* Campo: Email */}
                                <div>
                                    <label className="label-campo" htmlFor="audicion-email">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        id="audicion-email"
                                        type="email"
                                        className={`input-campo ${errores.email ? 'border-red-500/50' : ''}`}
                                        placeholder="tu@email.com"
                                        value={datosFormulario.email}
                                        onChange={e => actualizarCampo('email', e.target.value)}
                                    />
                                    {errores.email && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errores.email}
                                        </p>
                                    )}
                                </div>

                                {/* Campo: Teléfono */}
                                <div>
                                    <label className="label-campo" htmlFor="audicion-telefono">
                                        Teléfono / WhatsApp
                                    </label>
                                    <input
                                        id="audicion-telefono"
                                        type="tel"
                                        className="input-campo"
                                        placeholder="+1 234 567 8900"
                                        value={datosFormulario.telefono}
                                        onChange={e => actualizarCampo('telefono', e.target.value)}
                                    />
                                </div>

                                {/* Campo: Tipo de Voz */}
                                <div>
                                    <label className="label-campo" htmlFor="audicion-voz">
                                        Tipo de Voz / Rango Vocal *
                                    </label>
                                    <select
                                        id="audicion-voz"
                                        className={`input-campo cursor-pointer ${errores.tipoVoz ? 'border-red-500/50' : ''}`}
                                        value={datosFormulario.tipoVoz}
                                        onChange={e => actualizarCampo('tipoVoz', e.target.value)}
                                    >
                                        <option value="">Selecciona una opción</option>
                                        <option value="Soprano">Soprano</option>
                                        <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                                        <option value="Contralto">Contralto</option>
                                        <option value="Tenor">Tenor</option>
                                        <option value="Barítono">Barítono</option>
                                        <option value="Bajo">Bajo</option>
                                        <option value="No sé / A evaluar">No sé / A evaluar</option>
                                    </select>
                                    {errores.tipoVoz && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errores.tipoVoz}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Campo: Experiencia */}
                            <div>
                                <label className="label-campo" htmlFor="audicion-experiencia">
                                    Experiencia Musical *
                                </label>
                                <textarea
                                    id="audicion-experiencia"
                                    rows={4}
                                    className={`input-campo resize-none ${errores.experiencia ? 'border-red-500/50' : ''}`}
                                    placeholder="Cuéntanos sobre tu experiencia musical: coros anteriores, estudios, instrumentos que tocas, etc."
                                    value={datosFormulario.experiencia}
                                    onChange={e => actualizarCampo('experiencia', e.target.value)}
                                />
                                {errores.experiencia && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errores.experiencia}
                                    </p>
                                )}
                            </div>

                            {/* Campo: Audio o Video de Prueba */}                                        
                            <div>
                                <label className="label-campo">
                                    Audio o Video de Prueba (Opcional)
                                </label>
                                <SelectorAudioVideo
                                    valor={datosFormulario.urlAudioPrueba}
                                    esVideo={adjunto.esVideo}
                                    onCambio={adjuntoNuevo => {
                                        setAdjunto(adjuntoNuevo);
                                        actualizarCampo('urlAudioPrueba', adjuntoNuevo.url);
                                    }}
                                />
                            </div>

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                disabled={enviando}
                                className="btn-primario w-full justify-center py-4 text-base disabled:opacity-50"
                            >
                                {enviando ? (
                                    <>
                                        <div className="w-4 h-4 border-2 borde-medium border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Enviar Solicitud de Audición
                                    </>
                                )}
                            </button>

                            <p className="t-muted-low text-xs text-center">
                                * Campos obligatorios. Tu información se mantendrá confidencial.
                            </p>
                        </motion.form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SeccionAudiciones;