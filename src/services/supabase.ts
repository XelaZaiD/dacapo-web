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

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PistaAudio, Partitura, Integrante } from '../data/mockData';

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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-CLAVE-PUBLICA-AQUI';

// ============================================================
// CREAR EL CLIENTE DE SUPABASE
// ============================================================
// Esta línea crea la conexión con Supabase.
// Si las credenciales son inválidas, la app seguirá funcionando
// con LocalStorage (Fase 1).
let supabase: SupabaseClient<any> | null = null;

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
// Consulta instrucciones/01-Supabase.txt para el SQL completo con
// buckets y politicas RLS listos para ejecutar.
//
// -- Tabla de pistas de audio (Módulo 1):
// CREATE TABLE pistas_audio (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   titulo TEXT NOT NULL,
//   compositor TEXT,
//   duracion TEXT,
//   url_audio TEXT NOT NULL,
//   portada TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
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

type FilaIntegrante = Record<string, any>;

/**
 * Convierte una fila de la base de datos en el objeto Integrante que usa la app
 */
const mapearIntegrante = (row: FilaIntegrante): Integrante => ({
    id: row.id,
    nombre: row.nombre,
    cuerda: row.cuerda || 'Soprano',
    rangoVocal: row.rango_vocal || '',
    foto: row.foto || '',
    biografia: row.biografia || '',
    esDirectivo: !!row.es_directivo,
    cargo: row.cargo || undefined,
    orden: row.orden ?? undefined,
    anioIngreso: row.anio_ingreso ?? undefined,
    urlInstagram: row.url_instagram || undefined,
});

/**
 * Convierte el objeto Integrante de la app en una fila para insertar/actualizar
 */
const integranteAFila = (integrante: Partial<Integrante>) => {
    const fila: FilaIntegrante = {};
    if (integrante.nombre !== undefined) fila.nombre = integrante.nombre;
    if (integrante.cuerda !== undefined) fila.cuerda = integrante.cuerda;
    if (integrante.rangoVocal !== undefined) fila.rango_vocal = integrante.rangoVocal;
    if (integrante.foto !== undefined) fila.foto = integrante.foto;
    if (integrante.biografia !== undefined) fila.biografia = integrante.biografia;
    if (integrante.esDirectivo !== undefined) fila.es_directivo = integrante.esDirectivo;
    if (integrante.cargo !== undefined) fila.cargo = integrante.cargo;
    if (integrante.orden !== undefined) fila.orden = integrante.orden;
    if (integrante.anioIngreso !== undefined) fila.anio_ingreso = integrante.anioIngreso;
    if (integrante.urlInstagram !== undefined) fila.url_instagram = integrante.urlInstagram;
    return fila;
};

/**
 * Obtener todos los integrantes desde la base de datos (Módulo 2)
 * Ordenados por 'orden' y luego por fecha de creación.
 */
export const obtenerIntegrantesDB = async (): Promise<Integrante[] | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('integrantes')
        .select('*')
        .order('orden', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) { console.error('Error al obtener integrantes:', error); return null; }
    return (data || []).map(mapearIntegrante);
};

/**
 * Agregar un nuevo integrante a Supabase
 */
export const agregarIntegranteDB = async (integrante: Omit<Integrante, 'id'>): Promise<Integrante | null> => {
    if (!supabase) return null;
    const { data, error } = await (supabase.from('integrantes') as any)
        .insert([integranteAFila(integrante)])
        .select()
        .single();

    if (error) {
        console.error('Error al agregar integrante:', error);
        return null;
    }
    return mapearIntegrante(data);
};

/**
 * Editar un integrante existente en Supabase
 */
export const editarIntegranteDB = async (id: string, datos: Partial<Integrante>): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await (supabase.from('integrantes') as any)
        .update(integranteAFila(datos))
        .eq('id', id);

    if (error) {
        console.error('Error al actualizar integrante:', error);
        return false;
    }
    return true;
};

