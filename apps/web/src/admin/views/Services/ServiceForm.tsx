import { useState, useEffect } from 'react';
import { createHotelService, updateHotelService } from '../../../services/admin/hotelServiceService';
import fileService from '../../../services/admin/fileService';
import type { HotelServiceDTO } from '../../../types/adminTypes';
import { Upload, X, Link, Loader2 } from 'lucide-react';


interface ServiceFormProps {
    initialData?: HotelServiceDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ServiceForm = ({ initialData, onSuccess, onCancel }: ServiceFormProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMinioImage, setIsMinioImage] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setCost(initialData.cost.toString());
            setImageUrl(initialData.imageUrl || '');
            setIsAvailable(initialData.isAvailable);

            // Si la URL contiene el bucketName o endpoint de minio, lo marcamos como minio (opcional)
            if (initialData.imageUrl?.includes('/api/files') || initialData.imageUrl?.includes('9000')) {
                setIsMinioImage(true);
            }
        }
    }, [initialData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const url = await fileService.uploadFile(file, 'services');
            setImageUrl(url);
            setIsMinioImage(true);
        } catch (err) {
            console.error("Error uploading file", err);
            setError("Error al subir la imagen");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setIsMinioImage(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !cost) {
            setError("Nombre y costo son obligatorios");
            return;
        }

        const payload: HotelServiceDTO = {
            id: initialData?.id || 0, // ID is ignored on create usually, strictly typed
            name,
            description,
            cost: Number(cost),
            imageUrl,
            isAvailable
        };

        setLoading(true);
        try {
            if (initialData?.id) {
                await updateHotelService(initialData.id, payload);
            } else {
                // api expects Omit<HotelServiceDTO, 'id'> mostly, but let's check strict type
                // Usually we cast or object literal without ID for create
                const { id, ...createPayload } = payload;
                await createHotelService(createPayload as HotelServiceDTO);
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving service", err);
            const serverMsg = err.response?.data?.detail || err.response?.data?.message || 'Error al guardar el servicio';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    // Estilos reutilizados de RoomForm - ahora usando Tailwind para soporte de modo oscuro
    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors";

    const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1.5";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 grid gap-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className={labelClass}>
                        Nombre del Servicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`${inputClass} min-h-20 resize-vertical`}
                    />
                </div>

                {/* Cost */}
                <div>
                    <label className={labelClass}>
                        Costo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Image URL & File Upload */}
                <div className="space-y-3">
                    <label className={labelClass}>Imagen del Servicio</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Link size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={isMinioImage || isUploading}
                                    className={`${inputClass} pl-10 ${(isMinioImage || isUploading)
                                            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500'
                                            : ''
                                        }`}
                                />
                            </div>

                            {!isMinioImage ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="service-image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="service-image-upload"
                                        className="flex items-center justify-center w-[42px] h-[42px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
                                        title="Subir archivo"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    </label>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="flex items-center justify-center w-[42px] h-[42px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    title="Quitar imagen"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {imageUrl && (
                            <div className="w-full h-32 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center group relative">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1551882547-ff43c619c721?auto=format&fit=crop&q=80&w=400')}
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 size={32} className="text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                            {isMinioImage
                                ? "✨ Imagen subida a almacenamiento interno (Minio). Quita la foto para usar una URL externa."
                                : "💡 Puedes ingresar una URL directa o subir un archivo comprimido/imagen."}
                        </p>
                    </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 pt-2">
                    <input
                        id="isAvailable"
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="w-4 h-4 cursor-pointer text-teal-600 dark:text-teal-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400"
                    />
                    <label htmlFor="isAvailable" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium select-none">
                        Disponible para solicitar
                    </label>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg shadow-teal-500/20 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;
