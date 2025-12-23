import React, { useEffect, useState } from 'react';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import { formatCurrency, formatDate, getBookingStatusConfig } from '../../utils/helpers';
import type { BookingDTO, InvoiceDTO, InvoiceItemDTO } from '../../../types/adminTypes';
import { getInvoicesByBooking, addServiceCharge } from '../../../services/admin/invoiceService';
import InvoiceItemsTable from '../Finance/InvoiceItemsTable';
import { Plus, Receipt, User, CreditCard, CalendarDays, FileText, CheckCircle2 } from 'lucide-react';
import { extractErrorMessage } from '../../utils/errorHelper';

interface BookingDetailsModalProps {
    booking: BookingDTO | null;
    isOpen: boolean;
    onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [activeInvoice, setActiveInvoice] = useState<InvoiceDTO | null>(null);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [activeTab, setActiveTab] = useState<'General' | 'Finanzas'>('Finanzas');
    
    // Add Charge State
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [chargeDescription, setChargeDescription] = useState('');
    const [chargeAmount, setChargeAmount] = useState('');
    const [chargeLoading, setChargeLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        if (isOpen && booking) {
            fetchInvoices();
        } else {
            // Reset state on close
            setInvoices([]);
            setActiveInvoice(null);
            setShowChargeModal(false);
            setChargeDescription('');
            setChargeAmount('');
        }
    }, [isOpen, booking]);

    const fetchInvoices = async () => {
        if (!booking) return;
        try {
            setLoadingInvoices(true);
            const data = await getInvoicesByBooking(booking.id);
            setInvoices(data);
            // Default to first invoice or keeping active if valid
            if (data.length > 0 && !activeInvoice) {
                setActiveInvoice(data[0]);
            } else if (data.length > 0 && activeInvoice) {
                 const updated = data.find(i => i.id === activeInvoice.id);
                 if (updated) setActiveInvoice(updated);
            }
        } catch (error) {
            console.error("Error fetching invoices", error);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleAddCharge = async () => {
        if (!booking || !chargeAmount || !chargeDescription) return;

        try {
            setChargeLoading(true);
            const newItem: Partial<InvoiceItemDTO> = {
                description: chargeDescription,
                quantity: 1, // Default to 1 for generic charges
                unitPrice: parseFloat(chargeAmount),
                totalPrice: parseFloat(chargeAmount)
            };

            const updatedInvoice = await addServiceCharge(booking.id, newItem);
            
            // Optimistic / Immediate Update
            setInvoices(prev => {
                const exists = prev.find(i => i.id === updatedInvoice.id);
                if (exists) {
                    return prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i);
                } else {
                    return [...prev, updatedInvoice];
                }
            });
            setActiveInvoice(updatedInvoice);
            
            // Reset description/amount for next charge
            setChargeDescription('');
            setChargeAmount('');
            setShowChargeModal(false); // Close 'Add Charge' modal

        } catch (error) {
            console.error("Error adding charge", error);
            alert(extractErrorMessage(error)); // Simple alert for now inside modal
        } finally {
            setChargeLoading(false);
        }
    };

    if (!booking) return null;
    const statusConfig = getBookingStatusConfig(booking.status);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reserva ${booking.code}`} size="xl">
            <div className="h-[70vh] flex flex-col">
                {/* Header Information */}
                <div className="bg-gray-50 dark:bg-white/5 p-6 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-6 justify-between items-start">
                    <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                            <User size={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                 {booking.customer?.firstName} {booking.customer?.lastName}
                             </h3>
                             <p className="text-sm text-gray-500">{booking.customer?.email}</p>
                         </div>
                    </div>
                    
                    <div className="flex gap-8 text-sm">
                        <div>
                             <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Fechas</p>
                             <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                 <CalendarDays size={16} className="text-gray-400"/>
                                 {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                             </div>
                        </div>
                        <div>
                             <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Estado</p>
                             <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </div>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex border-b border-gray-100 dark:border-white/5 px-6 gap-6">
                    {(['General', 'Finanzas'] as const).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`py-4 text-sm font-medium border-b-2 outline-none transition-colors ${
                                activeTab === category
                                    ? 'border-gold-500 text-gold-600 dark:text-gold-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-auto p-6 bg-white dark:bg-[#1a1a1a]">
                    {/* GENERAL PANEL */}
                    <div className={activeTab === 'General' ? 'block space-y-6' : 'hidden'}>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={18} /> Habitaciones Reservadas
                            </h4>
                            <div className="space-y-3">
                                {booking.items?.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl flex justify-between items-center">
                                        <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.roomType.name}</p>
                                                <p className="text-sm text-gray-500">Ocupante: {item.occupantName || 'N/D'}</p>
                                        </div>
                                        <div className="text-right">
                                                <p className="font-mono font-medium dark:text-gray-300">{formatCurrency(item.price)}</p>
                                                {item.assignedRoom ? (
                                                    <Badge variant="success" className="mt-1">Hab: {item.assignedRoom.roomNumber}</Badge>
                                                ) : (
                                                    <Badge variant="warning" className="mt-1">Sin Asignar</Badge>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {(booking.notes || booking.customer?.email) && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/10">
                                    <h5 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-2">Notas</h5>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">{booking.notes || 'Sin notas adicionales.'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FINANCE PANEL */}
                    <div className={`h-full ${activeTab === 'Finanzas' ? 'flex flex-col' : 'hidden'}`}>
                        <div className="flex h-full gap-6">
                            {/* Sidebar Invoices List */}
                            <div className="w-1/3 border-r border-gray-100 dark:border-white/5 pr-6 space-y-3 overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Facturas</h4>
                                </div>
                                
                                {loadingInvoices ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">Cargando...</div>
                                ) : invoices.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <Receipt className="mx-auto text-gray-300 mb-2" size={32}/>
                                        <p className="text-sm text-gray-500">Sin facturas generadas</p>
                                    </div>
                                ) : (
                                    invoices.map(inv => (
                                        <button
                                            key={inv.id}
                                            onClick={() => setActiveInvoice(inv)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                activeInvoice?.id === inv.id 
                                                    ? 'border-gold-500 bg-gold-50 dark:bg-gold-500/10 ring-1 ring-gold-500' 
                                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-mono text-xs font-bold text-gray-500">{inv.code}</span>
                                                <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'CANCELLED' ? 'danger' : 'info'} className="text-[10px] px-1.5 py-0">
                                                    {inv.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(inv.issuedDate)}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(inv.totalAmount)}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Active Invoice Details */}
                            <div className="w-2/3 h-full overflow-y-auto pl-2 flex flex-col">
                                {activeInvoice ? (
                                    <>
                                        <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Factura Seleccionada</p>
                                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {formatCurrency(activeInvoice.totalAmount)}
                                                        {activeInvoice.status === 'PAID' && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                    </h2>
                                                </div>
                                                {activeInvoice.status !== 'PAID' && activeInvoice.status !== 'CANCELLED' && (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => setShowChargeModal(true)}
                                                        leftIcon={<Plus size={16} />}
                                                    >
                                                        Agregar Cargo
                                                    </Button>
                                                )}
                                        </div>
                                        
                                        <InvoiceItemsTable items={activeInvoice.items} />

                                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-8 text-sm">
                                            <div className="text-right">
                                                <p className="text-gray-500 mb-1">Subtotal (aprox)</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(activeInvoice.totalAmount - (activeInvoice.taxAmount || 0))}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500 mb-1">Impuestos</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(activeInvoice.taxAmount || 0)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 dark:text-white font-bold mb-1 text-lg">Total</p>
                                                <p className="font-bold text-xl text-gold-600 dark:text-gold-500">
                                                    {formatCurrency(activeInvoice.totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2">
                                        <CreditCard size={40} className="opacity-20"/>
                                        <p>Selecciona una factura para ver los detalles</p>
                                        <p className="text-xs max-w-xs text-center">Si no hay facturas, agrega un cargo para generar una nueva automáticamente.</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setShowChargeModal(true)}
                                            leftIcon={<Plus size={16} />}
                                            className="mt-4"
                                        >
                                            Crear Factura (Vía Cargo)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </div>

            {/* Nested Modal: Add Charge */}
            <Modal
                isOpen={showChargeModal}
                onClose={() => setShowChargeModal(false)}
                title="Agregar Cargo / Servicio"
                size="sm"
            >
                <div className="p-6 space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                         <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 outline-none"
                            placeholder="Ej. Servicio a la habitación, Lavandería..."
                            autoFocus
                            value={chargeDescription}
                            onChange={(e) => setChargeDescription(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                         <input
                            type="number"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 outline-none"
                            placeholder="0.00"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                         />
                     </div>
                     <div className="flex justify-end gap-3 pt-4">
                         <Button variant="ghost" onClick={() => setShowChargeModal(false)}>Cancelar</Button>
                         <Button onClick={handleAddCharge} disabled={chargeLoading || !chargeAmount || !chargeDescription}>
                             {chargeLoading ? 'Guardando...' : 'Agregar Cargo'}
                         </Button>
                     </div>
                </div>
            </Modal>
        </Modal>
    );
};

export default BookingDetailsModal;
