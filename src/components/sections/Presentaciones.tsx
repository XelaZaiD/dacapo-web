/**
 * ============================================================
 * ARCHIVO: src/components/sections/Presentaciones.tsx
 * ============================================================
 * Galería de videos de YouTube y carrusel de fotos de conciertos
 * ============================================================
 */

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Video } from 'lucide-react';

// ============================================================
// DATOS: Videos de YouTube de ejemplo
// ============================================================
// Para cambiar los videos: reemplaza el "id" con el ID del video de YouTube
// El ID está en la URL después de "v=": youtube.com/watch?v=ESTE_ES_EL_ID
const VIDEOS_YOUTUBE = [
    {
        id: 'vid-001',
        titulo: 'Ave Verum Corpus - DaCapo Grupo Vocal',
        descripcion: 'Presentación en el Teatro Municipal · Diciembre 2024',
        youtubeId: 'HLuKWZcN5b4', // ID del video de YouTube (reemplazar con el real)
    },
    {
        id: 'vid-002',
        titulo: 'Cantate Domino - Monteverdi · DaCapo',
        descripcion: 'Festival Coral Internacional · Septiembre 2024',
        youtubeId: '_wFTAj7Ydv4',
    },
    {
        id: 'vid-003',
        titulo: 'Concierto de Navidad 2023 · Completo',
        descripcion: 'Catedral Metropolitana · Diciembre 2023',
        youtubeId: 'KDibgQfVj7E',
    },
];

// ============================================================
// DATOS: Fotos de ejemplo (usando DiceBear como placeholder)
// ============================================================
// En el proyecto real, estas serán URLs de fotos subidas a Supabase Storage
const FOTOS_GALERIA = [
    { id: 1, src: 'https://picsum.photos/seed/concert1/800/600', alt: 'Concierto de Navidad 2023' },
    { id: 2, src: 'https://picsum.photos/seed/choir2/800/600', alt: 'Ensayo General' },
    { id: 3, src: 'https://picsum.photos/seed/music3/800/600', alt: 'Festival Coral 2024' },
    { id: 4, src: 'https://picsum.photos/seed/stage4/800/600', alt: 'Teatro Municipal' },
    { id: 5, src: 'https://picsum.photos/seed/vocal5/800/600', alt: 'Presentación al Aire Libre' },
    { id: 6, src: 'https://picsum.photos/seed/group6/800/600', alt: 'Gira Regional 2024' },
];

// ============================================================
// COMPONENTE: TarjetaVideo
// ============================================================
const TarjetaVideo = ({ video }: { video: typeof VIDEOS_YOUTUBE[0] }) => {
    const [reproduciendo, setReproduciendo] = useState(false);

    return (
        <div className="card-glass rounded-xl overflow-hidden group">
            {/* Si el usuario hace clic en "Play", mostramos el iframe de YouTube */}
            {reproduciendo ? (
                <div className="aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                        title={video.titulo}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        allowFullScreen
                    />
                </div>
            ) : (
                // Miniatura del video con botón de Play
                <div
                    className="aspect-video relative cursor-pointer"
                    onClick={() => setReproduciendo(true)}
                >
                    {/* Miniatura del video de YouTube */}
                    <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Si falla la miniatura HD, usar la estándar
                            (e.target as HTMLImageElement).src =
                                `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                        }}
                    />
                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    {/* Logo de YouTube */}
                    <div className="absolute top-3 right-3">
                        <Video className="w-6 h-6 text-red-500" />
                    </div>
                    {/* Botón de Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-vinotinto/80 backdrop-blur-sm
                            flex items-center justify-center border-2 border-white/20
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
                <p className="text-xs text-white/40">{video.descripcion}</p>
            </div>
        </div>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SeccionPresentaciones
// ============================================================
const SeccionPresentaciones = () => {
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });
    const [indiceCarrusel, setIndiceCarrusel] = useState(0);

    // Navegar al foto anterior en el carrusel
    const anteriorFoto = () => {
        setIndiceCarrusel(prev => (prev === 0 ? FOTOS_GALERIA.length - 1 : prev - 1));
    };

    // Navegar a la foto siguiente en el carrusel
    const siguienteFoto = () => {
        setIndiceCarrusel(prev => (prev === FOTOS_GALERIA.length - 1 ? 0 : prev + 1));
    };

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
                    <p className="text-white/50 max-w-2xl mx-auto">
                        Revive nuestras presentaciones y guarda los mejores momentos de DaCapo.
                    </p>
                </motion.div>

                {/* ---- VIDEOS DE YOUTUBE ---- */}
                <motion.div
                    className="mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold text-white/70 mb-6 flex items-center gap-2">
                        <Video className="w-5 h-5 text-red-500" />
                        Videos
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {VIDEOS_YOUTUBE.map(video => (
                            <TarjetaVideo key={video.id} video={video} />
                        ))}
                    </div>
                </motion.div>

                {/* ---- CARRUSEL DE FOTOS ---- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    <h3 className="text-xl font-semibold text-white/70 mb-6">Galería de Fotos</h3>

                    {/* Carrusel principal */}
                    <div className="relative">
                        {/* Foto principal */}
                        <div className="aspect-video rounded-2xl overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={indiceCarrusel}
                                    src={FOTOS_GALERIA[indiceCarrusel].src}
                                    alt={FOTOS_GALERIA[indiceCarrusel].alt}
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </AnimatePresence>

                            {/* Descripción de la foto */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70">
                                <p className="text-white font-medium">{FOTOS_GALERIA[indiceCarrusel].alt}</p>
                                <p className="text-white/50 text-sm">{indiceCarrusel + 1} / {FOTOS_GALERIA.length}</p>
                            </div>
                        </div>

                        {/* Botones de navegación */}
                        <button
                            onClick={anteriorFoto}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/50 backdrop-blur-sm border border-white/20
                         flex items-center justify-center text-white
                         hover:bg-vinotinto transition-all duration-300"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={siguienteFoto}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/50 backdrop-blur-sm border border-white/20
                         flex items-center justify-center text-white
                         hover:bg-vinotinto transition-all duration-300"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Miniaturas del carrusel */}
                    <div className="flex gap-3 mt-4 overflow-x-auto sin-scrollbar py-2">
                        {FOTOS_GALERIA.map((foto, indice) => (
                            <button
                                key={foto.id}
                                onClick={() => setIndiceCarrusel(indice)}
                                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${indice === indiceCarrusel ? 'border-vinotinto' : 'border-transparent opacity-60 hover:opacity-80'
                                    }`}
                            >
                                <img src={foto.src} alt={foto.alt} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

// Necesitamos importar AnimatePresence para el carrusel
import { AnimatePresence } from 'framer-motion';

export default SeccionPresentaciones;
