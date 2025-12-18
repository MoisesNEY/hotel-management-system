import React, { useEffect, useState, useCallback } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { FileDown, FileSpreadsheet, Users, Calendar, DoorOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllRooms } from '../../../services/admin/roomService';
import { getAllUsers } from '../../../services/admin/userService';
import type { CustomerDetailsDTO, BookingDTO, RoomDTO } from '../../../types/sharedTypes';
import type { AdminUserDTO } from '../../../types/adminTypes';
import { formatCurrency, formatDate, getStatusColor, getRoomStatusConfig } from '../../utils/helpers';
import { exportToPDF, exportToExcel, type ExportColumn } from '../../utils/exportUtils';

type Category = 'clientes' | 'reservas' | 'habitaciones';

const TablesView: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('clientes');
    const [customers, setCustomers] = useState<CustomerDetailsDTO[]>([]);
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, AdminUserDTO>>({});
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const loadCategoryData = useCallback(async (category: Category, page: number, size: number) => {
        try {
            setLoading(true);

            if (category === 'clientes' || category === 'reservas') {
                const usersRes = await getAllUsers(0, 500); // User stitching still needs a wide fetch or per-page fetch
                const map: Record<number, AdminUserDTO> = {};
                usersRes.data.forEach(u => {
                    if (u.id) map[u.id] = u;
                });
                setUsersMap(map);
            }

            let result: { data: any[], total: number };
            if (category === 'clientes') {
                result = await getAllCustomerDetails(page, size);
                setCustomers(result.data as CustomerDetailsDTO[]);
            } else if (category === 'reservas') {
                result = await getAllBookings(page, size);
                setBookings(result.data as BookingDTO[]);
            } else {
                result = await getAllRooms(page, size);
                setRooms(result.data as RoomDTO[]);
            }
            setTotalItems(result.total);
        } catch (error) {
            console.error(`Error loading ${category}:`, error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategoryData(activeCategory, currentPage, pageSize);
    }, [activeCategory, currentPage, pageSize, loadCategoryData]);

    const handleCategoryChange = (cat: Category) => {
        setActiveCategory(cat);
        setCurrentPage(0); // Reset pagination on category change
    };

    // --- Export Logic ---
    const handleExport = (type: 'pdf' | 'excel') => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        let filename = `reporte-${activeCategory}-${dateStr}`;
        let title = '';
        let columns: ExportColumn[] = [];
        let data: any[] = [];

        if (activeCategory === 'clientes') {
            title = 'Reporte de Clientes';
            columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Nombre', dataKey: 'fullName' },
                { header: 'Email', dataKey: 'email' },
                { header: 'País', dataKey: 'country' },
                { header: 'DNI', dataKey: 'licenseId' }
            ];
            data = customers.map(c => {
                const user = c.user?.id ? usersMap[c.user.id] : undefined;
                return {
                    id: c.id,
                    fullName: `${user?.firstName || c.user?.firstName || ''} ${user?.lastName || c.user?.lastName || ''}`.trim() || 'Sin Nombre',
                    email: user?.email || c.user?.email || 'N/A',
                    country: c.country,
                    licenseId: c.licenseId
                };
            });
        } else if (activeCategory === 'reservas') {
            title = 'Reporte de Reservas';
            columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Cliente', dataKey: 'customerName' },
                { header: 'Fecha Check-In', dataKey: 'checkInDate' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Total', dataKey: 'totalPrice' }
            ];
            data = bookings.map(b => {
                const user = b.customer?.id ? usersMap[b.customer.id] : undefined;
                return {
                    id: b.id,
                    customerName: `${user?.firstName || b.customer?.firstName || ''} ${user?.lastName || b.customer?.lastName || ''}`.trim() || 'Sin Nombre',
                    checkInDate: formatDate(b.checkInDate),
                    status: b.status,
                    totalPrice: formatCurrency(b.totalPrice || 0)
                };
            });
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
                id: r.id,
                roomNumber: r.roomNumber,
                roomType: r.roomType?.name || 'N/A',
                status: r.status,
                price: `$${r.roomType?.basePrice || 0}`
            }));
        }

        if (type === 'pdf') {
            exportToPDF(filename, title, columns, data);
        } else {
            exportToExcel(filename, activeCategory, data);
        }
    };

    // Column Definitions for Real Data
    const customerColumns: Column<CustomerDetailsDTO>[] = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Nombre',
            accessor: (row) => {
                const user = row.user?.id ? usersMap[row.user.id] : undefined;
                const firstName = user?.firstName || row.user?.firstName || '';
                const lastName = user?.lastName || row.user?.lastName || '';
                return <span className="font-semibold">{`${firstName} ${lastName}`.trim() || 'N/A'}</span>;
            }
        },
        {
            header: 'Email',
            accessor: (row) => {
                const user = row.user?.id ? usersMap[row.user.id] : undefined;
                return user?.email || row.user?.email || 'N/A';
            }
        },
        { header: 'País', accessor: 'country' },
        { header: 'DNI', accessor: 'licenseId' }
    ];

    const bookingColumns: Column<BookingDTO>[] = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Cliente',
            accessor: (row) => {
                const user = row.customer?.id ? usersMap[row.customer.id] : undefined;
                const firstName = user?.firstName || row.customer?.firstName || '';
                const lastName = user?.lastName || row.customer?.lastName || '';
                return <span className="font-semibold">{`${firstName} ${lastName}`.trim() || 'N/A'}</span>;
            }
        },
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Centro de Reportes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Selecciona una categoría para visualizar y exportar datos</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport('pdf')}
                        leftIcon={<FileDown size={14} />}
                        className="text-[10px] uppercase font-bold tracking-widest py-1 h-9"
                    >
                        Exportar PDF
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport('excel')}
                        leftIcon={<FileSpreadsheet size={14} />}
                        className="text-[10px] uppercase font-bold tracking-widest py-1 h-9 border-green-200 text-green-700 hover:bg-green-50"
                    >
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit border border-gray-200 dark:border-white/10">
                {[
                    { id: 'clientes', label: 'Clientes', icon: <Users size={16} /> },
                    { id: 'reservas', label: 'Reservas', icon: <Calendar size={16} /> },
                    { id: 'habitaciones', label: 'Habitaciones', icon: <DoorOpen size={16} /> }
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id as Category)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeCategory === cat.id
                            ? 'bg-white dark:bg-navy-light text-gold-dark shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Pagination & Table Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-navy-light p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm mt-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filas:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(0);
                            }}
                            className="bg-gray-50 dark:bg-navy-default border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-gold-default focus:border-gold-default block p-1.5 transition-colors cursor-pointer"
                        >
                            {[10, 20, 50, 100].map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                            ))}
                        </select>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando <span className="font-bold text-gray-900 dark:text-white">{currentPage * pageSize + 1}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0 || loading}
                        className="px-2 border-gray-200 dark:border-white/10"
                    >
                        <ChevronsLeft size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0 || loading}
                        leftIcon={<ChevronLeft size={16} />}
                        className="border-gray-200 dark:border-white/10"
                    >
                        Anterior
                    </Button>

                    <div className="flex items-center justify-center min-w-[36px] h-8 bg-gold-default/10 text-gold-dark dark:text-gold-light font-bold rounded-lg text-sm border border-gold-default/20">
                        {currentPage + 1}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={(currentPage + 1) * pageSize >= totalItems || loading}
                        rightIcon={<ChevronRight size={16} />}
                        className="border-gray-200 dark:border-white/10"
                    >
                        Siguiente
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.ceil(totalItems / pageSize) - 1)}
                        disabled={(currentPage + 1) * pageSize >= totalItems || loading}
                        className="px-2 border-gray-200 dark:border-white/10"
                    >
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>

            <Card className="mt-2">
                {activeCategory === 'clientes' && (
                    <Table<CustomerDetailsDTO>
                        title="Clientes Registrados"
                        subtitle="Listado integral de clientes y datos de contacto"
                        data={customers}
                        columns={customerColumns}
                        keyExtractor={(item) => item.id}
                        isLoading={loading}
                    />
                )}
                {activeCategory === 'reservas' && (
                    <Table<BookingDTO>
                        title="Reservas Actuales"
                        subtitle="Control de ingresos, salidas y estados de reserva"
                        data={bookings}
                        columns={bookingColumns}
                        keyExtractor={(item) => item.id}
                        isLoading={loading}
                    />
                )}
                {activeCategory === 'habitaciones' && (
                    <Table<RoomDTO>
                        title="Inventario de Habitaciones"
                        subtitle="Estado actual y tipos de habitaciones disponibles"
                        data={rooms}
                        columns={roomColumns}
                        keyExtractor={(item) => item.id}
                        isLoading={loading}
                    />
                )}
            </Card>
        </div>
    );
};

export default TablesView;
