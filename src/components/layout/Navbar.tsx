/**
 * ============================================================
 * ARCHIVO: src/components/layout/Navbar.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es la barra de navegación que aparece en la parte superior
 * de la página. Incluye el logo, los links de navegación,
 * el botón de modo oscuro/claro y el botón de login.
 *
 * ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
 * - AppContext.tsx: para saber si el usuario está logueado y el modo
 * - ModalAuth.tsx: abre el modal de login/registro al hacer clic
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * - Para cambiar los textos del menú: modifica el array "itemsNavegacion"
 * - Para cambiar el logo: modifica el elemento <span> con "DaCapo"
 * ============================================================
 */

import { useState, useEffect } from 'react';
// "motion" de Framer Motion añade animaciones fácilmente
import { motion, AnimatePresence } from 'framer-motion';
// Lucide React nos da íconos SVG listos para usar
import { Menu, X, Moon, Sun, LogIn, LogOut, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ModalAuth from '../ui/ModalAuth';
import LogoDaCapo from '../ui/LogoDaCapo';

// ============================================================
// DATOS: Items del menú de navegación
// ============================================================
// Cada item tiene: el texto visible ("etiqueta") y el destino ("#seccion")
const itemsNavegacion = [
    { etiqueta: 'Inicio', href: '#inicio' },
    { etiqueta: 'Nosotros', href: '#nosotros' },
    { etiqueta: 'Integrantes', href: '#integrantes' },
    { etiqueta: 'Presentaciones', href: '#presentaciones' },
    { etiqueta: 'Eventos', href: '#eventos' },
    { etiqueta: 'Partituras', href: '#biblioteca' },
    { etiqueta: 'Contacto', href: '#contacto' },
];

// ============================================================
// COMPONENTE: Navbar
// ============================================================
const Navbar = () => {
    // Lee los datos del contexto global
    const { estaLogueado, esAdmin, usuarioActual, cerrarSesion, modoOscuro, toggleModoOscuro, configuracionSecciones, modalAuthAbierto, abrirModalAuth, cerrarModalAuth } = useApp();

    // Estado local: si el menú móvil está abierto
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    // Estado local: si el navbar tiene fondo (al hacer scroll)
    const [navConFondo, setNavConFondo] = useState(false);
    // Estado local: si el menú de usuario está abierto
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

    // Detecta dispositivos táctiles (sin hover real) para reducir el
    // zoom del logo al tocar: en móvil 1.3, en PC 1.75
    const esHoverTactil = typeof window !== 'undefined'
        && window.matchMedia('(pointer: coarse)').matches;

    // Este efecto escucha el scroll de la página y activa el fondo
    // del navbar cuando el usuario baja más de 50 píxeles
    useEffect(() => {
        const alHacerScroll = () => {
            setNavConFondo(window.scrollY > 50);
        };
        // Añadimos el listener (escuchador) del evento scroll
        window.addEventListener('scroll', alHacerScroll);
        // Cuando el componente se desmonte, quitamos el listener
        // para evitar fugas de memoria
        return () => window.removeEventListener('scroll', alHacerScroll);
    }, []); // Array vacío = solo se ejecuta al montar el componente

    // Filtra los items del menú según qué secciones están activas
    const itemsFiltrados = itemsNavegacion.filter(item => {
        if (item.href === '#eventos' && !configuracionSecciones.mostrarEventos) return false;
        if (item.href === '#biblioteca' && !configuracionSecciones.mostrarBiblioteca) return false;
        return true;
    });

    // Función para hacer scroll suave al hacer clic en un link
    const hacerScrollA = (href: string) => {
        setMenuMovilAbierto(false); // Cierra el menú móvil si está abierto
        const elemento = document.querySelector(href);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* ---- BARRA DE NAVEGACIÓN ---- */}
            {/* "motion.nav" añade animaciones de Framer Motion al elemento nav */}
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navConFondo
                        ? 'bg-fondo-oscuro/95 backdrop-blur-md border-b borde-subtle shadow-lg'
                        : 'bg-transparent'
                    }`}
                initial={{ y: -100 }}           // Empieza 100px arriba (oculto)
                animate={{ y: 0 }}              // Se mueve a su posición normal
                transition={{ duration: 0.6 }}  // Duración de la animación: 0.6 segundos
            >
                <div className="contenedor">
                    <div className="flex items-center justify-between h-16 md:h-20">

                        {/* ---- LOGO ---- */}
                        <Link to="/" className="flex items-center shrink-0" aria-label="DaCapo - Volver al inicio">
                            {/* Logo oficial (incluye nombre y subtítulo del grupo) */}
                            <LogoDaCapo
                                className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
                                colorClase="text-secundario"
                                escalaHover={esHoverTactil ? 1.3 : 1.75}
                            />
                        </Link>

                        {/* ---- MENÚ DE NAVEGACIÓN (DESKTOP) ---- */}
                        {/* Solo visible en pantallas medianas y grandes (md:flex) */}
                        <nav className="hidden md:flex items-center gap-1">
                            {/* Recorremos los items y creamos un botón para cada uno */}
                            {itemsFiltrados.map(item => (
                                <button
                                    key={item.href}  // "key" es necesaria cuando renderizamos listas en React
                                    onClick={() => hacerScrollA(item.href)}
                                    className="px-3 py-2 text-sm font-medium t-muted-high hover:text-khaki
                             hover:bg-sutil rounded-lg transition-all duration-200"
                                >
                                    {item.etiqueta}
                                </button>
                            ))}
                        </nav>

                        {/* ---- ACCIONES DEL LADO DERECHO ---- */}
                        <div className="flex items-center gap-2">

                            {/* Botón de Modo Oscuro/Claro */}
                            <button
                                onClick={toggleModoOscuro}
                                className="w-9 h-9 flex items-center justify-center rounded-lg
                           t-muted-high hover:text-khaki hover:bg-sutil
                           transition-all duration-200"
                                aria-label="Cambiar tema"
                            >
                                {/* Si modoOscuro es true, muestra el ícono del sol; si no, la luna */}
                                {modoOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {/* Si el usuario está logueado, mostrar su menú */}
                            {estaLogueado ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg
                               bg-sutil hover:bg-sutil-hover transition-all duration-200"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-vinotinto flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="hidden sm:block text-sm t-muted-high max-w-[100px] truncate">
                                            {usuarioActual?.nombre}
                                        </span>
                                    </button>

                                    {/* Menú desplegable del usuario */}
                                    <AnimatePresence>
                                        {menuUsuarioAbierto && (
                                            <motion.div
                                                className="absolute right-0 mt-2 w-48 card-glass rounded-xl overflow-hidden
                                   border borde-subtle shadow-xl"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {/* Solo admin puede ver el Panel de Admin */}
                                                {esAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setMenuUsuarioAbierto(false)}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-khaki
                                       hover:bg-sutil-hover transition-colors"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                        Panel Admin
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => { cerrarSesion(); setMenuUsuarioAbierto(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400
                                     hover:bg-sutil-hover transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Cerrar Sesión
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // Si NO está logueado, mostrar botón de Iniciar Sesión
                                <button
                                    onClick={() => abrirModalAuth()}
                                    className="hidden sm:flex btn-primario text-sm py-2 px-4"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Iniciar Sesión
                                </button>
                            )}

                            {/* Botón de menú hamburguesa (solo en móvil) */}
                            <button
                                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                           t-muted-high hover:text-khaki hover:bg-sutil transition-all"
                            >
                                {menuMovilAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---- MENÚ MÓVIL ---- */}
                {/* AnimatePresence permite animar la entrada y salida del componente */}
                <AnimatePresence>
                    {menuMovilAbierto && (
                        <motion.div
                            className="md:hidden bg-fondo-oscuro/98 backdrop-blur-xl border-t borde-subtle"
                            initial={{ height: 0, opacity: 0 }}   // Estado inicial (oculto)
                            animate={{ height: 'auto', opacity: 1 }} // Estado visible
                            exit={{ height: 0, opacity: 0 }}       // Estado al desaparecer
                            transition={{ duration: 0.3 }}
                        >
                            <div className="contenedor py-4 flex flex-col gap-1">
                                {itemsFiltrados.map(item => (
                                    <button
                                        key={item.href}
                                        onClick={() => hacerScrollA(item.href)}
                                        className="text-left px-4 py-3 t-muted-high hover:text-khaki
                               hover:bg-sutil rounded-lg transition-all duration-200"
                                    >
                                        {item.etiqueta}
                                    </button>
                                ))}
                                {/* En móvil también mostramos el botón de login */}
                                {!estaLogueado && (
                                    <button
                                        onClick={() => { abrirModalAuth(); setMenuMovilAbierto(false); }}
                                        className="btn-primario mt-2 justify-center"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Iniciar Sesión
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ---- MODAL DE AUTENTICACIÓN ---- */}
            {/* Solo se renderiza cuando modalAuthAbierto es true */}
            {modalAuthAbierto && (
                <ModalAuth
                    alCerrar={cerrarModalAuth}
                />
            )}
        </>
    );
};

export default Navbar;
