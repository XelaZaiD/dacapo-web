/**
 * ============================================================
 * ARCHIVO: src/components/sections/MarqueeMusical.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Una banda de texto que se desliza infinitamente (marquee)
 * en la base del Hero, ligeramente inclinada, con palabras
 * relacionadas a DaCapo. Es un estilo muy usado en web
 * modernas para dar energía a la portada.
 *
 * Las frases se toman de infoGrupo.frasesBanner (editables
 * desde el panel de administración) y se guardan en Supabase
 * bajo la clave configuracion 'banner_frases'.
 *
 * La animación es CSS pura (animate-marquee, definida en
 * tailwind.config.js) y los colores usan variables CSS,
 * adaptándose al modo oscuro/claro.
 * ============================================================
 */

import { useApp } from '../../context/AppContext';

const CopiaMarquee = ({ palabras }: { palabras: string[] }) => (
    <div className="flex items-center shrink-0">
        {palabras.map((palabra, i) => (
            <span key={i} className="flex items-center shrink-0 px-5 md:px-7">
                <span className="marquee-texto font-display italic text-2xl md:text-4xl whitespace-nowrap">
                    {palabra}
                </span>
                <span className="marquee-acento text-xl md:text-2xl ml-5 md:ml-7">✦</span>
            </span>
        ))}
    </div>
);

const MarqueeMusical = () => {
    const { infoGrupo } = useApp();
    const palabras = infoGrupo.frasesBanner?.length
        ? infoGrupo.frasesBanner
        : ['DaCapo', 'Grupo Vocal', 'Música Coral', 'Armonía', 'Repertorio Clásico', 'Contemporáneo'];

    return (
        <div
            className="marquee-capa marquee-borde absolute bottom-0 -left-[7.5%] w-[115%] -rotate-3
                   border-y py-3 md:py-4 pointer-events-none z-[5]"
            aria-hidden="true"
        >
            {/* Dos copias idénticas para que el bucle no tenga costura */}
            <div className="animate-marquee flex w-max">
                <CopiaMarquee palabras={palabras} />
                <CopiaMarquee palabras={palabras} />
            </div>
        </div>
    );
};

export default MarqueeMusical;