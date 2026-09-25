/**
 * ============================================================
 * ARCHIVO: src/components/sections/Presentaciones.tsx
 * ============================================================
 * Galería de videos de YouTube y carrusel de fotos de conciertos
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import CarruselMovil from '../ui/CarruselMovil';
import { useApp } from '../../context/AppContext';
import { VideoMedia, FotoGaleria } from '../../data/mockData';

type TarjetaVideoProps = {
    video: VideoMedia;
};

// ============================================================
// COMPONENTE: TarjetaVideo
// ============================================================
const TarjetaVideo = ({ video }: TarjetaVideoProps) => {
    const [reproduciendo, setReproduciendo] = useState(false);

    return (
        <div className="card-glass rounded-xl overflow-hidden group">
            {/* Si el usuario hace clic en "Play", mostramos el reproductor (YouTube o archivo) */}
            {reproduciendo ? (
                <div className="aspect-video">
                    {video.tipoOrigen === 'archivo' ? (
                        <video
                            src={video.urlVideo}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <iframe
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                            title={video.titulo}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                            allowFullScreen
                        />
                    )}
                </div>
            ) : (
                // Miniatura del video con botón de Play
                <div
                    className="aspect-video relative cursor-pointer bg-black"
                    onClick={() => setReproduciendo(true)}
                >
                    {video.tipoOrigen === 'archivo' ? (
                        <video
                            src={video.urlVideo}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <img
                            src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                            alt={video.titulo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                            }}
                        />
                    )}
                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    {/* Logo de YouTube */}
                    <div className="absolute top-3 right-3">
                        <Video className="w-6 h-6 text-red-500" />
                    </div>
                    {/* Botón de Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-vinotinto/80 backdrop-blur-sm
                            flex items-center justify-center border-2 borde-medium
                            group-hover:scale-110 group-hover:bg-vinotinto transition-all duration-300
                            shadow-glow-vinotinto">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                    </div>
                </div>
            )}

            {/* Información del video */}
            <div className="p-4">
                <h4 className="font-semibold text-secundario text-sm mb-1">{video.titulo}</h4>
                <p className="text-xs t-muted">{video.descripcion}</p>
            </div>
        </div>
    );
};

// ============================================================
// CARRUSEL DE VIDEOS DE ESCRITORIO: 2 por página con paginación
// ============================================================
const VIDEOS_POR_PAGINA = 2;

