import { useState } from 'react';
import { createUser } from '../../../services/admin/userService';
import type { CreateUserDTO } from '../../../types/adminTypes';
import { Eye, EyeOff } from 'lucide-react';

interface UserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const UserForm = ({ onSuccess, onCancel }: UserFormProps) => {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const payload: CreateUserDTO = {
                login: login.toLowerCase().trim(),
                email: email.trim(),
                password,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined
            };

            await createUser(payload);
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                if (errorData?.title?.includes('Login')) {
                    setError('El nombre de usuario ya está en uso');
                } else if (errorData?.title?.includes('Email')) {
                    setError('El email ya está registrado');
                } else {
                    setError(errorData?.detail || 'Error al crear el usuario');
                }
            } else if (err.response?.status === 500) {
                setError('Error del servidor. Verifique que el rol ROLE_EMPLOYEE exista en Keycloak.');
            } else {
                setError('Error al crear el usuario. Intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 grid gap-4 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-gray-100">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Información de advertencia */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                <strong>Nota:</strong> El usuario creado tendrá el rol de <strong>Empleado</strong> y podrá acceder al panel de administración.
            </div>

            {/* Credenciales */}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Credenciales de Acceso
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        pattern="^[a-zA-Z0-9._-]+$"
                        placeholder="ejemplo: juan.perez"
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Solo letras, números, puntos, guiones</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="correo@ejemplo.com"
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full p-2.5 pr-10 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Repita la contraseña"
                            className="w-full p-2.5 pr-10 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Datos Personales */}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-2">
                Datos Personales (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Juan"
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Apellido
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Pérez"
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-transparent"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creando...' : 'Crear Empleado'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
