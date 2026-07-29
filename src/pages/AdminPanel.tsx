/**
 * ============================================================
 * ARCHIVO: src/pages/AdminPanel.tsx
 * ============================================================
 * Panel de administración completo. Accesible en /admin.
 * Solo para usuarios con rol 'admin'.
 * Incluye: Secciones, Integrantes, Partituras, Eventos, Buzón.
 * ============================================================
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, BookOpen, Calendar, Music,
    Inbox, Settings, LogOut, ChevronRight, Eye, EyeOff,
    Plus, Pencil, Trash2, X, Check, Shield, ArrowLeft,
    Mail, Mic
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Integrante, Partitura, Evento } from '../data/mockData';

// ============================================================
// MÓDULOS DEL MENÚ LATERAL
// ============================================================
const MODULOS = [
    { id: 'dashboard', icono: <LayoutDashboard className="w-5 h-5" />, etiqueta: 'Dashboard' },
    { id: 'secciones', icono: <Settings className="w-5 h-5" />, etiqueta: 'Secciones' },
    { id: 'integrantes', icono: <Users className="w-5 h-5" />, etiqueta: 'Integrantes' },
    { id: 'partituras', icono: <BookOpen className="w-5 h-5" />, etiqueta: 'Partituras' },
    { id: 'eventos', icono: <Calendar className="w-5 h-5" />, etiqueta: 'Eventos' },
    { id: 'audio', icono: <Music className="w-5 h-5" />, etiqueta: 'Audio' },
    { id: 'audiciones', icono: <Mic className="w-5 h-5" />, etiqueta: 'Buzón Audiciones' },
    { id: 'mensajes', icono: <Mail className="w-5 h-5" />, etiqueta: 'Buzón Mensajes' },
];

// ============================================================
// MÓDULO: Dashboard (resumen estadístico)
// ============================================================
const ModuloDashboard = () => {
    const { integrantes, partituras, eventos, solicitudesAudicion, mensajesContacto, infoGrupo } = useApp();

    const stats = [
        { etiqueta: 'Integrantes', valor: integrantes.length, color: 'text-rose-400' },
        { etiqueta: 'Partituras', valor: partituras.length, color: 'text-amber-400' },
        { etiqueta: 'Eventos', valor: eventos.filter(e => e.activo).length, color: 'text-blue-400' },
        { etiqueta: 'Solicitudes Pendientes', valor: solicitudesAudicion.filter(s => s.estado === 'Pendiente').length, color: 'text-khaki' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Dashboard</h2>
                <p className="text-white/40 text-sm">Resumen general de DaCapo Grupo Vocal</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="card-glass rounded-xl p-5">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{s.etiqueta}</p>
                        <p className={`text-4xl font-display font-bold ${s.color}`}>{s.valor}</p>
                    </div>
                ))}
            </div>

            {/* Info del grupo editable */}
            <div className="card-glass rounded-xl p-6">
                <h3 className="font-semibold text-secundario mb-4">Información del Grupo</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/60">
                    <div><span className="text-white/30">Nombre:</span> {infoGrupo.nombre} {infoGrupo.subtitulo}</div>
                    <div><span className="text-white/30">Fundado:</span> {infoGrupo.anioFundacion}</div>
                    <div><span className="text-white/30">Email:</span> {infoGrupo.emailContacto}</div>
                    <div><span className="text-white/30">Total Conciertos:</span> {infoGrupo.totalConciertos}</div>
                </div>
                <p className="text-xs text-white/30 mt-4">Para editar estos datos, ve a mockData.ts → infoGrupoDefault</p>
            </div>

            {/* Info de acceso rápido */}
            <div className="card-glass rounded-xl p-6 border border-khaki/20">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-khaki" />
                    <h3 className="font-semibold text-khaki">Credenciales Actuales (Fase 1)</h3>
                </div>
                <div className="space-y-2 text-xs text-white/50">
                    <p>🔴 Admin: admin@dacapo.com / admin123</p>
                    <p>🔵 Usuario: usuario@dacapo.com / user123</p>
                    <p className="text-white/30 mt-2">En Fase 2 (Supabase), estas credenciales serán reemplazadas por el sistema de Auth real.</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MÓDULO: Gestor de Secciones (toggles)