/**
 * Eliminar un integrante DEFINITIVAMENTE de la base de datos
 */
export const eliminarIntegranteDB = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await (supabase.from('integrantes') as any)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar integrante:', error);
        return false;
    }
    return true;
};

/**
 * Subir una foto de integrante al Storage de Supabase (bucket 'integrantes', carpeta 'fotos')
 */
export const subirFotoIntegranteSupabase = async (archivo: File): Promise<string | null> => {
    if (!supabase) return null;

    const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(new RegExp(`\\.${extension}$`, 'i'), '');
    const rutaArchivo = `fotos/${Date.now()}_${nombreLimpio}.${extension}`;

    const { error } = await supabase.storage
        .from('integrantes')
        .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error al subir foto de integrante:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('integrantes')
        .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
};

/**
 * Subir un PDF al Storage de Supabase (Fase 2)
 * El Storage es como Google Drive pero para tu app.
 */
export const subirPdfSupabase = async (archivo: File, nombreArchivo: string) => {
    if (!supabase) return null;

    const { error } = await supabase.storage
        .from('partituras')          // Nombre del "bucket" (carpeta) en Storage
        .upload(nombreArchivo, archivo);

    if (error) { console.error('Error al subir PDF:', error); return null; }

    // Obtenemos la URL pública del archivo subido
    const { data: urlData } = supabase.storage
        .from('partituras')
        .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
};

// ============================================================
// FUNCIONES PARA REPRODUCTOR MUSICAL (Módulo 1 - Supabase)
// ============================================================

/**
 * Obtener todas las pistas de audio desde Supabase
 */
export const obtenerPistasDB = async (): Promise<PistaAudio[] | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('pistas_audio')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error al obtener pistas de audio:', error);
        return null;
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        compositor: row.compositor || '',
        duracion: row.duracion || '0:00',
        urlAudio: row.url_audio,
        portada: row.portada || undefined,
    }));
};

/**
 * Agregar una nueva pista de audio a Supabase
 */
export const agregarPistaDB = async (pista: Omit<PistaAudio, 'id'>): Promise<PistaAudio | null> => {
    if (!supabase) return null;
    const { data, error } = await (supabase.from('pistas_audio') as any)
        .insert([{
            titulo: pista.titulo,
            compositor: pista.compositor,
            duracion: pista.duracion,
            url_audio: pista.urlAudio,
            portada: pista.portada || null,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error al agregar pista:', error);
        return null;
    }

    return {
        id: data.id,
        titulo: data.titulo,
        compositor: data.compositor || '',
        duracion: data.duracion || '0:00',
        urlAudio: data.url_audio,
        portada: data.portada || undefined,
    };
};

/**
 * Editar una pista de audio existente en Supabase
 */
export const editarPistaDB = async (id: string, datos: Partial<PistaAudio>): Promise<boolean> => {
    if (!supabase) return false;
    const updateData: Record<string, any> = {};
    if (datos.titulo !== undefined) updateData.titulo = datos.titulo;
    if (datos.compositor !== undefined) updateData.compositor = datos.compositor;
    if (datos.duracion !== undefined) updateData.duracion = datos.duracion;
    if (datos.urlAudio !== undefined) updateData.url_audio = datos.urlAudio;
    if (datos.portada !== undefined) updateData.portada = datos.portada;

    const { error } = await (supabase.from('pistas_audio') as any)
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error al actualizar pista:', error);
        return false;
    }
    return true;
};

/**
 * Eliminar una pista de audio en Supabase
 */
export const eliminarPistaDB = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await (supabase.from('pistas_audio') as any)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar pista:', error);
        return false;
    }
    return true;
};

/**
 * Subir un archivo de audio .mp3 al Storage de Supabase (bucket 'audio')
 */
