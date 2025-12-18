import { useState, useEffect } from 'react';
import { createBooking, updateBooking } from '../../../services/admin/bookingService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllUsers } from '../../../services/admin/userService';
import type { BookingDTO, RoomTypeDTO, CustomerDetailsDTO as CustomerDTO } from '../../../types/sharedTypes';
import type { BookingStatus } from '../../../types/sharedTypes';
import type { AdminUserDTO } from '../../../types/adminTypes';

interface BookingFormProps {
    initialData?: BookingDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const BookingForm = ({ initialData, onSuccess, onCancel }: BookingFormProps) => {
    // Estado para campos simples
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [status, setStatus] = useState<BookingStatus>('PENDING');
    const [notes, setNotes] = useState('');

    // Estado para selecciones (Ids) y listas
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | string>('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>('');

    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, AdminUserDTO>>({});

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos al montar
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch ALL items for dropdowns (using a large size)
                const [typesResponse, customersResponse, usersResponse] = await Promise.all([
                    getAllRoomTypes(0, 100),
                    getAllCustomerDetails(0, 100),
                    getAllUsers(0, 100)
                ]);
                setRoomTypes(typesResponse.data);
                setCustomers(customersResponse.data);

                // Build User Map
                const map: Record<number, AdminUserDTO> = {};
                usersResponse.data.forEach(u => map[u.id] = u);
                setUsersMap(map);

            } catch (e) {
                console.error("Error loading form data", e);
                setError("Error al cargar listas de selección");
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Cargar datos iniciales si es edición
    useEffect(() => {
        if (initialData) {
            setCheckInDate(initialData.checkInDate);
            setCheckOutDate(initialData.checkOutDate);
            setGuestCount(initialData.guestCount);
            setStatus(initialData.status);
            setNotes(initialData.notes || '');

            if (initialData.roomType) {
                setSelectedRoomTypeId(initialData.roomType.id);
            }
            if (initialData.customer) {
                // Determine the key for the customer selection
                // The dropdown values are `customer.id` (CustomerDetails ID)
                // But wait, we need to make sure we are selecting the right ID.
                // initialData.customer is a UserDTO (from checking BookingDTO earlier).
                // But the customers list is CustomerDetailsDTO.
                // We need to find the CustomerDetails that corresponds to this User.

                // NOTE: This logic depends on when 'customers' and 'initialData' are available.
                // But this effect runs on initialData change. 'customers' might be empty initially.
                // We might need to handle this in render or a separate effect?
                // Actually, let's just set the ID if we can. 
                // Wait, BookingDTO has `customer: UserDTO`.
                // CustomerDetailsDTO has `id` (its own ID) and `user: UserDTO`.
                // The dropdown iterates CustomerDetailsDTO `c`. Key/Value is `c.id`.
                // So we need to find `c` where `c.user.id === initialData.customer.id`.
                // Since this effect might run before customers are loaded, we can't do `.find` here easily 
                // UNLESS we add `customers` dependency.
                // Let's rely on the user manually selecting if it fails, OR improve this.
                // Better: Run this effect when both initialData and customers are ready.
            }
        }
    }, [initialData]);

    // Secondary effect to set selected customer once list is loaded
    useEffect(() => {
        if (initialData && initialData.customer && customers.length > 0) {
            const matchingCustomer = customers.find(c => c.user?.id === initialData.customer.id);
            if (matchingCustomer) {
                setSelectedCustomerId(matchingCustomer.id);
            }
        }
    }, [initialData, customers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedRoomTypeId || !selectedCustomerId) {
            setError('Debe seleccionar un cliente y un tipo de habitación');
            setLoading(false);
            return;
        }

        try {
            // Encontrar los objetos completos
            const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));
            const selectedRoomType = roomTypes.find(t => t.id === Number(selectedRoomTypeId));

            if (!selectedCustomer || !selectedCustomer.user) {
                setError("Error: Cliente seleccionado no tiene un usuario asociado válido.");
                setLoading(false);
                return;
            }

            if (!selectedRoomType) {
                setError("Error al seleccionar tipo de habitación");
                setLoading(false);
                return;
            }

            const payload = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                checkInDate,
                checkOutDate,
                guestCount: Number(guestCount),
                status: status as BookingStatus,
                notes,
                roomType: selectedRoomType,
                customer: selectedCustomer.user
            };

            if (initialData?.id) {
                await updateBooking(initialData.id, payload as unknown as BookingDTO);
            } else {
                await createBooking(payload as unknown as BookingDTO);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'];

    // Estilos reutilizados
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        outline: 'none',
        transition: 'all 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#6b7280',
        marginBottom: '6px',
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    };

    if (loadingData) {
        return <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Cargando formulario...</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ padding: '24px 24px', display: 'grid', gap: '16px' }}>
                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Sección Cliente y Tipo de Habitación */}
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>
                            Cliente <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {customers.map(c => {
                                const userId = c.user?.id;
                                const user = userId ? usersMap[userId] : undefined;
                                const firstName = user?.firstName || c.user?.firstName || 'Sin Nombre';
                                const lastName = user?.lastName || c.user?.lastName || '';
                                const email = user?.email || c.user?.email || 'Sin Email';

                                return (
                                    <option key={c.id} value={c.id}>
                                        {firstName} {lastName} ({email})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Tipo de Habitación <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={selectedRoomTypeId}
                            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="">-- Seleccionar Tipo --</option>
                            {roomTypes.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name} (Cap: {t.maxCapacity} | ${t.basePrice})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sección Fechas */}
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>
                            Fecha de Entrada <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Fecha de Salida <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                {/* Sección Huéspedes y Estado */}
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>
                            Huéspedes <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={guestCount}
                            onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as BookingStatus)}
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label style={labelStyle}>Notas</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notas adicionales..."
                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
            </div>

            {/* Footer con botones */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb'
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '20px',
                        backgroundColor: '#ffffff',
                        color: '#6b7280',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 24px',
                        border: 'none',
                        borderRadius: '20px',
                        backgroundColor: '#51cbce',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        boxShadow: '0 4px 6px rgba(81, 203, 206, 0.3)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4bc2c5')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#51cbce'}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

export default BookingForm;
