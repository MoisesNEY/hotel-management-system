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

// Service Status Options matching backend enum
const SERVICE_STATUS_OPTIONS = [
    { value: 'OPERATIONAL', label: 'Operativo', color: 'text-emerald-600' },
    { value: 'CLOSED', label: 'Cerrado', color: 'text-gray-600' },
    { value: 'FULL_CAPACITY', label: 'Capacidad Llena', color: 'text-amber-600' },
    { value: 'DOWN', label: 'Fuera de Servicio', color: 'text-red-600' },
];

const ServiceForm = ({ initialData, onSuccess, onCancel }: ServiceFormProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('OPERATIONAL');
    const [startHour, setStartHour] = useState('08:00');
    const [endHour, setEndHour] = useState('22:00');

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
            setStatus(initialData.status || 'OPERATIONAL');
            setStartHour(initialData.startHour || '08:00');
            setEndHour(initialData.endHour || '22:00');

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
            name,
            description: description.trim() || undefined,
            cost: Number(cost),
            imageUrl: imageUrl.trim() || undefined,
            startHour,
            endHour,
            status,
            isDeleted: false
        };

        setLoading(true);
        try {
            if (initialData?.id) {
                payload.id = initialData.id;
                await updateHotelService(initialData.id, payload);
            } else {
                await createHotelService(payload);
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving service", err);
            let serverMsg = 'Error al guardar el servicio';
            if (err.response?.data) {
                const data = err.response.data;
                serverMsg = data.detail || data.message || data.title || serverMsg;
            }
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
    const selectClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
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
                        placeholder="Ej: Servicio a la Habitación"
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
                        placeholder="Descripción breve del servicio..."
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {/* Cost and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>
                            Precio <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="0.00"
                                className={`${inputClass} pl-8`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={selectClass}
                        >
                            {SERVICE_STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1a1a1a]">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Hours Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Hora de Inicio</label>
                        <input
                            type="time"
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Hora de Fin</label>
                        <input
                            type="time"
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Image */}
                <div className="space-y-3">
                    <label className={labelClass}>Imagen del Servicio</label>
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
                                    ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
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
                                    className="flex items-center justify-center w-11 h-11 bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                                    title="Subir archivo"
                                >
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                </label>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="flex items-center justify-center w-11 h-11 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                title="Quitar imagen"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {imageUrl && (
                        <div className="w-full h-32 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20 flex items-center justify-center group relative">
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
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/10">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c9a432] disabled:bg-[#d4af37]/50 text-white font-medium text-sm rounded-lg shadow-lg shadow-[#d4af37]/20 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear Servicio')}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;
