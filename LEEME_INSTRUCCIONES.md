# 🎵 DaCapo Grupo Vocal - Plataforma Web

¡Hola y bienvenido(a) a tu nuevo proyecto! 
Este documento está diseñado especialmente para guiarte paso a paso, incluso si es tu primera vez viendo código en **React**, **TypeScript** o **Tailwind CSS**.

---

## 📂 1. ¿Cómo está organizada esta carpeta?

Dentro de este proyecto, la carpeta más importante es `/src`. Ahí es donde vive tu código.

*   **`/src/components/`**: Los bloques de construcción (como legos). Hay dos subcarpetas:
    *   **`/layout/`**: Cosas estructurales (El Navbar, el Footer).
    *   **`/sections/`**: Cada "piso" de la página (Hero, Nosotros, Integrantes, Biblioteca).
    *   **`/ui/`**: Componentes pequeños (El Chatbot flotante, el Reproductor de Audio y el Modal de Auth).
*   **`/src/context/` (`AppContext.tsx`)**: ¡El CEREBRO! 🧠 Aquí se guardan los datos, la función de Iniciar Sesión, y todo el almacenamiento temporal (LocalStorage).
*   **`/src/data/` (`mockData.ts`)**: Los datos simulados. Aquí es donde **puedes cambiar manualmente** los textos fijos, agregar integrantes de prueba, subir URLs de canciones, etc.
*   **`/src/pages/`**: Las vistas completas (`PaginaPrincipal.tsx` y el `AdminPanel.tsx`).
*   **`/src/services/` (`supabase.ts`)**: Tu puente hacia el futuro. Donde pegarás las claves de tu base de datos y Storage cuando estés listo.
*   **`tailwind.config.js`**: ¡La paleta de pintura! 🎨 Aquí determinas tus colores ("vinotinto", "khaki").

---

## 🚀 2. ¿Cómo inicio la web en mi computadora?

Para ver la aplicación funcionando, abre la consola (Terminal) en esta carpeta y escribe estos dos sencillos comandos:

1.  **Instala los paquetes (solo una vez):**
    ```bash
    npm install
    ```
2.  **Arranca el servidor local:**
    ```bash
    npm run dev
    ```

Esto te dará un enlace (normalmente `http://localhost:5173`). ¡HazCtrl+Click en él para ver tu obra de arte!

---

## 🎨 3. ¿Cómo le cambio los colores principales?

Ve al archivo `tailwind.config.js` que está en la raíz del proyecto.
Encontrarás una sección llamada `colors: { ... }`. Si quieres que el "vinotinto" ahora sea un "Azul Rey", simplemente cambia el código Hexadecimal:

```javascript
'vinotinto': {
  DEFAULT: '#1E40AF', // <-- Cambia este código por el color que quieras
  // ...
}
```

---

## 🗃️ 4. ¿Cómo y por qué entrar al Panel Admin?

Esta web viene con un sistema de **Dashboard de Administrador**.
Haz clic en "Iniciar Sesión" (arriba a la derecha) y usa estas credenciales en Fase 1:

*   **Email:** `admin@dacapo.com`
*   **Contraseña:** `admin123`

¿Qué puedes hacer en el Admin?
*   Apagar el "Chatbot" o la "Sección de Entradas" con un solo clic.
*   Crear nuevos Integrantes o Eventos en vivo.
*   Leer los mensajes de las personas que llenaron los formularios públicos audiciones (Buzones).

*(Recuerda que como estamos en "Modo de Prueba", lo que guardes en el Admin se quedará en tu navegador -Local Storage-)*

---

## ☁️ 5. Próximos pasos: Conectando Supabase (La Base de Datos REAL)

Ahora mismo, si abres la web en tu celular, no verás los cambios del panel admin que hiciste en tu computadora. Esto es porque aún no hay base de datos online.

Cuando estés listo para el "siguiente nivel":
1. Ve a [Supabase.com](https://supabase.com/) y crea un proyecto gratis.
2. Ve al archivo `src/services/supabase.ts` en este proyecto.
3. Lee las instrucciones didácticas al inicio del archivo y pega allí tus 2 "llaves mágicas" de Supabase.
4. Descomenta las funciones reales. ¡Y tarán, tu app estará en la nube!

---
*Hecho con 🎶 por tu Asistente Antigravity.*