export const subirAudioSupabase = async (archivo: File): Promise<string | null> => {
    if (!supabase) return null;

    const extension = archivo.name.split('.').pop()?.toLowerCase() || 'mp3';
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(new RegExp(`\\.${extension}$`, 'i'), '');
    const rutaArchivo = `pistas/${Date.now()}_${nombreLimpio}.${extension}`;

    const { error } = await supabase.storage
        .from('audio')
        .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'audio/mpeg',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error al subir archivo de audio a Supabase Storage:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
};

/**
 * Subir una imagen de portada al Storage de Supabase (bucket 'audio', carpeta 'portadas')
 */
export const subirPortadaAudioSupabase = async (archivo: File): Promise<string | null> => {
    if (!supabase) return null;

    const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(new RegExp(`\\.${extension}$`, 'i'), '');
    const rutaArchivo = `portadas/${Date.now()}_${nombreLimpio}.${extension}`;

    const { error } = await supabase.storage
        .from('audio')
        .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error al subir portada a Supabase Storage:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
};

// ============================================================
// FUNCIONES PARA BIBLIOTECA DE PARTITURAS (Módulo 3 - Supabase)
// ============================================================

type FilaPartitura = Record<string, any>;

/**
 * Convierte una fila de la base de datos en el objeto Partitura que usa la app
 */
const mapearPartitura = (row: FilaPartitura): Partitura => ({
    id: row.id,
    titulo: row.titulo,
    compositor: row.compositor,
    arreglista: row.arreglista || undefined,
    cuerdas: row.cuerdas || [],
    dificultad: row.dificultad || 'Básico',
    estilo: row.estilo || '',
    epoca: row.epoca || '',
    tonalidad: row.tonalidad || undefined,
    compas: row.compas || undefined,
    paginas: row.paginas ?? undefined,
    descripcion: row.descripcion || '',
    urlPdf: row.url_pdf || undefined,
    urlPortada: row.url_portada || undefined,
    descargable: !!row.descargable,
    activo: row.activo !== false,
    fechaSubida: row.fecha_subida || '',
});

/**
 * Convierte el objeto Partitura de la app en una fila para insertar/actualizar
 */
const partituraAFila = (p: Partial<Partitura>) => {
    const fila: FilaPartitura = {};
    if (p.titulo !== undefined) fila.titulo = p.titulo;
    if (p.compositor !== undefined) fila.compositor = p.compositor;
    if (p.arreglista !== undefined) fila.arreglista = p.arreglista;
    if (p.cuerdas !== undefined) fila.cuerdas = p.cuerdas;
    if (p.dificultad !== undefined) fila.dificultad = p.dificultad;
    if (p.estilo !== undefined) fila.estilo = p.estilo;
    if (p.epoca !== undefined) fila.epoca = p.epoca;
    if (p.tonalidad !== undefined) fila.tonalidad = p.tonalidad;
    if (p.compas !== undefined) fila.compas = p.compas;
    if (p.paginas !== undefined) fila.paginas = p.paginas;
    if (p.descripcion !== undefined) fila.descripcion = p.descripcion;
    if (p.urlPdf !== undefined) fila.url_pdf = p.urlPdf;
    if (p.urlPortada !== undefined) fila.url_portada = p.urlPortada;
    if (p.descargable !== undefined) fila.descargable = p.descargable;
    if (p.activo !== undefined) fila.activo = p.activo;
    return fila;
};

/**
 * Obtener todas las partituras desde Supabase
 */
export const obtenerPartiturasDB = async (): Promise<Partitura[] | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('partituras')
        .select('*')
        .order('fecha_subida', { ascending: false });

    if (error) {
        console.error('Error al obtener partituras:', error);
        return null;
    }
    return (data || []).map(mapearPartitura);
};

/**
 * Agregar una nueva partitura a Supabase
 */
export const agregarPartituraDB = async (p: Omit<Partitura, 'id' | 'fechaSubida'>): Promise<Partitura | null> => {
    if (!supabase) return null;
    const { data, error } = await (supabase.from('partituras') as any)
        .insert([partituraAFila(p)])
        .select()
        .single();

    if (error) {
        console.error('Error al agregar partitura:', error);
        return null;
    }
    return mapearPartitura(data);
};