// ============================================================
const ModuloSecciones = () => {
    const { configuracionSecciones, toggleSeccion } = useApp();

    type ClaveSeccion = keyof typeof configuracionSecciones;

    const SECCIONES_INFO: Array<{ clave: ClaveSeccion; etiqueta: string; descripcion: string }> = [
        { clave: 'mostrarAudiciones', etiqueta: 'Audiciones / Únete al Coro', descripcion: 'Formulario para que nuevos coristas se postulen' },
        { clave: 'mostrarEventos', etiqueta: 'Agenda de Eventos', descripcion: 'Próximos conciertos y presentaciones' },
        { clave: 'mostrarDonaciones', etiqueta: 'Donaciones', descripcion: 'Sección de apoyo y donaciones' },
        { clave: 'mostrarBiblioteca', etiqueta: 'Biblioteca de Partituras', descripcion: 'Zona privada de PDFs para integrantes' },
        { clave: 'mostrarChatbot', etiqueta: 'Chatbot Musical', descripcion: 'Asistente flotante de preguntas y respuestas' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Gestor de Secciones</h2>
                <p className="text-white/40 text-sm">Activa o desactiva secciones de la página pública en tiempo real</p>
            </div>

            <div className="space-y-3">
                {SECCIONES_INFO.map(({ clave, etiqueta, descripcion }) => {
                    const activa = configuracionSecciones[clave];
                    return (
                        <div key={clave} className="card-glass rounded-xl p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${activa ? 'bg-emerald-500/20' : 'bg-white/5'
                                    }`}>
                                    {activa
                                        ? <Eye className="w-4 h-4 text-emerald-400" />
                                        : <EyeOff className="w-4 h-4 text-white/30" />
                                    }
                                </div>
                                <div>
                                    <p className="font-medium text-secundario text-sm">{etiqueta}</p>
                                    <p className="text-xs text-white/40">{descripcion}</p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => toggleSeccion(clave)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${activa ? 'bg-emerald-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${activa ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
// MÓDULO: Gestor de Integrantes (CRUD)
// ============================================================
const ModuloIntegrantes = () => {
    const { integrantes, agregarIntegrante, editarIntegrante, eliminarIntegrante } = useApp();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState<Integrante | null>(null);
    const [form, setForm] = useState({ nombre: '', cuerda: 'Soprano' as Integrante['cuerda'], rangoVocal: '', foto: '', biografia: '', esDirectivo: false, cargo: '' });

    const COLORES_CUERDA: Record<string, string> = {
        'Soprano': 'text-rose-300', 'Contralto': 'text-amber-300', 'Tenor': 'text-blue-300', 'Bajo': 'text-purple-300'
    };

    const abrirCrear = () => { setEditando(null); setForm({ nombre: '', cuerda: 'Soprano', rangoVocal: '', foto: '', biografia: '', esDirectivo: false, cargo: '' }); setMostrarFormulario(true); };
    const abrirEditar = (i: Integrante) => { setEditando(i); setForm({ nombre: i.nombre, cuerda: i.cuerda, rangoVocal: i.rangoVocal, foto: i.foto, biografia: i.biografia, esDirectivo: i.esDirectivo, cargo: i.cargo || '' }); setMostrarFormulario(true); };

    const guardar = () => {
        if (!form.nombre) return;
        if (editando) {
            editarIntegrante(editando.id, { ...form, cargo: form.cargo || undefined });
        } else {
            agregarIntegrante({ ...form, cargo: form.cargo || undefined });
        }
        setMostrarFormulario(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">Integrantes</h2>
                    <p className="text-white/40 text-sm">{integrantes.length} integrantes registrados</p>
                </div>
                <button onClick={abrirCrear} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Añadir
                </button>
            </div>

            {/* Lista de integrantes */}
            <div className="space-y-2">
                {integrantes.map(i => (
                    <div key={i.id} className="card-glass rounded-xl p-4 flex items-center gap-4">
                        <img src={i.foto} alt={i.nombre} className="w-10 h-10 rounded-full object-cover bg-fondo-medio flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-secundario text-sm">{i.nombre}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs ${COLORES_CUERDA[i.cuerda]}`}>{i.cuerda}</span>
                                {i.esDirectivo && <span className="text-xs text-khaki">· {i.cargo}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => abrirEditar(i)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => eliminarIntegrante(i.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formulario modal */}
            <AnimatePresence>
                {mostrarFormulario && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarFormulario(false)}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-glass rounded-2xl w-full max-w-md p-6 z-10 space-y-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-secundario">{editando ? 'Editar' : 'Añadir'} Integrante</h3>
                                <button onClick={() => setMostrarFormulario(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><label className="label-campo">Nombre *</label><input className="input-campo" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" /></div>
                                <div><label className="label-campo">Cuerda</label><select className="input-campo" value={form.cuerda} onChange={e => setForm(p => ({ ...p, cuerda: e.target.value as Integrante['cuerda'] }))}>
                                    {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map(c => <option key={c}>{c}</option>)}
                                </select></div>
                                <div><label className="label-campo">Rango Vocal</label><input className="input-campo" value={form.rangoVocal} onChange={e => setForm(p => ({ ...p, rangoVocal: e.target.value }))} placeholder="C4 - G5" /></div>
                                <div className="col-span-2"><label className="label-campo">URL de Foto</label><input className="input-campo" value={form.foto} onChange={e => setForm(p => ({ ...p, foto: e.target.value }))} placeholder="https://..." /></div>
                                <div className="col-span-2"><label className="label-campo">Biografía</label><textarea rows={3} className="input-campo resize-none" value={form.biografia} onChange={e => setForm(p => ({ ...p, biografia: e.target.value }))} placeholder="Mini-biografía..." /></div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <input type="checkbox" id="esDirectivo" checked={form.esDirectivo} onChange={e => setForm(p => ({ ...p, esDirectivo: e.target.checked }))} className="cursor-pointer" />
                                    <label htmlFor="esDirectivo" className="text-sm text-white/70 cursor-pointer">Es miembro directivo</label>
                                </div>
                                {form.esDirectivo && <div className="col-span-2"><label className="label-campo">Cargo</label><input className="input-campo" value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Ej: Presidenta" /></div>}
                            </div>
                            <button onClick={guardar} className="btn-primario w-full justify-center">
                                <Check className="w-4 h-4" /> {editando ? 'Guardar Cambios' : 'Añadir Integrante'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// MÓDULO: Gestor de Eventos (CRUD simplificado)
// ============================================================
const ModuloEventos = () => {
    const { eventos, agregarEvento, editarEvento, eliminarEvento } = useApp();
    const [mostrarForm, setMostrarForm] = useState(false);
    const [formEvento, setFormEvento] = useState({ titulo: '', descripcion: '', fecha: '', lugar: '', direccion: '', tipoEntrada: 'Libre' as Evento['tipoEntrada'], urlEntradas: '', urlMapa: '', activo: true });

    const guardar = () => {
        if (!formEvento.titulo || !formEvento.fecha) return;
        agregarEvento({ ...formEvento, urlEntradas: formEvento.urlEntradas || undefined, urlMapa: formEvento.urlMapa || undefined });
        setMostrarForm(false);
        setFormEvento({ titulo: '', descripcion: '', fecha: '', lugar: '', direccion: '', tipoEntrada: 'Libre', urlEntradas: '', urlMapa: '', activo: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">Eventos</h2>
                    <p className="text-white/40 text-sm">{eventos.length} eventos</p>
                </div>
                <button onClick={() => setMostrarForm(true)} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Nuevo Evento
                </button>
            </div>

            <div className="space-y-3">
                {eventos.map(e => (
                    <div key={e.id} className="card-glass rounded-xl p-4 flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-secundario text-sm">{e.titulo}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${e.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'}`}>
                                    {e.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <p className="text-xs text-white/40">{new Date(e.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {e.lugar}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => editarEvento(e.id, { activo: !e.activo })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                {e.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => eliminarEvento(e.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {mostrarForm && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarForm(false)}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-glass rounded-2xl w-full max-w-md p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto sin-scrollbar" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-secundario">Nuevo Evento</h3>
                                <button onClick={() => setMostrarForm(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <div><label className="label-campo">Título *</label><input className="input-campo" value={formEvento.titulo} onChange={e => setFormEvento(p => ({ ...p, titulo: e.target.value }))} /></div>
                                <div><label className="label-campo">Descripción</label><textarea rows={2} className="input-campo resize-none" value={formEvento.descripcion} onChange={e => setFormEvento(p => ({ ...p, descripcion: e.target.value }))} /></div>
                                <div><label className="label-campo">Fecha y Hora *</label><input type="datetime-local" className="input-campo" value={formEvento.fecha} onChange={e => setFormEvento(p => ({ ...p, fecha: e.target.value }))} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label-campo">Lugar</label><input className="input-campo" value={formEvento.lugar} onChange={e => setFormEvento(p => ({ ...p, lugar: e.target.value }))} /></div>
                                    <div><label className="label-campo">Tipo de Entrada</label>
                                        <select className="input-campo" value={formEvento.tipoEntrada} onChange={e => setFormEvento(p => ({ ...p, tipoEntrada: e.target.value as Evento['tipoEntrada'] }))}>
                                            {['Libre', 'Con entrada', 'Donación voluntaria'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><label className="label-campo">Dirección</label><input className="input-campo" value={formEvento.direccion} onChange={e => setFormEvento(p => ({ ...p, direccion: e.target.value }))} /></div>
                            </div>
                            <button onClick={guardar} className="btn-primario w-full justify-center"><Check className="w-4 h-4" /> Guardar Evento</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// MÓDULO: Buzón de Audiciones
// ============================================================
const ModuloBuzonAudiciones = () => {
    const { solicitudesAudicion, marcarSolicitudRevisada } = useApp();
    const COLORES_ESTADO: Record<string, string> = {
        'Pendiente': 'text-amber-400 bg-amber-400/10',
        'Revisada': 'text-blue-400 bg-blue-400/10',
        'Aceptada': 'text-emerald-400 bg-emerald-400/10',
        'Rechazada': 'text-red-400 bg-red-400/10',
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Buzón de Audiciones</h2>
                <p className="text-white/40 text-sm">{solicitudesAudicion.filter(s => s.estado === 'Pendiente').length} pendientes de revisión</p>
            </div>

            {solicitudesAudicion.length === 0 ? (
                <div className="card-glass rounded-xl p-12 text-center text-white/30">
                    <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay solicitudes de audición</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {[...solicitudesAudicion].reverse().map(s => (
                        <div key={s.id} className="card-glass rounded-xl p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-secundario">{s.nombre}</p>
                                    <p className="text-xs text-white/40">{s.email} · {s.telefono}</p>
                                    <p className="text-xs text-vinotinto-claro mt-1">Voz: {s.tipoVoz}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`badge text-[10px] ${COLORES_ESTADO[s.estado]}`}>{s.estado}</span>
                                    <p className="text-[10px] text-white/30 mt-1">{new Date(s.fechaEnvio).toLocaleDateString('es-ES')}</p>
                                </div>
                            </div>
                            <p className="text-xs text-white/50 bg-white/5 rounded-lg p-3">{s.experiencia}</p>
                            {s.urlAudioPrueba && <a href={s.urlAudioPrueba} target="_blank" rel="noopener noreferrer" className="text-xs text-khaki hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Ver audio de prueba</a>}
                            <div className="flex gap-2 flex-wrap">
                                {(['Pendiente', 'Revisada', 'Aceptada', 'Rechazada'] as const).map(estado => (
                                    <button key={estado} onClick={() => marcarSolicitudRevisada(s.id, estado)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-all ${s.estado === estado
                                                ? `${COLORES_ESTADO[estado]} border-current`
                                                : 'border-white/10 text-white/30 hover:border-white/30'
                                            }`}>
                                        {estado}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// MÓDULO: Buzón de Mensajes
// ============================================================
const ModuloBuzonMensajes = () => {
    const { mensajesContacto, marcarMensajeLeido } = useApp();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Buzón de Mensajes</h2>
                <p className="text-white/40 text-sm">{mensajesContacto.filter(m => !m.leido).length} sin leer</p>
            </div>

            {mensajesContacto.length === 0 ? (
                <div className="card-glass rounded-xl p-12 text-center text-white/30">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay mensajes de contacto</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {[...mensajesContacto].reverse().map(m => (
                        <div key={m.id} className={`card-glass rounded-xl p-5 border transition-all ${m.leido ? 'border-white/5' : 'border-vinotinto/30'}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-secundario text-sm">{m.nombre}</p>
                                        {!m.leido && <div className="w-2 h-2 rounded-full bg-vinotinto animate-pulse" />}
                                    </div>
                                    <p className="text-xs text-white/40">{m.email}</p>
                                </div>
                                <p className="text-xs text-white/30 flex-shrink-0">{new Date(m.fechaEnvio).toLocaleDateString('es-ES')}</p>
                            </div>
                            {m.asunto && <p className="text-xs text-khaki mb-2">Asunto: {m.asunto}</p>}
                            <p className="text-sm text-white/60 bg-white/5 rounded-lg p-3">{m.mensaje}</p>
                            {!m.leido && (
                                <button onClick={() => marcarMensajeLeido(m.id)} className="mt-3 text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Marcar como leído
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: AdminPanel
// ============================================================
const AdminPanel = () => {
    const { esAdmin, usuarioActual, cerrarSesion } = useApp();
    const [moduloActivo, setModuloActivo] = useState('dashboard');
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

    // Si no es admin, mostrar acceso denegado
    if (!esAdmin) {
        return (
            <div className="min-h-screen bg-fondo-oscuro flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-vinotinto mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-secundario mb-2">Acceso Denegado</h2>
                    <p className="text-white/50 mb-6">Esta área es exclusiva para administradores.</p>
                    <Link to="/" className="btn-primario mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Volver al sitio
                    </Link>
                </div>
            </div>
        );
    }

    const COMPONENTES_MODULOS: Record<string, JSX.Element> = {
        'dashboard': <ModuloDashboard />,
        'secciones': <ModuloSecciones />,
        'integrantes': <ModuloIntegrantes />,
        'partituras': <div className="text-white/50 text-center py-20"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Gestión de partituras: añade/edita/elimina en el código (mockData.ts)</p><p className="text-xs mt-2">Interfaz completa disponible en Fase 2 con Supabase Storage para PDFs</p></div>,
        'audio': <div className="text-white/50 text-center py-20"><Music className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Gestión de pistas de audio: edita pistasAudioDefault en mockData.ts</p><p className="text-xs mt-2">Subida de audio desde la interfaz disponible en Fase 2</p></div>,
        'eventos': <ModuloEventos />,
        'audiciones': <ModuloBuzonAudiciones />,
        'mensajes': <ModuloBuzonMensajes />,
    };

    return (
        <div className="min-h-screen bg-fondo-oscuro flex">

            {/* ---- MENÚ LATERAL (Sidebar) ---- */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-fondo-card border-r border-white/10
                       flex flex-col transition-transform duration-300 lg:translate-x-0 ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-vinotinto flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-display font-bold text-secundario text-sm">DaCapo Admin</p>
                            <p className="text-xs text-khaki">Panel de Control</p>
                        </div>
                    </div>
                </div>

                {/* Items del menú */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto sin-scrollbar">
                    {MODULOS.map(modulo => (
                        <button
                            key={modulo.id}
                            onClick={() => { setModuloActivo(modulo.id); setMenuMovilAbierto(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         transition-all duration-200 ${moduloActivo === modulo.id
                                    ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {modulo.icono}
                            {modulo.etiqueta}
                            {moduloActivo === modulo.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}
                </nav>

                {/* Footer del sidebar */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <div className="px-3 py-2">
                        <p className="text-xs text-white/50">Conectado como</p>
                        <p className="text-sm font-medium text-khaki">{usuarioActual?.nombre}</p>
                    </div>
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50
                                   hover:text-white hover:bg-white/5 transition-all w-full">
                        <ArrowLeft className="w-4 h-4" />
                        Ver sitio público
                    </Link>
                    <button onClick={cerrarSesion} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            text-sm text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Overlay para cerrar menú móvil */}
            {menuMovilAbierto && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMenuMovilAbierto(false)} />
            )}

            {/* ---- CONTENIDO PRINCIPAL ---- */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Header móvil */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-fondo-card">
                    <button onClick={() => setMenuMovilAbierto(true)} className="btn-ghost">
                        <LayoutDashboard className="w-5 h-5" />
                        Menú
                    </button>
                    <span className="text-sm font-medium text-white/70">
                        {MODULOS.find(m => m.id === moduloActivo)?.etiqueta}
                    </span>
                </div>

                {/* Contenido del módulo activo */}
                <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={moduloActivo}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {COMPONENTES_MODULOS[moduloActivo]}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
