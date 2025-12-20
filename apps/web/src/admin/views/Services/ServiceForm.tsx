import { useState, useEffect } from 'react';
import { createHotelService, updateHotelService } from '../../../services/admin/hotelServiceService';
import type { HotelServiceDTO } from '../../../types/adminTypes';


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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setCost(initialData.cost.toString());
            setImageUrl(initialData.imageUrl || '');
            setIsAvailable(initialData.isAvailable);
        }
    }, [initialData]);

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

                {/* Image URL */}
                <div>
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