const CarruselVideosDesktop = ({ videos }: { videos: VideoMedia[] }) => {
    const [pagina, setPagina] = useState(0);
    const totalPaginas = Math.max(1, Math.ceil(videos.length / VIDEOS_POR_PAGINA));
    const paginaSegura = Math.min(pagina, totalPaginas - 1);
    const inicio = paginaSegura * VIDEOS_POR_PAGINA;
    const visibles = videos.slice(inicio, inicio + VIDEOS_POR_PAGINA);
    const tieneVariasPaginas = totalPaginas > 1;

    return (
        <div>
            {/* Página actual (2 videos) con transición */}
            <div className="md:min-h-[430px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={paginaSegura}
                        className="grid md:grid-cols-2 md:gap-6"
                        initial={{ opacity: 0, x: 48 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -48 }}
                        transition={{ duration: 0.4 }}
                    >
                        {visibles.map(video => (
                            <TarjetaVideo key={video.id} video={video} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controles: flechas + contador + puntos */}
            {tieneVariasPaginas && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPagina(Math.max(0, paginaSegura - 1))}
                        disabled={paginaSegura === 0}
                        aria-label="Videos anteriores"
                        className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border borde-medium
                                   flex items-center justify-center text-white
                                   hover:bg-vinotinto transition-all duration-300
                                   disabled:opacity-30 disabled:hover:bg-black/50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs t-muted-high tabular-nums bg-sutil border borde-subtle inline-block rounded-full px-3 py-1">
                            {paginaSegura + 1} / {totalPaginas}
                        </span>
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPaginas }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagina(i)}
                                    aria-label={`Ir a la página ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === paginaSegura
                                            ? 'w-5 bg-vinotinto'
                                            : 'w-2 bg-sutil-hover hover:bg-vinotinto/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setPagina(Math.min(totalPaginas - 1, paginaSegura + 1))}
                        disabled={paginaSegura >= totalPaginas - 1}
                        aria-label="Videos siguientes"
                        className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border borde-medium
                                   flex items-center justify-center text-white
                                   hover:bg-vinotinto transition-all duration-300
                                   disabled:opacity-30 disabled:hover:bg-black/50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================
// CARRUSEL DE FOTOS CON REPRODUCCIÓN AUTOMÁTICA
// Avanza solo (5s), se pausa al pasar el cursor sobre la foto
// y tiene botón de reproducir/pausar. Solo avanza cuando está
// visible en pantalla (IntersectionObserver).
// ============================================================
const INTERVALO_AUTOPLAY = 5000;

const CarruselFotos = ({ fotos }: { fotos: FotoGaleria[] }) => {
    const [indice, setIndice] = useState(0);
    const [automatico, setAutomatico] = useState(true);
    const [pausadoHover, setPausadoHover] = useState(false);
    const [visible, setVisible] = useState(false);
    const reproductorRef = useRef<HTMLDivElement>(null);

    const indiceSeguro = Math.min(indice, Math.max(0, fotos.length - 1));
    const tieneVarias = fotos.length > 1;
    const foto = fotos[indiceSeguro];

    // Solo avanza si el carrusel está realmente en pantalla
    useEffect(() => {
        const el = reproductorRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entrada]) => setVisible(entrada.isIntersecting),
            { threshold: 0.4 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Avance automático: se reinicia con cada foto (o al pausar)
    useEffect(() => {
        if (!automatico || pausadoHover || !visible || !tieneVarias) return;
        const id = window.setTimeout(() => {
            setIndice(i => (i >= fotos.length - 1 ? 0 : i + 1));
        }, INTERVALO_AUTOPLAY);
        return () => window.clearTimeout(id);
    }, [automatico, pausadoHover, visible, indice, fotos.length, tieneVarias]);

    const anterior = () => setIndice(i => (i === 0 ? fotos.length - 1 : i - 1));
    const siguiente = () => setIndice(i => (i === fotos.length - 1 ? 0 : i + 1));

    return (
        <div>
            <div className="relative">
                {/* Foto principal */}
                <div
                    ref={reproductorRef}
                    className="aspect-video rounded-2xl overflow-hidden relative"
                    onMouseEnter={() => setPausadoHover(true)}
                    onMouseLeave={() => setPausadoHover(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={indiceSeguro}
                            src={foto.urlFoto}
                            alt={foto.titulo}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        />
                    </AnimatePresence>

                    {/* Botón de reproducir / pausar */}
                    {tieneVarias && (
                        <button
                            onClick={() => setAutomatico(!automatico)}
                            aria-label={automatico
                                ? 'Pausar reproducción automática'
                                : 'Reproducción automática'}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                                       bg-black/50 backdrop-blur-sm border borde-medium
                                       flex items-center justify-center text-white
                                       hover:bg-vinotinto transition-all duration-300"
                        >
                            {automatico ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                    )}

                    {/* Descripción de la foto */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70">
                        <p className="text-white font-medium">{foto.titulo}</p>
                        {foto.enlaceUrl && (
                            <a
                                href={foto.enlaceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-vinotinto-luz hover:underline mt-1"
                            >
                                {foto.enlaceTexto || 'Ver más'}
                            </a>
                        )}
                        <p className="t-muted text-sm">{indiceSeguro + 1} / {fotos.length}</p>
                    </div>
                </div>

                {/* Botones de navegación */}
                <button
                    onClick={anterior}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/50 backdrop-blur-sm border borde-medium
                         flex items-center justify-center text-white
                         hover:bg-vinotinto transition-all duration-300"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={siguiente}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/50 backdrop-blur-sm border borde-medium
                         flex items-center justify-center text-white
                         hover:bg-vinotinto transition-all duration-300"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Barra de progreso del autoplay */}
            {tieneVarias && automatico && !pausadoHover && visible && (
                <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                        key={indiceSeguro}
                        className="h-full rounded-full bg-khaki/80"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: INTERVALO_AUTOPLAY / 1000, ease: 'linear' }}
                    />
                </div>
            )}

            {/* Miniaturas del carrusel */}
            <div className="flex gap-3 mt-4 overflow-x-auto sin-scrollbar py-2">
                {fotos.map((f, i) => (
                    <button
                        key={f.id}
                        onClick={() => setIndice(i)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${i === indiceSeguro ? 'border-vinotinto' : 'border-transparent opacity-60 hover:opacity-80'
                            }`}
                    >
                        <img src={f.urlFoto} alt={f.titulo} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionPresentaciones
// ============================================================
const SeccionPresentaciones = () => {
    const { videosMedia, fotosGaleria } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const videosVisibles = videosMedia.filter(v => v.activo);
    const fotosVisibles = fotosGaleria.filter(f => f.activo);

    const hayVideos = videosVisibles.length > 0;
    const hayFotos = fotosVisibles.length > 0;

    return (
        <section id="presentaciones" className="py-24 bg-fondo-medio relative overflow-hidden">
            <div className="contenedor" ref={ref}>

                {/* Encabezado */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Play className="w-3 h-3" />
                        Actuaciones
                    </span>
                    <h2 className="titulo-seccion mb-4">Presentaciones & Media</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="t-muted max-w-2xl mx-auto">
                        Revive nuestras presentaciones y guarda los mejores momentos de DaCapo.
                    </p>
                </motion.div>

                {/* ---- VIDEOS DE YOUTUBE ---- */}
                {hayVideos && (
                    <motion.div
                        className="mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h3 className="text-xl font-semibold t-muted-high mb-6 flex items-center gap-2">
                            <Video className="w-5 h-5 text-red-500" />
                            Videos
                            {videosVisibles.length > 2 && (
                                <span className="text-xs t-muted-low font-normal bg-sutil border borde-subtle rounded-full px-2.5 py-0.5">
                                    {videosVisibles.length} videos
                                </span>
                            )}
                        </h3>

                        {/* Móvil: swipe con peek */}
                        <div className="md:hidden">
                            <CarruselMovil
                                slides={videosVisibles.map(video => (
                                    <TarjetaVideo key={video.id} video={video} />
                                ))}
                                claseSlide="w-[86%]"
                                ariaLabel="Carrusel de videos en móvil"
                            />
                        </div>

                        {/* Escritorio: carrusel paginado de 2 en 2 */}
                        <div className="hidden md:block">
                            <CarruselVideosDesktop videos={videosVisibles} />
                        </div>
                    </motion.div>
                )}

                {/* ---- CARRUSEL DE FOTOS ---- */}
                {hayFotos && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        <h3 className="text-xl font-semibold t-muted-high mb-6">Galería de Fotos</h3>

                        <CarruselFotos fotos={fotosVisibles} />
                    </motion.div>
                )}

                {!hayVideos && !hayFotos && (
                    <p className="t-muted text-center py-10">Aún no hay contenido de presentaciones.</p>
                )}

            </div>
        </section>
    );
};

export default SeccionPresentaciones;
