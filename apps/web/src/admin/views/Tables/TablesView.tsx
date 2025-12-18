import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { FileDown, FileSpreadsheet, Users, Calendar, DoorOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllRooms } from '../../../services/admin/roomService';
import { getAllUsers } from '../../../services/admin/userService';
import type { AdminUserDTO } from '../../../types/adminTypes';
import { formatCurrency, formatDate, getStatusColor, getUserDisplayInfo } from '../../utils/helpers';
import { exportToPDF, exportToExcel, type ExportColumn } from '../../utils/exportUtils';

type Category = 'clientes' | 'reservas' | 'habitaciones';

const TablesView: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('clientes');
    const [data, setData] = useState<any[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string | number, AdminUserDTO>>({});
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Metadata Configuration for each Table Category
    const CATEGORY_CONFIG = useMemo(() => ({
        clientes: {
            title: 'Clientes Registrados',
            subtitle: 'Listado integral de clientes y datos de contacto',
            icon: <Users size={16} />,
            fetcher: getAllCustomerDetails,
            exportTitle: 'Reporte de Clientes',
            columns: [
                { header: 'ID', accessor: 'id' },
                {
                    header: 'Nombre',
                    accessor: (row: any) => (
                        <span className="font-semibold">{getUserDisplayInfo(row.user, usersMap).fullName}</span>
                    )
                },
                {
                    header: 'Email',
                    accessor: (row: any) => getUserDisplayInfo(row.user, usersMap).email
                },
                { header: 'País', accessor: 'country' },
                { header: 'DNI', accessor: 'licenseId' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Nombre', dataKey: 'fullName' },
                { header: 'Email', dataKey: 'email' },
                { header: 'País', dataKey: 'country' },
                { header: 'DNI', dataKey: 'licenseId' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                ...getUserDisplayInfo(r.user, usersMap),
                country: r.country,
                licenseId: r.licenseId
            }))
        },
        reservas: {
            title: 'Reservas Actuales',
            subtitle: 'Control de ingresos, salidas y estados de reserva',
            icon: <Calendar size={16} />,
            fetcher: getAllBookings,
            exportTitle: 'Reporte de Reservas',
            columns: [
                { header: 'ID', accessor: 'id' },
                {
                    header: 'Cliente',
                    accessor: (row: any) => (
                        <span className="font-semibold">{getUserDisplayInfo(row.customer, usersMap).fullName}</span>
                    )
                },
                { header: 'Check-In', accessor: (row: any) => formatDate(row.checkInDate) },
                { header: 'Estado', accessor: (row: any) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge> },
                { header: 'Total', accessor: (row: any) => formatCurrency(row.totalPrice || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Cliente', dataKey: 'customerName' },
                { header: 'Fecha Check-In', dataKey: 'checkInDate' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Total', dataKey: 'totalPrice' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                customerName: getUserDisplayInfo(r.customer, usersMap).fullName,
                checkInDate: formatDate(r.checkInDate),
                status: r.status,
                totalPrice: formatCurrency(r.totalPrice || 0)
            }))
        },
        habitaciones: {
            title: 'Inventario de Habitaciones',
            subtitle: 'Estado actual de habitaciones disponibles',
            icon: <DoorOpen size={16} />,
            fetcher: getAllRooms,
            exportTitle: 'Reporte de Inventario de Habitaciones',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Número', accessor: 'roomNumber' },
                { header: 'Tipo', accessor: (row: any) => row.roomType?.name || 'N/A' },
                {
                    header: 'Estado',
                    accessor: (row: any) => (
                        <Badge variant={row.status === 'AVAILABLE' ? 'success' : 'warning'}>{row.status}</Badge>
                    )
                },
                { header: 'Precio', accessor: (row: any) => `$${row.roomType?.basePrice || 0}`, className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Número', dataKey: 'roomNumber' },
                { header: 'Tipo', dataKey: 'roomType' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Precio Noche', dataKey: 'price' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                roomNumber: r.roomNumber,
                roomType: r.roomType?.name || 'N/A',
                status: r.status,
                price: `$${r.roomType?.basePrice || 0}`
            }))
        }
    }), [usersMap]);

    const loadCategoryData = useCallback(async (category: Category, page: number, size: number) => {
        try {
            setLoading(true);

            // Stitching users Map
            if (category !== 'habitaciones' && Object.keys(usersMap).length === 0) {
                const usersRes = await getAllUsers(0, 500);
                const map: Record<string | number, AdminUserDTO> = {};
                usersRes.data.forEach(u => { if (u.id) map[u.id] = u; });
                setUsersMap(map);
            }

            const result = await CATEGORY_CONFIG[category].fetcher(page, size);
            setData(result.data);
            setTotalItems(result.total);
        } catch (error) {
            console.error(`Error loading ${category}:`, error);
        } finally {
            setLoading(false);
        }
    }, [CATEGORY_CONFIG, usersMap]);

    useEffect(() => {
        loadCategoryData(activeCategory, currentPage, pageSize);
    }, [activeCategory, currentPage, pageSize, loadCategoryData]);

    const handleCategoryChange = (cat: Category) => {
        setActiveCategory(cat);
        setCurrentPage(0);
        setData([]); // Clear data while loading new category
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        const config = CATEGORY_CONFIG[activeCategory];
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `reporte-${activeCategory}-${dateStr}`;
        const exportData = config.mapForExport(data);

        if (type === 'pdf') {
            exportToPDF(filename, config.exportTitle, config.exportColumns as ExportColumn[], exportData);
        } else {
            exportToExcel(filename, activeCategory, exportData);
        }
    };

    const currentConfig = CATEGORY_CONFIG[activeCategory];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Centro de Reportes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visualiza y exporta datos estratégicos del hotel</p>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExport('pdf')} leftIcon={<FileDown size={14} />} className="text-[10px] uppercase font-bold tracking-widest py-1 h-9">
                        Exportar PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport('excel')} leftIcon={<FileSpreadsheet size={14} />} className="text-[10px] uppercase font-bold tracking-widest py-1 h-9 border-green-200 text-green-700 hover:bg-green-50">
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit border border-gray-200 dark:border-white/10">
                {Object.entries(CATEGORY_CONFIG).map(([id, config]) => (
                    <button
                        key={id}
                        onClick={() => handleCategoryChange(id as Category)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeCategory === id
                            ? 'bg-white dark:bg-navy-light text-gold-dark shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {config.icon}
                        {id.charAt(0).toUpperCase() + id.slice(1)}
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
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                            className="bg-gray-50 dark:bg-navy-default border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-gold-default focus:border-gold-default block p-1.5 transition-colors cursor-pointer"
                        >
                            {[10, 20, 50, 100].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando <span className="font-bold text-gray-900 dark:text-white">{currentPage * pageSize + 1}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0 || loading} className="px-2 border-gray-200 dark:border-white/10">
                        <ChevronsLeft size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0 || loading} leftIcon={<ChevronLeft size={16} />} className="border-gray-200 dark:border-white/10">
                        Anterior
                    </Button>
                    <div className="flex items-center justify-center min-w-[36px] h-8 bg-gold-default/10 text-gold-dark dark:text-gold-light font-bold rounded-lg text-sm border border-gold-default/20">
                        {currentPage + 1}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => prev + 1)} disabled={(currentPage + 1) * pageSize >= totalItems || loading} rightIcon={<ChevronRight size={16} />} className="border-gray-200 dark:border-white/10">
                        Siguiente
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.ceil(totalItems / pageSize) - 1)} disabled={(currentPage + 1) * pageSize >= totalItems || loading} className="px-2 border-gray-200 dark:border-white/10">
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>

            <Card className="mt-2">
                <Table
                    title={currentConfig.title}
                    subtitle={currentConfig.subtitle}
                    data={data}
                    columns={currentConfig.columns}
                    keyExtractor={(item) => item.id}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default TablesView;
