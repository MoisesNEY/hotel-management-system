import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Table from '../../components/shared/Table';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { FileDown, FileSpreadsheet, Users, Calendar, DoorOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Home, CreditCard, FileText, Wrench, Layers, Receipt } from 'lucide-react';
import { getAllCustomers } from '../../../services/admin/customerService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllRooms } from '../../../services/admin/roomService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import { getAllHotelServices } from '../../../services/admin/hotelServiceService';
import { getAllServiceRequests } from '../../../services/admin/serviceRequestService';
import { getAllInvoices } from '../../../services/admin/invoiceService';
import { getAllPayments } from '../../../services/admin/paymentService';
import { getAllUsers } from '../../../services/admin/userService';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { exportToPDF, exportToExcel, type ExportColumn } from '../../utils/exportUtils';

type Category = 'clientes' | 'reservas' | 'habitaciones' | 'tipos' | 'servicios' | 'solicitudes' | 'facturas' | 'pagos' | 'usuarios';

const TablesView: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('clientes');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [exportScope, setExportScope] = useState<string | number>('page');
    const [customLimit, setCustomLimit] = useState<number>(50);
    const [exportLoading, setExportLoading] = useState(false);

    // Metadata Configuration for each Table Category
    const CATEGORY_CONFIG = useMemo(() => ({
        clientes: {
            title: 'Clientes Registrados',
            subtitle: 'Listado de clientes y datos de contacto',
            icon: <Users size={16} />,
            label: 'Clientes',
            fetcher: getAllCustomers,
            exportTitle: 'Reporte de Clientes',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Nombre', accessor: (row: any) => <span className="font-semibold">{row.firstName} {row.lastName}</span> },
                { header: 'Email', accessor: 'email' },
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
                fullName: `${r.firstName} ${r.lastName}`,
                email: r.email,
                country: r.country,
                licenseId: r.licenseId
            }))
        },
        reservas: {
            title: 'Reservas',
            subtitle: 'Control de reservas y estados',
            icon: <Calendar size={16} />,
            label: 'Reservas',
            fetcher: getAllBookings,
            exportTitle: 'Reporte de Reservas',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Cliente', accessor: (row: any) => <span className="font-semibold">{row.customer?.firstName} {row.customer?.lastName}</span> },
                { header: 'Check-In', accessor: (row: any) => formatDate(row.checkInDate) },
                { header: 'Estado', accessor: (row: any) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge> },
                { header: 'Total', accessor: (row: any) => formatCurrency(row.totalPrice || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Cliente', dataKey: 'customerName' },
                { header: 'Check-In', dataKey: 'checkInDate' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Total', dataKey: 'totalPrice' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                customerName: r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'N/A',
                checkInDate: formatDate(r.checkInDate),
                status: r.status,
                totalPrice: formatCurrency(r.totalPrice || 0)
            }))
        },
        habitaciones: {
            title: 'Habitaciones',
            subtitle: 'Inventario de habitaciones',
            icon: <DoorOpen size={16} />,
            label: 'Habitaciones',
            fetcher: getAllRooms,
            exportTitle: 'Reporte de Habitaciones',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Número', accessor: 'roomNumber' },
                { header: 'Tipo', accessor: (row: any) => row.roomType?.name || 'N/A' },
                { header: 'Estado', accessor: (row: any) => <Badge variant={row.status === 'AVAILABLE' ? 'success' : 'warning'}>{row.status}</Badge> },
                { header: 'Precio', accessor: (row: any) => formatCurrency(row.roomType?.basePrice || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Número', dataKey: 'roomNumber' },
                { header: 'Tipo', dataKey: 'roomType' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Precio', dataKey: 'price' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                roomNumber: r.roomNumber,
                roomType: r.roomType?.name || 'N/A',
                status: r.status,
                price: formatCurrency(r.roomType?.basePrice || 0)
            }))
        },
        tipos: {
            title: 'Tipos de Habitación',
            subtitle: 'Categorías y precios base',
            icon: <Layers size={16} />,
            label: 'Tipos',
            fetcher: getAllRoomTypes,
            exportTitle: 'Reporte de Tipos de Habitación',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Nombre', accessor: (row: any) => <span className="font-semibold">{row.name}</span> },
                { header: 'Capacidad', accessor: 'capacity' },
                { header: 'Precio Base', accessor: (row: any) => formatCurrency(row.basePrice || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Nombre', dataKey: 'name' },
                { header: 'Capacidad', dataKey: 'capacity' },
                { header: 'Precio Base', dataKey: 'basePrice' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity,
                basePrice: formatCurrency(r.basePrice || 0)
            }))
        },
        servicios: {
            title: 'Servicios del Hotel',
            subtitle: 'Catálogo de servicios disponibles',
            icon: <Home size={16} />,
            label: 'Servicios',
            fetcher: getAllHotelServices,
            exportTitle: 'Reporte de Servicios',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Nombre', accessor: (row: any) => <span className="font-semibold">{row.name}</span> },
                { header: 'Estado', accessor: (row: any) => <Badge variant={row.status === 'OPERATIONAL' ? 'success' : 'warning'}>{row.status}</Badge> },
                { header: 'Horario', accessor: (row: any) => `${row.startHour || '00:00'} - ${row.endHour || '24:00'}` },
                { header: 'Costo', accessor: (row: any) => formatCurrency(row.cost || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Nombre', dataKey: 'name' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Horario', dataKey: 'schedule' },
                { header: 'Costo', dataKey: 'cost' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                name: r.name,
                status: r.status,
                schedule: `${r.startHour || '00:00'} - ${r.endHour || '24:00'}`,
                cost: formatCurrency(r.cost || 0)
            }))
        },
        solicitudes: {
            title: 'Solicitudes de Servicio',
            subtitle: 'Servicios solicitados por huéspedes',
            icon: <Wrench size={16} />,
            label: 'Solicitudes',
            fetcher: getAllServiceRequests,
            exportTitle: 'Reporte de Solicitudes',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Servicio', accessor: (row: any) => row.service?.name || 'N/A' },
                { header: 'Cliente', accessor: (row: any) => row.booking?.customer ? `${row.booking.customer.firstName} ${row.booking.customer.lastName}` : 'N/A' },
                { header: 'Fecha', accessor: (row: any) => formatDate(row.requestDate) },
                { header: 'Estado', accessor: (row: any) => <Badge variant={row.status === 'COMPLETED' ? 'success' : row.status === 'IN_PROGRESS' ? 'warning' : 'info'}>{row.status}</Badge> }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Servicio', dataKey: 'serviceName' },
                { header: 'Cliente', dataKey: 'customerName' },
                { header: 'Fecha', dataKey: 'requestDate' },
                { header: 'Estado', dataKey: 'status' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                serviceName: r.service?.name || 'N/A',
                customerName: r.booking?.customer ? `${r.booking.customer.firstName} ${r.booking.customer.lastName}` : 'N/A',
                requestDate: formatDate(r.requestDate),
                status: r.status
            }))
        },
        facturas: {
            title: 'Facturas',
            subtitle: 'Documentos de facturación',
            icon: <FileText size={16} />,
            label: 'Facturas',
            fetcher: getAllInvoices,
            exportTitle: 'Reporte de Facturas',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Código', accessor: (row: any) => <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">{row.code}</code> },
                { header: 'Emisión', accessor: (row: any) => formatDate(row.issuedDate) },
                { header: 'Estado', accessor: (row: any) => <Badge variant={row.status === 'PAID' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default'}>{row.status}</Badge> },
                { header: 'Total', accessor: (row: any) => formatCurrency(row.totalAmount || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Código', dataKey: 'code' },
                { header: 'Emisión', dataKey: 'issuedDate' },
                { header: 'Estado', dataKey: 'status' },
                { header: 'Total', dataKey: 'totalAmount' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                code: r.code,
                issuedDate: formatDate(r.issuedDate),
                status: r.status,
                totalAmount: formatCurrency(r.totalAmount || 0)
            }))
        },
        pagos: {
            title: 'Pagos',
            subtitle: 'Registro de transacciones',
            icon: <CreditCard size={16} />,
            label: 'Pagos',
            fetcher: getAllPayments,
            exportTitle: 'Reporte de Pagos',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Factura', accessor: (row: any) => row.invoice?.code || `#${row.invoiceId}` },
                { header: 'Método', accessor: (row: any) => <Badge variant="info">{row.method}</Badge> },
                { header: 'Fecha', accessor: (row: any) => formatDate(row.paymentDate) },
                { header: 'Monto', accessor: (row: any) => formatCurrency(row.amount || 0), className: 'text-right', headerClassName: 'text-right' }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Factura', dataKey: 'invoiceCode' },
                { header: 'Método', dataKey: 'method' },
                { header: 'Fecha', dataKey: 'paymentDate' },
                { header: 'Monto', dataKey: 'amount' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                invoiceCode: r.invoice?.code || `#${r.invoiceId}`,
                method: r.method,
                paymentDate: formatDate(r.paymentDate),
                amount: formatCurrency(r.amount || 0)
            }))
        },
        usuarios: {
            title: 'Usuarios del Sistema',
            subtitle: 'Cuentas de acceso (Keycloak)',
            icon: <Receipt size={16} />,
            label: 'Usuarios',
            fetcher: getAllUsers,
            exportTitle: 'Reporte de Usuarios',
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Usuario', accessor: (row: any) => <span className="font-semibold">{row.login}</span> },
                { header: 'Nombre', accessor: (row: any) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'N/A' },
                { header: 'Email', accessor: 'email' },
                { header: 'Roles', accessor: (row: any) => <div className="flex gap-1">{row.authorities?.map((r: string) => <Badge key={r} variant="default" className="text-[9px]">{r.replace('ROLE_', '')}</Badge>)}</div> }
            ],
            exportColumns: [
                { header: 'ID', dataKey: 'id' },
                { header: 'Usuario', dataKey: 'login' },
                { header: 'Nombre', dataKey: 'fullName' },
                { header: 'Email', dataKey: 'email' },
                { header: 'Roles', dataKey: 'roles' }
            ],
            mapForExport: (rows: any[]) => rows.map(r => ({
                id: r.id,
                login: r.login,
                fullName: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A',
                email: r.email,
                roles: r.authorities?.join(', ') || ''
            }))
        }
    }), []);

    const loadCategoryData = useCallback(async (category: Category, page: number, size: number) => {
        try {
            setLoading(true);
            const result = await CATEGORY_CONFIG[category].fetcher(page, size);
            setData(result.data);
            setTotalItems(result.total);
        } catch (error) {
            console.error(`Error loading ${category}:`, error);
            setData([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [CATEGORY_CONFIG]);

    useEffect(() => {
        loadCategoryData(activeCategory, currentPage, pageSize);
    }, [activeCategory, currentPage, pageSize, loadCategoryData]);

    const handleCategoryChange = (cat: Category) => {
        setActiveCategory(cat);
        setCurrentPage(0);
        setData([]);
    };

    const handleExport = async (type: 'pdf' | 'excel') => {
        try {
            setExportLoading(true);
            const config = CATEGORY_CONFIG[activeCategory];
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `reporte-${activeCategory}-${exportScope}-${dateStr}`;

            let exportRows = data;

            if (exportScope === 'all') {
                if (totalItems > data.length) {
                    const result = await config.fetcher(0, totalItems);
                    exportRows = result.data;
                }
            } else if (typeof exportScope === 'number') {
                const result = await config.fetcher(0, exportScope);
                exportRows = result.data;
            } else if (exportScope === 'custom') {
                const result = await config.fetcher(0, customLimit);
                exportRows = result.data;
            }

            const exportData = config.mapForExport(exportRows);

            if (type === 'pdf') {
                exportToPDF(filename, config.exportTitle, config.exportColumns as ExportColumn[], exportData);
            } else {
                exportToExcel(filename, activeCategory, exportData);
            }
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setExportLoading(false);
        }
    };

    const currentConfig = CATEGORY_CONFIG[activeCategory];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Centro de Reportes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visualiza y exporta datos de todas las entidades del sistema</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400">Rango:</span>
                        <div className="flex items-center gap-1.5">
                            <select
                                value={exportScope}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setExportScope(val === 'page' || val === 'all' || val === 'custom' ? val : Number(val));
                                }}
                                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[10px] uppercase font-bold tracking-widest rounded-lg focus:ring-1 focus:ring-[#d4af37]/30 block px-3 h-9 transition-all cursor-pointer outline-none appearance-none pr-8"
                            >
                                <option value="page">Página Actual</option>
                                <option value={50}>Primeros 50</option>
                                <option value={100}>Primeros 100</option>
                                <option value={500}>Primeros 500</option>
                                <option value="all">Todo</option>
                                <option value="custom">Personalizado...</option>
                            </select>

                            {exportScope === 'custom' && (
                                <input
                                    type="number"
                                    value={customLimit}
                                    onChange={(e) => setCustomLimit(Math.max(1, Number(e.target.value)))}
                                    className="w-16 h-9 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 text-[10px] font-bold px-2 rounded-lg focus:ring-1 focus:ring-[#d4af37]/30 outline-none transition-all"
                                    placeholder="Cant."
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport('pdf')}
                            isLoading={exportLoading}
                            leftIcon={<FileDown size={14} />}
                            className="text-[10px] uppercase font-bold tracking-widest py-1 h-9"
                        >
                            PDF
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport('excel')}
                            isLoading={exportLoading}
                            leftIcon={<FileSpreadsheet size={14} />}
                            className="text-[10px] uppercase font-bold tracking-widest py-1 h-9 border-green-200 text-green-700 hover:bg-green-50"
                        >
                            Excel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Tabs - Scrollable */}
            <div className="overflow-x-auto pb-2">
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit border border-gray-200 dark:border-white/10 gap-1">
                    {Object.entries(CATEGORY_CONFIG).map(([id, config]) => (
                        <button
                            key={id}
                            onClick={() => handleCategoryChange(id as Category)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeCategory === id
                                ? 'bg-white dark:bg-[#d4af37]/20 text-[#b8982e] dark:text-[#d4af37] shadow-sm border border-[#d4af37]/30'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'
                                }`}
                        >
                            {config.icon}
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="mt-4">
                {/* Pagination & Table Header Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filas:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 text-sm rounded-lg focus:ring-1 focus:ring-[#d4af37]/30 block px-3 h-9 transition-all cursor-pointer outline-none"
                            >
                                {[10, 20, 50, 100].map(sz => (
                                    <option key={sz} value={sz}>{sz}</option>
                                ))}
                            </select>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Mostrando <span className="font-bold text-gray-900 dark:text-white">{totalItems > 0 ? currentPage * pageSize + 1 : 0}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0 || loading} className="px-2 border-gray-200 dark:border-white/10">
                            <ChevronsLeft size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0 || loading} leftIcon={<ChevronLeft size={16} />} className="border-gray-200 dark:border-white/10">
                            Anterior
                        </Button>
                        <div className="flex items-center justify-center min-w-[36px] h-8 bg-[#d4af37]/10 text-[#b8982e] dark:text-[#d4af37] font-bold rounded-lg text-sm border border-[#d4af37]/20">
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
