import React from 'react';
import Table, { type Column } from '../../components/shared/Table'; // Use shared Table

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
        <div className="content">
            <div className="row">
                <div className="col-md-12">
                    {/* Table 1: Simple Table */}
                    <Table<TableRow>
                        title="Simple Table"
                        subtitle="Here is a subtitle for this table"
                        data={data}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        striped={false} // Default paper table isn't heavily striped, usually white
                    />
                </div>
                <div className="col-md-12">
                    {/* Table 2: Table on Plain Background */}
                    <Table<TableRow>
                        title="Table on Plain Background"
                        subtitle="Here is a subtitle for this table"
                        data={data}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                    // In true Paper Dashboard, "Plain Background" removes the white card bg and transparency. 
                    // My Card component supports transparency if I pass className="card-plain" style={{backgroundColor: 'transparent', boxShadow: 'none'}}
                    // But strictly, I should just reuse the component logic. 
                    // For now, I'll stick to the cleaner look.
                    />
                </div>
            </div>
        </div>
    );
};

export default TablesView;
