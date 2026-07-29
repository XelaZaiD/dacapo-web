/**
 * ============================================================
 * ARCHIVO: src/components/ui/Chatbot.tsx
 * ============================================================
 * Widget de chatbot flotante en la esquina inferior derecha.
 * Responde preguntas sobre el coro y teoría musical básica.
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Tipo para los mensajes del chat
type Mensaje = {
    id: string;
    texto: string;
    esBot: boolean;        // true = mensaje del bot, false = mensaje del usuario
    timestamp: Date;
};

// Mensaje de bienvenida del bot
const SALUDO_INICIAL: Mensaje = {
    id: 'saludo',
    texto: '¡Hola! 🎵 Soy el asistente musical de DaCapo Grupo Vocal. Puedo responderte sobre:\n\n• Horarios de ensayos\n• Cómo audicionar\n• Teoría musical básica\n• Información del grupo\n\n¿En qué puedo ayudarte?',
    esBot: true,
    timestamp: new Date(),
};

// Preguntas sugeridas para el usuario
const PREGUNTAS_SUGERIDAS = [
    '¿Cuándo son los ensayos?',
    '¿Cómo audicionar?',
    '¿Qué significa DaCapo?',
    '¿Qué es un Soprano?',
];

const Chatbot = () => {
    const { configuracionSecciones, respuestasChatbot } = useApp();
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO_INICIAL]);
    const [inputUsuario, setInputUsuario] = useState('');
    const [botEscribiendo, setBotEscribiendo] = useState(false);
    const finMensajesRef = useRef<HTMLDivElement>(null);

    // No mostrar si está desactivado desde el admin
    if (!configuracionSecciones.mostrarChatbot) return null;

    // Cada vez que hay un nuevo mensaje, scrollear al final
    useEffect(() => {
        finMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, botEscribiendo]);

    /**
     * Busca la respuesta más relevante para el mensaje del usuario.
     * Compara el mensaje con las palabras clave de las respuestas predefinidas.
     */
    const buscarRespuesta = (mensajeUsuario: string): string => {
        const mensajeLower = mensajeUsuario.toLowerCase();

        // Busca en todas las entradas del chatbot cuál coincide mejor
        for (const entrada of respuestasChatbot) {
            const coincide = entrada.categorias.some(categoria =>
                mensajeLower.includes(categoria.toLowerCase())
            );
            if (coincide) return entrada.respuesta;
        }

        // Respuesta por defecto si no encuentra coincidencia
        return '🎵 No estoy seguro de cómo responder esa pregunta, pero puedo ayudarte con:\n\n• Horarios de ensayos\n• Proceso de audición\n• Información sobre tipos de voz\n• Datos sobre DaCapo\n\n¿Sobre qué quieres saber?';
    };

    /**
     * Procesa el mensaje del usuario y genera la respuesta del bot.
     */
    const enviarMensaje = async (textoMensaje: string) => {
        const texto = textoMensaje.trim();
        if (!texto) return;

        // Añade el mensaje del usuario al chat
        const mensajeUsuario: Mensaje = {
            id: `user-${Date.now()}`,
            texto,
            esBot: false,
            timestamp: new Date(),
        };

        setMensajes(prev => [...prev, mensajeUsuario]);
        setInputUsuario('');
        setBotEscribiendo(true); // Muestra "escribiendo..."

        // Simula que el bot está "pensando" (1-2 segundos)
        const tiempoRespuesta = 800 + Math.random() * 800;
        await new Promise(resolve => setTimeout(resolve, tiempoRespuesta));

        const textoRespuesta = buscarRespuesta(texto);
        const mensajeBot: Mensaje = {
            id: `bot-${Date.now()}`,
            texto: textoRespuesta,
            esBot: true,
            timestamp: new Date(),
        };

        setBotEscribiendo(false);
        setMensajes(prev => [...prev, mensajeBot]);
    };

    // Maneja el envío con la tecla Enter
    const manejarKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje(inputUsuario);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-40">

            {/* Ventana del chat */}
            <AnimatePresence>
                {abierto && (
                    <motion.div
                        className="mb-4 w-80 sm:w-96 bg-fondo-oscuro/95 backdrop-blur-xl
                       border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ height: '480px' }}
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* ---- CABECERA ---- */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10
                            bg-gradient-to-r from-vinotinto/20 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-vinotinto flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-secundario">Asistente DaCapo</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-white/50">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setAbierto(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-full
                           text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ---- ÁREA DE MENSAJES ---- */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 sin-scrollbar">
                            {mensajes.map(mensaje => (
                                <div
                                    key={mensaje.id}
                                    className={`flex gap-2 ${mensaje.esBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    {/* Avatar del bot */}
                                    {mensaje.esBot && (
                                        <div className="w-7 h-7 rounded-full bg-vinotinto flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}

                                    {/* Burbuja del mensaje */}
                                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                                   whitespace-pre-line ${mensaje.esBot
                                            ? 'bg-white/10 text-white/80 rounded-tl-sm'
                                            : 'bg-vinotinto text-white rounded-tr-sm'
                                        }`}>
                                        {mensaje.texto}
                                    </div>

                                    {/* Avatar del usuario */}
                                    {!mensaje.esBot && (
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <UserIcon className="w-3.5 h-3.5 text-white/70" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* "Escribiendo..." del bot */}
                            {botEscribiendo && (
                                <div className="flex gap-2 items-center">
                                    <div className="w-7 h-7 rounded-full bg-vinotinto flex items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                        {[0, 1, 2].map(i => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Referencia para scroll automático */}
                            <div ref={finMensajesRef} />
                        </div>

                        {/* ---- PREGUNTAS SUGERIDAS ---- */}
                        {mensajes.length === 1 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                                {PREGUNTAS_SUGERIDAS.map(pregunta => (
                                    <button
                                        key={pregunta}
                                        onClick={() => enviarMensaje(pregunta)}
                                        className="text-[10px] px-3 py-1.5 rounded-full bg-vinotinto/20 text-vinotinto-claro
                               border border-vinotinto/30 hover:bg-vinotinto hover:text-white
                               transition-all duration-200"
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ---- INPUT DE MENSAJE ---- */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputUsuario}
                                    onChange={e => setInputUsuario(e.target.value)}
                                    onKeyPress={manejarKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
                             text-sm text-secundario placeholder-white/30 focus:outline-none
                             focus:border-vinotinto/50 transition-colors"
                                />
                                <button
                                    onClick={() => enviarMensaje(inputUsuario)}
                                    disabled={!inputUsuario.trim() || botEscribiendo}
                                    className="w-10 h-10 rounded-xl bg-vinotinto hover:bg-vinotinto-claro
                             flex items-center justify-center transition-all duration-300
                             disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- BOTÓN FLOTANTE PARA ABRIR/CERRAR ---- */}
            <motion.button
                onClick={() => setAbierto(!abierto)}
                className="w-14 h-14 rounded-full bg-vinotinto hover:bg-vinotinto-claro shadow-glow-vinotinto
                   flex items-center justify-center transition-all duration-300 relative ml-auto"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {abierto ? (
                        <motion.div key="cerrar" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="abrir" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageCircle className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Punto de notificación (cuando hay mensajes sin leer) */}
                {!abierto && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-khaki flex items-center justify-center">
                        <span className="text-[8px] font-bold text-black">♪</span>
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default Chatbot;
