import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllBookings } from '../../../services/admin/bookingService';
import type { BookingDTO } from '../../../types/sharedTypes';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const BookingsView = () => {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await getAllBookings();
            setBookings(response.data);
        } catch (error) {
            console.error("Error loading bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<BookingDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Cliente',
            accessor: (row) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {row.customer.firstName} {row.customer.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{row.customer.email}</div>
                </div>
            )
        },
        {
            header: 'Check-In',
            accessor: (row) => formatDate(row.checkInDate)
        },
        {
            header: 'Check-Out',
            accessor: (row) => formatDate(row.checkOutDate)
        },
        {
            header: 'Huéspedes',
            accessor: (row) => row.guestCount
        },
        {
            header: 'Tipo de Habitación',
            accessor: (row) => row.roomType.name
        },
        {
            header: 'Habitación Asignada',
            accessor: (row) => row.assignedRoom ? `#${row.assignedRoom.roomNumber}` : 'Sin asignar'
        },
        {
            header: 'Estado',
            accessor: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
        },
        {
            header: 'Total',
            accessor: (row) => (
                <span className="font-semibold text-green-600">
                    {row.totalPrice ? formatCurrency(row.totalPrice) : 'N/A'}
                </span>
            )
        },
        {
            header: 'Notas',
            accessor: (row) => (
                <div className="text-xs text-gray-600 max-w-xs truncate">
                    {row.notes || '-'}
                </div>
            )
        },
        {
            header: 'Acciones',
            accessor: () => (
                <Button size="sm" variant="outline">Ver Detalles</Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>
                    <p className="text-gray-600">Gestión de reservaciones del hotel</p>
                </div>
            </div>

            <Card className="card-plain">
                <Table
                    data={bookings}
                    columns={columns}
                    isLoading={loading}
                    title="Listado de Reservas"
                    emptyMessage="No hay reservas registradas"
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
};

export default BookingsView;
