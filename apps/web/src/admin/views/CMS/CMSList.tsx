import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { CollectionType, type AssetCollection } from '../../../types/adminTypes';
import { AssetCollectionService } from '../../../services/admin/assetCollectionService';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';

const CMSList: React.FC = () => {
    const [collections, setCollections] = useState<AssetCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await AssetCollectionService.query();
            setCollections(res.data);
        } catch (error) {
            console.error("Error cargando CMS", error);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (type?: AssetCollection['type']) => {
        switch (type) {
            case CollectionType.SINGLE_IMAGE: return 'bg-[#51bcda]'; // Info
            case CollectionType.GALLERY: return 'bg-[#6bd098]'; // Success
            case CollectionType.MAP_EMBED: return 'bg-[#fbc658]'; // Warning
            default: return 'bg-[#ef8157]'; // Danger/Secondary default
        }
    };
    
    // Define columns for the Table component
    const columns = [
        { 
            header: "Código", 
            accessor: 'code' as keyof AssetCollection,
            cell: (item: AssetCollection) => <code className="text-[#e83e8c] text-xs bg-pink-50 px-1 py-0.5 rounded">{item.code}</code>
        },
        { 
            header: "Nombre Sección", 
            accessor: 'name' as keyof AssetCollection,
            cell: (item: AssetCollection) => (
                <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <br/>
                    <small className="text-gray-500">{item.description}</small>
                </div>
            )
        },
        { 
            header: "Tipo", 
            accessor: 'type' as keyof AssetCollection,
            cell: (item: AssetCollection) => (
                <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold text-white rounded-full ${getBadgeColor(item.type)}`}>
                    {item.type}
                </span>
            )
        },
        {
            header: "Acciones",
            accessor: 'id' as keyof AssetCollection,
            cell: (item: AssetCollection) => (
                <div className="flex justify-end">
                     <Button 
                        size="sm" 
                        variant="primary" 
                        icon={<Edit size={14} />} 
                        onClick={() => navigate(`/admin/cms/edit/${item.id}`)}
                    >
                        Gestionar
                    </Button>
                </div>
            ),
            headerClassName: "text-right",
            className: "text-right"
        }
    ];

    return (
        <div className="content">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full px-4">
                    <Card 
                        title="Gestor de Contenido Web" 
                        subtitle="Administra las secciones de tu Landing Page"
                        className="mb-8"
                    >
                        <Table 
                            data={collections}
                            columns={columns}
                            keyExtractor={(item) => item.id || item.code || Math.random()}
                            isLoading={loading}
                            emptyMessage="No se encontraron colecciones de contenido."
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CMSList;