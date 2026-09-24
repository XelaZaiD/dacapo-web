/**
 * ============================================================
 * ARCHIVO: src/pages/AdminPanel.tsx
 * ============================================================
 * Panel de administración completo. Accesible en /admin.
 * Solo para usuarios con rol 'admin'.
 * Incluye: Secciones, Integrantes, Partituras, Eventos, Buzón.
 * ============================================================
 */

import { useState, type ChangeEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, BookOpen, Calendar, Music,
    Settings, LogOut, ChevronLeft, ChevronRight, Eye, EyeOff,
    Plus, Pencil, Trash2, X, Check, Shield, ArrowLeft,
    Mail, Mic, Upload, Play, Pause, Disc, Loader2, AlertCircle,
    Sun, Moon, FileText, LayoutGrid, List, Rows2, Grid3x3, Download,
    ArrowUp, ArrowDown, Video, Image as ImageIcon,
    Lock, AtSign, ExternalLink, Music2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Integrante, Evento, PistaAudio, Partitura, VideoMedia, FotoGaleria, InfoGrupo, VistasBiblioteca, VistasIntegrantes, CUERDAS_PARTITURA, CUERDAS_INTEGRANTE, DIFICULTADES_PARTITURA, ESTILOS_PARTITURA, EPOCAS_PARTITURA, CATEGORIAS_VIDEO, CATEGORIAS_FOTO } from '../data/mockData';
import { supabase, subirAudioSupabase, subirPortadaAudioSupabase, subirPdfPartituraSupabase, subirPortadaPartituraSupabase, subirFotoIntegranteSupabase, subirLogoGrupoSupabase } from '../services/supabase';
import AvisoTemporal from '../components/ui/AvisoTemporal';

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
    { id: 'media', icono: <Video className="w-5 h-5" />, etiqueta: 'Media & Galería' },
    { id: 'audiciones', icono: <Mic className="w-5 h-5" />, etiqueta: 'Buzón Audiciones' },
    { id: 'mensajes', icono: <Mail className="w-5 h-5" />, etiqueta: 'Buzón Mensajes' },
];

// ============================================================
// UTILIDAD: Paginación de registros (10 por página)
// ============================================================
const REGISTROS_POR_PAGINA = 10;

