/**
 * ============================================================
 * ARCHIVO: src/components/ui/AvisoTemporal.tsx
 * ============================================================
 * Aviso flotante (toast) no bloqueante. Se usa para informar al
 * usuario de forma amigable, por ejemplo cuando no se pudieron
 * actualizar los datos desde el servicio y se muestran los
 * guardados en el dispositivo.
 *
 * Se auto-oculta después de unos segundos y tiene botón de cierre.
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, X } from 'lucide-react';

type Props = {
    /** Frase amigable que se muestra al usuario */
    mensaje: string;
    /** true para mostrar, false para ocultar */
    visibilidad: boolean;
    /** Milisegundos antes de ocultarse solo (por defecto 6 s) */
    duracionMs?: number;
};

const AvisoTemporal = ({ mensaje, visibilidad, duracionMs = 6000 }: Props) => {
    const [visible, setVisible] = useState(visibilidad);

    // La visibilidad sigue a la prop (aparece / desaparece con la animación)
    useEffect(() => {
        setVisible(visibilidad);
    }, [visibilidad]);

    // Auto-ocultarse después de unos segundos
    useEffect(() => {
        if (!visible) return;
        const temporizador = setTimeout(() => setVisible(false), duracionMs);
        return () => clearTimeout(temporizador);
    }, [visible, duracionMs]);

    return createPortal(
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md pointer-events-none"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                >
                    <div className="card-glass rounded-xl border borde-medium px-4 py-3 shadow-card flex items-center gap-3 pointer-events-auto">
                        <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-xs t-muted-high flex-1 leading-snug">{mensaje}</p>
                        <button
                            onClick={() => setVisible(false)}
                            className="btn-ghost p-1 -mr-1"
                            title="Cerrar aviso"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AvisoTemporal;