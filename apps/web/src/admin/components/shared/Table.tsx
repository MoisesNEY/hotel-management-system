import type { ReactNode } from 'react';
import Card from './Card'; // Assuming Card is in the same directory or adjust import

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string; // For body cells
    headerClassName?: string; // For header cells
    cell?: (item: T) => ReactNode; // Explicit render function
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    title?: string;
    subtitle?: string; // Added subtitle prop if needed, or remove usage
    isLoading?: boolean;
}

function Table<T>({
    data,
    columns,
    keyExtractor,
    emptyMessage = "No data available",
    title,
    subtitle,
    isLoading = false
}: TableProps<T>) {
    return (
        <Card className="overflow-hidden !p-0 border-none shadow-card">
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-gray-100/50">
                    {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`
                                        px-6 py-3 text-left
                                        text-xs font-semibold text-blue-500 uppercase tracking-wider
                                        border-b border-gray-100
                                        ${col.headerClassName || ''}
                                    `}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className="hover:bg-gray-50/50 transition-colors duration-200"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`
                                                px-6 py-4 whitespace-nowrap text-sm text-gray-600
                                                ${col.className || ''}
                                            `}
                                        >
                                            {col.cell ? col.cell(item) : (typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as ReactNode))}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Table;
