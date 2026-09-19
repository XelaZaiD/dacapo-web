/**
 * ============================================================
 * ARCHIVO: src/components/ui/VisorPdf.tsx
 * ============================================================
 * Visor de PDF personalizado (react-pdf). NO usa el visor
 * del navegador: renderiza el PDF en un canvas con paginación,
 * zoom y marca de agua "DaCapo Grupo Vocal".
 *
 * El botón "Descargar" solo aparece si el administrador marcó
 * la partitura como descargable.
 * ============================================================
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Download, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';

// Configurar el "worker" de pdf.js desde el CDN de la librería (requisito de react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// Marca de agua del grupo
const MARCA_AGUA = 'DaCapo Grupo Vocal';

type Props = {
    urlPdf: string;
    titulo: string;
    descargable: boolean;
    alCerrar: () => void;
};

const VisorPdf = ({ urlPdf, titulo, descargable, alCerrar }: Props) => {
    const [numPaginas, setNumPaginas] = useState<number | null>(null);
    const [pagina, setPagina] = useState(1);
    const [zoom, setZoom] = useState(1);

    const cambiarPagina = (delta: number) => {
        if (numPaginas === null) return;
        setPagina(prev => Math.min(Math.max(prev + delta, 1), numPaginas));
    };

    const ajustarZoom = (delta: number) => {
        setZoom(prev => Math.min(Math.max(Math.round((prev + delta) * 100) / 100, 0.5), 2));
    };

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[70] flex overflow-y-auto p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={alCerrar}
            >
                <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm pointer-events-none" />
                <motion.div
                    className="relative card-modal w-full max-w-5xl p-5 z-10 m-auto flex flex-col max-h-[calc(100vh-2rem)]"
                    initial={{ scale: 0.92, y: 24 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 24 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Barra superior */}
                    <div className="flex items-center justify-between gap-3 border-b borde-subtle pb-3 mb-3">
                        <div className="min-w-0">
                            <h3 className="font-display font-bold text-secundario text-sm sm:text-lg truncate">
                                {titulo}
                            </h3>
                            <p className="text-[11px] t-muted font-mono">
                                Página {numPaginas ? `${pagina} de ${numPaginas}` : '—'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {/* Controles de zoom */}
                            <button onClick={() => ajustarZoom(-0.25)} className="btn-ghost" title="Alejar">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs t-muted font-mono w-11 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button onClick={() => ajustarZoom(0.25)} className="btn-ghost" title="Acercar">
                                <ZoomIn className="w-4 h-4" />
                            </button>

                            {descargable && (
                                <a
                                    href={urlPdf}
                                    download
                                    className="btn-primario text-xs py-1.5 px-3 ml-1"
                                >
                                    <Download className="w-3.5 h-3.5" /> Descargar
                                </a>
                            )}
                            <button onClick={alCerrar} className="btn-ghost ml-1" title="Cerrar">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Paginación */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button
                            onClick={() => cambiarPagina(-1)}
                            disabled={!numPaginas || pagina <= 1}
                            className="btn-ghost disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>
                        <input
                            type="number"
                            min={1}
                            max={numPaginas || 1}
                            value={pagina}
                            disabled={!numPaginas}
                            onChange={e => {
                                const valor = Math.min(Math.max(Number(e.target.value) || 1, 1), numPaginas || 1);
                                setPagina(valor);
                            }}
                            className="input-campo w-16 !py-1 text-center font-mono text-sm"
                        />
                        <span className="text-xs t-muted">de <span className="font-mono">{numPaginas || '…'}</span></span>
                        <button
                            onClick={() => cambiarPagina(1)}
                            disabled={!numPaginas || pagina >= numPaginas}
                            className="btn-ghost disabled:opacity-30"
                        >
                            Siguiente <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Área del documento con scroll interno */}
                    <div className="flex-1 min-h-0 overflow-auto sin-scrollbar bg-sutil/60 dark:bg-black/20 rounded-xl border borde-subtle p-3">
                        <Document
                            file={urlPdf}
                            onLoadSuccess={({ numPages }) => {
                                setNumPaginas(numPages);
                            }}
                            loading={
                                <div className="flex flex-col items-center justify-center py-16 t-muted">
                                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-vinotinto" />
                                    <p className="text-sm">Cargando partitura...</p>
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center py-16 t-muted">
                                    <p className="text-sm">No se pudo abrir el PDF. Verifica el archivo.</p>
                                </div>
                            }
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative" key={`p-${pagina}-z-${zoom}`}>
                                    <Page
                                        pageNumber={pagina}
                                        scale={zoom}
                                        className="rounded-lg shadow-2xl bg-white"
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                    {/* Marca de agua diagonal (el PDF siempre es blanco, por eso texto oscuro en ambos modos) */}
                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
                                        <span
                                            className="rotate-[-28deg] whitespace-nowrap font-display font-bold tracking-widest
                                            text-black/20 text-3xl sm:text-4xl"
                                        >
                                            {MARCA_AGUA}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </Document>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default VisorPdf;