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
    striped = true // Default to true for Paper theme
}: TableProps<T>) {
    return (
        <Card className="card-plain" style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
            {/* Header Section inside Card if provided */}
            {(title || subtitle) && (
                <div className="card-header" style={{
                    backgroundColor: 'transparent',
                    border: '0 none',
                    padding: '15px 15px 0'
                }}>
                    {title && <h4 className="card-title" style={{ margin: 0, color: '#333' }}>{title}</h4>}
                    {subtitle && <p className="card-category" style={{ color: '#9a9a9a', fontSize: '14px', margin: 0 }}>{subtitle}</p>}
                </div>
            )}

            <div className="card-body table-full-width table-responsive" style={{ padding: '0' }}>
                <table className="table table-hover" style={{ width: '100%', marginBottom: '1rem', color: '#66615b' }}>
                    <thead style={{ color: '#51cbce' /* Primary Color */ }}>
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    style={{
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        color: 'inherit',
                                        fontWeight: 600,
                                        padding: '12px 8px',
                                        borderBottom: '1px solid #ddd',
                                        borderTop: '0'
                                    }}
                                    className={col.headerClassName || ''}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-5 text-gray-500">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-5 text-gray-500 italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={keyExtractor(item)}
                                    // Striped logic: nth-of-type(odd) usually handled by CSS, but can force explicit bg
                                    style={{
                                        backgroundColor: striped && index % 2 !== 0 ? '#f2f2f2' : 'transparent',
                                        /* Hover affect handled by global .table-hover css or inline */
                                    }}
                                    className="hover:bg-gray-100 transition-colors"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                fontSize: '14px',
                                                padding: '12px 8px',
                                                verticalAlign: 'middle',
                                                borderTop: '1px solid #e3e3e3'
                                            }}
                                            className={col.className || ''}
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
