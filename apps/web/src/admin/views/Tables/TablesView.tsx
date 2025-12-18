import React, { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { CustomerDetailsDTO, BookingDTO, RoomDTO } from '../../../types/sharedTypes';
import { formatCurrency, formatDate, getStatusColor, getRoomStatusConfig } from '../../utils/helpers';
import { exportToPDF, exportToExcel, type ExportColumn } from '../../utils/exportUtils';

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

    // --- Export Logic ---
    const handleExport = (type: 'pdf' | 'excel', category: 'clientes' | 'reservas' | 'habitaciones') => {
        let filename = `reporte-${category}-${new Date().toISOString().split('T')[0]}`;
        let title = '';
        let columns: ExportColumn[] = [];
        let data: any[] = [];

        if (category === 'clientes') {
            title = 'Reporte de Clientes';
            columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Nombre', dataKey: 'fullName' },
                { header: 'Email', dataKey: 'email' },
                { header: 'País', dataKey: 'country' },
                { header: 'DNI', dataKey: 'licenseId' }
            ];
            data = customers.map(c => ({
                ...c,
                fullName: `${c.user?.firstName || ''} ${c.user?.lastName || ''}`,
                email: c.user?.email || 'N/A'
            }));
        } else if (category === 'reservas') {
            title = 'Reporte de Reservas';
            columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Cliente', dataKey: 'customerName' },
                { header: 'Fecha Check-In', dataKey: 'checkInDate' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Total', dataKey: 'totalPrice' }
            ];
            data = bookings.map(b => ({
                ...b,
                customerName: `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`,
                checkInDate: formatDate(b.checkInDate),
                totalPrice: formatCurrency(b.totalPrice || 0)
            }));
        } else {
            title = 'Reporte de Inventario de Habitaciones';
            columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Número', dataKey: 'roomNumber' },
                { header: 'Tipo', dataKey: 'roomType' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Precio Noche', dataKey: 'price' }
            ];
            data = rooms.map(r => ({
                ...r,
                roomType: r.roomType?.name || 'N/A',
                price: `$${r.roomType?.basePrice || 0}`
            }));
        }

        if (type === 'pdf') {
            exportToPDF(filename, title, columns, data);
        } else {
            exportToExcel(filename, category, data);
        }
    };

    // --- UI Helpers ---
    const ExportButtons = ({ category }: { category: 'clientes' | 'reservas' | 'habitaciones' }) => (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('pdf', category)}
                leftIcon={<FileDown size={14} />}
                className="text-[10px] uppercase font-bold tracking-widest py-1 h-8"
            >
                PDF
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('excel', category)}
                leftIcon={<FileSpreadsheet size={14} />}
                className="text-[10px] uppercase font-bold tracking-widest py-1 h-8 border-green-200 text-green-700 hover:bg-green-50"
            >
                Excel
            </Button>
        </div>
    );

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
                const isAvailable = row.status === 'AVAILABLE';
                return <Badge variant={isAvailable ? 'success' : 'warning'}>{row.status}</Badge>;
            }
        },
        { header: 'Precio', accessor: (row) => `$${row.roomType?.basePrice || 0}`, className: 'text-right', headerClassName: 'text-right' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Información General</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Vista completa de los registros del sistema</p>
                </div>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4 pr-4">
                    <div className="p-0">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Clientes Registrados</h4>
                        <p className="text-xs text-gray-400">Listado integral de clientes y datos de contacto</p>
                    </div>
                    <ExportButtons category="clientes" />
                </div>
                <Table<CustomerDetailsDTO>
                    data={customers}
                    columns={customerColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4 pr-4">
                    <div className="p-0">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Reservas Actuales</h4>
                        <p className="text-xs text-gray-400">Control de ingresos, salidas y estados de reserva</p>
                    </div>
                    <ExportButtons category="reservas" />
                </div>
                <Table<BookingDTO>
                    data={bookings}
                    columns={bookingColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4 pr-4">
                    <div className="p-0">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Inventario de Habitaciones</h4>
                        <p className="text-xs text-gray-400">Estado actual y tipos de habitaciones disponibles</p>
                    </div>
                    <ExportButtons category="habitaciones" />
                </div>
                <Table<RoomDTO>
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
