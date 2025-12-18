import type { ReactNode } from 'react';
import Card from './Card';

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
    subtitle?: string;
    isLoading?: boolean;
    striped?: boolean; // New prop for striped rows
}

function Table<T>({
    data,
    columns,
    keyExtractor,
    emptyMessage = "No data available",
    title,
    subtitle,
    isLoading = false,
    striped = true
}: TableProps<T>) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            {/* Header Section inside Card if provided */}
            {(title || subtitle) && (
                <div className="px-4 pt-4 pb-0 bg-transparent border-0">
                    {title && <h4 className="m-0 text-gray-800 text-xl font-medium">{title}</h4>}
                    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                </div>
            )}

            <div className="overflow-x-auto w-full p-0">
                <table className="w-full mb-4 text-left border-collapse">
                    <thead className="text-paper-primary">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`
                                        text-xs uppercase font-semibold tracking-wider
                                        py-3 px-4
                                        border-b border-gray-200
                                        ${col.headerClassName || ''}
                                    `}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-6 text-gray-500 italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={`
                                        border-b border-gray-100 last:border-b-0
                                        hover:bg-gray-50 transition-colors duration-150
                                        ${striped && index % 2 !== 0 ? 'bg-gray-50/50' : 'bg-transparent'}
                                    `}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`
                                                text-sm py-3 px-4 align-middle
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
