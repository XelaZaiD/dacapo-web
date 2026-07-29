/**
 * ============================================================
 * ARCHIVO: src/components/ui/ModalAuth.tsx
 * ============================================================
 * Modal de inicio de sesión y registro de usuarios.
 * ============================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Eye, EyeOff, AlertCircle, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Props = { alCerrar: () => void };

// Credenciales de prueba para que el usuario las vea fácilmente
const USUARIOS_DEMO = [
    { rol: 'Admin', email: 'admin@dacapo.com', password: 'admin123', color: 'text-khaki' },
    { rol: 'Usuario', email: 'usuario@dacapo.com', password: 'user123', color: 'text-blue-300' },
];

const ModalAuth = ({ alCerrar }: Props) => {
    const { iniciarSesion, registrarUsuario } = useApp();
    const [modoActivo, setModoActivo] = useState<'login' | 'registro'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            if (modoActivo === 'login') {
                const exito = await iniciarSesion(email, password);
                if (exito) {
                    alCerrar();
                } else {
                    setError('Email o contraseña incorrectos. Usa las credenciales de demostración de abajo.');
                }
            } else {
                if (!nombre.trim()) { setError('El nombre es requerido'); return; }
                const exito = await registrarUsuario(email, password, nombre);
                if (exito) {
                    alCerrar();
                } else {
                    setError('Este email ya está registrado.');
                }
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            <motion.div
                className="relative card-glass rounded-2xl max-w-md w-full p-8 z-10"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button onClick={alCerrar}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white
                     transition-all">
                    <X className="w-4 h-4" />
                </button>

                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-vinotinto flex items-center justify-center mx-auto mb-4">
                        <Music className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-secundario">
                        {modoActivo === 'login' ? 'Bienvenido de vuelta' : 'Únete a DaCapo'}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                        {modoActivo === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta gratuita'}
                    </p>
                </div>

                {/* Tabs Login/Registro */}
                <div className="flex rounded-xl bg-white/5 p-1 mb-6">
                    {(['login', 'registro'] as const).map(modo => (
                        <button
                            key={modo}
                            onClick={() => { setModoActivo(modo); setError(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${modoActivo === modo
                                    ? 'bg-vinotinto text-white shadow-glow-vinotinto'
                                    : 'text-white/50 hover:text-white'
                                }`}
                        >
                            {modo === 'login' ? '🔐 Iniciar Sesión' : '✨ Registrarse'}
                        </button>
                    ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-xs">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Formulario */}
                <form onSubmit={manejarSubmit} className="space-y-4">
                    {modoActivo === 'registro' && (
                        <div>
                            <label className="label-campo">Nombre completo</label>
                            <input type="text" className="input-campo" placeholder="Tu nombre"
                                value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                    )}

                    <div>
                        <label className="label-campo">Email</label>
                        <input type="email" className="input-campo" placeholder="tu@email.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <label className="label-campo">Contraseña</label>
                        <div className="relative">
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                className="input-campo pr-10"
                                placeholder={modoActivo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="btn-primario w-full justify-center py-3 mt-2 disabled:opacity-50"
                    >
                        {cargando ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : modoActivo === 'login' ? (
                            <><LogIn className="w-4 h-4" /> Iniciar Sesión</>
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Crear Cuenta</>
                        )}
                    </button>
                </form>

                {/* Credenciales de demo (solo en login) */}
                {modoActivo === 'login' && (
                    <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                            Cuentas de Demostración (Fase 1):
                        </p>
                        <div className="space-y-2">
                            {USUARIOS_DEMO.map(u => (
                                <button
                                    key={u.rol}
                                    onClick={() => { setEmail(u.email); setPassword(u.password); }}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold ${u.color}`}>{u.rol}</span>
                                        <span className="text-[10px] text-white/30">Clic para rellenar</span>
                                    </div>
                                    <p className="text-xs text-white/50">{u.email}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ModalAuth;
