import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Layers } from 'lucide-react';
import { CollectionType, type AssetCollection } from '../../../types/adminTypes';
import { AssetCollectionService } from '../../../services/admin/assetCollectionService';


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
            case CollectionType.SINGLE_IMAGE: return 'info';
            case CollectionType.GALLERY: return 'success';
            case CollectionType.MAP_EMBED: return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <div className="content">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Gestor de Contenido Web</h4>
                            <p className="category">Administra las secciones de tu Landing Page</p>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead className="text-primary">
                                        <tr>
                                            <th>Código</th>
                                            <th>Nombre Sección</th>
                                            <th>Tipo</th>
                                            <th className="text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4} className="text-center">Cargando...</td></tr>
                                        ) : collections.map((col) => (
                                            <tr key={col.id}>
                                                <td><code>{col.code}</code></td>
                                                <td>{col.name} <br/><small className="text-muted">{col.description}</small></td>
                                                <td>
                                                    <span className={`badge badge-${getBadgeColor(col.type)}`}>
                                                        {col.type}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button 
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => navigate(`/admin/cms/edit/${col.id}`)}
                                                    >
                                                        <Edit size={16} className="mr-1" />
                                                        Gestionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSList;