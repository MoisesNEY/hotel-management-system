import React from 'react';
import type { InvoiceItemDTO } from '../../../types/adminTypes';
import { formatCurrency } from '../../utils/helpers';

interface InvoiceItemsTableProps {
    items: InvoiceItemDTO[];
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ items }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/10">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3 text-right">Cant.</th>
                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                        <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {items && items.length > 0 ? (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                    {item.description}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                    {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(item.totalPrice)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 italic">
                                No hay items registrados en esta factura.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceItemsTable;
