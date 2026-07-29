/**
 * ============================================================
 * ARCHIVO: src/services/supabase.ts
 * ============================================================
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Este archivo es el PUENTE entre tu aplicación y Supabase.
 * Supabase es como Firebase: un backend gratuito que te da
 * base de datos, autenticación de usuarios y almacenamiento
 * de archivos (como PDFs y fotos).
 *
 * Actualmente (FASE 1), este archivo contiene funciones
 * vacías / comentadas porque aún no conectamos Supabase.
 * Cuando estés listo, solo necesitas:
 *  1. Crear tu proyecto en https://supabase.com (gratis)
 *  2. Copiar la URL del proyecto y la clave anon
 *  3. Pegarlas donde dice "PEGA AQUÍ"
 *  4. Descomentar las funciones reales de base de datos
 *
 * ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
 * - AppContext.tsx: en Fase 2 reemplazará las funciones
 *   de LocalStorage por estas funciones de Supabase
 *
 * ¿CÓMO EDITARLO SI SOY PRINCIPIANTE?
 * Busca los comentarios que dicen "PEGA AQUÍ" y sigue
 * las instrucciones para conectar Supabase.
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// PASO 1: PEGA TUS CREDENCIALES DE SUPABASE AQUÍ
// ============================================================
// Para obtener estas claves:
// 1. Ve a https://supabase.com y crea una cuenta gratuita
// 2. Crea un nuevo proyecto
// 3. Ve a Settings > API
// 4. Copia "Project URL" y pégalo en SUPABASE_URL
// 5. Copia "anon public" y pégalo en SUPABASE_ANON_KEY
//
// ⚠️ IMPORTANTE: La clave "anon" es pública y segura para el frontend.
//    NUNCA pegues la clave "service_role" aquí (esa es secreta).

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';      // ← PEGA AQUÍ tu URL
const SUPABASE_ANON_KEY = 'TU-CLAVE-PUBLICA-AQUI';          // ← PEGA AQUÍ tu clave

// ============================================================
// CREAR EL CLIENTE DE SUPABASE
// ============================================================
// Esta línea crea la conexión con Supabase.
// Si las credenciales son inválidas, la app seguirá funcionando
// con LocalStorage (Fase 1).
let supabase: ReturnType<typeof createClient> | null = null;

try {
    // Solo creamos la conexión si las credenciales parecen reales
    if (SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 20) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado correctamente');
    } else {
        console.log('ℹ️ Supabase no configurado. Usando datos locales (Fase 1).');
    }
} catch (error) {
    console.warn('⚠️ Error al conectar Supabase:', error);
}

// Exportamos el cliente para usarlo en otros archivos
export { supabase };

// ============================================================
// PASO 2: ESTRUCTURA DE LA BASE DE DATOS EN SUPABASE
// ============================================================
// Cuando conectes Supabase, crea estas tablas en el
// SQL Editor de tu proyecto Supabase:
//
// -- Tabla de integrantes:
// CREATE TABLE integrantes (
//   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   nombre TEXT NOT NULL,
//   cuerda TEXT NOT NULL,
//   rango_vocal TEXT,
//   foto TEXT,
//   biografia TEXT,
//   es_directivo BOOLEAN DEFAULT false,
//   cargo TEXT,
//   created_at TIMESTAMP DEFAULT NOW()
// );
//
// -- Tabla de partituras:
// CREATE TABLE partituras (
//   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   titulo TEXT NOT NULL,
//   compositor TEXT NOT NULL,
//   arreglista TEXT,
//   cuerdas TEXT[],
//   dificultad TEXT,
//   estilo TEXT,
//   epoca TEXT,
//   descripcion TEXT,
//   url_pdf TEXT,
//   url_portada TEXT,
//   fecha_subida TIMESTAMP DEFAULT NOW()
// );
//
// -- Tabla de eventos:
// CREATE TABLE eventos (
//   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   titulo TEXT NOT NULL,
//   descripcion TEXT,
//   fecha TIMESTAMP NOT NULL,
//   lugar TEXT,
//   direccion TEXT,
//   tipo_entrada TEXT,
//   url_entradas TEXT,
//   url_mapa TEXT,
//   imagen TEXT,
//   activo BOOLEAN DEFAULT true,
//   created_at TIMESTAMP DEFAULT NOW()
// );
//
// -- Tabla de solicitudes de audición:
// CREATE TABLE solicitudes_audicion (
//   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   nombre TEXT NOT NULL,
//   email TEXT NOT NULL,
//   telefono TEXT,
//   tipo_voz TEXT,
//   experiencia TEXT,
//   url_audio_prueba TEXT,
//   fecha_envio TIMESTAMP DEFAULT NOW(),
//   estado TEXT DEFAULT 'Pendiente'
// );
//
// -- Tabla de mensajes de contacto:
// CREATE TABLE mensajes_contacto (
//   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   nombre TEXT NOT NULL,
//   email TEXT NOT NULL,
//   asunto TEXT,
//   mensaje TEXT,
//   fecha_envio TIMESTAMP DEFAULT NOW(),
//   leido BOOLEAN DEFAULT false
// );

// ============================================================
// FUNCIONES DE AUTENTICACIÓN (Fase 2 - Supabase Auth)
// ============================================================
// En Fase 2, reemplaza las funciones de AppContext.tsx
// con estas funciones reales de Supabase.

/**
 * Iniciar sesión con Supabase Auth (Fase 2)
 * Para activar: reemplaza la función iniciarSesion en AppContext.tsx
 */
export const iniciarSesionSupabase = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };

    // Supabase tiene su propio sistema de login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
};

/**
 * Registrar usuario con Supabase Auth (Fase 2)
 */
export const registrarUsuarioSupabase = async (email: string, password: string, nombre: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nombre } // Guardamos el nombre en los metadatos del usuario
        }
    });
    return { data, error };
};

/**
 * Cerrar sesión con Supabase Auth (Fase 2)
 */
export const cerrarSesionSupabase = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// ============================================================
// FUNCIONES DE BASE DE DATOS (Fase 2 - Supabase DB)
// ============================================================

/**
 * Obtener todos los integrantes desde la base de datos (Fase 2)
 */
export const obtenerIntegrantesDB = async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('integrantes').select('*');
    if (error) { console.error('Error al obtener integrantes:', error); return null; }
    return data;
};

/**
 * Subir un PDF al Storage de Supabase (Fase 2)
 * El Storage es como Google Drive pero para tu app.
 */
export const subirPdfSupabase = async (archivo: File, nombreArchivo: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
        .from('partituras')          // Nombre del "bucket" (carpeta) en Storage
        .upload(nombreArchivo, archivo);

    if (error) { console.error('Error al subir PDF:', error); return null; }

    // Obtenemos la URL pública del archivo subido
    const { data: urlData } = supabase.storage
        .from('partituras')
        .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
};

// Exportamos el cliente principal
export default supabase;
