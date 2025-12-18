import { useState, useEffect } from 'react';
import { Save, DoorOpen, Layout, Loader2, AlertCircle } from 'lucide-react';
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
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 409) {
                setError(err.response.data?.detail || 'El número de habitación ya está en uso.');
            } else if (err.response?.status === 400) {
                setError(err.response.data?.title || 'Datos inválidos. Por favor revise el formulario.');
            } else {
                setError('Ocurrió un error inesperado al guardar la habitación.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-default/20 focus:border-gold-default outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed appearance-none";
    const labelStyle = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-10">
            {error && (
                <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-3xl animate-shake">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                        <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">Hubo un problema</p>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Room Number */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>
                        Identificador <span className="text-gold-default">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <DoorOpen size={18} />
                        </div>
                        <input
                            type="text"
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 101"
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>
                        Estado Inicial <span className="text-gold-default">*</span>
                    </label>
                    <div className="relative">
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                        >
                            <option value="AVAILABLE" className="dark:bg-[#111111]">✓ Disponible</option>
                            <option value="OCCUPIED" className="dark:bg-[#111111]">⬢ Ocupada</option>
                            <option value="MAINTENANCE" className="dark:bg-[#111111]">⚠ Mantenimiento</option>
                            <option value="CLEANING" className="dark:bg-[#111111]">✨ Limpieza</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={14} className="transition-transform group-focus-within:rotate-180" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Type Select */}
            <div className="space-y-3">
                <label className={labelStyle}>
                    Tipo de Alojamiento <span className="text-gold-default">*</span>
                </label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                        <Layout size={18} />
                    </div>
                    <select
                        name="roomTypeId"
                        value={formData.roomType?.id || ''}
                        onChange={handleChange}
                        required
                        className={`${inputStyle} pl-12`}
                    >
                        <option value="" className="dark:bg-[#111111]">Seleccionar una categoría...</option>
                        {roomTypes.map(type => (
                            <option key={type.id} value={type.id} className="dark:bg-[#111111]">
                                {type.name} — ${type.basePrice} / noche
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={14} className="transition-transform group-focus-within:rotate-180" />
                    </div>
                </div>
                {formData.roomType && (
                    <div className="flex items-center gap-3 mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-gold-default/10 flex items-center justify-center text-gold-default">
                             <Layout size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Capacidad Máxima</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {formData.roomType.maxCapacity} Huéspedes ({formData.roomType.beds} Camas)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                <p className="text-[11px] text-gray-400 font-medium italic">
                    * Campos obligatorios para el registro
                </p>
                <div className="flex gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onCancel}
                        disabled={loading}
                        className="px-8"
                    >
                        Salir
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading || !formData.roomType}
                        className="px-10 min-w-[160px]"
                        leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    >
                        {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Habitación'}
                    </Button>
                </div>
            </div>
            
        </form>
    );
};

const ChevronDown = ({ size, className }: { size: number, className: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default RoomForm;
