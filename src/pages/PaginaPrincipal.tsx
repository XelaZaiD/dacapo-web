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
import BotonWhatsApp from '../components/ui/BotonWhatsApp';
import Footer from '../components/layout/Footer';
import EfectoCursor from '../components/ui/EfectoCursor';
import { useApp } from '../context/AppContext';

const PaginaPrincipal = () => {
    const { configuracionSecciones } = useApp();

    return (
        <>
            <EfectoCursor />
            <Navbar />

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

            <Footer />

            <ReproductorAudio />

            {configuracionSecciones.tipoAsistente === 'chatbot' && <Chatbot />}
            {configuracionSecciones.tipoAsistente === 'whatsapp' && <BotonWhatsApp />}
        </>
    );
};

export default PaginaPrincipal;
