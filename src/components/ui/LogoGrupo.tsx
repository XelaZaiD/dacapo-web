/**
 * ============================================================
 * ARCHIVO: src/components/ui/LogoGrupo.tsx
 * ============================================================
 * Muestra el logo oficial del grupo cargado desde el Admin
 * (infoGrupo.logoUrl). Si no hay logo cargado (o se rompe),
 * usa el LogoDaCapo (SVG oficial) como respaldo.
 *
 * Se usa en la Navbar y el Footer de la web pública.
 * ============================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import LogoDaCapo from './LogoDaCapo';

type Props = {
    // Tamaño del logo (ej: "h-11 w-11", "h-14 w-14")
    className?: string;
    // Color del logo SVG de respaldo mediante clases de texto
    colorClase?: string;
    // Cuánto crece al pasar el cursor (1 = tamaño normal, 1.5 = 50% más grande)
    escalaHover?: number;
};

const LogoGrupo = ({
    className = 'h-11 w-11',
    colorClase = 'text-secundario',
    escalaHover = 1.15,
}: Props) => {
    const { infoGrupo } = useApp();
    const [roto, setRoto] = useState(false);

    const urlLogo = infoGrupo.logoUrl && !roto ? infoGrupo.logoUrl : '';

    if (!urlLogo) {
        return <LogoDaCapo className={className} colorClase={colorClase} escalaHover={escalaHover} />;
    }

    return (
        <motion.div
            className={`group relative select-none ${className}`}
            role="img"
            aria-label={`${infoGrupo.nombre} ${infoGrupo.subtitulo || 'Grupo Vocal'}`}
            whileHover={{ scale: escalaHover, rotate: -4 }}
            whileTap={{ scale: 0.9, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
            <img
                src={urlLogo}
                alt="Logo"
                onError={() => setRoto(true)}
                className="w-full h-full object-contain rounded-sm
                    transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(240,230,140,0.45)]"
            />
        </motion.div>
    );
};

export default LogoGrupo;