import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { bookingsService } from '../../services/api';
import type { Booking } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const BookingsView = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingsService.getAll();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Booking>[] = [
        {
            header: 'ID',
            accessor: (row: Booking) => <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span>
        },
        {
            header: 'Cliente',
            accessor: (row: Booking) => (
                <div>
                    <div className="font-medium text-gray-900">{row.customer.firstName} {row.customer.lastName}</div>
                </div>
            )
        },
        {
            header: 'Habitación',
            accessor: (row: Booking) => `Hab. ${row.room.roomNumber} (${row.room.type.name})`
        },
        {
            header: 'Fechas',
            accessor: (row: Booking) => (
                <div className="text-sm">
                    <span className="text-gray-600 block">In: {formatDate(row.checkInDate)}</span>
                    <span className="text-gray-600 block">Out: {formatDate(row.checkOutDate)}</span>
                </div>
            )
        },
        {
            header: 'Total',
            accessor: (row: Booking) => <span className="font-bold">{formatCurrency(row.totalPrice)}</span>
        },
        {
            header: 'Estado',
            accessor: (row: Booking) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
        },
        {
            header: 'Acciones',
            accessor: (_row: Booking) => (
                <Button size="sm" variant="light">Ver</Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex items-center p-4 bg-blue-50 border-blue-100">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'PENDING').length}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-4 bg-green-50 border-green-100">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Confirmadas</p>
                        <p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-4 bg-red-50 border-red-100">
                    <div className="p-3 bg-red-100 rounded-full text-red-600 mr-4">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Canceladas</p>
                        <p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'CANCELLED').length}</p>
                    </div>
                </Card>
            </div>

            <Table
                data={bookings}
                columns={columns}
                isLoading={loading}
                title="Listado de Reservas"
                emptyMessage="No hay reservas registradas"
                keyExtractor={(item: Booking) => item.id}
            />
        </div>
    );
};

export default BookingsView;