/**
 * Editar una partitura existente en Supabase
 */
export const editarPartituraDB = async (id: string, datos: Partial<Partitura>): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await (supabase.from('partituras') as any)
        .update(partituraAFila(datos))
        .eq('id', id);

    if (error) {
        console.error('Error al actualizar partitura:', error);
        return false;
    }
    return true;
};

/**
 * Eliminar una partitura DEFINITIVAMENTE de la base de datos
 * (borrado permanente; no se oculta, se elimina)
 */
export const eliminarPartituraDB = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await (supabase.from('partituras') as any)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar partitura:', error);
        return false;
    }
    return true;
};

/**
 * Subir un PDF de partitura al Storage de Supabase (bucket 'partituras', carpeta 'pdfs')
 */
export const subirPdfPartituraSupabase = async (archivo: File): Promise<string | null> => {
    if (!supabase) return null;

    const extension = (archivo.name.split('.').pop() || 'pdf').toLowerCase();
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(new RegExp(`\\.${extension}$`, 'i'), '');
    const rutaArchivo = `pdfs/${Date.now()}_${nombreLimpio}.${extension}`;

    const { error } = await supabase.storage
        .from('partituras')
        .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'application/pdf',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error al subir PDF de partitura:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('partituras')
        .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
};

/**
 * Subir una imagen de portada de partitura al Storage (bucket 'partituras', carpeta 'portadas')
 */
export const subirPortadaPartituraSupabase = async (archivo: File): Promise<string | null> => {
    if (!supabase) return null;

    const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(new RegExp(`\\.${extension}$`, 'i'), '');
    const rutaArchivo = `portadas/${Date.now()}_${nombreLimpio}.${extension}`;

    const { error } = await supabase.storage
        .from('partituras')
        .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error al subir portada de partitura:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('partituras')
        .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
};

/**
 * Eliminar un archivo del Storage de Supabase (intento, no crítico)
 * Sirve para borrar el PDF del Storage cuando se elimina una partitura.
 */
export const eliminarArchivoStorageSupabase = async (bucket: string, urlPublica: string): Promise<void> => {
    if (!supabase) return;
    try {
        const path = urlPublica.split(`/object/public/${bucket}/`)[1];
        if (!path) return;
        await supabase.storage.from(bucket).remove([path]);
    } catch (error) {
        console.warn('No se pudo borrar el archivo del Storage:', error);
    }
};

// ============================================================
// FUNCIONES DE CONFIGURACIÓN (Módulo 3 - tabla 'configuracion')
// ============================================================

/**
 * Obtener un valor de configuración por su clave (ej: 'vistas_biblioteca')
 */
export const obtenerConfiguracionDB = async <T>(clave: string): Promise<T | null> => {
    if (!supabase) return null;
    const { data, error } = await (supabase.from('configuracion') as any)
        .select('valor')
        .eq('clave', clave)
        .maybeSingle();

    if (error) {
        console.error('Error al obtener configuración:', error);
        return null;
    }
    return data?.valor ?? null;
};

/**
 * Guardar (insertar o actualizar) un valor de configuración por su clave
 */
export const guardarConfiguracionDB = async (clave: string, valor: unknown): Promise<void> => {
    if (!supabase) return;
    const existente = await obtenerConfiguracionDB(clave);
    if (existente !== null) {
        const { error } = await (supabase.from('configuracion') as any)
            .update({ valor })
            .eq('clave', clave);
        if (error) console.error('Error al actualizar configuración:', error);
    } else {
        const { error } = await (supabase.from('configuracion') as any)
            .insert([{ clave, valor }]);
        if (error) console.error('Error al insertar configuración:', error);
    }
};

// Exportamos el cliente principal
export default supabase;
