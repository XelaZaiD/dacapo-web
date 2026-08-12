import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useApp, WHATSAPP_PHONE_NUMBER } from '../../context/AppContext';

const BotonWhatsApp = () => {
    const { configuracionSecciones } = useApp();
    const [hover, setHover] = useState(false);

    if (configuracionSecciones.tipoAsistente !== 'whatsapp') return null;

    const numero = configuracionSecciones.numeroWhatsapp || WHATSAPP_PHONE_NUMBER;
    const url = `https://wa.me/${numero}`;

    return (
        <div className="fixed bottom-4 right-4 z-40">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <motion.button
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative
                        ${hover
                            ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                            : 'bg-vinotinto hover:bg-vinotinto-claro shadow-glow-vinotinto'
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <MessageCircle className="w-7 h-7 text-white" />

                    {/* Indicador pulse */}
                    <AnimatePresence>
                        {hover && (
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-green-400"
                                initial={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 1.3, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            />
                        )}
                    </AnimatePresence>
                </motion.button>
            </a>
        </div>
    );
};

export default BotonWhatsApp;
