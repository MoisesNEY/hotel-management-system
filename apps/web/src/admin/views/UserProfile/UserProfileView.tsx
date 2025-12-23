import React, { useState, useEffect, useRef } from 'react';
import { getAccount, updateAccount, uploadProfilePicture, deleteProfilePicture } from '../../../services/accountService';
import type { AdminUserDTO } from '../../../types/adminTypes';
import { User, Mail, Globe, Shield, Save, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthProvider';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';

const UserProfileView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { reloadProfile } = useAuth();
    const [formData, setFormData] = useState<Partial<AdminUserDTO>>({
        firstName: '',
        lastName: '',
        email: '',
        login: '',
        langKey: 'en',
        activated: false,
        authorities: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAccount();
                setFormData(data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (formData.login) {
                await updateAccount(formData as AdminUserDTO);
                await reloadProfile(); // Fuerza actualización de token y claims en Keycloak
                setSuccessMessage('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Error al actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const newUrl = await uploadProfilePicture(file);
            setFormData(prev => ({ ...prev, imageUrl: newUrl }));

            // Actualizar instantáneamente local y en el servidor
            await reloadProfile();
            setSuccessMessage('Foto de perfil actualizada');
        } catch (error) {
            console.error("Failed to upload photo", error);
            alert('Error al subir la foto');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePhoto = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeletePhoto = async () => {
        setShowDeleteConfirm(false);
        setIsUploading(true);
        try {
            await deleteProfilePicture();
            setFormData(prev => ({ ...prev, imageUrl: undefined }));

            // Actualizar instantáneamente local y en el servidor
            await reloadProfile();
            setSuccessMessage('Foto de perfil eliminada');
        } catch (error) {
            console.error("Failed to delete photo", error);
            alert('Error al eliminar la foto');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <div className="min-h-screen p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mi Perfil</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información personal y preferencias del sistema.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Avatar & Quick Stats (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 flex flex-col items-center text-center">
                            <div className="relative group mb-6">
                                <div className="h-32 w-32 rounded-full bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-white/10 shadow-md flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-4xl overflow-hidden">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Photo Actions Overlay */}
                                <div className="absolute -bottom-2 right-0 flex gap-1">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all active:scale-90"
                                        title="Subir foto"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    {formData.imageUrl && (
                                        <button
                                            onClick={handleDeletePhoto}
                                            disabled={isUploading}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all active:scale-90"
                                            title="Eliminar foto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {formData.firstName} {formData.lastName}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">@{formData.login}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {formData.authorities?.map((role) => (
                                    <span key={role} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase rounded-md tracking-wide">
                                        {role.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </div>

                            <div className="w-full pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Estado</p>
                                    <p className={`font-bold ${formData.activated ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {formData.activated ? 'Activo' : 'Inactivo'}
                                    </p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Idioma</p>
                                    <p className="font-bold text-gray-900 dark:text-white uppercase">{formData.langKey}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    Información General
                                </h3>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName || ''}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 h-auto min-h-112px]"
                                                    placeholder="Ingresa tu nombre"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Apellido</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName || ''}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 h-auto min-h-112px]"
                                                    placeholder="Ingresa tu apellido"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 opacity-75">
                                            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Usuario (Login)</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.login || ''}
                                                    disabled
                                                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 cursor-not-allowed h-auto min-h-112px"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email || ''}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 h-auto min-h-112px"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Idioma Preferido</label>
                                        <div className="relative max-w-md">
                                            <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <select
                                                name="langKey"
                                                value={formData.langKey || 'en'}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer h-auto min-h-112px"
                                            >
                                                <option value="en" className="dark:bg-[#1c1c1c]">English (Inglés)</option>
                                                <option value="es" className="dark:bg-[#1c1c1c]">Español (Spanish)</option>
                                                <option value="fr" className="dark:bg-[#1c1c1c]">Français (Francés)</option>
                                            </select>
                                            <div className="absolute right-3 top-3.5 pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 flex justify-end border-t border-gray-100 dark:border-white/5">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className={`
                                                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all
                                                ${isSaving
                                                    ? 'bg-blue-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'}
                                            `}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Guardando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    <span>Guardar Cambios</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                size="sm"
            >
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                        <CheckCircle2 size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Todo listo!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {successMessage}
                    </p>

                    <Button
                        variant="primary"
                        onClick={() => setSuccessMessage(null)}
                        className="w-full justify-center py-3 text-base shadow-lg shadow-blue-500/20"
                    >
                        Aceptar
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                size="sm"
            >
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                        <Trash2 size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ¿Eliminar foto?
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        ¿Estás seguro de que deseas eliminar tu foto de perfil? Esta acción no se puede deshacer.
                    </p>

                    <div className="flex w-full gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 justify-center py-3"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDeletePhoto}
                            className="flex-1 justify-center py-3 shadow-lg shadow-red-500/20"
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserProfileView;
