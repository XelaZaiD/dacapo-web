/**
 * ============================================================
 * ARCHIVO: src/components/sections/Audiciones.tsx
 * ============================================================
 * Formulario de inscripción para nuevos coristas.
 * Solo visible si configuracionSecciones.mostrarAudiciones = true
 * ============================================================
 */

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Send, CheckCircle, Music2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Estado inicial vacío del formulario
const FORMULARIO_VACIO = {
    nombre: '',
    email: '',
    telefono: '',
    tipoVoz: '',
    experiencia: '',
    urlAudioPrueba: '',
};

const SeccionAudiciones = () => {
    const { configuracionSecciones, enviarSolicitudAudicion } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    // Estado del formulario: un objeto con todos los campos
    const [datosFormulario, setDatosFormulario] = useState(FORMULARIO_VACIO);
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

        // Simulamos un pequeño retraso (en Fase 2 aquí iría la llamada a Supabase)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Enviamos la solicitud al contexto (que la guarda en LocalStorage)
        enviarSolicitudAudicion({
            nombre: datosFormulario.nombre,
            email: datosFormulario.email,
            telefono: datosFormulario.telefono,
            tipoVoz: datosFormulario.tipoVoz,
            experiencia: datosFormulario.experiencia,
            urlAudioPrueba: datosFormulario.urlAudioPrueba || undefined,
        });

        setEnviando(false);
        setEnviadoExitosamente(true);
        setDatosFormulario(FORMULARIO_VACIO);
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
                        <p className="text-white/50 leading-relaxed">
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
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-secundario mb-3">
                                ¡Solicitud Enviada!
                            </h3>
                            <p className="text-white/60 mb-8">
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
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errores.experiencia}
                                    </p>
                                )}
                            </div>

                            {/* Campo: Enlace de Audio */}
                            <div>
                                <label className="label-campo" htmlFor="audicion-audio">
                                    Enlace de Audio o Video (Opcional)
                                </label>
                                <input
                                    id="audicion-audio"
                                    type="url"
                                    className="input-campo"
                                    placeholder="https://drive.google.com/... o https://youtube.com/..."
                                    value={datosFormulario.urlAudioPrueba}
                                    onChange={e => actualizarCampo('urlAudioPrueba', e.target.value)}
                                />
                                <p className="text-white/30 text-xs mt-1">
                                    Puedes compartir un enlace de Google Drive, YouTube, Instagram o cualquier plataforma.
                                </p>
                            </div>

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                disabled={enviando}
                                className="btn-primario w-full justify-center py-4 text-base disabled:opacity-50"
                            >
                                {enviando ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Enviar Solicitud de Audición
                                    </>
                                )}
                            </button>

                            <p className="text-white/30 text-xs text-center">
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