const PaginadorRegistros = ({ pagina, totalPaginas, alCambiar }: {
    pagina: number;
    totalPaginas: number;
    alCambiar: (pagina: number) => void;
}) => {
    if (totalPaginas <= 1) return null;
    const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1 flex-wrap py-4">
            <button
                onClick={() => alCambiar(Math.max(1, pagina - 1))}
                disabled={pagina <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover text-secundario disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Página anterior"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {paginas.map(p => (
                <button
                    key={p}
                    onClick={() => alCambiar(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === pagina
                            ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                            : 'bg-sutil hover:bg-sutil-hover text-secundario'
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => alCambiar(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina >= totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover text-secundario disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Página siguiente"
            >
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// ============================================================
// MÓDULO: Dashboard (resumen estadístico + info del grupo)
// ============================================================

// Campo con edición en línea: muestra el valor + lápiz; al pulsar
// el lápiz se vuelve un input/textarea y Enter (✓ para campos largos)
// guarda, Escape cancela.
const CampoEditable = ({ etiqueta, valor, alGuardar, multilinea = false, placeholder, icono }: {
    etiqueta: string;
    valor: string;
    alGuardar: (valor: string) => void;
    multilinea?: boolean;
    placeholder?: string;
    icono?: ReactNode;
}) => {
    const [editando, setEditando] = useState(false);
    const [borrador, setBorrador] = useState(valor);

    const iniciar = () => {
        setBorrador(valor);
        setEditando(true);
    };

    const guardar = () => {
        alGuardar(borrador);
        setEditando(false);
    };

    const cancelar = () => setEditando(false);

    if (editando) {
        return (
            <div className="w-full">
                <p className="text-[11px] uppercase tracking-wider t-muted-low mb-1">{etiqueta}</p>
                {multilinea ? (
                    <div className="flex items-start gap-2">
                        <textarea
                            autoFocus
                            rows={2}
                            className="input-campo flex-1 resize-none"
                            value={borrador}
                            onChange={e => setBorrador(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Escape') cancelar(); }}
                            placeholder={placeholder}
                        />
                        <button onClick={guardar} title="Guardar" className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-vinotinto text-white hover:bg-vinotinto-claro transition-all">
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <input
                        autoFocus
                        className="input-campo w-full"
                        value={borrador}
                        onChange={e => setBorrador(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') cancelar(); }}
                        onBlur={guardar}
                        placeholder={placeholder}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="group flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider t-muted-low mb-0.5 flex items-center gap-1">{icono}{etiqueta}</p>
                <p className="text-sm t-muted-high break-words">
                    {valor.trim() ? valor : <span className="italic t-muted-low">Sin definir</span>}
                </p>
            </div>
            <button
                onClick={iniciar}
                title={`Editar ${etiqueta}`}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-secundario/60 hover:text-vinotinto hover:bg-vinotinto/10 transition-all bg-sutil/60"
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// Contador sincronizado con otro módulo (no editable): muestra un tooltip
// que explica que el valor proviene de los registros reales de ese módulo.
const ContadorSincronizado = ({ etiqueta, icono, valor, tooltip, modulo, alNavegar }: {
    etiqueta: string;
    icono: ReactNode;
    valor: number;
    tooltip: string;
    modulo: string;
    alNavegar: (modulo: string) => void;
}) => (
    <button
        onClick={() => alNavegar(modulo)}
        title={tooltip}
        className="card-glass rounded-xl p-4 text-left w-full group hover:border-vinotinto/50 hover:shadow-glow-vinotinto transition-all duration-300 cursor-pointer"
    >
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs t-muted uppercase tracking-wider flex items-center gap-1.5">{icono}{etiqueta}</p>
            <Lock className="w-3.5 h-3.5 text-khaki/70" />
        </div>
        <p className="text-3xl font-display font-bold text-secundario">{valor}</p>
        <p className="text-[11px] t-muted-low mt-1">Automático · ver módulo</p>
    </button>
);

const ModuloDashboard = ({ onNavigate }: { onNavigate: (modulo: string) => void }) => {
    const { integrantes, partituras, eventos, solicitudesAudicion, mensajesContacto, infoGrupo, actualizarInfoGrupo } = useApp();
    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const [nuevaFrase, setNuevaFrase] = useState('');

    const solicitudesPendientes = solicitudesAudicion.filter(s => s.estado === 'Pendiente').length;
    const mensajesNoLeidos = mensajesContacto.filter(m => !m.leido).length;
    const conciertosRealizados = eventos.filter(e => e.activo && new Date(e.fecha).getTime() <= Date.now()).length;
    const aniosTrayectoria = Math.max(0, new Date().getFullYear() - infoGrupo.anioFundacion);

    const aplicar = (datos: Partial<InfoGrupo>) => actualizarInfoGrupo(datos);

    const subirLogo = async (e: ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] ?? null;
        e.target.value = '';
        if (!archivo) return;
        setSubiendoLogo(true);
        const url = await subirLogoGrupoSupabase(archivo);
        setSubiendoLogo(false);
        if (url) aplicar({ logoUrl: url });
    };

    const agregarFrase = () => {
        const frase = nuevaFrase.trim();
        if (!frase) return;
        aplicar({ frasesBanner: [...(infoGrupo.frasesBanner || []), frase] });
        setNuevaFrase('');
    };

    const actualizarFrase = (indice: number, valor: string) => {
        const frases = [...(infoGrupo.frasesBanner || [])];
        frases[indice] = valor;
        aplicar({ frasesBanner: frases });
    };

    const quitarFrase = (indice: number) => {
        aplicar({ frasesBanner: (infoGrupo.frasesBanner || []).filter((_, i) => i !== indice) });
    };

    const stats = [
        { etiqueta: 'Integrantes', valor: integrantes.length, color: 'text-rose-600 dark:text-rose-400', modulo: 'integrantes' },
        { etiqueta: 'Partituras', valor: partituras.length, color: 'text-amber-600 dark:text-amber-400', modulo: 'partituras' },
        { etiqueta: 'Eventos', valor: eventos.filter(e => e.activo).length, color: 'text-blue-600 dark:text-blue-400', modulo: 'eventos' },
        { etiqueta: 'Solicitudes Pendientes', valor: solicitudesPendientes, color: 'text-khaki', modulo: 'audiciones', alerta: solicitudesPendientes > 0 },
    ];

    const redes = [
        { clave: 'instagram' as const, etiqueta: 'Instagram', icono: <AtSign className="w-3.5 h-3.5" /> },
        { clave: 'facebook' as const, etiqueta: 'Facebook', icono: <ExternalLink className="w-3.5 h-3.5" /> },
        { clave: 'youtube' as const, etiqueta: 'YouTube', icono: <Play className="w-3.5 h-3.5" /> },
        { clave: 'tiktok' as const, etiqueta: 'TikTok', icono: <Music2 className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Dashboard</h2>
                <p className="t-muted text-sm">Resumen general de DaCapo Grupo Vocal</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <button key={i} onClick={() => onNavigate(s.modulo)}
                        className="card-glass rounded-xl p-5 text-left w-full
                            hover:border-vinotinto/50 hover:shadow-glow-vinotinto
                            transition-all duration-300 cursor-pointer group relative"
                    >
                        {s.alerta && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                        )}
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs t-muted uppercase tracking-wider">{s.etiqueta}</p>
                            <ChevronRight className="w-3 h-3 text-black/20 dark:text-white/20 group-hover:text-vinotinto-claro 
                                group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className={`text-4xl font-display font-bold ${s.color}`}>{s.valor}</p>
                    </button>
                ))}
            </div>

            {/* Tarjeta de mensajes no leídos */}
            <button onClick={() => onNavigate('mensajes')}
                className="card-glass rounded-xl p-5 text-left w-full
                    hover:border-vinotinto/50 hover:shadow-glow-vinotinto
                    transition-all duration-300 cursor-pointer group relative"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-vinotinto-claro" />
                        <h3 className="font-semibold text-secundario">Buzón de Mensajes</h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/20 dark:text-white/20 group-hover:text-vinotinto-claro 
                        group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-3xl font-display font-bold text-blue-700 dark:text-blue-400">{mensajesNoLeidos}</p>
                    <span className="text-sm t-muted">mensajes sin leer</span>
                </div>
                {mensajesNoLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                )}
            </button>

            {/* Información del Grupo (edición en línea) */}
            <div className="card-glass rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-secundario">Información del Grupo</h3>
                    <p className="text-[11px] t-muted-low">Pulsa el lápiz para editar en el sitio · Enter guarda</p>
                </div>

                {/* Identidad + logo */}
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-sutil border borde-subtle flex items-center justify-center">
                            {infoGrupo.logoUrl ? (
                                <img src={infoGrupo.logoUrl} alt="Logo del grupo" className="w-full h-full object-cover" />
                            ) : (
                                <Music className="w-10 h-10 text-vinotinto-claro" />
                            )}
                        </div>
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={subirLogo} />
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-sutil hover:bg-sutil-hover text-secundario transition-all">
                                {subiendoLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Logo
                            </span>
                        </label>
                        {infoGrupo.logoUrl && (
                            <button onClick={() => aplicar({ logoUrl: '' })} className="text-[11px] text-red-600 dark:text-red-400 hover:underline">Quitar</button>
                        )}
                    </div>

                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <CampoEditable etiqueta="Nombre del grupo" valor={infoGrupo.nombre} alGuardar={v => aplicar({ nombre: v })} placeholder="DaCapo" />
                            <CampoEditable etiqueta="Subtítulo" valor={infoGrupo.subtitulo} alGuardar={v => aplicar({ subtitulo: v })} placeholder="Grupo Vocal" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <CampoEditable etiqueta="Año de fundación" valor={String(infoGrupo.anioFundacion)} alGuardar={v => aplicar({ anioFundacion: Number(v) || new Date().getFullYear() })} placeholder="2019" />
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-sm t-muted-high">
                                    <span className="w-2 h-2 rounded-full bg-khaki/70" />
                                    <span>Fundado en <b>{infoGrupo.anioFundacion}</b> · <b className="text-vinotinto">{aniosTrayectoria}</b> años de trayectoria</span>
                                </div>
                                <p className="text-[11px] t-muted-low mt-1 pl-5">Años calculados automáticamente desde el año de fundación</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Descripción / Misión / Visión */}
                <div className="space-y-4">
                    <CampoEditable etiqueta="Descripción" valor={infoGrupo.descripcion} multilinea alGuardar={v => aplicar({ descripcion: v })} placeholder="¿Quiénes son?" />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <CampoEditable etiqueta="Misión" valor={infoGrupo.mision} multilinea alGuardar={v => aplicar({ mision: v })} placeholder="Misión del grupo" />
                        <CampoEditable etiqueta="Visión" valor={infoGrupo.vision} multilinea alGuardar={v => aplicar({ vision: v })} placeholder="Visión del grupo" />
                    </div>
                </div>

                {/* Contacto */}
                <div className="grid sm:grid-cols-2 gap-4 border-t borde-subtle pt-4">
                    <CampoEditable etiqueta="Email de contacto" valor={infoGrupo.emailContacto} alGuardar={v => aplicar({ emailContacto: v })} placeholder="correo@dacapo.com" />
                    <CampoEditable etiqueta="Teléfono" valor={infoGrupo.telefono || ''} alGuardar={v => aplicar({ telefono: v })} placeholder="+58 412 000 0000" />
                    <CampoEditable etiqueta="Ubicación" valor={infoGrupo.ubicacion || ''} alGuardar={v => aplicar({ ubicacion: v })} placeholder="Ciudad, país" />
                    <CampoEditable etiqueta="Mapa (enlace)" valor={infoGrupo.mapaUrl || ''} alGuardar={v => aplicar({ mapaUrl: v })} placeholder="https://maps.google.com/..." />
                </div>

                {/* Contadores sincronizados */}
                <div className="border-t borde-subtle pt-5">
                    <p className="text-xs t-muted mb-3 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-khaki/70" /> Estos valores se sincronizan automáticamente con sus módulos (no se editan aquí)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ContadorSincronizado
                            etiqueta="Conciertos"
                            icono={<Calendar className="w-3.5 h-3.5" />}
                            valor={conciertosRealizados}
                            modulo="eventos"
                            tooltip="Se sincroniza con el módulo Eventos: suma los eventos activos con fecha ya pasada. Registra un evento con fecha pasada para sumarlo a la métrica histórica."
                            alNavegar={onNavigate}
                        />
                        <ContadorSincronizado
                            etiqueta="Integrantes"
                            icono={<Users className="w-3.5 h-3.5" />}
                            valor={integrantes.length}
                            modulo="integrantes"
                            tooltip="Se sincroniza con el módulo Integrantes: es el total de miembros registrados."
                            alNavegar={onNavigate}
                        />
                        <ContadorSincronizado
                            etiqueta="Partituras"
                            icono={<BookOpen className="w-3.5 h-3.5" />}
                            valor={partituras.length}
                            modulo="partituras"
                            tooltip="Se sincroniza con el módulo Partituras: es el total de partituras registradas."
                            alNavegar={onNavigate}
                        />
                    </div>
                </div>

                {/* Redes sociales */}
                <div className="border-t borde-subtle pt-5">
                    <p className="text-xs t-muted mb-3">Redes sociales (aparecen en toda la página web)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {redes.map(r => (
                            <CampoEditable
                                key={r.clave}
                                etiqueta={r.etiqueta}
                                icono={r.icono}
                                valor={infoGrupo.redesSociales?.[r.clave] || ''}
                                alGuardar={v => aplicar({ redesSociales: { ...infoGrupo.redesSociales, [r.clave]: v } })}
                                placeholder={`https://${r.etiqueta.toLowerCase()}.com/...`}
                            />
                        ))}
                    </div>
                </div>

                {/* Frases del banner (Hero) */}
                <div className="border-t borde-subtle pt-5">
                    <p className="text-xs t-muted mb-1">Cinta musical del inicio (Hero)</p>
                    <p className="text-[11px] t-muted-low mb-3">Estas frases se deslizan en la parte inferior del inicio.</p>
                    <div className="space-y-2">
                        {(infoGrupo.frasesBanner || []).map((frase, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <CampoEditable etiqueta={`Frase ${i + 1}`} valor={frase} alGuardar={v => actualizarFrase(i, v)} placeholder="Palabra o frase" />
                                </div>
                                <button onClick={() => quitarFrase(i)} title="Quitar frase" className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <input
                            className="input-campo flex-1"
                            value={nuevaFrase}
                            onChange={e => setNuevaFrase(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') agregarFrase(); }}
                            placeholder="Añadir nueva frase al banner..."
                        />
                        <button onClick={agregarFrase} className="btn-ghost text-sm px-3 py-2 shrink-0">
                            <Plus className="w-4 h-4" /> Añadir
                        </button>
                    </div>
                </div>
            </div>

            {/* Info de acceso rápido */}
            <div className="card-glass rounded-xl p-6 border border-khaki/20">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-khaki" />
                    <h3 className="font-semibold text-khaki">Credenciales Actuales (Fase 1)</h3>
                </div>
                <div className="space-y-2 text-xs t-muted">
                    <p>🔴 Admin: admin@dacapo.com / admin123</p>
                    <p>🔵 Usuario: usuario@dacapo.com / user123</p>
                    <p className="t-muted-low mt-2">En Fase 2 (Supabase), estas credenciales serán reemplazadas por el sistema de Auth real.</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MÓDULO: Gestor de Secciones (toggles + asistente)
// ============================================================
const ModuloSecciones = () => {
    const { configuracionSecciones, toggleSeccion, actualizarAsistente } = useApp();

    type ClaveSeccion = keyof typeof configuracionSecciones;

    const SECCIONES_INFO: Array<{ clave: Exclude<ClaveSeccion, 'tipoAsistente' | 'numeroWhatsapp'>; etiqueta: string; descripcion: string }> = [
        { clave: 'mostrarAudiciones', etiqueta: 'Audiciones / Únete al Coro', descripcion: 'Formulario para que nuevos coristas se postulen' },
        { clave: 'mostrarEventos', etiqueta: 'Agenda de Eventos', descripcion: 'Próximos conciertos y presentaciones' },
        { clave: 'mostrarDonaciones', etiqueta: 'Donaciones', descripcion: 'Sección de apoyo y donaciones' },
        { clave: 'mostrarBiblioteca', etiqueta: 'Biblioteca de Partituras', descripcion: 'Zona privada de PDFs para integrantes' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Gestor de Secciones</h2>
                <p className="t-muted text-sm">Activa o desactiva secciones de la página pública en tiempo real</p>
            </div>

            <div className="space-y-3">
                {SECCIONES_INFO.map(({ clave, etiqueta, descripcion }) => {
                    const activa = configuracionSecciones[clave];
                    return (
                        <div key={clave} className="card-glass rounded-xl p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${activa ? 'bg-emerald-500/20' : 'bg-sutil'}`}>
                                    {activa
                                        ? <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                        : <EyeOff className="w-4 h-4 t-muted-low" />
                                    }
                                </div>
                                <div>
                                    <p className="font-medium text-secundario text-sm">{etiqueta}</p>
                                    <p className="text-xs t-muted">{descripcion}</p>
                                </div>
                            </div>
                            <button onClick={() => toggleSeccion(clave)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${activa ? 'bg-emerald-500' : 'bg-sutil-hover'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${activa ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Configuración del Asistente Virtual */}
            <div className="card-glass rounded-xl p-6">
                <h3 className="font-semibold text-secundario mb-4">Asistente Virtual</h3>
                <p className="text-xs t-muted mb-4">Selecciona qué asistente estará activo (solo uno a la vez)</p>
                <div className="flex flex-col gap-3">
                    {[
                        { valor: 'ninguno' as const, label: 'Apagar todo', desc: 'No mostrar ningún asistente', icono: '🚫' },
                        { valor: 'chatbot' as const, label: 'Chatbot', desc: 'Asistente flotante de preguntas y respuestas', icono: '🤖' },
                        { valor: 'whatsapp' as const, label: 'WhatsApp', desc: 'Enlace directo a WhatsApp', icono: '💬' },
                    ].map(opcion => {
                        const activo = configuracionSecciones.tipoAsistente === opcion.valor;
                        return (
                            <button
                                key={opcion.valor}
                                onClick={() => actualizarAsistente({ tipoAsistente: opcion.valor })}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${activo
                                        ? 'bg-vinotinto/20 border-vinotinto text-white'
                                        : 'bg-sutil borde-subtle t-muted-high hover:bg-sutil-hover hover:text-secundario'
                                    }`}
                            >
                                <span className="text-xl">{opcion.icono}</span>
                                <div className="flex-1">
                                    <p className={`font-medium text-sm ${activo ? 'text-secundario' : ''}`}>{opcion.label}</p>
                                    <p className="text-xs t-muted">{opcion.desc}</p>
                                </div>
                                {activo && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <span className="text-[10px] text-white">✓</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                {configuracionSecciones.tipoAsistente === 'whatsapp' && (
                    <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-3">
                        <label className="block">
                            <span className="text-xs text-green-700 dark:text-green-400 font-medium">Número de WhatsApp</span>
                            <div className="flex gap-2 mt-1">
                                <span className="flex items-center text-xs t-muted bg-sutil px-3 rounded-lg border borde-subtle">+</span>
                                <input
                                    type="text"
                                    value={configuracionSecciones.numeroWhatsapp}
                                    onChange={e => actualizarAsistente({ numeroWhatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                                    className="flex-1 bg-sutil border borde-subtle rounded-lg px-3 py-2 text-sm text-secundario placeholder-black/40 dark:placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors font-mono"
                                    placeholder="584241721311"
                                />
                            </div>
                            <p className="text-[10px] t-muted-low mt-1">Ej: 584241721311 (código país + número)</p>
                        </label>
                        <div className="p-2 rounded bg-green-500/5">
                            <p className="text-xs text-green-700/80 dark:text-green-400/80">
                                {configuracionSecciones.numeroWhatsapp
                                    ? `wa.me/${configuracionSecciones.numeroWhatsapp}`
                                    : 'Ingresa un número para generar el enlace'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// MÓDULO: Gestor de Integrantes (CRUD)
// ============================================================
const VISTAS_INTEGRANTES_INFO: { clave: keyof VistasIntegrantes; etiqueta: string; icono: JSX.Element; descripcion: string }[] = [
    { clave: 'grid', etiqueta: 'Cuadrícula', icono: <LayoutGrid className="w-4 h-4" />, descripcion: 'Tarjetas con filtros por cuerda' },
    { clave: 'satb', etiqueta: 'Paneles SATB', icono: <Rows2 className="w-4 h-4" />, descripcion: 'Bloques temáticos por cuerda' },
    { clave: 'lista', etiqueta: 'Directorio', icono: <List className="w-4 h-4" />, descripcion: 'Roster estilo programa de concierto' },
    { clave: 'mosaico', etiqueta: 'Mosaico', icono: <Grid3x3 className="w-4 h-4" />, descripcion: 'Vitrina de fotos de altura variada' },
];

const ModuloIntegrantes = () => {
    const {
        integrantes, agregarIntegrante, editarIntegrante, eliminarIntegrante,
        vistasIntegrantes, toggleVistaIntegrante, estadoIntegrantes,
    } = useApp();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState<Integrante | null>(null);
    const [form, setForm] = useState({
        nombre: '', cuerda: 'Soprano' as Integrante['cuerda'], rangoVocal: '', foto: '', biografia: '',
        esDirectivo: false, cargo: '', anioIngreso: '', urlInstagram: '',
    });
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [aviso, setAviso] = useState<{ mensaje: string; tipo: 'ok' | 'error' } | null>(null);
    const [paginaIntegrantes, setPaginaIntegrantes] = useState(1);

    const COLORES_CUERDA: Record<string, string> = {
        'Soprano': 'text-rose-600 dark:text-rose-300', 'Contralto': 'text-amber-600 dark:text-amber-300', 'Tenor': 'text-blue-600 dark:text-blue-300', 'Bajo': 'text-purple-600 dark:text-purple-300'
    };

    const formVacio = () => ({
        nombre: '', cuerda: 'Soprano' as Integrante['cuerda'], rangoVocal: '', foto: '', biografia: '',
        esDirectivo: false, cargo: '', anioIngreso: '', urlInstagram: '',
    });

    const abrirCrear = () => { setEditando(null); setForm(formVacio()); setMostrarFormulario(true); };
    const abrirEditar = (i: Integrante) => {
        setEditando(i);
        setForm({
            nombre: i.nombre,
            cuerda: i.cuerda,
            rangoVocal: i.rangoVocal,
            foto: i.foto,
            biografia: i.biografia,
            esDirectivo: i.esDirectivo,
            cargo: i.cargo || '',
            anioIngreso: i.anioIngreso !== undefined ? String(i.anioIngreso) : '',
            urlInstagram: i.urlInstagram || '',
        });
        setMostrarFormulario(true);
    };

    const aDatos = (): Omit<Integrante, 'id'> => ({
        nombre: form.nombre,
        cuerda: form.cuerda,
        rangoVocal: form.rangoVocal,
        foto: form.foto,
        biografia: form.biografia,
        esDirectivo: form.esDirectivo,
        cargo: form.cargo || undefined,
        anioIngreso: form.anioIngreso ? Number(form.anioIngreso) : undefined,
        urlInstagram: form.urlInstagram || undefined,
    });

    const guardar = () => {
        if (!form.nombre.trim()) return;
        if (editando) {
            editarIntegrante(editando.id, aDatos());
        } else {
            agregarIntegrante({ ...aDatos(), orden: integrantes.length });
        }
        setMostrarFormulario(false);
    };

    const subirFoto = async (archivo: File | null) => {
        if (!archivo) return;
        setSubiendoFoto(true);
        const url = await subirFotoIntegranteSupabase(archivo);
        setSubiendoFoto(false);
        if (url) {
            setForm(p => ({ ...p, foto: url }));
            setAviso({ mensaje: 'Foto subida correctamente.', tipo: 'ok' });
        } else {
            setAviso({ mensaje: 'No se pudo subir la foto. Revisa el bucket "integrantes" en Supabase.', tipo: 'error' });
        }
    };

    // Reordena un integrante (botones subir/bajar) actualizando el campo "orden"
    const mover = (id: string, direccion: -1 | 1) => {
        const ordenados = [...integrantes]
            .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999) || a.nombre.localeCompare(b.nombre));
        const indice = ordenados.findIndex(i => i.id === id);
        const nuevoIndice = indice + direccion;
        if (indice < 0 || nuevoIndice < 0 || nuevoIndice >= ordenados.length) return;
        const [movido] = ordenados.splice(indice, 1);
        ordenados.splice(nuevoIndice, 0, movido);
        ordenados.forEach((i, pos) => {
            if ((i.orden ?? 9999) !== pos) editarIntegrante(i.id, { orden: pos });
        });
    };

    const integrantesOrdenados = [...integrantes]
        .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999) || a.nombre.localeCompare(b.nombre));

    const totalPaginasIntegrantes = Math.max(1, Math.ceil(integrantesOrdenados.length / REGISTROS_POR_PAGINA));
    const paginaIntegrantesClamp = Math.min(paginaIntegrantes, totalPaginasIntegrantes);
    const integrantesPaginados = integrantesOrdenados.slice(
        (paginaIntegrantesClamp - 1) * REGISTROS_POR_PAGINA,
        paginaIntegrantesClamp * REGISTROS_POR_PAGINA
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">Integrantes</h2>
                    <p className="t-muted text-sm">{integrantes.length} integrantes registrados</p>
                </div>
                <button onClick={abrirCrear} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Añadir
                </button>
            </div>

            {/* Preferencias de la sección Integrantes (diseños públicos) */}
            <div className="card-glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                    <LayoutGrid className="w-4 h-4 text-vinotinto-claro" />
                    <h3 className="font-semibold text-secundario text-sm">Diseños disponibles para el público</h3>
                </div>
                <p className="text-xs t-muted mb-4">
                    Elige qué formatos puede usar el visitante en la sección de Integrantes. Esta configuración se guarda en Supabase.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {VISTAS_INTEGRANTES_INFO.map(v => {
                        const activa = vistasIntegrantes[v.clave];
                        return (
                            <button
                                key={v.clave}
                                onClick={() => toggleVistaIntegrante(v.clave)}
                                className={`flex items-center gap-3 rounded-xl p-3 border transition-all text-left ${
                                    activa
                                        ? 'bg-vinotinto/5 dark:bg-khaki/5 border-vinotinto/30 dark:border-khaki/30'
                                        : 'bg-sutil border-borde-subtle opacity-60'
                                }`}
                            >
                                <span className={`${activa ? 'text-vinotinto dark:text-khaki' : 't-muted'}`}>{v.icono}</span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium text-secundario">{v.etiqueta}</span>
                                    <span className="block text-[11px] t-muted truncate">{v.descripcion}</span>
                                </span>
                                <span
                                    className={`toggle-switch ${activa ? 'bg-vinotinto' : 'bg-sutil-hover'}`}
                                    role="switch"
                                    aria-checked={activa}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${activa ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </span>
                            </button>
                        );
                    })}
                </div>
                {!Object.values(vistasIntegrantes).some(v => v) && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                        ⚠️ Todas los diseños están apagados. En el sitio público se mostrará la cuadrícula por seguridad.
                    </p>
                )}
            </div>

            {/* Lista de integrantes */}
            {estadoIntegrantes === 'error' && integrantes.length === 0 ? (
                <div className="card-glass rounded-xl p-8 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 t-muted" />
                    <p className="t-muted text-sm">No se pudieron cargar los integrantes (¿creaste la tabla en Supabase?).</p>
                </div>
            ) : integrantes.length === 0 ? (
                <div className="card-glass rounded-xl p-8 text-center">
                    <Users className="w-8 h-8 mx-auto mb-3 t-muted" />
                    <p className="t-muted text-sm">Aún no hay integrantes. Presiona "Añadir" para registrar el primero.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {integrantesPaginados.map((i, indice) => (
                        <div key={i.id} className="card-glass rounded-xl p-4 flex items-center gap-3">
                            <img src={i.foto} alt={i.nombre}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                className="w-10 h-10 rounded-full object-cover bg-fondo-medio flex-shrink-0" />
                            <div className="flex flex-col items-start">
                                <div className="flex gap-1">
                                    <button onClick={() => mover(i.id, -1)} disabled={indice === 0}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-sutil hover:bg-sutil-hover t-muted disabled:opacity-30 transition-all"
                                        title="Subir">
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => mover(i.id, 1)} disabled={indice === integrantesPaginados.length - 1}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-sutil hover:bg-sutil-hover t-muted disabled:opacity-30 transition-all"
                                        title="Bajar">
                                        <ArrowDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-secundario text-sm">{i.nombre}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs ${COLORES_CUERDA[i.cuerda]}`}>{i.cuerda}</span>
                                    {i.esDirectivo && <span className="text-xs text-khaki">· {i.cargo}</span>}
                                    {i.anioIngreso !== undefined && <span className="text-[11px] t-muted-low">· Desde {i.anioIngreso}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => abrirEditar(i)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => eliminarIntegrante(i.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <PaginadorRegistros
                        pagina={paginaIntegrantesClamp}
                        totalPaginas={totalPaginasIntegrantes}
                        alCambiar={setPaginaIntegrantes}
                    />
                </div>
            )}

            {/* Formulario modal */}
            {createPortal(<AnimatePresence>
                {mostrarFormulario && (
                    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarFormulario(false)}>
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-modal w-full max-w-md p-6 z-10 space-y-4 max-h-[90dvh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-secundario">{editando ? 'Editar' : 'Añadir'} Integrante</h3>
                                <button onClick={() => setMostrarFormulario(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><label className="label-campo">Nombre *</label><input className="input-campo" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" /></div>
                                <div><label className="label-campo">Cuerda</label><select className="input-campo" value={form.cuerda} onChange={e => setForm(p => ({ ...p, cuerda: e.target.value as Integrante['cuerda'] }))}>
                                    {CUERDAS_INTEGRANTE.map(c => <option key={c}>{c}</option>)}
                                </select></div>
                                <div><label className="label-campo">Rango Vocal</label><input className="input-campo" value={form.rangoVocal} onChange={e => setForm(p => ({ ...p, rangoVocal: e.target.value }))} placeholder="C4 - G5" /></div>
                                <div className="col-span-2"><label className="label-campo">Foto</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => (document.getElementById('input-foto-integrante') as HTMLInputElement)?.click()}
                                            className="btn-ghost text-sm px-3 py-2 flex-shrink-0">
                                            {subiendoFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Subir foto
                                        </button>
                                        <input className="input-campo flex-1" value={form.foto} onChange={e => setForm(p => ({ ...p, foto: e.target.value }))} placeholder="o pega una URL https://..." />
                                        <input
                                            id="input-foto-integrante"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => { subirFoto(e.target.files?.[0] ?? null); e.target.value = ''; }}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2"><label className="label-campo">Biografía</label><textarea rows={3} className="input-campo resize-none" value={form.biografia} onChange={e => setForm(p => ({ ...p, biografia: e.target.value }))} placeholder="Mini-biografía..." /></div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <input type="checkbox" id="esDirectivo" checked={form.esDirectivo} onChange={e => setForm(p => ({ ...p, esDirectivo: e.target.checked }))} className="cursor-pointer" />
                                    <label htmlFor="esDirectivo" className="text-sm t-muted-high cursor-pointer">Es miembro directivo</label>
                                </div>
                                {form.esDirectivo && <div className="col-span-2"><label className="label-campo">Cargo</label><input className="input-campo" value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Ej: Presidenta" /></div>}
                                <div><label className="label-campo">Año de ingreso</label><input type="number" min={1900} max={2100} className="input-campo" value={form.anioIngreso} onChange={e => setForm(p => ({ ...p, anioIngreso: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="2019" /></div>
                                <div><label className="label-campo">Instagram</label><input className="input-campo" value={form.urlInstagram} onChange={e => setForm(p => ({ ...p, urlInstagram: e.target.value }))} placeholder="https://instagram.com/..." /></div>
                            </div>
                            <button onClick={guardar} className="btn-primario w-full justify-center">
                                <Check className="w-4 h-4" /> {editando ? 'Guardar Cambios' : 'Añadir Integrante'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}

            {/* Aviso flotante (subida de foto / errores) */}
            <AvisoTemporal
                visibilidad={!!aviso}
                mensaje={aviso?.mensaje ?? ''}
                duracionMs={4000}
            />
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
    const [paginaEventos, setPaginaEventos] = useState(1);

    const totalPaginasEventos = Math.max(1, Math.ceil(eventos.length / REGISTROS_POR_PAGINA));
    const paginaEventosClamp = Math.min(paginaEventos, totalPaginasEventos);
    const eventosPaginados = eventos.slice(
        (paginaEventosClamp - 1) * REGISTROS_POR_PAGINA,
        paginaEventosClamp * REGISTROS_POR_PAGINA
    );

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
                    <p className="t-muted text-sm">{eventos.length} eventos</p>
                </div>
                <button onClick={() => setMostrarForm(true)} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Nuevo Evento
                </button>
            </div>

            <div className="space-y-3">
                {eventosPaginados.map(e => (
                    <div key={e.id} className="card-glass rounded-xl p-4 flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-secundario text-sm">{e.titulo}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${e.activo ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-sutil-hover t-muted-low'}`}>
                                    {e.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <p className="text-xs t-muted">{new Date(e.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {e.lugar}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => editarEvento(e.id, { activo: !e.activo })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all">
                                {e.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => eliminarEvento(e.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                <PaginadorRegistros
                    pagina={paginaEventosClamp}
                    totalPaginas={totalPaginasEventos}
                    alCambiar={setPaginaEventos}
                />
            </div>

            {createPortal(<AnimatePresence>
                {mostrarForm && (
                    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarForm(false)}>
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-modal w-full max-w-md p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto sin-scrollbar" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
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
            </AnimatePresence>, document.body)}
        </div>
    );
};

// ============================================================
// MÓDULO: Pistas de Audio (Reproductor Musical)
// ============================================================
const ModuloAudio = () => {
    const { pistasAudio, agregarPista, editarPista, eliminarPista } = useApp();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState<PistaAudio | null>(null);
    const [form, setForm] = useState({
        titulo: '',
        compositor: '',
        duracion: '',
        urlAudio: '',
        portada: '',
    });
    const [archivoAudio, setArchivoAudio] = useState<File | null>(null);
    const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [errorSubida, setErrorSubida] = useState<string | null>(null);
    const [pistaEnPreescucha, setPistaEnPreescucha] = useState<string | null>(null);
    const [audioPreescucha] = useState<HTMLAudioElement>(() => new Audio());
    const [paginaAudio, setPaginaAudio] = useState(1);

    const totalPaginasAudio = Math.max(1, Math.ceil(pistasAudio.length / REGISTROS_POR_PAGINA));
    const paginaAudioClamp = Math.min(paginaAudio, totalPaginasAudio);
    const pistasAudioPaginadas = pistasAudio.slice(
        (paginaAudioClamp - 1) * REGISTROS_POR_PAGINA,
        paginaAudioClamp * REGISTROS_POR_PAGINA
    );

    const togglePreescucha = (url: string, id: string) => {
        if (pistaEnPreescucha === id) {
            audioPreescucha.pause();
            setPistaEnPreescucha(null);
        } else {
            audioPreescucha.src = url;
            audioPreescucha.play().catch(() => {});
            setPistaEnPreescucha(id);
            audioPreescucha.onended = () => setPistaEnPreescucha(null);
        }
    };

    const abrirCrear = () => {
        setEditando(null);
        setForm({ titulo: '', compositor: 'DaCapo Grupo Vocal', duracion: '3:00', urlAudio: '', portada: '' });
        setArchivoAudio(null);
        setArchivoPortada(null);
        setErrorSubida(null);
        setMostrarFormulario(true);
    };

    const abrirEditar = (p: PistaAudio) => {
        setEditando(p);
        setForm({
            titulo: p.titulo,
            compositor: p.compositor,
            duracion: p.duracion,
            urlAudio: p.urlAudio,
            portada: p.portada || '',
        });
        setArchivoAudio(null);
        setArchivoPortada(null);
        setErrorSubida(null);
        setMostrarFormulario(true);
    };

    const manejarArchivoAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchivoAudio(file);

        // Si el título está vacío, sugerir el nombre del archivo limpio
        if (!form.titulo || form.titulo.trim() === '') {
            const nombreLimpio = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
            setForm(p => ({ ...p, titulo: nombreLimpio }));
        }

        // Auto-detectar duración del archivo .mp3
        try {
            const objectUrl = URL.createObjectURL(file);
            const tempAudio = new Audio(objectUrl);
            tempAudio.addEventListener('loadedmetadata', () => {
                if (tempAudio.duration && !isNaN(tempAudio.duration)) {
                    const totalSeg = Math.floor(tempAudio.duration);
                    const min = Math.floor(totalSeg / 60);
                    const seg = totalSeg % 60;
                    setForm(p => ({ ...p, duracion: `${min}:${seg < 10 ? '0' : ''}${seg}` }));
                }
                URL.revokeObjectURL(objectUrl);
            });
        } catch {
            // Si falla la detección automática se puede ingresar manualmente
        }
    };

    const manejarArchivoPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setArchivoPortada(file);
    };

    const guardar = async () => {
        if (!form.titulo.trim()) {
            setErrorSubida('Por favor ingresa un título para la pista.');
            return;
        }

        let urlFinalAudio = form.urlAudio.trim();
        let urlFinalPortada = form.portada.trim();

        if (!archivoAudio && !urlFinalAudio) {
            setErrorSubida('Debes seleccionar un archivo .mp3 o proporcionar una URL de audio.');
            return;
        }

        setSubiendo(true);
        setErrorSubida(null);

        try {
            // Subir archivo de audio si se seleccionó uno
            if (archivoAudio) {
                if (supabase) {
                    const url = await subirAudioSupabase(archivoAudio);
                    if (!url) {
                        throw new Error('No se pudo subir el archivo .mp3 a Supabase. Verifica que el bucket "audio" esté creado en Storage y sea público.');
                    }
                    urlFinalAudio = url;
                } else {
                    // Fallback para pruebas si Supabase no está conectado
                    urlFinalAudio = URL.createObjectURL(archivoAudio);
                }
            }

            // Subir portada si se seleccionó una
            if (archivoPortada) {
                if (supabase) {
                    const url = await subirPortadaAudioSupabase(archivoPortada);
                    if (url) urlFinalPortada = url;
                } else {
                    urlFinalPortada = URL.createObjectURL(archivoPortada);
                }
            }

            const datosPista = {
                titulo: form.titulo.trim(),
                compositor: form.compositor.trim() || 'DaCapo Grupo Vocal',
                duracion: form.duracion.trim() || '3:30',
                urlAudio: urlFinalAudio,
                portada: urlFinalPortada || undefined,
            };

            if (editando) {
                editarPista(editando.id, datosPista);
            } else {
                agregarPista(datosPista);
            }

            setMostrarFormulario(false);
        } catch (err: any) {
            console.error('Error al guardar pista:', err);
            setErrorSubida(err.message || 'Error inesperado al guardar la pista.');
        } finally {
            setSubiendo(false);
        }
    };

    const handleEliminar = (id: string, titulo: string) => {
        if (window.confirm(`¿Deseas eliminar la pista "${titulo}"?`)) {
            if (pistaEnPreescucha === id) {
                audioPreescucha.pause();
                setPistaEnPreescucha(null);
            }
            eliminarPista(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">
                        Pistas de Audio (Reproductor)
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <p className="t-muted text-sm">{pistasAudio.length} pistas en la lista de reproducción</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            supabase 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        }`}>
                            {supabase ? '● Supabase Conectado' : '○ Modo Local (Fase 1)'}
                        </span>
                    </div>
                </div>
                <button onClick={abrirCrear} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Añadir Pista
                </button>
            </div>

            {/* Lista de pistas */}
            <div className="space-y-2">
                {pistasAudio.length === 0 ? (
                    <div className="card-glass rounded-xl p-12 text-center t-muted">
                        <Disc className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No hay pistas en el reproductor.</p>
                        <p className="text-xs mt-1">Haz clic en "Añadir Pista" para subir tu primer archivo .mp3</p>
                    </div>
                ) : (
                    pistasAudioPaginadas.map(p => {
                        const estaSonando = pistaEnPreescucha === p.id;
                        const esSupabase = p.urlAudio.includes('supabase.co');

                        return (
                            <div key={p.id} className="card-glass rounded-xl p-4 flex items-center gap-4 hover:border-vinotinto/30 dark:hover:border-khaki/30 transition-all">
                                {/* Botón de preescucha rápida */}
                                <button
                                    onClick={() => togglePreescucha(p.urlAudio, p.id)}
                                    title={estaSonando ? 'Pausar' : 'Preescuchar'}
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                        estaSonando
                                            ? 'bg-khaki text-primario shadow-glow-khaki'
                                            : 'bg-fondo-medio text-secundario hover:bg-vinotinto hover:text-white'
                                    }`}
                                >
                                    {estaSonando ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                </button>

                                {/* Portada miniatura */}
                                {p.portada ? (
                                    <img
                                        src={p.portada}
                                        alt={p.titulo}
                                        className="w-11 h-11 rounded-lg object-cover bg-fondo-medio flex-shrink-0 border border-black/10 dark:border-white/5"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-lg bg-fondo-medio flex items-center justify-center flex-shrink-0 t-muted">
                                        <Music className="w-5 h-5 opacity-40" />
                                    </div>
                                )}

                                {/* Datos de la pista */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-secundario text-sm truncate">{p.titulo}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                            esSupabase ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-black/5 dark:bg-white/5 t-muted'
                                        }`}>
                                            {esSupabase ? 'Supabase' : 'Externo'}
                                        </span>
                                    </div>
                                    <p className="text-xs t-muted truncate mt-0.5">
                                        {p.compositor} <span className="opacity-40">·</span> <span className="font-mono">{p.duracion}</span>
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => abrirEditar(p)}
                                        title="Editar"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
<button
                                        onClick={() => handleEliminar(p.id, p.titulo)}
                                        title="Eliminar"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                <PaginadorRegistros
                    pagina={paginaAudioClamp}
                    totalPaginas={totalPaginasAudio}
                    alCambiar={setPaginaAudio}
                />
            </div>

            {/* Formulario modal */}
            {createPortal(<AnimatePresence>
                {mostrarFormulario && (
                    <motion.div
                        className="fixed inset-0 z-[70] flex overflow-y-auto p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !subiendo && setMostrarFormulario(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />

                        <motion.div
                            className="relative card-modal w-full max-w-lg p-6 z-10 space-y-4 m-auto max-h-[calc(100vh-2rem)] overflow-y-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Encabezado modal */}
                            <div className="flex items-center justify-between border-b borde-subtle pb-3">
                                <h3 className="font-display font-bold text-lg text-secundario">
                                    {editando ? 'Editar Pista' : 'Añadir Nueva Pista'}
                                </h3>
                                <button
                                    onClick={() => !subiendo && setMostrarFormulario(false)}
                                    disabled={subiendo}
                                    className="btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Alerta de error si existe */}
                            {errorSubida && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{errorSubida}</span>
                                </div>
                            )}

                            {/* Campos del formulario */}
                            <div className="space-y-3">
                                {/* Título */}
                                <div>
                                    <label className="label-campo">Título de la Obra *</label>
                                    <input
                                        className="input-campo"
                                        value={form.titulo}
                                        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                                        placeholder="Ej: Ave Verum Corpus"
                                        disabled={subiendo}
                                    />
                                </div>

                                {/* Compositor y Duración */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label-campo">Compositor / Arreglista</label>
                                        <input
                                            className="input-campo"
                                            value={form.compositor}
                                            onChange={e => setForm(p => ({ ...p, compositor: e.target.value }))}
                                            placeholder="Ej: W. A. Mozart"
                                            disabled={subiendo}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-campo">Duración (mm:ss)</label>
                                        <input
                                            className="input-campo"
                                            value={form.duracion}
                                            onChange={e => setForm(p => ({ ...p, duracion: e.target.value }))}
                                            placeholder="Ej: 3:24"
                                            disabled={subiendo}
                                        />
                                    </div>
                                </div>

                                {/* Archivo de Audio .mp3 */}
                                <div className="border border-vinotinto/20 dark:border-khaki/25 rounded-xl p-3.5 bg-vinotinto/5 dark:bg-khaki/5 space-y-2">
                                    <label className="label-campo flex items-center justify-between text-vinotinto dark:text-khaki">
                                        <span className="flex items-center gap-1.5 font-semibold">
                                            <Upload className="w-3.5 h-3.5" /> Archivo de Audio (.mp3)
                                        </span>
                                        <span className="text-[10px] opacity-75 font-normal">
                                            {supabase ? 'Se subirá a Supabase Storage' : 'Modo local activo'}
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="audio/mp3,audio/mpeg,.mp3"
                                        onChange={manejarArchivoAudio}
                                        disabled={subiendo}
                                        className="block w-full text-xs t-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-vinotinto/10 file:text-vinotinto hover:file:bg-vinotinto/20 dark:file:bg-khaki/20 dark:file:text-khaki dark:hover:file:bg-khaki/30 cursor-pointer"
                                    />
                                    {archivoAudio && (
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                                            ✓ Seleccionado: {archivoAudio.name} ({(archivoAudio.size / (1024 * 1024)).toFixed(2)} MB)
                                        </p>
                                    )}

                                    {/* Alternativa: URL directa */}
                                    <div className="pt-2 border-t border-vinotinto/10 dark:border-khaki/10">
                                        <label className="text-[11px] t-muted block mb-1">
                                            O pega una URL directa de audio (opcional si ya seleccionaste archivo):
                                        </label>
                                        <input
                                            className="input-campo text-xs py-1.5"
                                            value={form.urlAudio}
                                            onChange={e => setForm(p => ({ ...p, urlAudio: e.target.value }))}
                                            placeholder="https://..."
                                            disabled={subiendo}
                                        />
                                    </div>
                                </div>

                                {/* Portada (Opcional) */}
                                <div>
                                    <label className="label-campo">Imagen de Portada (Opcional)</label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
                                        onChange={manejarArchivoPortada}
                                        disabled={subiendo}
                                        className="block w-full text-xs t-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sutil file:text-secundario hover:file:bg-sutil-hover cursor-pointer"
                                    />
                                    {archivoPortada && (
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                                            ✓ Portada: {archivoPortada.name}
                                        </p>
                                    )}
                                    <input
                                        className="input-campo text-xs mt-1.5"
                                        value={form.portada}
                                        onChange={e => setForm(p => ({ ...p, portada: e.target.value }))}
                                        placeholder="O pega una URL de imagen: https://..."
                                        disabled={subiendo}
                                    />
                                </div>
                            </div>

                            {/* Botón de guardado */}
                            <button
                                onClick={guardar}
                                disabled={subiendo}
                                className="btn-primario w-full justify-center py-2.5 mt-2"
                            >
                                {subiendo ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Subiendo a Storage...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> {editando ? 'Guardar Cambios' : 'Añadir Pista'}
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </div>
    );
};

// ============================================================
// MÓDULO: Media & Galería (Presentaciones)
// ============================================================
type SubModuloMedia = 'videos' | 'fotos';

type FormVideoMedia = {
    titulo: string;
    descripcion: string;
    urlYoutube: string;
    categoria: string;
    destacado: boolean;
    duracion: string;
    orden: number;
    activo: boolean;
};

type FormFotoGaleria = {
    titulo: string;
    src: string;
    categoria: string;
    enlaceTexto: string;
    enlaceUrl: string;
    orden: number;
    activo: boolean;
};

const ModuloMedia = () => {
    const { videosMedia, agregarVideoMedia, editarVideoMedia, eliminarVideoMedia, fotosGaleria, agregarFotoGaleria, editarFotoGaleria, eliminarFotoGaleria } = useApp();

    const [subModulo, setSubModulo] = useState<SubModuloMedia>('videos');

    // --- Estado de Videos ---
    const [paginaVideos, setPaginaVideos] = useState(1);
    const [mostrarFormVideo, setMostrarFormVideo] = useState(false);
    const [editandoVideo, setEditandoVideo] = useState<VideoMedia | null>(null);
    const [formVideo, setFormVideo] = useState<FormVideoMedia>({ titulo: '', descripcion: '', urlYoutube: '', categoria: CATEGORIAS_VIDEO[0], destacado: false, duracion: '', orden: 0, activo: true });

    // --- Estado de Fotos ---
    const [paginaFotos, setPaginaFotos] = useState(1);
    const [mostrarFormFoto, setMostrarFormFoto] = useState(false);
    const [editandoFoto, setEditandoFoto] = useState<FotoGaleria | null>(null);
    const [formFoto, setFormFoto] = useState<FormFotoGaleria>({ titulo: '', src: '', categoria: CATEGORIAS_FOTO[0], enlaceTexto: '', enlaceUrl: '', orden: 0, activo: true });

    // --- Utilidad para extraer el ID de un video de YouTube ---
    const extraerYoutubeId = (url: string): string => {
        const limpia = url.trim();
        if (!limpia) return '';
        const patrones = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
            /^([\w-]{11})$/,
        ];
        for (const patron of patrones) {
            const match = limpia.match(patron);
            if (match) return match[1];
        }
        return limpia;
    };

    // --- Paginación ---
    const totalPaginasVideos = Math.max(1, Math.ceil(videosMedia.length / REGISTROS_POR_PAGINA));
    const paginaVideosClamp = Math.min(paginaVideos, totalPaginasVideos);
    const videosPaginados = videosMedia.slice(
        (paginaVideosClamp - 1) * REGISTROS_POR_PAGINA,
        paginaVideosClamp * REGISTROS_POR_PAGINA
    );

    const totalPaginasFotos = Math.max(1, Math.ceil(fotosGaleria.length / REGISTROS_POR_PAGINA));
    const paginaFotosClamp = Math.min(paginaFotos, totalPaginasFotos);
    const fotosPaginadas = fotosGaleria.slice(
        (paginaFotosClamp - 1) * REGISTROS_POR_PAGINA,
        paginaFotosClamp * REGISTROS_POR_PAGINA
    );

    const guardarVideo = () => {
        const youtubeId = extraerYoutubeId(formVideo.urlYoutube);
        if (!formVideo.titulo.trim() || !youtubeId) return;
        const datos = {
            titulo: formVideo.titulo.trim(),
            descripcion: formVideo.descripcion.trim(),
            tipoOrigen: 'youtube' as const,
            youtubeId,
            urlVideo: formVideo.urlYoutube.trim(),
            categoria: formVideo.categoria,
            destacado: formVideo.destacado,
            duracion: formVideo.duracion.trim(),
            orden: formVideo.orden,
            activo: formVideo.activo,
        };
        if (editandoVideo) {
            editarVideoMedia(editandoVideo.id, datos);
        } else {
            agregarVideoMedia(datos);
        }
        setMostrarFormVideo(false);
        setEditandoVideo(null);
        setFormVideo({ titulo: '', descripcion: '', urlYoutube: '', categoria: CATEGORIAS_VIDEO[0], destacado: false, duracion: '', orden: 0, activo: true });
    };

    const abrirEditarVideo = (v: VideoMedia) => {
        setEditandoVideo(v);
        setFormVideo({ titulo: v.titulo, descripcion: v.descripcion, urlYoutube: v.youtubeId, categoria: v.categoria, destacado: v.destacado, duracion: v.duracion, orden: v.orden, activo: v.activo });
        setMostrarFormVideo(true);
    };

    const guardarFoto = () => {
        if (!formFoto.titulo.trim() || !formFoto.src.trim()) return;
        const datos = {
            titulo: formFoto.titulo.trim(),
            urlFoto: formFoto.src.trim(),
            categoria: formFoto.categoria,
            enlaceTexto: formFoto.enlaceTexto.trim(),
            enlaceUrl: formFoto.enlaceUrl.trim(),
            orden: formFoto.orden,
            activo: formFoto.activo,
        };
        if (editandoFoto) {
            editarFotoGaleria(editandoFoto.id, datos);
        } else {
            agregarFotoGaleria(datos);
        }
        setMostrarFormFoto(false);
        setEditandoFoto(null);
        setFormFoto({ titulo: '', src: '', categoria: CATEGORIAS_FOTO[0], enlaceTexto: '', enlaceUrl: '', orden: 0, activo: true });
    };

    const abrirEditarFoto = (f: FotoGaleria) => {
        setEditandoFoto(f);
        setFormFoto({ titulo: f.titulo, src: f.urlFoto, categoria: f.categoria, enlaceTexto: f.enlaceTexto || '', enlaceUrl: f.enlaceUrl || '', orden: f.orden, activo: f.activo });
        setMostrarFormFoto(true);
    };

    const TabBotones = [
        { id: 'videos' as const, etiqueta: 'Videos', cuenta: videosMedia.length },
        { id: 'fotos' as const, etiqueta: 'Galería de Fotos', cuenta: fotosGaleria.length },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">Media & Galería</h2>
                    <p className="t-muted text-sm">Administra los videos de YouTube y las fotos de la sección Presentaciones.</p>
                </div>
            </div>

            {/* Pestañas: Videos / Fotos */}
            <div className="flex flex-wrap gap-2">
                {TabBotones.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubModulo(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                            subModulo === tab.id
                                ? 'bg-vinotinto text-white border-vinotinto shadow-glow-vinotinto'
                                : 'bg-sutil hover:bg-sutil-hover text-secundario border-transparent'
                        }`}
                    >
                        {tab.id === 'videos' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                        {tab.etiqueta}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${subModulo === tab.id ? 'bg-white/20' : 'bg-sutil-hover'}`}>
                            {tab.cuenta}
                        </span>
                    </button>
                ))}
            </div>

            {/* ---- PESTAÑA: VIDEOS ---- */}
            {subModulo === 'videos' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-secundario">Videos de YouTube</h3>
                        <button onClick={() => { setEditandoVideo(null); setFormVideo({ titulo: '', descripcion: '', urlYoutube: '', categoria: CATEGORIAS_VIDEO[0], destacado: false, duracion: '', orden: 0, activo: true }); setMostrarFormVideo(true); }} className="btn-primario text-sm py-2 px-4">
                            <Plus className="w-4 h-4" /> Añadir Video
                        </button>
                    </div>

                    {videosMedia.length === 0 ? (
                        <div className="card-glass rounded-xl p-12 text-center t-muted">
                            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aún no hay videos registrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {videosPaginados.map(v => (
                                <div key={v.id} className={`card-glass rounded-xl p-4 flex items-center gap-4 transition-all ${v.activo ? '' : 'opacity-60'}`}>
                                    {/* Miniatura */}
                                    <img
                                        src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                                        alt={v.titulo}
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        className="w-24 h-14 rounded-lg object-cover bg-fondo-medio flex-shrink-0 border border-black/10 dark:border-white/5"
                                    />
                                    {/* Datos */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-secundario text-sm truncate">{v.titulo}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sutil t-muted">{v.categoria}</span>
                                            {v.destacado && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                                    Destacado
                                                </span>
                                            )}
                                            {!v.activo && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                                    Oculta
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs t-muted truncate mt-0.5">{v.descripcion || `youtube.com/watch?v=${v.youtubeId}`}</p>
                                        <p className="text-[11px] t-muted mt-0.5">Duración: {v.duracion || '—'} · Orden: {v.orden}</p>
                                    </div>
                                    {/* Acciones */}
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => editarVideoMedia(v.id, { activo: !v.activo })}
                                            title={v.activo ? 'Ocultar de la web' : 'Mostrar en la web'}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all"
                                        >
                                            {v.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                        <button onClick={() => abrirEditarVideo(v)} title="Editar"
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => eliminarVideoMedia(v.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <PaginadorRegistros
                                pagina={paginaVideosClamp}
                                totalPaginas={totalPaginasVideos}
                                alCambiar={setPaginaVideos}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ---- PESTAÑA: FOTOS ---- */}
            {subModulo === 'fotos' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-secundario">Galería de Fotos</h3>
                        <button onClick={() => { setEditandoFoto(null); setFormFoto({ titulo: '', src: '', categoria: CATEGORIAS_FOTO[0], enlaceTexto: '', enlaceUrl: '', orden: 0, activo: true }); setMostrarFormFoto(true); }} className="btn-primario text-sm py-2 px-4">
                            <Plus className="w-4 h-4" /> Añadir Foto
                        </button>
                    </div>

                    {fotosGaleria.length === 0 ? (
                        <div className="card-glass rounded-xl p-12 text-center t-muted">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aún no hay fotos en la galería.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {fotosPaginadas.map(f => (
                                <div key={f.id} className={`card-glass rounded-xl overflow-hidden transition-all ${f.activo ? '' : 'opacity-60'}`}>
                                    <div className="aspect-video relative">
                                        <img src={f.urlFoto} alt={f.titulo} className="w-full h-full object-cover" />
                                        {!f.activo && (
                                            <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/80 text-white font-semibold">
                                                Oculta
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-secundario text-sm truncate">{f.titulo}</p>
                                        <p className="text-[11px] t-muted mt-0.5">{f.categoria} · Orden {f.orden}</p>
                                        <div className="flex gap-1.5 mt-2">
                                            <button
                                                onClick={() => editarFotoGaleria(f.id, { activo: !f.activo })}
                                                title={f.activo ? 'Ocultar de la web' : 'Mostrar en la web'}
                                                className="flex-1 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all"
                                            >
                                                {f.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                            <button onClick={() => abrirEditarFoto(f)} title="Editar"
                                                className="flex-1 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => eliminarFotoGaleria(f.id)}
                                                className="flex-1 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="col-span-full">
                                <PaginadorRegistros
                                    pagina={paginaFotosClamp}
                                    totalPaginas={totalPaginasFotos}
                                    alCambiar={setPaginaFotos}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ---- FORMULARIO: Video ---- */}
            {createPortal(<AnimatePresence>
                {mostrarFormVideo && (
                    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarFormVideo(false)}>
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-modal w-full max-w-md p-6 z-10 space-y-4 max-h-[90dvh] overflow-y-auto sin-scrollbar" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-secundario">{editandoVideo ? 'Editar' : 'Añadir'} Video</h3>
                                <button onClick={() => setMostrarFormVideo(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <div><label className="label-campo">Título *</label><input className="input-campo" value={formVideo.titulo} onChange={e => setFormVideo(p => ({ ...p, titulo: e.target.value }))} placeholder="Nombre del video" /></div>
                                <div><label className="label-campo">URL o ID de YouTube *</label><input className="input-campo" value={formVideo.urlYoutube} onChange={e => setFormVideo(p => ({ ...p, urlYoutube: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." /></div>
                                {extraerYoutubeId(formVideo.urlYoutube) && (
                                    <div className="rounded-lg overflow-hidden border borde-subtle">
                                        <img
                                            src={`https://img.youtube.com/vi/${extraerYoutubeId(formVideo.urlYoutube)}/mqdefault.jpg`}
                                            alt="Vista previa"
                                            className="w-full h-28 object-cover"
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <div><label className="label-campo">Descripción</label><textarea rows={2} className="input-campo resize-none" value={formVideo.descripcion} onChange={e => setFormVideo(p => ({ ...p, descripcion: e.target.value }))} placeholder="Lugar, fecha, evento..." /></div>
                                <div><label className="label-campo">Categoría</label>
                                    <select className="input-campo" value={formVideo.categoria} onChange={e => setFormVideo(p => ({ ...p, categoria: e.target.value }))}>
                                        {CATEGORIAS_VIDEO.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label-campo">Duración (ej: 4:35)</label><input className="input-campo" value={formVideo.duracion} onChange={e => setFormVideo(p => ({ ...p, duracion: e.target.value }))} placeholder="4:35" /></div>
                                    <div><label className="label-campo">Orden</label><input type="number" min={0} className="input-campo" value={formVideo.orden} onChange={e => setFormVideo(p => ({ ...p, orden: Number(e.target.value) || 0 }))} /></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="videoDestacado" checked={formVideo.destacado} onChange={e => setFormVideo(p => ({ ...p, destacado: e.target.checked }))} className="cursor-pointer" />
                                    <label htmlFor="videoDestacado" className="text-sm t-muted-high">Destacado en la web</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="videoVisible" checked={formVideo.activo} onChange={e => setFormVideo(p => ({ ...p, activo: e.target.checked }))} className="cursor-pointer" />
                                    <label htmlFor="videoVisible" className="text-sm t-muted-high">Visible en la web</label>
                                </div>
                            </div>
                            <button onClick={guardarVideo} className="btn-primario w-full justify-center">
                                <Check className="w-4 h-4" /> {editandoVideo ? 'Guardar Cambios' : 'Añadir Video'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}

            {/* ---- FORMULARIO: Foto ---- */}
            {createPortal(<AnimatePresence>
                {mostrarFormFoto && (
                    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarFormFoto(false)}>
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />
                        <motion.div className="relative card-modal w-full max-w-md p-6 z-10 space-y-4 max-h-[90dvh] overflow-y-auto sin-scrollbar" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-secundario">{editandoFoto ? 'Editar' : 'Añadir'} Foto</h3>
                                <button onClick={() => setMostrarFormFoto(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <div><label className="label-campo">Título *</label><input className="input-campo" value={formFoto.titulo} onChange={e => setFormFoto(p => ({ ...p, titulo: e.target.value }))} placeholder="Descripción breve de la foto" /></div>
                                <div><label className="label-campo">URL de la imagen *</label><input className="input-campo" value={formFoto.src} onChange={e => setFormFoto(p => ({ ...p, src: e.target.value }))} placeholder="https://..." /></div>
                                {formFoto.src && (
                                    <div className="rounded-lg overflow-hidden border borde-subtle">
                                        <img src={formFoto.src} alt="Vista previa" className="w-full h-28 object-cover" />
                                    </div>
                                )}
                                <div><label className="label-campo">Categoría</label>
                                    <select className="input-campo" value={formFoto.categoria} onChange={e => setFormFoto(p => ({ ...p, categoria: e.target.value }))}>
                                        {CATEGORIAS_FOTO.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div><label className="label-campo">Texto del enlace (opcional)</label><input className="input-campo" value={formFoto.enlaceTexto} onChange={e => setFormFoto(p => ({ ...p, enlaceTexto: e.target.value }))} placeholder="Ver reseña del concierto" /></div>
                                <div><label className="label-campo">URL de enlace (opcional)</label><input className="input-campo" value={formFoto.enlaceUrl} onChange={e => setFormFoto(p => ({ ...p, enlaceUrl: e.target.value }))} placeholder="https://..." /></div>
                                <div><label className="label-campo">Orden</label><input type="number" min={0} className="input-campo" value={formFoto.orden} onChange={e => setFormFoto(p => ({ ...p, orden: Number(e.target.value) || 0 }))} /></div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="fotoVisible" checked={formFoto.activo} onChange={e => setFormFoto(p => ({ ...p, activo: e.target.checked }))} className="cursor-pointer" />
                                    <label htmlFor="fotoVisible" className="text-sm t-muted-high">Visible en la web</label>
                                </div>
                            </div>
                            <button onClick={guardarFoto} className="btn-primario w-full justify-center">
                                <Check className="w-4 h-4" /> {editandoFoto ? 'Guardar Cambios' : 'Añadir Foto'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </div>
    );
};

// ============================================================
// MÓDULO: Partituras (Biblioteca de Partituras - Módulo 3)
// ============================================================
type FormPartitura = {
    titulo: string;
    compositor: string;
    arreglista: string;
    cuerdas: string[];
    dificultad: string;
    estilo: string;
    epoca: string;
    tonalidad: string;
    compas: string;
    paginas: string;
    descripcion: string;
    urlPdf: string;
    urlPortada: string;
    descargable: boolean;
    activo: boolean;
};

const formVacio: FormPartitura = {
    titulo: '',
    compositor: '',
    arreglista: '',
    cuerdas: [...CUERDAS_PARTITURA],
    dificultad: 'Básico',
    estilo: ESTILOS_PARTITURA[0],
    epoca: EPOCAS_PARTITURA[0],
    tonalidad: '',
    compas: '',
    paginas: '',
    descripcion: '',
    urlPdf: '',
    urlPortada: '',
    descargable: false,
    activo: true,
};

const VISTAS_BIBLIOTECA_INFO: { clave: keyof VistasBiblioteca; etiqueta: string; icono: JSX.Element; descripcion: string }[] = [
    { clave: 'grid', etiqueta: 'Cuadrícula', icono: <LayoutGrid className="w-4 h-4" />, descripcion: 'Tarjetas en columnas' },
    { clave: 'lista', etiqueta: 'Lista', icono: <List className="w-4 h-4" />, descripcion: 'Filas compactas' },
    { clave: 'shelf', etiqueta: 'Estantería', icono: <Rows2 className="w-4 h-4" />, descripcion: 'Carrusel horizontal' },
    { clave: 'mosaico', etiqueta: 'Mosaico', icono: <Grid3x3 className="w-4 h-4" />, descripcion: 'Tarjetas de altura variable' },
];

const ModuloPartituras = () => {
    const { partituras, agregarPartitura, editarPartitura, eliminarPartitura, vistasBiblioteca, toggleVistaBiblioteca } = useApp();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState<Partitura | null>(null);
    const [form, setForm] = useState<FormPartitura>(formVacio);
    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
    const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [errorSubida, setErrorSubida] = useState<string | null>(null);
    const [paginaPartituras, setPaginaPartituras] = useState(1);

    const totalPaginasPartituras = Math.max(1, Math.ceil(partituras.length / REGISTROS_POR_PAGINA));
    const paginaPartiturasClamp = Math.min(paginaPartituras, totalPaginasPartituras);
    const partiturasPaginadas = partituras.slice(
        (paginaPartiturasClamp - 1) * REGISTROS_POR_PAGINA,
        paginaPartiturasClamp * REGISTROS_POR_PAGINA
    );

    const abrirCrear = () => {
        setEditando(null);
        setForm(formVacio);
        setArchivoPdf(null);
        setArchivoPortada(null);
        setErrorSubida(null);
        setMostrarFormulario(true);
    };

    const abrirEditar = (p: Partitura) => {
        setEditando(p);
        setForm({
            titulo: p.titulo,
            compositor: p.compositor,
            arreglista: p.arreglista || '',
            cuerdas: p.cuerdas || [],
            dificultad: p.dificultad || 'Básico',
            estilo: p.estilo || ESTILOS_PARTITURA[0],
            epoca: p.epoca || EPOCAS_PARTITURA[0],
            tonalidad: p.tonalidad || '',
            compas: p.compas || '',
            paginas: p.paginas ? String(p.paginas) : '',
            descripcion: p.descripcion || '',
            urlPdf: p.urlPdf || '',
            urlPortada: p.urlPortada || '',
            descargable: !!p.descargable,
            activo: p.activo !== false,
        });
        setArchivoPdf(null);
        setArchivoPortada(null);
        setErrorSubida(null);
        setMostrarFormulario(true);
    };

    const toggleCuerda = (cuerda: string) => {
        setForm(prev => ({
            ...prev,
            cuerdas: prev.cuerdas.includes(cuerda)
                ? prev.cuerdas.filter(c => c !== cuerda)
                : [...prev.cuerdas, cuerda],
        }));
    };

    const manejarArchivoPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchivoPdf(file);
        if (!form.titulo || form.titulo.trim() === '') {
            const nombreLimpio = file.name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ');
            setForm(p => ({ ...p, titulo: nombreLimpio }));
        }
    };

    const manejarArchivoPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setArchivoPortada(file);
    };

    const guardar = async () => {
        if (!form.titulo.trim() || !form.compositor.trim()) {
            setErrorSubida('El título y el compositor son obligatorios.');
            return;
        }
        if (form.cuerdas.length === 0) {
            setErrorSubida('Selecciona al menos una cuerda que canta la obra.');
            return;
        }
        if (!archivoPdf && !form.urlPdf.trim()) {
            setErrorSubida('Debes seleccionar un archivo PDF o proporcionar una URL.');
            return;
        }

        let urlFinalPdf = form.urlPdf.trim();
        let urlFinalPortada = form.urlPortada.trim();

        setSubiendo(true);
        setErrorSubida(null);

        try {
            if (archivoPdf) {
                if (supabase) {
                    const url = await subirPdfPartituraSupabase(archivoPdf);
                    if (!url) {
                        throw new Error('No se pudo subir el PDF a Supabase. Verifica que el bucket "partituras" esté creado en Storage y sea público.');
                    }
                    urlFinalPdf = url;
                } else {
                    urlFinalPdf = URL.createObjectURL(archivoPdf);
                }
            }

            if (archivoPortada) {
                if (supabase) {
                    const url = await subirPortadaPartituraSupabase(archivoPortada);
                    if (url) urlFinalPortada = url;
                } else {
                    urlFinalPortada = URL.createObjectURL(archivoPortada);
                }
            }

            const datosPartitura: Omit<Partitura, 'id' | 'fechaSubida'> = {
                titulo: form.titulo.trim(),
                compositor: form.compositor.trim(),
                arreglista: form.arreglista.trim() || undefined,
                cuerdas: form.cuerdas,
                dificultad: form.dificultad as Partitura['dificultad'],
                estilo: form.estilo,
                epoca: form.epoca,
                tonalidad: form.tonalidad.trim() || undefined,
                compas: form.compas.trim() || undefined,
                paginas: form.paginas && !isNaN(Number(form.paginas)) ? Number(form.paginas) : undefined,
                descripcion: form.descripcion.trim(),
                urlPdf: urlFinalPdf,
                urlPortada: urlFinalPortada || undefined,
                descargable: form.descargable,
                activo: form.activo,
            };

            if (editando) {
                editarPartitura(editando.id, datosPartitura);
            } else {
                agregarPartitura(datosPartitura);
            }

            setMostrarFormulario(false);
        } catch (err: any) {
            console.error('Error al guardar partitura:', err);
            setErrorSubida(err.message || 'Error inesperado al guardar la partitura.');
        } finally {
            setSubiendo(false);
        }
    };

    const handleEliminar = (p: Partitura) => {
        const mensaje = `¿Eliminar DEFINITIVAMENTE la partitura "${p.titulo}"?\n\nEsta acción borra la fila de la base de datos y el archivo del Storage (si aplica). No se puede deshacer.\n\nPara solo ocultarla de la web, usa el botón de ojo (Ocultar).`;
        if (window.confirm(mensaje)) {
            eliminarPartitura(p.id);
        }
    };

    const COLOR_DIFICULTAD: Record<string, string> = {
        'Básico': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
        'Intermedio': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25',
        'Avanzado': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25',
    };

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-secundario mb-1">
                        Partituras (Biblioteca)
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <p className="t-muted text-sm">{partituras.length} partituras en el catálogo</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            supabase
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        }`}>
                            {supabase ? '● Supabase Conectado' : '○ Modo Local (Fase 1)'}
                        </span>
                    </div>
                </div>
                <button onClick={abrirCrear} className="btn-primario text-sm py-2 px-4">
                    <Plus className="w-4 h-4" /> Añadir Partitura
                </button>
            </div>

            {/* Preferencias de la Biblioteca (vistas públicas) */}
            <div className="card-glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                    <LayoutGrid className="w-4 h-4 text-vinotinto-claro" />
                    <h3 className="font-semibold text-secundario text-sm">Vistas disponibles para el público</h3>
                </div>
                <p className="text-xs t-muted mb-4">
                    Elige qué formatos puede usar el visitante en la Biblioteca. Esta configuración se guarda en Supabase.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {VISTAS_BIBLIOTECA_INFO.map(v => {
                        const activa = vistasBiblioteca[v.clave];
                        return (
                            <button
                                key={v.clave}
                                onClick={() => toggleVistaBiblioteca(v.clave)}
                                className={`flex items-center gap-3 rounded-xl p-3 border transition-all text-left ${
                                    activa
                                        ? 'bg-vinotinto/5 dark:bg-khaki/5 border-vinotinto/30 dark:border-khaki/30'
                                        : 'bg-sutil border-borde-subtle opacity-60'
                                }`}
                            >
                                <span className={`${activa ? 'text-vinotinto dark:text-khaki' : 't-muted'}`}>{v.icono}</span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium text-secundario">{v.etiqueta}</span>
                                    <span className="block text-[11px] t-muted truncate">{v.descripcion}</span>
                                </span>
                                <span
                                    className={`toggle-switch ${activa ? 'bg-vinotinto' : 'bg-sutil-hover'}`}
                                    role="switch"
                                    aria-checked={activa}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${activa ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </span>
                            </button>
                        );
                    })}
                </div>
                {!Object.values(vistasBiblioteca).some(v => v) && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                        ⚠️ Todas las vistas están apagadas. En el sitio público se mostrará la cuadrícula por seguridad.
                    </p>
                )}
            </div>

            {/* Lista de partituras */}
            <div className="space-y-2">
                {partituras.length === 0 ? (
                    <div className="card-glass rounded-xl p-12 text-center t-muted">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No hay partituras en la biblioteca.</p>
                        <p className="text-xs mt-1">Haz clic en "Añadir Partitura" para subir tu primer PDF</p>
                    </div>
                ) : (
                    partiturasPaginadas.map(p => {
                        const esSupabase = p.urlPdf?.includes('supabase.co') || false;
                        return (
                            <div key={p.id} className={`card-glass rounded-xl p-4 flex items-center gap-4 transition-all ${
                                p.activo ? 'hover:border-vinotinto/30 dark:hover:border-khaki/30' : 'opacity-60'
                            }`}>
                                {/* Portada miniatura */}
                                {p.urlPortada ? (
                                    <img
                                        src={p.urlPortada}
                                        alt={p.titulo}
                                        className="w-12 h-14 rounded-lg object-cover bg-fondo-medio flex-shrink-0 border border-black/10 dark:border-white/5"
                                    />
                                ) : (
                                    <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-vinotinto/30 to-khaki/30 flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/10">
                                        <FileText className="w-5 h-5 opacity-60 text-secundario" />
                                    </div>
                                )}

                                {/* Datos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-secundario text-sm truncate">{p.titulo}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                            esSupabase ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-black/5 dark:bg-white/5 t-muted'
                                        }`}>
                                            {esSupabase ? 'Supabase' : 'Externo'}
                                        </span>
                                        {!p.activo && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                                Oculta
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs t-muted truncate mt-0.5">
                                        {p.compositor}{p.arreglista ? ` · Arr: ${p.arreglista}` : ''}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${COLOR_DIFICULTAD[p.dificultad] || 'bg-sutil t-muted'}`}>
                                            {p.dificultad}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sutil t-muted">{p.estilo}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sutil t-muted">
                                            {p.cuerdas.join(' · ')}
                                        </span>
                                        {p.paginas !== undefined && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sutil t-muted font-mono">
                                                {p.paginas} pág.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => editarPartitura(p.id, { descargable: !p.descargable })}
                                        title={p.descargable ? 'Descargable: ON' : 'Descargable: OFF'}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                            p.descargable
                                                ? 'bg-khaki text-primario shadow-glow-khaki'
                                                : 'bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario'
                                        }`}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => editarPartitura(p.id, { activo: !p.activo })}
                                        title={p.activo ? 'Ocultar de la web' : 'Mostrar en la web'}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all"
                                    >
                                        {p.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => abrirEditar(p)}
                                        title="Editar"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-sutil hover:bg-sutil-hover t-muted hover:text-secundario transition-all"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(p)}
                                        title="Eliminar definitivamente"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                <PaginadorRegistros
                    pagina={paginaPartiturasClamp}
                    totalPaginas={totalPaginasPartituras}
                    alCambiar={setPaginaPartituras}
                />
            </div>

            {/* Formulario modal */}
            {createPortal(<AnimatePresence>
                {mostrarFormulario && (
                    <motion.div
                        className="fixed inset-0 z-[70] flex overflow-y-auto p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !subiendo && setMostrarFormulario(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />

                        <motion.div
                            className="relative card-modal w-full max-w-2xl p-6 z-10 space-y-4 m-auto max-h-[calc(100vh-2rem)] overflow-y-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Encabezado modal */}
                            <div className="flex items-center justify-between border-b borde-subtle pb-3">
                                <h3 className="font-display font-bold text-lg text-secundario">
                                    {editando ? 'Editar Partitura' : 'Añadir Nueva Partitura'}
                                </h3>
                                <button
                                    onClick={() => !subiendo && setMostrarFormulario(false)}
                                    disabled={subiendo}
                                    className="btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Alerta de error */}
                            {errorSubida && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{errorSubida}</span>
                                </div>
                            )}

                            {/* Campos del formulario */}
                            <div className="space-y-3">
                                {/* Título y Compositor */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="label-campo">Título de la Obra *</label>
                                        <input
                                            className="input-campo"
                                            value={form.titulo}
                                            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                                            placeholder="Ej: Ave Verum Corpus"
                                            disabled={subiendo}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-campo">Compositor *</label>
                                        <input
                                            className="input-campo"
                                            value={form.compositor}
                                            onChange={e => setForm(p => ({ ...p, compositor: e.target.value }))}
                                            placeholder="Ej: W. A. Mozart"
                                            disabled={subiendo}
                                        />
                                    </div>
                                </div>

                                {/* Arreglista */}
                                <div>
                                    <label className="label-campo">Arreglista (Opcional)</label>
                                    <input
                                        className="input-campo"
                                        value={form.arreglista}
                                        onChange={e => setForm(p => ({ ...p, arreglista: e.target.value }))}
                                        placeholder="Ej: Carlos López"
                                        disabled={subiendo}
                                    />
                                </div>

                                {/* Cuerdas */}
                                <div>
                                    <label className="label-campo">Cuerdas que la cantan *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CUERDAS_PARTITURA.map(c => {
                                            const seleccionada = form.cuerdas.includes(c);
                                            return (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => toggleCuerda(c)}
                                                    disabled={subiendo}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                        seleccionada
                                                            ? 'bg-vinotinto/15 text-vinotinto dark:text-khaki border-vinotinto/40 dark:border-khaki/40'
                                                            : 'bg-sutil t-muted border-borde-subtle hover:border-vinotinto/40'
                                                    }`}
                                                >
                                                    {seleccionada ? '✓ ' : ''}{c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dificultad, Estilo, Época */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="label-campo">Dificultad</label>
                                        <select
                                            className="input-campo"
                                            value={form.dificultad}
                                            onChange={e => setForm(p => ({ ...p, dificultad: e.target.value }))}
                                            disabled={subiendo}
                                        >
                                            {DIFICULTADES_PARTITURA.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-campo">Estilo</label>
                                        <select
                                            className="input-campo"
                                            value={form.estilo}
                                            onChange={e => setForm(p => ({ ...p, estilo: e.target.value }))}
                                            disabled={subiendo}
                                        >
                                            {ESTILOS_PARTITURA.map(e => <option key={e}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-campo">Época</label>
                                        <select
                                            className="input-campo"
                                            value={form.epoca}
                                            onChange={e => setForm(p => ({ ...p, epoca: e.target.value }))}
                                            disabled={subiendo}
                                        >
                                            {EPOCAS_PARTITURA.map(ep => <option key={ep}>{ep}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Tonalidad, Compás, Páginas */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="label-campo">Tonalidad</label>
                                        <input
                                            className="input-campo"
                                            value={form.tonalidad}
                                            onChange={e => setForm(p => ({ ...p, tonalidad: e.target.value }))}
                                            placeholder="Sol mayor"
                                            disabled={subiendo}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-campo">Compás</label>
                                        <input
                                            className="input-campo"
                                            value={form.compas}
                                            onChange={e => setForm(p => ({ ...p, compas: e.target.value }))}
                                            placeholder="4/4"
                                            disabled={subiendo}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-campo">Páginas</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="input-campo"
                                            value={form.paginas}
                                            onChange={e => setForm(p => ({ ...p, paginas: e.target.value }))}
                                            placeholder="4"
                                            disabled={subiendo}
                                        />
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="label-campo">Descripción</label>
                                    <textarea
                                        rows={2}
                                        className="input-campo resize-none"
                                        value={form.descripcion}
                                        onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                                        placeholder="Breve descripción de la obra o anotaciones de ensayo..."
                                        disabled={subiendo}
                                    />
                                </div>

                                {/* Archivo PDF */}
                                <div className="border border-vinotinto/20 dark:border-khaki/25 rounded-xl p-3.5 bg-vinotinto/5 dark:bg-khaki/5 space-y-2">
                                    <label className="label-campo flex items-center justify-between text-vinotinto dark:text-khaki">
                                        <span className="flex items-center gap-1.5 font-semibold">
                                            <FileText className="w-3.5 h-3.5" /> Partitura (PDF) *
                                        </span>
                                        <span className="text-[10px] opacity-75 font-normal">
                                            {supabase ? 'Se subirá a Supabase Storage' : 'Modo local activo'}
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={manejarArchivoPdf}
                                        disabled={subiendo}
                                        className="block w-full text-xs t-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-vinotinto/10 file:text-vinotinto hover:file:bg-vinotinto/20 dark:file:bg-khaki/20 dark:file:text-khaki dark:hover:file:bg-khaki/30 cursor-pointer"
                                    />
                                    {archivoPdf && (
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                                            ✓ Seleccionado: {archivoPdf.name} ({(archivoPdf.size / (1024 * 1024)).toFixed(2)} MB)
                                        </p>
                                    )}
                                    <div className="pt-2 border-t border-vinotinto/10 dark:border-khaki/10">
                                        <label className="text-[11px] t-muted block mb-1">
                                            O pega una URL directa del PDF (opcional si ya seleccionaste archivo):
                                        </label>
                                        <input
                                            className="input-campo text-xs py-1.5"
                                            value={form.urlPdf}
                                            onChange={e => setForm(p => ({ ...p, urlPdf: e.target.value }))}
                                            placeholder="https://..."
                                            disabled={subiendo}
                                        />
                                    </div>
                                </div>

                                {/* Portada */}
                                <div>
                                    <label className="label-campo">Imagen de Portada (Opcional)</label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
                                        onChange={manejarArchivoPortada}
                                        disabled={subiendo}
                                        className="block w-full text-xs t-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sutil file:text-secundario hover:file:bg-sutil-hover cursor-pointer"
                                    />
                                    {archivoPortada && (
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                                            ✓ Portada: {archivoPortada.name}
                                        </p>
                                    )}
                                    <input
                                        className="input-campo text-xs mt-1.5"
                                        value={form.urlPortada}
                                        onChange={e => setForm(p => ({ ...p, urlPortada: e.target.value }))}
                                        placeholder="O pega una URL de imagen: https://..."
                                        disabled={subiendo}
                                    />
                                </div>

                                {/* Toggles: Descargable y Ocultar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, descargable: !p.descargable }))}
                                        disabled={subiendo}
                                        className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                                            form.descargable
                                                ? 'bg-khaki/10 border-khaki/40'
                                                : 'bg-sutil border-borde-subtle'
                                        }`}
                                    >
                                        <Download className={`w-4 h-4 ${form.descargable ? 'text-khaki' : 't-muted'}`} />
                                        <span className="flex-1 text-left">
                                            <span className="block text-sm font-medium text-secundario">Descargable</span>
                                            <span className="block text-[11px] t-muted">Mostrar botón "Descargar" al público</span>
                                        </span>
                                        <span
                                            className={`toggle-switch ${form.descargable ? 'bg-vinotinto' : 'bg-sutil-hover'}`}
                                            role="switch"
                                            aria-checked={form.descargable}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.descargable ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
                                        disabled={subiendo}
                                        className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                                            form.activo
                                                ? 'bg-vinotinto/5 dark:bg-khaki/5 border-vinotinto/30 dark:border-khaki/30'
                                                : 'bg-sutil border-borde-subtle'
                                        }`}
                                    >
                                        <EyeOff className={`w-4 h-4 ${form.activo ? 'text-vinotinto dark:text-khaki' : 't-muted'}`} />
                                        <span className="flex-1 text-left">
                                            <span className="block text-sm font-medium text-secundario">Ocultar</span>
                                            <span className="block text-[11px] t-muted">{form.activo ? 'Visible en la web (ON)' : 'Oculta temporalmente'}</span>
                                        </span>
                                        <span
                                            className={`toggle-switch ${form.activo ? 'bg-vinotinto' : 'bg-sutil-hover'}`}
                                            role="switch"
                                            aria-checked={form.activo}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Botón de guardado */}
                            <button
                                onClick={guardar}
                                disabled={subiendo}
                                className="btn-primario w-full justify-center py-2.5 mt-2"
                            >
                                {subiendo ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Subiendo a Storage...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> {editando ? 'Guardar Cambios' : 'Añadir Partitura'}
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </div>
    );
};

// ============================================================
// MÓDULO: Buzón de Audiciones
// ============================================================
const ModuloBuzonAudiciones = () => {
    const { solicitudesAudicion, marcarSolicitudRevisada } = useApp();
    const [paginaAudiciones, setPaginaAudiciones] = useState(1);
    const COLORES_ESTADO: Record<string, string> = {
        'Pendiente': 'text-amber-700 dark:text-amber-400 bg-amber-400/10',
        'Revisada': 'text-blue-700 dark:text-blue-400 bg-blue-400/10',
        'Aceptada': 'text-emerald-700 dark:text-emerald-400 bg-emerald-400/10',
        'Rechazada': 'text-red-600 dark:text-red-400 bg-red-400/10',
    };

    const solicitudesInvertidas = [...solicitudesAudicion].reverse();
    const totalPaginasAudiciones = Math.max(1, Math.ceil(solicitudesAudicion.length / REGISTROS_POR_PAGINA));
    const paginaAudicionesClamp = Math.min(paginaAudiciones, totalPaginasAudiciones);
    const solicitudesPaginadas = solicitudesInvertidas.slice(
        (paginaAudicionesClamp - 1) * REGISTROS_POR_PAGINA,
        paginaAudicionesClamp * REGISTROS_POR_PAGINA
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Buzón de Audiciones</h2>
                <p className="t-muted text-sm">{solicitudesAudicion.filter(s => s.estado === 'Pendiente').length} pendientes de revisión</p>
            </div>

            {solicitudesAudicion.length === 0 ? (
                <div className="card-glass rounded-xl p-12 text-center t-muted-low">
                    <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay solicitudes de audición</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {solicitudesPaginadas.map(s => (
                        <div key={s.id} className="card-glass rounded-xl p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-secundario">{s.nombre}</p>
                                    <p className="text-xs t-muted">{s.email} · {s.telefono}</p>
                                    <p className="text-xs text-vinotinto-claro mt-1">Voz: {s.tipoVoz}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`badge text-[10px] ${COLORES_ESTADO[s.estado]}`}>{s.estado}</span>
                                    <p className="text-[10px] t-muted-low mt-1">{new Date(s.fechaEnvio).toLocaleDateString('es-ES')}</p>
                                </div>
                            </div>
                            <p className="text-xs t-muted bg-sutil rounded-lg p-3">{s.experiencia}</p>
                            {s.urlAudioPrueba && <a href={s.urlAudioPrueba} target="_blank" rel="noopener noreferrer" className="text-xs text-khaki hover:underline flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Ver audio de prueba</a>}
                            <div className="flex gap-2 flex-wrap">
                                {(['Pendiente', 'Revisada', 'Aceptada', 'Rechazada'] as const).map(estado => (
                                    <button key={estado} onClick={() => marcarSolicitudRevisada(s.id, estado)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-all ${s.estado === estado
                                                ? `${COLORES_ESTADO[estado]} border-current`
                                                : 'borde-subtle t-muted-low hover:borde-medium'
                                            }`}>
                                        {estado}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <PaginadorRegistros
                        pagina={paginaAudicionesClamp}
                        totalPaginas={totalPaginasAudiciones}
                        alCambiar={setPaginaAudiciones}
                    />
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
    const [paginaMensajes, setPaginaMensajes] = useState(1);

    const mensajesInvertidos = [...mensajesContacto].reverse();
    const totalPaginasMensajes = Math.max(1, Math.ceil(mensajesContacto.length / REGISTROS_POR_PAGINA));
    const paginaMensajesClamp = Math.min(paginaMensajes, totalPaginasMensajes);
    const mensajesPaginados = mensajesInvertidos.slice(
        (paginaMensajesClamp - 1) * REGISTROS_POR_PAGINA,
        paginaMensajesClamp * REGISTROS_POR_PAGINA
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-secundario mb-1">Buzón de Mensajes</h2>
                <p className="t-muted text-sm">{mensajesContacto.filter(m => !m.leido).length} sin leer</p>
            </div>

            {mensajesContacto.length === 0 ? (
                <div className="card-glass rounded-xl p-12 text-center t-muted-low">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay mensajes de contacto</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {mensajesPaginados.map(m => (
                        <div key={m.id} className={`card-glass rounded-xl p-5 border transition-all ${m.leido ? 'borde-subtle' : 'border-vinotinto/30'}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-secundario text-sm">{m.nombre}</p>
                                        {!m.leido && <div className="w-2 h-2 rounded-full bg-vinotinto animate-pulse" />}
                                    </div>
                                    <p className="text-xs t-muted">{m.email}</p>
                                </div>
                                <p className="text-xs t-muted-low flex-shrink-0">{new Date(m.fechaEnvio).toLocaleDateString('es-ES')}</p>
                            </div>
                            {m.asunto && <p className="text-xs text-khaki mb-2">Asunto: {m.asunto}</p>}
                            <p className="text-sm t-muted-high bg-sutil rounded-lg p-3">{m.mensaje}</p>
                            {!m.leido && (
                                <button onClick={() => marcarMensajeLeido(m.id)} className="mt-3 text-xs t-muted hover:text-secundario transition-colors flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Marcar como leído
                                </button>
                            )}
                        </div>
                    ))}
                    <PaginadorRegistros
                        pagina={paginaMensajesClamp}
                        totalPaginas={totalPaginasMensajes}
                        alCambiar={setPaginaMensajes}
                    />
                </div>
            )}
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: AdminPanel
// ============================================================
const AdminPanel = () => {
    const { esAdmin, usuarioActual, cerrarSesion, solicitudesAudicion, mensajesContacto, modoOscuro, toggleModoOscuro } = useApp();
    const [moduloActivo, setModuloActivo] = useState('dashboard');
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

    // Si no es admin, mostrar acceso denegado
    if (!esAdmin) {
        return (
            <div className="min-h-screen bg-fondo-oscuro flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-vinotinto mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-secundario mb-2">Acceso Denegado</h2>
                    <p className="t-muted mb-6">Esta área es exclusiva para administradores.</p>
                    <Link to="/" className="btn-primario mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Volver al sitio
                    </Link>
                </div>
            </div>
        );
    }
    const solicitudesPendientes = solicitudesAudicion.filter(s => s.estado === 'Pendiente').length;
    const mensajesNoLeidos = mensajesContacto.filter(m => !m.leido).length;

    const navegarA = (modulo: string) => setModuloActivo(modulo);

    const COMPONENTES_MODULOS: Record<string, JSX.Element> = {
        'dashboard': <ModuloDashboard onNavigate={navegarA} />,
        'secciones': <ModuloSecciones />,
        'integrantes': <ModuloIntegrantes />,
        'partituras': <ModuloPartituras />,
        'audio': <ModuloAudio />,
        'media': <ModuloMedia />,
        'eventos': <ModuloEventos />,
        'audiciones': <ModuloBuzonAudiciones />,
        'mensajes': <ModuloBuzonMensajes />,
    };

    return (
        <div className="min-h-screen bg-fondo-oscuro flex">

            {/* ---- MENÚ LATERAL (Sidebar) ---- */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-fondo-card border-r borde-subtle
                       flex flex-col transition-transform duration-300 lg:translate-x-0 ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo */}
                <div className="p-6 border-b borde-subtle">
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
                    {MODULOS.map(modulo => {
                        const badge = modulo.id === 'audiciones' ? solicitudesPendientes
                            : modulo.id === 'mensajes' ? mensajesNoLeidos : 0;
                        return (
                            <button
                                key={modulo.id}
                                onClick={() => { setModuloActivo(modulo.id); setMenuMovilAbierto(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                             transition-all duration-200 ${moduloActivo === modulo.id
                                        ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                        : 't-muted hover:text-secundario hover:bg-sutil'
                                    }`}
                            >
                                {modulo.icono}
                                <span className="flex-1 text-left">{modulo.etiqueta}</span>
                                {badge > 0 && (
                                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full 
                                        bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30
                                        animate-pulse-soft">
                                        {badge}
                                    </span>
                                )}
                                {moduloActivo === modulo.id && <ChevronRight className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer del sidebar */}
                <div className="p-4 border-t borde-subtle space-y-2">
                    <div className="px-3 py-2">
                        <p className="text-xs t-muted">Conectado como</p>
                        <p className="text-sm font-medium text-khaki">{usuarioActual?.nombre}</p>
                    </div>
                    <button onClick={toggleModoOscuro} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm t-muted
                                   hover:text-secundario hover:bg-sutil transition-all">
                        {modoOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {modoOscuro ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
                    </button>
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm t-muted
                                   hover:text-secundario hover:bg-sutil transition-all w-full">
                        <ArrowLeft className="w-4 h-4" />
                        Ver sitio público
                    </Link>
                    <button onClick={cerrarSesion} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all">
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
                <div className="lg:hidden flex items-center justify-between p-4 border-b borde-subtle bg-fondo-card">
                    <button onClick={() => setMenuMovilAbierto(true)} className="btn-ghost">
                        <LayoutDashboard className="w-5 h-5" />
                        Menú
                    </button>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium t-muted-high">
                            {MODULOS.find(m => m.id === moduloActivo)?.etiqueta}
                        </span>
                        <button
                            onClick={toggleModoOscuro}
                            className="w-9 h-9 flex items-center justify-center rounded-lg t-muted-high hover:text-khaki hover:bg-sutil transition-all duration-200"
                            aria-label="Cambiar tema"
                        >
                            {modoOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
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
