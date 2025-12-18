import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Button from '../../components/shared/Button';
import { createRoom, updateRoom } from '../../../services/admin/roomService';

import type { RoomDTO, RoomTypeDTO, RoomStatus } from '../../../types/sharedTypes';

interface RoomFormProps {
    initialData?: RoomDTO | null;
    roomTypes: RoomTypeDTO[];
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomForm = ({ initialData, roomTypes, onSuccess, onCancel }: RoomFormProps) => {
    const [formData, setFormData] = useState<Partial<RoomDTO>>({
        roomNumber: '',
        roomType: roomTypes.length > 0 ? roomTypes[0] : undefined,
        status: 'AVAILABLE' as RoomStatus
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else if (roomTypes.length > 0 && !formData.roomType) {
            setFormData(prev => ({ ...prev, roomType: roomTypes[0] }));
        }
    }, [initialData, roomTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'roomTypeId') {
            const selectedType = roomTypes.find(rt => rt.id === Number(value));
            setFormData(prev => ({
                ...prev,
                roomType: selectedType
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData && initialData.id) {
                await updateRoom(initialData.id, formData as RoomDTO);
            } else {
                await createRoom(formData as RoomDTO);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar la habitación. Verifique que el número no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-gold-default focus:border-gold-default outline-none transition-all placeholder:text-gray-400";
    const labelStyle = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className={labelStyle}>
                    Número de Habitación <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 101, 205B"
                    className={inputStyle}
                />
            </div>

            <div className="space-y-2">
                <label className={labelStyle}>
                    Tipo de Habitación <span className="text-red-500">*</span>
                </label>
                <select
                    name="roomTypeId"
                    value={formData.roomType?.id || ''}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                >
                    <option value="" className="dark:bg-[#1c1c1c]">Seleccionar tipo...</option>
                    {roomTypes.map(type => (
                        <option key={type.id} value={type.id} className="dark:bg-[#1c1c1c]">
                            {type.name} - ${type.basePrice}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className={labelStyle}>
                    Estado <span className="text-red-500">*</span>
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                >
                    <option value="AVAILABLE" className="dark:bg-[#1c1c1c]">Disponible</option>
                    <option value="OCCUPIED" className="dark:bg-[#1c1c1c]">Ocupada</option>
                    <option value="MAINTENANCE" className="dark:bg-[#1c1c1c]">Mantenimiento</option>
                    <option value="CLEANING" className="dark:bg-[#1c1c1c]">Limpieza</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-white/5">
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
                    disabled={loading || !formData.roomType}
                    leftIcon={<Save size={16} />}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
};

export default RoomForm;
