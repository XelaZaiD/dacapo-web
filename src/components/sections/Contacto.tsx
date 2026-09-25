import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Mail, Send, CheckCircle, Heart, ExternalLink, MapPin,
    Music2, Users, GraduationCap, Sparkles, AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EnlaceRedSocial, IconoInstagram, IconoFacebook, IconoYoutube, IconoTiktok } from '../ui/IconosRedes';

const FORM_VACIO = { nombre: '', email: '', asunto: '', mensaje: '' };

const SUGERENCIAS_ASUNTO = [
    { etiqueta: 'Concierto', icono: <Music2 className="w-3.5 h-3.5" /> },
    { etiqueta: 'Colaboración', icono: <Users className="w-3.5 h-3.5" /> },
    { etiqueta: 'Clases', icono: <GraduationCap className="w-3.5 h-3.5" /> },
    { etiqueta: 'Otro', icono: <Sparkles className="w-3.5 h-3.5" /> },
];

const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

type CanalContactoProps = {
    icono: React.ReactNode;
    etiqueta: string;
    valor: string;
    href?: string;
};

const CanalContacto = ({ icono, etiqueta, valor, href }: CanalContactoProps) => {
    const contenido = (
        <>
            <div className="w-11 h-11 rounded-xl bg-vinotinto/15 border border-vinotinto/25
                        flex items-center justify-center flex-shrink-0 text-vinotinto-claro
                        group-hover:scale-105 transition-transform duration-300">
                {icono}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs t-muted uppercase tracking-wider">{etiqueta}</p>
                <p className="text-sm t-muted-high group-hover:text-khaki truncate transition-colors">{valor}</p>
            </div>
            <ExternalLink className="w-4 h-4 t-muted-low group-hover:text-khaki flex-shrink-0 transition-colors" />
        </>
    );

    const clases = `group flex items-center gap-4 p-3 rounded-xl border borde-subtle bg-sutil
                    hover:border-vinotinto/40 hover:bg-vinotinto/5
                    transition-all duration-300`;

    return href ? (
        <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={clases}
        >
            {contenido}
        </a>
    ) : (
        <div className={clases}>{contenido}</div>
    );
};

