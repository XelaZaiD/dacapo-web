/**
 * ============================================================
 * ARCHIVO: src/components/layout/Footer.tsx
 * ============================================================
 * Pie de página con links, redes sociales e info del grupo.
 * ============================================================
 */

import { Music, Heart, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Footer = () => {
    const { infoGrupo } = useApp();
    const anioActual = new Date().getFullYear();

    const irASeccion = (href: string) => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="bg-primario border-t border-white/10 pt-16 pb-8">
            <div className="contenedor">
                <div className="grid md:grid-cols-3 gap-12 mb-12">

                    {/* Logo e info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-vinotinto rounded-xl flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-display font-bold text-xl text-secundario">DaCapo</p>
                                <p className="text-[10px] text-khaki uppercase tracking-[0.2em]">Grupo Vocal</p>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed mb-6">
                            Fundado en {infoGrupo.anioFundacion}. Llevando la música coral
                            a los corazones de nuestra comunidad.
                        </p>
                        {/* Redes sociales */}
                        <div className="flex gap-3">
                            {[
                                { icono: <LinkIcon className="w-4 h-4" />, url: infoGrupo.redesSociales.instagram },
                                { icono: <LinkIcon className="w-4 h-4" />, url: infoGrupo.redesSociales.facebook },
                                { icono: <LinkIcon className="w-4 h-4" />, url: infoGrupo.redesSociales.youtube },
                            ].filter(r => r.url).map((red, i) => (
                                <a key={i} href={red.url} target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                              text-white/50 hover:bg-vinotinto hover:text-white hover:border-vinotinto
                              transition-all duration-300">
                                    {red.icono}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links rápidos */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Navegación</h4>
                        <div className="space-y-2">
                            {[
                                ['Inicio', '#inicio'], ['Nosotros', '#nosotros'], ['Integrantes', '#integrantes'],
                                ['Presentaciones', '#presentaciones'], ['Eventos', '#eventos'], ['Contacto', '#contacto']
                            ].map(([texto, href]) => (
                                <button key={href} onClick={() => irASeccion(href)}
                                    className="block text-white/40 hover:text-khaki text-sm transition-colors text-left">
                                    {texto}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Contacto</h4>
                        <div className="space-y-3 text-sm text-white/40">
                            <p>{infoGrupo.emailContacto}</p>
                            <div className="mt-4 p-4 rounded-xl bg-vinotinto/10 border border-vinotinto/20">
                                <p className="text-vinotinto-claro font-medium text-xs mb-1">¿Quieres ser parte del coro?</p>
                                <button onClick={() => irASeccion('#audiciones')}
                                    className="text-xs text-white/60 hover:text-white transition-colors">
                                    Envía tu audición aquí →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                {/* Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
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
