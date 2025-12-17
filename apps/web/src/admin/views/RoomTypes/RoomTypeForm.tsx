import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Button from '../../components/shared/Button';
import { createRoomType, updateRoomType } from '../../../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../../../types/sharedTypes';

interface RoomTypeFormProps {
    initialData?: RoomTypeDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomTypeForm = ({ initialData, onSuccess, onCancel }: RoomTypeFormProps) => {
    const [formData, setFormData] = useState<Partial<RoomTypeDTO>>({
        name: '',
        description: '',
        basePrice: 0,
        maxCapacity: 1,
        beds: 1,
        area: 0,
        imageUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' || name === 'maxCapacity' || name === 'beds' || name === 'area'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData && initialData.id) {
                await updateRoomType(initialData.id, formData as RoomTypeDTO);
            } else {
                await createRoomType(formData as RoomTypeDTO);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el tipo de habitación');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51cbce] focus:border-transparent outline-none transition-all";
    const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className={labelStyle}>
                    Nombre del Tipo <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Suite Junior, Doble Estándar"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Descripción</label>
                <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Describe las características principales..."
                    className={`${inputStyle} h-24 resize-none`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelStyle}>
                        Precio Base <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>
                        Capacidad <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleChange}
                        min="1"
                        required
                        className={inputStyle}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelStyle}>Camas</label>
                    <input
                        type="number"
                        name="beds"
                        value={formData.beds}
                        onChange={handleChange}
                        min="1"
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Área (m²)</label>
                    <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        min="0"
                        className={inputStyle}
                    />
                </div>
            </div>

            <div>
                <label className={labelStyle}>URL de Imagen</label>
                <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputStyle}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                    leftIcon={<Save size={16} />}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
};

export default RoomTypeForm;
