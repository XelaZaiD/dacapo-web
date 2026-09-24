/**
 * ============================================================
 * ARCHIVO: src/components/sections/Eventos.tsx
 * ============================================================
 * Sección de conciertos y eventos. Datos 100% de Supabase.
 * Solo visible si configuracionSecciones.mostrarEventos = true
 *
 * Diseño (HITO 5):
 * - Pestañas: Próximos / Todos / Pasados
 * - Los eventos marcados "destacado" se muestran como tarjetas
 *   grandes con imagen de fondo; el resto en lista.
 * - Repertorio desplegable (un obra por línea).
 * ============================================================
 */

import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ExternalLink, Music, Star, ChevronDown, ChevronUp, HeartHandshake } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Evento } from '../../data/mockData';
import CarruselMovil from '../ui/CarruselMovil';

// Función que formatea una fecha ISO a texto legible en español
const formatearFecha = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatearHora = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Genera un link para añadir el evento a Google Calendar usando la duración real
const generarLinkGoogleCalendar = (evento: Evento): string => {
    const inicio = new Date(evento.fecha);
    const duracion = evento.duracionMin || 120;
    const fin = new Date(inicio.getTime() + duracion * 60 * 1000);

    const formatearParaGoogle = (d: Date) =>
        d.toISOString().replace(/-|:|\.\d{3}/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(evento.titulo)}` +
        `&dates=${formatearParaGoogle(inicio)}/${formatearParaGoogle(fin)}` +
        `&details=${encodeURIComponent(evento.descripcion || '')}` +
        `&location=${encodeURIComponent([evento.lugar, evento.direccion].filter(Boolean).join(', '))}`;
};

const COLORES_TIPO: Record<string, string> = {
    'Libre': 'text-emerald-700 dark:text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'Con entrada': 'text-vinotinto-claro bg-vinotinto/10 border-vinotinto/30',
    'Donación voluntaria': 'text-[#8A7A3E] dark:text-khaki bg-khaki/10 border-khaki/30',
};

// ============================================================
// COMPONENTE: Botones de acción de un evento
// ============================================================
const BotonesEvento = ({ evento, variante = 'normal' }: { evento: Evento; variante?: 'normal' | 'grande' }) => {
    const esDonacion = evento.tipoEntrada === 'Donación voluntaria';
    const esEntrada = evento.tipoEntrada === 'Con entrada';
    const mostrarEntradas = !evento.agotado && (esEntrada || (esDonacion && evento.urlEntradas));
    const base = variante === 'grande' ? 'text-base py-2.5 px-5' : 'text-sm py-2 px-4';

    return (
        <div className="flex flex-wrap gap-3">
            {mostrarEntradas && evento.urlEntradas && (
                <a href={evento.urlEntradas} target="_blank" rel="noopener noreferrer" className={`btn-primario ${base}`}>
                    <Ticket className="w-4 h-4" />
                    {esDonacion ? 'Hacer Aporte' : 'Conseguir Entradas'}
                </a>
            )}
            {evento.agotado && !esDonacion && (
                <span className={`inline-flex items-center gap-2 ${base} font-semibold rounded-full bg-red-500/15 text-red-600 dark:text-red-400`}>
                    <Ticket className="w-4 h-4" /> Entradas Agotadas
                </span>
            )}
            <a href={generarLinkGoogleCalendar(evento)} target="_blank" rel="noopener noreferrer" className={`btn-secundario ${base}`}>
                <Calendar className="w-4 h-4" />
                Añadir al Calendario
            </a>
            {evento.urlMapa && (
                <a href={evento.urlMapa} target="_blank" rel="noopener noreferrer" className={`btn-ghost ${base} t-muted hover:text-secundario`}>
                    <ExternalLink className="w-4 h-4" />
                    Ver en Mapa
                </a>
            )}
        </div>
    );
};

// ============================================================
// COMPONENTE: Repertorio (listado desplegable)
// ============================================================
const RepertorioDesplegable = ({ repertorio, abierto }: { repertorio: string; abierto?: boolean }) => {
    const [visible, setVisible] = useState(!!abierto);
    const lineas = repertorio.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lineas.length === 0) return null;

    return (
        <div className="mt-4">
            <button
                onClick={() => setVisible(v => !v)}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider t-muted hover:text-secundario transition-colors"
            >
                <Music className="w-3.5 h-3.5 text-vinotinto-claro" />
                Programa ({lineas.length})
                {visible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {visible && (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm t-muted border-l-2 border-vinotinto/30 pl-4">
                    {lineas.map((linea, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="text-vinotinto-claro/70">{i + 1}.</span>
                            {linea}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ============================================================
// COMPONENTE: TarjetaEvento (lista normal)
// ============================================================
const TarjetaEvento = ({ evento, indice }: { evento: Evento; indice: number }) => {
    const esFuturo = new Date(evento.fecha) > new Date();
    const colorTipo = COLORES_TIPO[evento.tipoEntrada] || COLORES_TIPO['Libre'];
    const tieneImagen = !!evento.imagen;

    return (
        <motion.div
            className={`card-glass rounded-2xl overflow-hidden border ${esFuturo ? 'border-borde-subtle hover:border-vinotinto/40' : 'border-borde-subtle opacity-90'} transition-all duration-300`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(indice * 0.05, 0.3) }}
        >
            {/* Barra superior según futuro/pasado */}
            <div className={`h-1 w-full ${esFuturo ? 'bg-gradient-to-r from-vinotinto to-khaki' : 'bg-sutil-hover'}`} />

            {tieneImagen && (
                <div className="relative h-40 md:h-52 overflow-hidden">
                    <img src={evento.imagen} alt={evento.titulo} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                        <span className="text-white text-sm font-semibold drop-shadow">{evento.lugar}</span>
                        {esFuturo && (
                            <span className="badge border border-khaki/40 text-khaki bg-black/40 backdrop-blur-sm">
                                {new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className={`p-6 md:p-8 ${tieneImagen ? 'pt-5' : ''}`}>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Columna fecha (solo si no hay imagen) */}
                    {!tieneImagen && (
                        <div className="flex-shrink-0 text-center">
                            <div className={`w-20 h-20 rounded-xl ${esFuturo ? 'bg-vinotinto/20 border border-vinotinto/30' : 'bg-sutil'} flex flex-col items-center justify-center mx-auto`}>
                                <span className="text-2xl font-display font-bold text-vinotinto-claro leading-none">
                                    {new Date(evento.fecha).getDate()}
                                </span>
                                <span className="text-xs t-muted uppercase tracking-wider mt-1">
                                    {new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                </span>
                            </div>
                            <div className="text-xs t-muted mt-2">{new Date(evento.fecha).getFullYear()}</div>
                        </div>
                    )}

                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className={`badge border ${colorTipo}`}>
                                <Ticket className="w-3 h-3" />
                                {evento.tipoEntrada}
                            </span>
                            {evento.categoria && evento.categoria !== 'Concierto' && (
                                <span className="badge border t-muted">{evento.categoria}</span>
                            )}
                            {evento.destacado && (
                                <span className="badge border text-amber-700 dark:text-khaki bg-khaki/10 border-khaki/40">
                                    <Star className="w-3 h-3" /> Destacado
                                </span>
                            )}
                        </div>

                        <h3 className={`text-xl font-display font-bold text-secundario mb-3 hover:text-khaki transition-colors duration-300 ${esFuturo ? '' : 'opacity-70'}`}>
                            {evento.titulo}
                        </h3>

                        {evento.descripcion && (
                            <p className="t-muted text-sm leading-relaxed mb-4">{evento.descripcion}</p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mb-5 text-sm">
                            <div className="flex items-center gap-2 t-muted-high">
                                <MapPin className="w-4 h-4 text-vinotinto-claro flex-shrink-0" />
                                <span>{evento.lugar}</span>
                            </div>
                            <div className="flex items-center gap-2 t-muted-high">
                                <Clock className="w-4 h-4 text-vinotinto-claro flex-shrink-0" />
                                <span>{formatearFecha(evento.fecha)} · {formatearHora(evento.fecha)}</span>
                            </div>
                            {evento.precio && !evento.agotado && (
                                <div className="flex items-center gap-2 t-muted-high">
                                    <HeartHandshake className="w-4 h-4 text-khaki flex-shrink-0" />
                                    <span>{evento.precio}</span>
                                </div>
                            )}
                        </div>

                        {evento.direccion && (
                            <div className="flex items-center gap-2 t-muted text-xs mb-4">
                                <MapPin className="w-3 h-3" />
                                {evento.direccion}
                            </div>
                        )}

                        <BotonesEvento evento={evento} />
                        {evento.repertorio && <RepertorioDesplegable repertorio={evento.repertorio} abierto={evento.destacado} />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================
// COMPONENTE: TarjetaDestacada (hero con imagen de fondo)
// ============================================================
const TarjetaDestacada = ({ evento, indice }: { evento: Evento; indice: number }) => {
    const colorTipo = COLORES_TIPO[evento.tipoEntrada] || COLORES_TIPO['Libre'];

    return (
        <motion.div
            className="relative rounded-3xl overflow-hidden min-h-[22rem] md:min-h-[26rem] flex items-end group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: indice * 0.15 }}
        >
            {evento.imagen && (
                <img src={evento.imagen} alt={evento.titulo} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className={`absolute inset-0 ${evento.imagen ? 'bg-gradient-to-t from-black/90 via-black/50 to-black/10' : 'bg-gradient-to-t from-black/80 via-vinotinto/40 to-vinotinto/20'}`} />

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 z-10">
                <span className={`badge border backdrop-blur-sm ${evento.imagen ? 'text-white border-white/40 bg-black/40' : colorTipo}`}>
                    <Ticket className="w-3 h-3" /> {evento.tipoEntrada}
                </span>
                <span className="badge border border-khaki/50 text-khaki bg-black/50 backdrop-blur-sm">
                    <Star className="w-3 h-3" /> Destacado
                </span>
            </div>

            {evento.agotado && !evento.imagen && (
                <div className="absolute top-16 left-4 z-10">
                    <span className="badge border bg-red-500/80 text-white border-red-400">
                        <Ticket className="w-3 h-3" /> Entradas Agotadas
                    </span>
                </div>
            )}

            <div className="relative z-10 p-6 md:p-8 w-full">
                <p className="text-khaki/90 text-xs font-semibold uppercase tracking-widest mb-2">
                    {formatearFecha(evento.fecha)} · {formatearHora(evento.fecha)}
                </p>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 drop-shadow">
                    {evento.titulo}
                </h3>
                <p className="flex items-center gap-2 text-white/80 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-khaki" /> {evento.lugar}
                    {evento.direccion && <span>· {evento.direccion}</span>}
                </p>
                <BotonesEvento evento={evento} variante="grande" />
                {evento.repertorio && <RepertorioDesplegable repertorio={evento.repertorio} />}
            </div>
        </motion.div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionEventos
// ============================================================
type Pestana = 'proximos' | 'todos' | 'pasados';

const SeccionEventos = () => {
    const { eventos, configuracionSecciones } = useApp();
    const [pestana, setPestana] = useState<Pestana>('proximos');
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    if (!configuracionSecciones.mostrarEventos) return null;

    const ahora = Date.now();

    // Eventos activos ordenados por fecha ascendente
    const eventosActivos = useMemo(
        () => eventos
            .filter(e => e.activo)
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),
        [eventos]
    );

    const proximos = useMemo(() => eventosActivos.filter(e => new Date(e.fecha).getTime() >= ahora), [eventosActivos, ahora]);
    const pasados = useMemo(() => eventosActivos.filter(e => new Date(e.fecha).getTime() < ahora), [eventosActivos, ahora]);
    const destacados = useMemo(
        () => [...proximos, ...pasados.filter(e => e.destacado)].filter(e => e.destacado),
        [proximos, pasados]
    );

    const listaVisible = pestana === 'proximos' ? proximos : pestana === 'pasados' ? pasados : eventosActivos;
    const destacadosVisibles = pestana === 'todos'
        ? eventosActivos.filter(e => e.destacado)
        : pestana === 'proximos'
            ? destacados.filter(e => new Date(e.fecha).getTime() >= ahora)
            : destacados.filter(e => new Date(e.fecha).getTime() < ahora);

    const PESTANAS: { id: Pestana; etiqueta: string; contador: number }[] = [
        { id: 'proximos', etiqueta: 'Próximos', contador: proximos.length },
        { id: 'todos', etiqueta: 'Todos', contador: eventosActivos.length },
        { id: 'pasados', etiqueta: 'Pasados', contador: pasados.length },
    ];

    return (
        <section id="eventos" className="py-24 bg-fondo-card">
            <div className="contenedor" ref={ref}>
                {/* Encabezado */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Calendar className="w-3 h-3" />
                        Agenda
                    </span>
                    <h2 className="titulo-seccion mb-4">Conciertos y Eventos</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="t-muted max-w-2xl mx-auto">
                        No te pierdas las próximas presentaciones de DaCapo Grupo Vocal.
                    </p>
                </motion.div>

                {/* Pestañas */}
                {eventosActivos.length > 0 && (
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex rounded-full bg-sutil p-1 gap-1">
                            {PESTANAS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPestana(p.id)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                        pestana === p.id
                                            ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                            : 't-muted hover:text-secundario'
                                    }`}
                                >
                                    {p.etiqueta}
                                    <span className={`ml-1.5 text-xs ${pestana === p.id ? 'text-white/70' : 't-muted-low'}`}>
                                        {p.contador}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {eventosActivos.length > 0 ? (
                    <div className="max-w-5xl mx-auto space-y-10">
                        {/* Eventos destacados: tarjetas grandes */}
                        {destacadosVisibles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {destacadosVisibles.map((evento, i) => (
                                    <TarjetaDestacada key={evento.id} evento={evento} indice={i} />
                                ))}
                            </div>
                        )}

                        {/* Lista: los no destacados (o todos si no hay destacados en la pestaña) */}
                        {(() => {
                            const enLista = pestana === 'todos'
                                ? eventosActivos.filter(e => !e.destacado)
                                : listaVisible.filter(e => !e.destacado);
                            if (enLista.length === 0) return null;
                            return (
                                <div className="space-y-5">
                                    <CarruselMovil
                                        slides={enLista.map((evento, indice) => (
                                            <TarjetaEvento key={evento.id} evento={evento} indice={indice} />
                                        ))}
                                        claseSlide="w-[85%] sm:w-full"
                                        apiladoSm
                                        ariaLabel="Lista de eventos"
                                    />
                                </div>
                            );
                        })()}

                        {/* Pestaña "pasados" vacía pero con próximos */}
                        {pestana === 'pasados' && pasados.length === 0 && (
                            <div className="text-center py-12 t-muted">
                                Aún no hay conciertos pasados registrados.
                            </div>
                        )}
                    </div>
                ) : (
                    // Mensaje cuando no hay eventos
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-sutil flex items-center justify-center mx-auto mb-4">
                            <Music className="w-10 h-10 text-white/20" />
                        </div>
                        <p className="t-muted text-lg">Próximamente nuevas fechas</p>
                        <p className="t-muted-low text-sm mt-2">
                            Sigue nuestras redes sociales para ser el primero en enterarte.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SeccionEventos;