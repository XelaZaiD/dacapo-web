/**
 * ============================================================
 * ARCHIVO: src/App.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el enrutador de la aplicación. Decide qué página mostrar
 * dependiendo de la URL (si es "/" muestra la página principal,
 * si es "/admin" muestra el panel de control).
 * ============================================================
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaginaPrincipal from './pages/PaginaPrincipal';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    // BrowserRouter permite la navegación sin recargar la página web
    <BrowserRouter>
      {/* Routes agrupa todas las posibles rutas de la app */}
      <Routes>

        {/* Ruta principal: Muestra la landing page de DaCapo */}
        <Route path="/" element={<PaginaPrincipal />} />

        {/* Ruta de administración: Muestra el panel de control (protegido por rol) */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Ruta de error (opcional por si alguien entra a un link que no existe) */}
        <Route path="*" element={<PaginaPrincipal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
