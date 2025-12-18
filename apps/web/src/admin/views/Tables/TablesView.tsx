import React, { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { CustomerDetailsDTO, BookingDTO, RoomDTO } from '../../../types/sharedTypes';
import { formatCurrency, formatDate, getStatusColor, getRoomStatusConfig } from '../../utils/helpers';

const TablesView: React.FC = () => {
    const [customers, setCustomers] = useState<CustomerDetailsDTO[]>([]);
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                const [customersRes, bookingsRes, roomsRes] = await Promise.all([
                    getAllCustomerDetails(),
                    getAllBookings(),
                    getAllRooms()
                ]);
                setCustomers(customersRes.data);
                setBookings(bookingsRes.data);
                setRooms(roomsRes.data);
            } catch (error) {
                console.error("Error loading administration data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    // Column Definitions for Real Data
    const customerColumns: Column<CustomerDetailsDTO>[] = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}` },
        { header: 'Email', accessor: (row) => row.user?.email || 'N/A' },
        { header: 'País', accessor: 'country' },
        { header: 'DNI', accessor: 'licenseId' }
    ];

    const bookingColumns: Column<BookingDTO>[] = [
        { header: 'ID', accessor: 'id' },
        { header: 'Cliente', accessor: (row) => `${row.customer?.firstName || ''} ${row.customer?.lastName || ''}` },
        { header: 'Check-In', accessor: (row) => formatDate(row.checkInDate) },
        { header: 'Estado', accessor: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge> },
        { header: 'Total', accessor: (row) => formatCurrency(row.totalPrice || 0), className: 'text-right', headerClassName: 'text-right' }
    ];

    const roomColumns: Column<RoomDTO>[] = [
        { header: 'ID', accessor: 'id' },
        { header: 'Número', accessor: 'roomNumber' },
        { header: 'Tipo', accessor: (row) => row.roomType?.name || 'N/A' },
        {
            header: 'Estado',
            accessor: (row) => {
                const config = getRoomStatusConfig(row.status);
                return <Badge variant={config.label === 'Disponible' ? 'success' : 'warning'}>{row.status}</Badge>;
            }
        },
        { header: 'Precio', accessor: (row) => `$${row.roomType?.basePrice || 0}`, className: 'text-right', headerClassName: 'text-right' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Información General</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Vista completa de los registros del sistema</p>
            </div>

            <Card>
                <Table<CustomerDetailsDTO>
                    title="Clientes Registrados"
                    subtitle="Listado integral de clientes y datos de contacto"
                    data={customers}
                    columns={customerColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>

            <Card>
                <Table<BookingDTO>
                    title="Reservas Actuales"
                    subtitle="Control de ingresos, salidas y estados de reserva"
                    data={bookings}
                    columns={bookingColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>

            <Card>
                <Table<RoomDTO>
                    title="Inventario de Habitaciones"
                    subtitle="Estado actual y tipos de habitaciones disponibles"
                    data={rooms}
                    columns={roomColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default TablesView;
