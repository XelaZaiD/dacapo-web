import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Send, CheckCircle, Heart, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EnlaceRedSocial, IconoInstagram, IconoFacebook, IconoYoutube, IconoTiktok } from '../ui/IconosRedes';

const FORM_VACIO = { nombre: '', email: '', asunto: '', mensaje: '' };

const SeccionContacto = () => {
    const { enviarMensajeContacto, infoGrupo, configuracionSecciones } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const [form, setForm] = useState(FORM_VACIO);
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const actualizar = (campo: keyof typeof FORM_VACIO, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre || !form.email || !form.mensaje) return;

        setEnviando(true);
        await new Promise(r => setTimeout(r, 800));

        enviarMensajeContacto(form);
        setEnviando(false);
        setEnviado(true);
        setForm(FORM_VACIO);
    };

    const redes = [
        { icono: <IconoInstagram className="w-4 h-4" />, url: infoGrupo.redesSociales.instagram, colorNeon: 'hover:text-pink-400', nombre: 'Instagram' },
        { icono: <IconoFacebook className="w-4 h-4" />, url: infoGrupo.redesSociales.facebook, colorNeon: 'hover:text-blue-400', nombre: 'Facebook' },
        { icono: <IconoYoutube className="w-4 h-4" />, url: infoGrupo.redesSociales.youtube, colorNeon: 'hover:text-red-400', nombre: 'YouTube' },
        { icono: <IconoTiktok className="w-4 h-4" />, url: infoGrupo.redesSociales.tiktok, colorNeon: 'hover:text-secundario', nombre: 'TikTok' },
    ].flatMap(r => r.url ? [{ ...r, url: r.url }] : []);

    return (
        <section id="contacto" className="py-24 bg-fondo-card">
            <div className="contenedor" ref={ref}>

                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Mail className="w-3 h-3" />
                        Escríbenos
                    </span>
                    <h2 className="titulo-seccion mb-4">Contacto</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* FORMULARIO */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {enviado ? (
                            <div className="card-glass rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30
                                flex items-center justify-center mb-6">
                                    <CheckCircle className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-secundario mb-3">
                                    ¡Mensaje Enviado!
                                </h3>
                                <p className="t-muted-high mb-6 text-sm">
                                    Te responderemos lo antes posible a {form.email || 'tu correo'}.
                                </p>
                                <button onClick={() => setEnviado(false)} className="btn-ghost text-sm">
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={manejarEnvio} className="card-glass rounded-2xl p-8 space-y-5">
                                <h3 className="text-xl font-display font-bold text-secundario mb-2">
                                    Envíanos un mensaje
                                </h3>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-campo">Nombre *</label>
                                        <input type="text" className="input-campo" placeholder="Tu nombre"
                                            value={form.nombre} onChange={e => actualizar('nombre', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label-campo">Email *</label>
                                        <input type="email" className="input-campo" placeholder="tu@email.com"
                                            value={form.email} onChange={e => actualizar('email', e.target.value)} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="label-campo">Asunto</label>
                                    <input type="text" className="input-campo" placeholder="¿De qué se trata?"
                                        value={form.asunto} onChange={e => actualizar('asunto', e.target.value)} />
                                </div>

                                <div>
                                    <label className="label-campo">Mensaje *</label>
                                    <textarea rows={5} className="input-campo resize-none" required
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={form.mensaje} onChange={e => actualizar('mensaje', e.target.value)} />
                                </div>

                                <button type="submit" disabled={enviando} className="btn-primario w-full justify-center py-3 disabled:opacity-50">
                                    {enviando ? (
                                        <><div className="w-4 h-4 border-2 borde-medium border-t-white rounded-full animate-spin" /> Enviando...</>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Enviar Mensaje</>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* INFORMACIÓN DE CONTACTO + DONACIONES */}
                    <motion.div
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, x: 40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="card-glass rounded-2xl p-8">
                            <h3 className="text-xl font-display font-bold text-secundario mb-6">Información</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-vinotinto/20 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-vinotinto-claro" />
                                    </div>
                                    <div>
                                        <p className="text-xs t-muted uppercase tracking-wider">Email</p>
                                        <a href={`mailto:${infoGrupo.emailContacto}`}
                                            className="t-muted-high hover:text-khaki transition-colors text-sm">
                                            {infoGrupo.emailContacto}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {redes.length > 0 && (
                                <div>
                                    <p className="text-xs t-muted uppercase tracking-wider mb-3">Redes Sociales</p>
                                    <div className="flex gap-3">
                                        {redes.map((red, i) => (
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
                            )}
                        </div>

                        {configuracionSecciones.mostrarDonaciones && (
                            <div className="card-glass rounded-2xl p-8 border border-khaki/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-khaki/10 border border-khaki/30
                                  flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-khaki" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-secundario">Apoya a DaCapo</h3>
                                </div>
                                <p className="t-muted text-sm leading-relaxed mb-6">
                                    Tu apoyo nos permite continuar llevando la música coral a más personas,
                                    financiar los ensayos, las partituras y los conciertos gratuitos.
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { nombre: 'PayPal', url: '#', descripcion: 'Donación segura con tarjeta' },
                                        { nombre: 'Transferencia Bancaria', url: '#', descripcion: 'Contáctanos para los datos' },
                                        { nombre: 'Ko-fi / Patreon', url: '#', descripcion: 'Apoyo mensual desde $2/mes' },
                                    ].map((opcion, i) => (
                                        <a
                                            key={i}
                                            href={opcion.url}
                                            className="flex items-center justify-between p-3 rounded-lg
                                   bg-sutil hover:bg-khaki/10 border borde-subtle hover:border-khaki/30
                                   transition-all duration-200 group"
                                        >
                                            <div>
                                                <p className="text-sm font-medium t-muted-high group-hover:text-khaki transition-colors">
                                                    {opcion.nombre}
                                                </p>
                                                <p className="text-xs t-muted">{opcion.descripcion}</p>
                                            </div>
                                            <ExternalLink className="w-4 h-4 t-muted-low group-hover:text-khaki transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SeccionContacto;
