import React from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Card from '../../components/shared/Card';

interface TableRow {
    id: number;
    name: string;
    position: string;
    office: string;
    age: number;
    startDate: string;
    salary: string;
}

const TablesView: React.FC = () => {
    // const [searchTerm, setSearchTerm] = useState(''); // Removed simple search for now to match strict "Table List" demo look which splits tables

    // In Paper Dashboard demo, Tables page usually shows two examples: "Simple Table" and "Table on Plain Background"
    // I will replicate this structure for visual fidelity.

    const data: TableRow[] = [
        { id: 1, name: 'Dakota Rice', position: 'Niger', office: 'Oud-Turnhout', age: 36, startDate: '2011/04/25', salary: '$36,738' },
        { id: 2, name: 'Minerva Hooper', position: 'Curaçao', office: 'Sinaai-Waas', age: 23, startDate: '2011/07/25', salary: '$23,789' },
        { id: 3, name: 'Sage Rodriguez', position: 'Netherlands', office: 'Baileux', age: 56, startDate: '2009/01/12', salary: '$56,142' },
        { id: 4, name: 'Philip Chaney', position: 'Korea, South', office: 'Overland Park', age: 38, startDate: '2012/03/29', salary: '$38,735' },
        { id: 5, name: 'Doris Greene', position: 'Malawi', office: 'Feldkirchen in Kärnten', age: 63, startDate: '2008/11/28', salary: '$63,542' },
        { id: 6, name: 'Mason Porter', position: 'Chile', office: 'Gloucester', age: 65, startDate: '2012/12/02', salary: '$78,615' }
    ];

    const columns: Column<TableRow>[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Country', accessor: 'position' }, // Demo maps 'Country' to second col usually
        { header: 'City', accessor: 'office' },
        { header: 'Salary', accessor: 'salary', className: 'text-right', headerClassName: 'text-right' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Listado de Tablas</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ejemplos de visualización de datos</p>
            </div>

            <Card>
                <Table<TableRow>
                    title="Simple Table"
                    subtitle="Ejemplo de tabla con fondo de tarjeta"
                    data={data}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    striped={false}
                />
            </Card>

            <Card className="card-plain">
                <Table<TableRow>
                    title="Table on Plain Background"
                    subtitle="Ejemplo de tabla con fondo transparente"
                    data={data}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
};

export default TablesView;
