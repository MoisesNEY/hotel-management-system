import React, { useState } from 'react';
import {
    Home, Settings, User, Mail, Bell, Search,
    Trash, Edit, CheckCircle,
    ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
    Menu // Kept widely used ones or reused ones.
} from 'lucide-react';
import Card from '../../components/shared/Card';

const IconsView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const iconCategories = [
        {
            name: 'Navegación',
            icons: [
                { Icon: Home, name: 'Home' },
                { Icon: Menu, name: 'Menu' },
                { Icon: Search, name: 'Search' },
                { Icon: Settings, name: 'Settings' },
                { Icon: ChevronRight, name: 'ChevronRight' },
                { Icon: ChevronLeft, name: 'ChevronLeft' },
                { Icon: ChevronUp, name: 'ChevronUp' },
                { Icon: ChevronDown, name: 'ChevronDown' }
            ]
        },
        {
            name: 'General',
            icons: [
                { Icon: User, name: 'User' },
                { Icon: Mail, name: 'Mail' },
                { Icon: Bell, name: 'Bell' },
                { Icon: Trash, name: 'Trash' },
                { Icon: Edit, name: 'Edit' },
                { Icon: CheckCircle, name: 'Check' }
            ]
        }
    ];

    // Flattener for demo simplicity if needed, or keeping categories for structure
    const allIcons = iconCategories.flatMap(c => c.icons);

    // Simple filter
    const filteredIcons = allIcons.filter(icon =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="content">
            <div className="row">
                <div className="col-md-12">
                    <Card title="100+ Awesome Icons" subtitle="Handcrafted by Lucide React">
                        <div className="card-header">
                            {/* Search embedded in header area or above */}
                            <div className="input-group" style={{ maxWidth: '300px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar icono..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '10px 15px',
                                        borderRadius: '20px',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {filteredIcons.map((icon, index) => (
                                    <div className="font-icon-list col-lg-2 col-md-3 col-sm-4 col-6" key={index} style={{ padding: '15px' }}>
                                        <div className="font-icon-detail" style={{
                                            textAlign: 'center',
                                            padding: '10px',
                                            border: '1px solid #e9e9e9',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}>
                                            <icon.Icon size={30} style={{ marginBottom: '10px', color: '#66615b' }} />
                                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{icon.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IconsView;
