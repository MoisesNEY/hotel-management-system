import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';

import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllRooms, deleteRoom } from '../../../services/admin/roomService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import type { RoomDTO, RoomTypeDTO } from '../../../types/adminTypes';
import { getRoomStatusConfig } from '../../utils/helpers';
import RoomForm from './RoomForm';

const RoomsView = () => {
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Load data when pagination or filter changes
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, statusFilter]);

    // Load room types only once on mount
    useEffect(() => {
        getAllRoomTypes().then(res => setRoomTypes(res.data)).catch(console.error);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const roomsResponse = await getAllRooms(currentPage, pageSize, 'id,asc', statusFilter);
            setRooms(roomsResponse.data);
            setTotalItems(roomsResponse.total);
        } catch (error) {
            console.error("Error loading rooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (room: RoomDTO) => {
        setEditingRoom(room);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setRoomToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;
        try {
            await deleteRoom(roomToDelete);
            setShowDeleteModal(false);
            setRoomToDelete(null);
            // Reload data to get correct pagination
            loadData();
        } catch (error) {
            console.error(error);
            alert('No se pudo eliminar la habitación.');
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingRoom(null);
        loadData();
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingRoom(null);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to first page when size changes
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(0); // Reset to first page when filter changes
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    const columns: Column<RoomDTO>[] = [
        { header: 'ID', accessor: (row) => row.id },
        {
            header: 'Número',
            accessor: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.roomNumber}</span>
        },
        {
            header: 'Tipo',
            accessor: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.roomType?.name || 'Sin asignar'}
                </span>
            )
        },
        {
            header: 'Precio',
            accessor: (row) => (
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ${row.roomType?.basePrice || 0}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => {
                const config = getRoomStatusConfig(row.status);
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
                    >
                        {config.label}
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="info" onClick={() => handleEdit(row)} iconOnly>
                        <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)} iconOnly>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const statusLabels: Record<string, string> = {
        'ALL': 'Todas',
        'AVAILABLE': 'Disponible',
        'OCCUPIED': 'Ocupada',
        'MAINTENANCE': 'Mantenimiento',
        'CLEANING': 'Limpieza'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habitaciones</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión del inventario de habitaciones</p>
                </div>
                <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
                    Nueva Habitación
                </Button>
            </div>

            <Card>
                {/* Filters and Page Size */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(statusLabels).map(([status, label]) => {
                            const isActive = statusFilter === status;
                            return (
                                <Button
                                    key={status}
                                    onClick={() => handleStatusFilterChange(status)}
                                    variant={isActive ? 'primary' : 'ghost'}
                                    size="sm"
                                    className={isActive
                                        ? 'shadow-md'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-none shadow-none hover:shadow-none'
                                    }
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                    
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
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
                            <option value={100} className="bg-white dark:bg-[#1a1a1a]">100</option>
                        </select>
                        <span className="text-sm text-gray-500 dark:text-gray-400">por página</span>
                    </div>
                </div>

                <Table
                    data={rooms}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No se encontraron habitaciones"
                    keyExtractor={(room: RoomDTO) => room.id}
                />

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalItems > 0 
                                ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} habitaciones`
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

            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title={editingRoom ? "Editar Habitación" : "Nueva Habitación"}
                size="md"
            >
                <RoomForm
                    initialData={editingRoom}
                    roomTypes={roomTypes}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmar Eliminación"
                size="md"
            >
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-8 ring-red-50 dark:ring-red-900/10">
                        <Trash2 size={32} />
                    </div>

                    <div className="space-y-2 px-4">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            ¿Estás seguro de eliminar esta habitación?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Esta acción no se puede deshacer y la información asociada se perderá permanentemente.
                        </p>
                    </div>

                    <div className="flex justify-center space-x-3 pt-4 w-full">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteModal(false)}
                            className="px-6"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            leftIcon={<Trash2 size={16} />}
                            className="px-6"
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RoomsView;
