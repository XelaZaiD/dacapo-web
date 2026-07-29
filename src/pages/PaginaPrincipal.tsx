/**
 * ============================================================
 * ARCHIVO: src/pages/PaginaPrincipal.tsx
 * ============================================================
 * La página principal que agrupa todas las secciones públicas.
 * ============================================================
 */

import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import SobreNosotros from '../components/sections/SobreNosotros';
import SeccionIntegrantes from '../components/sections/Integrantes';
import SeccionPresentaciones from '../components/sections/Presentaciones';
import SeccionEventos from '../components/sections/Eventos';
import SeccionBiblioteca from '../components/sections/Biblioteca';
import SeccionAudiciones from '../components/sections/Audiciones';
import SeccionContacto from '../components/sections/Contacto';
import ReproductorAudio from '../components/ui/ReproductorAudio';
import Chatbot from '../components/ui/Chatbot';
import Footer from '../components/layout/Footer';

const PaginaPrincipal = () => {
    return (
        <>
            {/* Barra de navegación fija en la parte superior */}
            <Navbar />

            {/* Contenido principal: todas las secciones en orden */}
            <main>
                <HeroSection />
                <SobreNosotros />
                <SeccionIntegrantes />
                <SeccionPresentaciones />
                <SeccionEventos />
                <SeccionBiblioteca />
                <SeccionAudiciones />
                <SeccionContacto />
            </main>

            {/* Pie de página */}
            <Footer />

            {/* Componentes flotantes (siempre visibles) */}
            <ReproductorAudio />
            <Chatbot />
        </>
    );
};

export default PaginaPrincipal;
