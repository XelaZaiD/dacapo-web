/**
 * ============================================================
 * ARCHIVO: tailwind.config.js
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Este archivo configura Tailwind CSS, que es la herramienta
 * que nos permite escribir estilos directamente en el HTML
 * usando clases especiales (como "bg-primario", "text-acento1").
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * - Para cambiar los COLORES del sitio web, modifica la sección
 *   "colors" dentro de "theme > extend".
 * - Cada color tiene un nombre y un valor hexadecimal (#RRGGBB).
 * - Los nombres que definimos aquí se usan como clases en el HTML:
 *   Ej: color "vinotinto" -> clase "bg-vinotinto" o "text-vinotinto"
 * ============================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Le decimos a Tailwind dónde están nuestros archivos para
  // que solo incluya los estilos que realmente usamos (más rápido)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Revisa todos los archivos en /src
  ],

  // darkMode: 'class' significa que el modo oscuro se activa
  // añadiendo la clase "dark" al elemento <html>
  darkMode: 'class',

  theme: {
    extend: {
      // ====================================================
      // PALETA DE COLORES DE DACAPO GRUPO VOCAL
      // ====================================================
      // Para cambiar un color, reemplaza el valor hexadecimal.
      // Ejemplo: 'vinotinto': '#722F37'  ->  'vinotinto': '#8B0000'
      colors: {
        // --- Colores Principales ---
        'primario': '#000000',       // Negro Profundo - Fondo principal modo oscuro
        'secundario': '#FFFFFF',     // Blanco Puro - Textos y fondos modo claro

        // --- Colores de Acento (los más importantes visualmente) ---
        'vinotinto': {
          DEFAULT: '#722F37',        // Vinotinto principal para botones y destacados
          'claro': '#9B4450',        // Versión más clara para hovers
          'oscuro': '#4A1E23',       // Versión más oscura para fondos sutiles
        },
        'khaki': {
          DEFAULT: '#F0E68C',        // Khaki/Dorado para detalles y badges
          'claro': '#F5EDA0',        // Versión más clara
          'oscuro': '#C8C070',       // Versión más oscura
        },

        // --- Fondos Alternativos ---
        'fondo-oscuro': '#0B0C10',   // Gris ultra oscuro (fondo principal)
        'fondo-card': '#121212',     // Fondo de tarjetas en modo oscuro
        'fondo-medio': '#1A1B1F',   // Fondo de secciones intermedias
        'fondo-claro': '#F8F5F0',   // Fondo marfil para modo claro
      },

      // ====================================================
      // FUENTES TIPOGRÁFICAS
      // ====================================================
      fontFamily: {
        // 'sans' es la fuente principal del texto
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        // 'display' es para títulos grandes e impactantes
        'display': ['Playfair Display', 'Georgia', 'serif'],
        // 'mono' para código o texto técnico (poco usado)
        'mono': ['JetBrains Mono', 'monospace'],
      },

      // ====================================================
      // ANIMACIONES PERSONALIZADAS
      // ====================================================
      keyframes: {
        // Animación de notas flotando de abajo hacia arriba
        'float-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateY(-100px)' },
        },
        // Animación de pulso suave
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        // Animación de ecualizador (barras subiendo y bajando)
        'eq-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        // Fade in desde abajo
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        // Efecto shimmer para skeleton loaders
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'float-up': 'float-up 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'eq-bar': 'eq-bar 0.8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },

      // Sombras personalizadas
      boxShadow: {
        'glow-vinotinto': '0 0 20px rgba(114, 47, 55, 0.5)',
        'glow-khaki': '0 0 20px rgba(240, 230, 140, 0.3)',
        'card': '0 4px 16px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(114, 47, 55, 0.3)',
      },

      // Estilos de fondo para glassmorphism
      backdropBlur: {
        'xs': '2px',
      },
    },
  },

  plugins: [],
}
