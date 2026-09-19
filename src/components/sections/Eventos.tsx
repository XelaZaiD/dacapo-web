/**
 * ============================================================
 * ARCHIVO: src/components/sections/Eventos.tsx
 * ============================================================
 * Sección de próximos conciertos y eventos. 
 * Solo visible si configuracionSecciones.mostrarEventos = true
 * ============================================================
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ExternalLink, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Evento } from '../../data/mockData';
import CarruselMovil from '../ui/CarruselMovil';

// Función que formatea una fecha ISO a texto legible en español
// Ejemplo: "2025-09-15T19:30:00" → "15 de septiembre de 2025"
const formatearFecha = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

// Extrae solo la hora de una fecha ISO
// Ejemplo: "2025-09-15T19:30:00" → "7:30 PM"
const formatearHora = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Genera un link para añadir el evento a Google Calendar
const generarLinkGoogleCalendar = (evento: Evento): string => {
    const inicio = new Date(evento.fecha);
    const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000); // Asume 2 horas de duración

    const formatearParaGoogle = (d: Date) =>
        d.toISOString().replace(/-|:|\.\d{3}/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(evento.titulo)}` +
        `&dates=${formatearParaGoogle(inicio)}/${formatearParaGoogle(fin)}` +
        `&details=${encodeURIComponent(evento.descripcion)}` +
        `&location=${encodeURIComponent(evento.lugar + ', ' + evento.direccion)}`;
};

// Colores para el tipo de entrada
const COLORES_TIPO: Record<string, string> = {
    'Libre': 'text-emerald-700 dark:text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'Con entrada': 'text-vinotinto-claro bg-vinotinto/10 border-vinotinto/30',
    'Donación voluntaria': 'text-[#8A7A3E] dark:text-khaki bg-khaki/10 border-khaki/30',
};

// ============================================================
// COMPONENTE: TarjetaEvento
// ============================================================
const TarjetaEvento = ({ evento, indice }: { evento: Evento; indice: number }) => {
    const esFuturo = new Date(evento.fecha) > new Date();
    const colorTipo = COLORES_TIPO[evento.tipoEntrada] || COLORES_TIPO['Libre'];

    return (
        <motion.div
            className="card-glass rounded-2xl overflow-hidden group border borde-subtle
                 hover:border-vinotinto/40 transition-all duration-300"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: indice * 0.1 }}
        >
            {/* Barra de color según si es futuro o pasado */}
            <div className={`h-1 w-full ${esFuturo ? 'bg-gradient-to-r from-vinotinto to-khaki' : 'bg-sutil-hover'}`} />

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">

                    {/* ---- COLUMNA: FECHA ---- */}
                    <div className="flex-shrink-0 text-center">
                        {/* Bloque visual de fecha */}
                        <div className="w-20 h-20 rounded-xl bg-vinotinto/20 border border-vinotinto/30
                            flex flex-col items-center justify-center mx-auto">
                            <span className="text-2xl font-display font-bold text-vinotinto-claro leading-none">
                                {new Date(evento.fecha).getDate()}
                            </span>
                            <span className="text-xs t-muted uppercase tracking-wider mt-1">
                                {new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                            </span>
                        </div>
                        <div className="text-xs t-muted mt-2">
                            {new Date(evento.fecha).getFullYear()}
                        </div>
                    </div>

                    {/* ---- COLUMNA: INFORMACIÓN ---- */}
                    <div className="flex-1">
                        {/* Badge de tipo de entrada */}
                        <span className={`badge border ${colorTipo} mb-3`}>
                            <Ticket className="w-3 h-3" />
                            {evento.tipoEntrada}
                        </span>

                        {/* Título del evento */}
                        <h3 className="text-xl font-display font-bold text-secundario mb-3 
                           group-hover:text-khaki transition-colors duration-300">
                            {evento.titulo}
                        </h3>

                        {/* Descripción */}
                        <p className="t-muted text-sm leading-relaxed mb-4">
                            {evento.descripcion}
                        </p>

                        {/* Detalles: lugar, hora, dirección */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-5 text-sm">
                            <div className="flex items-center gap-2 t-muted-high">
                                <MapPin className="w-4 h-4 text-vinotinto-claro flex-shrink-0" />
                                <span>{evento.lugar}</span>
                            </div>
                            <div className="flex items-center gap-2 t-muted-high">
                                <Clock className="w-4 h-4 text-vinotinto-claro flex-shrink-0" />
                                <span>{formatearFecha(evento.fecha)} · {formatearHora(evento.fecha)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 t-muted text-xs mb-5">
                            <MapPin className="w-3 h-3" />
                            {evento.direccion}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-wrap gap-3">
                            {/* Si tiene link de entradas, mostrar botón */}
                            {evento.urlEntradas && (
                                <a
                                    href={evento.urlEntradas}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primario text-sm py-2 px-4"
                                >
                                    <Ticket className="w-4 h-4" />
                                    Conseguir Entradas
                                </a>
                            )}

                            {/* Botón de Google Calendar */}
                            <a
                                href={generarLinkGoogleCalendar(evento)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secundario text-sm py-2 px-4"
                            >
                                <Calendar className="w-4 h-4" />
                                Añadir al Calendario
                            </a>

                            {/* Link de mapa */}
                            {evento.urlMapa && (
                                <a
                                    href={evento.urlMapa}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-ghost text-sm py-2 px-4 t-muted hover:text-secundario"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ver en Mapa
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionEventos
// ============================================================
const SeccionEventos = () => {
    const { eventos, configuracionSecciones } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    // Si la sección está desactivada desde el Admin, no la mostramos
    if (!configuracionSecciones.mostrarEventos) return null;

    // Solo mostramos eventos activos, ordenados por fecha (más próximos primero)
    const eventosActivos = eventos
        .filter(e => e.activo)
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return (
        <section id="eventos" className="py-24 bg-fondo-card">
            <div className="contenedor" ref={ref}>

                {/* Encabezado */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Calendar className="w-3 h-3" />
                        Agenda
                    </span>
                    <h2 className="titulo-seccion mb-4">Próximos Eventos</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="t-muted max-w-2xl mx-auto">
                        No te pierdas las próximas presentaciones de DaCapo Grupo Vocal.
                    </p>
                </motion.div>

                {/* Carrusel de eventos (solo móvil; en sm+ vuelve a la lista apilada) */}
                {eventosActivos.length > 0 ? (
                    <div className="max-w-4xl mx-auto">
                        <CarruselMovil
                            slides={eventosActivos.map((evento, indice) => (
                                <TarjetaEvento key={evento.id} evento={evento} indice={indice} />
                            ))}
                            claseSlide="w-[85%] sm:w-full"
                            apiladoSm
                            ariaLabel="Carrusel de próximos eventos"
                        />
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
