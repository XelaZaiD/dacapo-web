/**
 * ============================================================
 * ARCHIVO: src/components/layout/Footer.tsx
 * ============================================================
 * Pie de página con links, redes sociales e info del grupo.
 * ============================================================
 */

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { EnlaceRedSocial, IconoInstagram, IconoFacebook, IconoYoutube, IconoTiktok } from '../ui/IconosRedes';
import LogoDaCapo from '../ui/LogoDaCapo';

const Footer = () => {
    const { infoGrupo, configuracionSecciones } = useApp();
    const anioActual = new Date().getFullYear();

    const irASeccion = (href: string) => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="footer-bg border-t footer-border pt-16 pb-8">
            <div className="contenedor">
                <div className="grid md:grid-cols-3 gap-12 mb-12">

                    {/* Logo e info */}
                    <div>
                        <div className="mb-4">
                            {/* Logo oficial (incluye nombre y subtítulo del grupo) */}
                            <LogoDaCapo
                                className="h-24 w-24 sm:h-28 sm:w-28"
                                colorClase="text-white"
                            />
                        </div>
                        <p className="footer-text text-sm leading-relaxed mb-6">
                            Fundado en {infoGrupo.anioFundacion}. Llevando la música coral
                            a los corazones de nuestra comunidad.
                        </p>
                        {/* Redes sociales */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { icono: <IconoInstagram className="w-4 h-4" />, url: infoGrupo.redesSociales.instagram, colorNeon: 'hover:text-pink-400', nombre: 'Instagram' },
                                { icono: <IconoFacebook className="w-4 h-4" />, url: infoGrupo.redesSociales.facebook, colorNeon: 'hover:text-blue-400', nombre: 'Facebook' },
                                { icono: <IconoYoutube className="w-4 h-4" />, url: infoGrupo.redesSociales.youtube, colorNeon: 'hover:text-red-400', nombre: 'YouTube' },
                                { icono: <IconoTiktok className="w-4 h-4" />, url: infoGrupo.redesSociales.tiktok, colorNeon: 'hover:text-white', nombre: 'TikTok' },
                            ].flatMap(r => r.url ? [{ ...r, url: r.url }] : []).map((red, i) => (
                                <EnlaceRedSocial
                                    key={i}
                                    url={red.url}
                                    icono={red.icono}
                                    nombre={red.nombre}
                                    colorNeon={red.colorNeon}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Links rápidos */}
                    <div>
                        <h4 className="text-sm font-semibold footer-text-high uppercase tracking-wider mb-4">Navegación</h4>
                        <div className="space-y-2">
                            {[
                                ['Inicio', '#inicio'], ['Nosotros', '#nosotros'], ['Integrantes', '#integrantes'],
                                ['Presentaciones', '#presentaciones'], ['Eventos', '#eventos'], ['Contacto', '#contacto']
                            ].map(([texto, href]) => (
                                <button key={href} onClick={() => irASeccion(href)}
                                    className="block footer-text hover:text-khaki text-sm transition-colors text-left">
                                    {texto}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-sm font-semibold footer-text-high uppercase tracking-wider mb-4">Contacto</h4>
                        <div className="space-y-3 text-sm footer-text">
                            <p>{infoGrupo.emailContacto}</p>
                            {configuracionSecciones.mostrarAudiciones && (
                                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-vinotinto/10 to-khaki/10 border border-vinotinto/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 px-2 py-1 bg-vinotinto/20 rounded-bl-lg">
                                        <span className="text-[8px] footer-text-high uppercase tracking-wider">¡Nuevo!</span>
                                    </div>
                                    <p className="text-vinotinto-claro font-medium text-xs mb-1">¿Quieres ser parte del coro?</p>
                                    <p className="text-[10px] footer-text mb-2">Únete a DaCapo Grupo Vocal</p>
                                    <motion.button
                                        onClick={() => irASeccion('#audiciones')}
                                        className="text-xs bg-vinotinto hover:bg-vinotinto-claro text-white px-3 py-1.5 rounded-lg transition-all duration-300 shadow-glow-vinotinto hover:shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Enviar Solicitud de Audición →
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-footer-border)] to-transparent mb-8" />

                {/* Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs footer-text-low">
                    <p>© {anioActual} DaCapo Grupo Vocal. Todos los derechos reservados.</p>
                    <p className="flex items-center gap-1">
                        Hecho con <Heart className="w-3 h-3 text-vinotinto-claro" /> y mucha música
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