const SeccionContacto = () => {
    const { enviarMensajeContacto, infoGrupo, configuracionSecciones } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const [form, setForm] = useState(FORM_VACIO);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [ultimoEmail, setUltimoEmail] = useState('');

    const actualizar = (campo: keyof typeof FORM_VACIO, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => {
                const { [campo]: omitido, ...resto } = prev;
                void omitido;
                return resto;
            });
        }
    };

    const validar = () => {
        const nuevos: Record<string, string> = {};
        if (!form.nombre.trim()) nuevos.nombre = 'Escribe tu nombre.';
        if (!form.email.trim()) nuevos.email = 'Necesitamos tu email para responderte.';
        else if (!validarEmail(form.email.trim())) nuevos.email = 'Ese correo no parece válido.';
        if (!form.mensaje.trim()) nuevos.mensaje = 'Cuéntanos en qué podemos ayudarte.';
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validar()) return;

        setEnviando(true);
        await new Promise(r => setTimeout(r, 800));

        enviarMensajeContacto(form);
        setUltimoEmail(form.email);
        setEnviando(false);
        setEnviado(true);
        setForm(FORM_VACIO);
        setErrores({});
    };

    const canales: CanalContactoProps[] = [
        { icono: <Mail className="w-5 h-5" />, etiqueta: 'Email', valor: infoGrupo.emailContacto, href: `mailto:${infoGrupo.emailContacto}` },
    ];
    if (infoGrupo.ubicacion) {
        canales.push({ icono: <MapPin className="w-5 h-5" />, etiqueta: 'Ubicación', valor: infoGrupo.ubicacion, href: infoGrupo.mapaUrl || undefined });
    }

    const redes = [
        { icono: <IconoInstagram className="w-4 h-4" />, url: infoGrupo.redesSociales.instagram, colorNeon: 'hover:text-pink-400', nombre: 'Instagram' },
        { icono: <IconoFacebook className="w-4 h-4" />, url: infoGrupo.redesSociales.facebook, colorNeon: 'hover:text-blue-400', nombre: 'Facebook' },
        { icono: <IconoYoutube className="w-4 h-4" />, url: infoGrupo.redesSociales.youtube, colorNeon: 'hover:text-red-400', nombre: 'YouTube' },
        { icono: <IconoTiktok className="w-4 h-4" />, url: infoGrupo.redesSociales.tiktok, colorNeon: 'hover:text-secundario', nombre: 'TikTok' },
    ].flatMap(r => r.url ? [{ ...r, url: r.url }] : []);

    const campoConError = (hayError: boolean) => (hayError ? { borderColor: 'rgb(239 68 68 / 0.6)' } : undefined);

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
                    <p className="t-muted max-w-xl mx-auto text-sm">
                        ¿Tienes una idea, una invitación o simplemente ganas de escucharnos en vivo?
                        Cuéntanos y te escribiremos en cuanto podamos.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs borde-subtle bg-sutil t-muted-low">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Respondemos en 24-48 h
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs borde-subtle bg-sutil t-muted-low">
                            <Heart className="w-3 h-3 text-khaki" />
                            Todos los niveles bienvenidos
                        </span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">

                    {/* VITRINA DE CONTACTO */}
                    <motion.div
                        className="relative overflow-hidden card-glass rounded-3xl p-8 lg:p-10"
                        initial={{ opacity: 0, x: -40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-vinotinto/15 via-transparent to-khaki/10 pointer-events-none" />
                        <div className="relative">
                            <h3 className="text-xl font-display font-bold text-secundario mb-2">Hablemos</h3>
                            <p className="t-muted text-sm mb-8">
                                Estos son los canales por donde llegamos a ti. Elige el que prefieras.
                            </p>

                            <div className="space-y-3">
                                {canales.map(canal => (
                                    <CanalContacto key={canal.etiqueta} {...canal} />
                                ))}
                            </div>

                            {redes.length > 0 && (
                                <div className="mt-8">
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
                    </motion.div>

                    {/* FORMULARIO */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        {enviado ? (
                            <div className="card-glass rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30
                                flex items-center justify-center mb-6">
                                    <CheckCircle className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-secundario mb-3">
                                    ¡Mensaje Enviado!
                                </h3>
                                <p className="t-muted-high mb-6 text-sm">
                                    Te responderemos lo antes posible a {ultimoEmail || 'tu correo'}.
                                </p>
                                <button onClick={() => setEnviado(false)} className="btn-ghost text-sm">
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={manejarEnvio} noValidate className="card-glass rounded-3xl p-8 lg:p-10 space-y-5">
                                <h3 className="text-xl font-display font-bold text-secundario mb-2">
                                    Envíanos un mensaje
                                </h3>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-campo">Nombre *</label>
                                        <input
                                            type="text"
                                            className="input-campo"
                                            placeholder="Tu nombre"
                                            style={campoConError(!!errores.nombre)}
                                            value={form.nombre}
                                            onChange={e => actualizar('nombre', e.target.value)}
                                            required
                                        />
                                        {errores.nombre && (
                                            <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                                                <AlertCircle className="w-3 h-3" /> {errores.nombre}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="label-campo">Email *</label>
                                        <input
                                            type="email"
                                            className="input-campo"
                                            placeholder="tu@email.com"
                                            style={campoConError(!!errores.email)}
                                            value={form.email}
                                            onChange={e => actualizar('email', e.target.value)}
                                            required
                                        />
                                        {errores.email && (
                                            <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                                                <AlertCircle className="w-3 h-3" /> {errores.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-campo">Asunto</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {SUGERENCIAS_ASUNTO.map(s => (
                                            <button
                                                key={s.etiqueta}
                                                type="button"
                                                onClick={() => actualizar('asunto', s.etiqueta)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.asunto === s.etiqueta
                                                        ? 'bg-khaki/15 text-khaki border-khaki/40'
                                                        : 'borde-subtle t-muted hover:text-secundario hover:border-secundario/40'
                                                    }`}
                                            >
                                                {s.icono} {s.etiqueta}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        className="input-campo"
                                        placeholder="O escribe tu propio asunto"
                                        value={form.asunto}
                                        onChange={e => actualizar('asunto', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="label-campo">Mensaje *</label>
                                    <textarea
                                        rows={5}
                                        className="input-campo resize-none"
                                        style={campoConError(!!errores.mensaje)}
                                        required
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={form.mensaje}
                                        onChange={e => actualizar('mensaje', e.target.value)}
                                    />
                                    {errores.mensaje && (
                                        <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                                            <AlertCircle className="w-3 h-3" /> {errores.mensaje}
                                        </p>
                                    )}
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
                </div>

                {/* DONACIONES */}
                {configuracionSecciones.mostrarDonaciones && (
                    <motion.div
                        className="relative overflow-hidden card-glass rounded-3xl p-8 lg:p-10 mt-8 border border-khaki/20"
                        initial={{ opacity: 0, y: 40 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-khaki/10 via-transparent to-khaki/5 pointer-events-none" />
                        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                            <div className="lg:max-w-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-khaki/10 border border-khaki/30
                                  flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-khaki" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-secundario">Apoya a DaCapo</h3>
                                </div>
                                <p className="t-muted text-sm leading-relaxed mb-6 lg:mb-0">
                                    Tu apoyo nos permite continuar llevando la música coral a más personas,
                                    financiar los ensayos, las partituras y los conciertos gratuitos.
                                </p>
                            </div>

                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                                {[
                                    { nombre: 'PayPal', url: '#', descripcion: 'Donación segura con tarjeta' },
                                    { nombre: 'Transferencia Bancaria', url: '#', descripcion: 'Contáctanos para los datos' },
                                    { nombre: 'Ko-fi / Patreon', url: '#', descripcion: 'Apoyo mensual desde $2/mes' },
                                ].map((opcion, i) => (
                                    <a
                                        key={i}
                                        href={opcion.url}
                                        className="flex flex-col justify-between gap-3 p-4 rounded-xl group
                                   bg-sutil hover:bg-khaki/10 border borde-subtle hover:border-khaki/30
                                   transition-all duration-200"
                                    >
                                        <div>
                                            <p className="text-sm font-medium t-muted-high group-hover:text-khaki transition-colors">
                                                {opcion.nombre}
                                            </p>
                                            <p className="text-xs t-muted mt-1">{opcion.descripcion}</p>
                                        </div>
                                        <span className="self-end inline-flex items-center gap-1 text-xs font-semibold text-khaki opacity-0 group-hover:opacity-100 transition-opacity">
                                            Donar <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default SeccionContacto;