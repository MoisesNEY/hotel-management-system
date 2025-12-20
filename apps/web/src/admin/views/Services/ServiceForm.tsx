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
                <div>
                    <label style={labelStyle}>Imagen del Servicio</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Link size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={isMinioImage || isUploading}
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '36px',
                                        backgroundColor: (isMinioImage || isUploading) ? '#f3f4f6' : '#ffffff',
                                        cursor: (isMinioImage || isUploading) ? 'not-allowed' : 'text'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {!isMinioImage ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        id="service-image-upload"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="service-image-upload"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '42px',
                                            height: '42px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            cursor: isUploading ? 'not-allowed' : 'pointer',
                                            color: '#6b7280',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Subir archivo"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    </label>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '42px',
                                        height: '42px',
                                        backgroundColor: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Quitar imagen"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {imageUrl && (
                            <div style={{
                                width: '100%',
                                height: '120px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1551882547-ff43c619c721?auto=format&fit=crop&q=80&w=400')}
                                />
                            </div>
                        )}

                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
                            {isMinioImage
                                ? "Imagen subida a almacenamiento interno. Desbloquea para usar una URL externa."
                                : "Puedes ingresar una URL directa o subir un archivo comprimido/imagen."}
                        </p>
                    </div>
                    <label className={labelClass}>URL de Imagen</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={inputClass}
                    />
                </div>

                {/* Availability */}
                <div className="flex items-center">
                    <input
                        id="isAvailable"
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="w-4 h-4 mr-2 cursor-pointer text-teal-600 dark:text-teal-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400"
                    />
                    <label htmlFor="isAvailable" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Disponible para solicitar
                    </label>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold text-xs uppercase hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold text-xs uppercase rounded-full shadow-lg shadow-teal-500/30 disabled:shadow-none disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;
