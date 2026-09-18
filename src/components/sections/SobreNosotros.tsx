/**
 * ============================================================
 * ARCHIVO: src/components/sections/SobreNosotros.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Sección "Sobre Nosotros" con la historia, misión y visión
 * del grupo. Incluye contadores animados de estadísticas.
 *
 * ¿CÓMO EDITARLO?
 * - Los textos de misión y visión se editan en el Panel Admin
 *   o directamente en mockData.ts
 * - Los contadores toman sus valores de infoGrupo en el contexto
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Star, Users, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ============================================================
// COMPONENTE AUXILIAR: ContadorAnimado
// ============================================================
// Este componente muestra un número que "cuenta" desde 0
// hasta el valor final cuando aparece en pantalla.
const ContadorAnimado = ({ valorFinal, sufijo = '' }: { valorFinal: number; sufijo?: string }) => {
    const [valorActual, setValorActual] = useState(0);
    const ref = useRef(null);
    // "isInView" es true cuando el elemento es visible en la pantalla
    const estaEnPantalla = useInView(ref, { once: true }); // "once: true" = se anima solo la primera vez

    useEffect(() => {
        if (!estaEnPantalla) return;

        let inicio = 0;
        const incremento = valorFinal / 60; // Divide el valor final en 60 pasos

        // setInterval llama a la función cada X milisegundos
        const intervalo = setInterval(() => {
            inicio += incremento;
            if (inicio >= valorFinal) {
                setValorActual(valorFinal);
                clearInterval(intervalo); // Detiene el conteo cuando llega al final
            } else {
                setValorActual(Math.floor(inicio));
            }
        }, 30); // Se actualiza cada 30ms → ~33 veces por segundo

        return () => clearInterval(intervalo); // Limpieza al desmontar
    }, [estaEnPantalla, valorFinal]);

    return (
        <span ref={ref}>
            {valorActual}{sufijo}
        </span>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL: SobreNosotros
// ============================================================
const SobreNosotros = () => {
    const { infoGrupo, integrantes } = useApp();
    const ref = useRef(null);
    const estaEnPantalla = useInView(ref, { once: true, margin: '-100px' });

    const aniosTrayectoria = new Date().getFullYear() - infoGrupo.anioFundacion;

    // Valores para los contadores
    const estadisticas = [
        { icono: <Star className="w-6 h-6" />, valor: aniosTrayectoria, sufijo: '+', etiqueta: 'Años de Trayectoria' },
        { icono: <Music className="w-6 h-6" />, valor: infoGrupo.totalConciertos, sufijo: '+', etiqueta: 'Conciertos Realizados' },
        { icono: <Users className="w-6 h-6" />, valor: integrantes.length, sufijo: '', etiqueta: 'Integrantes Activos' },
        { icono: <Heart className="w-6 h-6" />, valor: infoGrupo.totalPartituras, sufijo: '+', etiqueta: 'Partituras en Repertorio' },
    ];

    return (
        <section id="nosotros" className="py-24 bg-fondo-card relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 text-[20rem] font-display text-vinotinto leading-none select-none">
                    ♬
                </div>
            </div>

            <div className="contenedor relative z-10" ref={ref}>

                {/* ---- ENCABEZADO DE SECCIÓN ---- */}
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="badge-vinotinto mb-4 inline-flex">
                        <Heart className="w-3 h-3" />
                        Nuestra Historia
                    </span>
                    <h2 className="titulo-seccion mb-4">Sobre Nosotros</h2>
                    <div className="linea-decorativa mx-auto mb-6" />
                    <p className="t-muted-high text-lg max-w-3xl mx-auto leading-relaxed">
                        {infoGrupo.descripcion}
                    </p>
                </motion.div>

                {/* ---- MISIÓN Y VISIÓN ---- */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {/* Misión */}
                    <motion.div
                        className="card-glass p-8 rounded-2xl group"
                        initial={{ opacity: 0, x: -40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {/* Ícono decorativo */}
                        <div className="w-12 h-12 rounded-xl bg-vinotinto/20 border border-vinotinto/30 
                            flex items-center justify-center mb-6
                            group-hover:bg-vinotinto/30 transition-colors duration-300">
                            <span className="text-vinotinto-claro text-2xl font-display">M</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-secundario mb-4">
                            Nuestra Misión
                        </h3>
                        <p className="t-muted-high leading-relaxed">
                            {infoGrupo.mision}
                        </p>
                    </motion.div>

                    {/* Visión */}
                    <motion.div
                        className="card-glass p-8 rounded-2xl group"
                        initial={{ opacity: 0, x: 40 }}
                        animate={estaEnPantalla ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-khaki/10 border border-khaki/30 
                            flex items-center justify-center mb-6
                            group-hover:bg-khaki/20 transition-colors duration-300">
                            <span className="text-khaki text-2xl font-display">V</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-secundario mb-4">
                            Nuestra Visión
                        </h3>
                        <p className="t-muted-high leading-relaxed">
                            {infoGrupo.vision}
                        </p>
                    </motion.div>
                </div>

                {/* ---- CONTADORES DE ESTADÍSTICAS ---- */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 40 }}
                    animate={estaEnPantalla ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.5 }}
                >
                    {estadisticas.map((stat, indice) => (
                        <div
                            key={indice}
                            className="card-glass p-6 rounded-xl text-center group hover:border-vinotinto/30
                         border borde-subtle transition-all duration-300"
                        >
                            {/* Ícono */}
                            <div className="w-12 h-12 rounded-full bg-vinotinto/20 flex items-center justify-center
                              mx-auto mb-4 text-vinotinto-claro 
                              group-hover:bg-vinotinto group-hover:text-white transition-all duration-300">
                                {stat.icono}
                            </div>
                            {/* Número animado */}
                            <div className="text-4xl font-display font-black texto-gradiente mb-1">
                                <ContadorAnimado valorFinal={stat.valor} sufijo={stat.sufijo} />
                            </div>
                            {/* Etiqueta */}
                            <p className="text-xs t-muted uppercase tracking-wider">
                                {stat.etiqueta}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* ---- AÑO DE FUNDACIÓN ---- */}
                <motion.p
                    className="text-center mt-8 t-muted-low text-sm"
                    initial={{ opacity: 0 }}
                    animate={estaEnPantalla ? { opacity: 1 } : {}}
                    transition={{ delay: 1 }}
                >
                    Fundado en {infoGrupo.anioFundacion} · {infoGrupo.emailContacto}
                </motion.p>

            </div>
        </section>
    );
};

export default SobreNosotros;
