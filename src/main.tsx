/**
 * ============================================================
 * ARCHIVO: src/main.tsx
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el PUNTO DE PARTIDA de toda la aplicación web.
 * Toma el componente <App /> y lo "inyecta" en el archivo index.html.
 * 
 * También es aquí donde envolvemos nuestra aplicación con el
 * <AppProvider>, lo que le da "vida" (datos) a todo el proyecto.
 * ============================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import './index.css'; // Nuestros estilos globales

// Busca el elemento <div id="root"> en index.html y renderiza React ahí
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvemos la App con los datos (Contexto Global) */}
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
