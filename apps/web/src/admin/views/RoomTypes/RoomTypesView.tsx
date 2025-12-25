import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllRoomTypes, deleteRoomType } from '../../../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../../../types/adminTypes';
import { formatCurrency } from '../../utils/helpers';
import RoomTypeForm from './RoomTypeForm';

const RoomTypesView = () => {
    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<RoomTypeDTO | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<number | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when pagination or search changes
    useEffect(() => {
        loadTypes();
    }, [currentPage, pageSize, debouncedSearch]);

    const loadTypes = async () => {
        try {
            setLoading(true);
            const result = await getAllRoomTypes(currentPage, pageSize, 'id,asc');
            
            // Client-side filter by name if search is active
            let filteredData = result.data;
            if (debouncedSearch.trim()) {
                const query = debouncedSearch.toLowerCase();
                filteredData = result.data.filter(rt => 
                    rt.name?.toLowerCase().includes(query) ||
                    rt.description?.toLowerCase().includes(query)
                );
            }
            
            setRoomTypes(filteredData);
            setTotalItems(debouncedSearch.trim() ? filteredData.length : result.total);
        } catch (error) {
            console.error("Error loading room types", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: RoomTypeDTO) => {
        setEditingType(type);
        setShowModal(true);
    };

    const handleDeleteCheck = (id: number) => {
        setTypeToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (typeToDelete !== null) {
            try {
                await deleteRoomType(typeToDelete);
                setShowDeleteModal(false);
                setTypeToDelete(null);
                loadTypes(); // Reload to update pagination
            } catch (error) {
                console.error(error);
                alert('No se pudo eliminar, verifique si hay habitaciones asociadas.');
                setShowDeleteModal(false);
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingType(null);
        loadTypes();
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingType(null);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    const columns: Column<RoomTypeDTO>[] = [
        { header: 'ID', accessor: (row) => row.id },
        {
            header: 'Nombre',
            accessor: (row) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-white tracking-tight">{row.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">
                        {row.description?.substring(0, 50)}{row.description && row.description.length > 50 ? '...' : ''}
                    </div>
                </div>
            )
        },
        {
            header: 'Precio Base',
            accessor: (row) => (
                <span className="font-semibold text-green-600">{formatCurrency(row.basePrice)}</span>
            )
        },
        { header: 'Capacidad', accessor: (row) => `${row.maxCapacity} personas` },
        { header: 'Camas', accessor: (row) => row.beds || '-' },
        { header: 'Área', accessor: (row) => row.area ? `${row.area} m²` : '-' },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="info" onClick={() => handleEdit(row)} iconOnly>
                        <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteCheck(row.id)} iconOnly>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipos de Habitación</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configuración de categorías y precios</p>
                </div>
                <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
                    Nuevo Tipo
                </Button>
            </div>

            <Card>
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center justify-end gap-2 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mostrar:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                    >
                        <option value={5} className="bg-white dark:bg-[#1a1a1a]">5</option>
                        <option value={10} className="bg-white dark:bg-[#1a1a1a]">10</option>
                        <option value={20} className="bg-white dark:bg-[#1a1a1a]">20</option>
                        <option value={50} className="bg-white dark:bg-[#1a1a1a]">50</option>
                    </select>
                    <span className="text-sm text-gray-500 dark:text-gray-400">por página</span>
                </div>

                <Table
                    data={roomTypes}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No hay tipos de habitación registrados"
                    keyExtractor={(item) => item.id}
                />

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalItems > 0 
                                ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} tipos`
                                : 'Sin resultados'
                            }
                        </p>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                                
                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 3) {
                                        pageNum = i;
                                    } else if (currentPage > totalPages - 4) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-[#d4af37] text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title={editingType ? "Editar Tipo de Habitación" : "Nuevo Tipo de Habitación"}
                size="lg"
            >
                <RoomTypeForm
                    initialData={editingType}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100 opacity-100">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Confirmar acción
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ¿Estás seguro de eliminar este tipo de habitación?
                                </p>
                            </div>

                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-red-500/30"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTypesView;
