import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
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
            <div className="flex flex-wrap -mx-4">
                <div className="w-full px-4">
                    <div className="bg-white rounded-md shadow-[0_6px_10px_-4px_rgba(0,0,0,0.15)] flex flex-col mb-8 w-full break-words">
                        <div className="p-4 bg-transparent border-b-0 rounded-t-md">
                            <h4 className="mt-2 mb-2 text-[#252422] text-2xl font-light">Gestor de Contenido Web</h4>
                            <p className="text-[#9a9a9a] text-sm mb-2 font-light">Administra las secciones de tu Landing Page</p>
                        </div>
                        <div className="flex-auto p-[15px_15px_10px]">
                            <div className="block w-full overflow-x-auto">
                                <table className="w-full max-w-full mb-4 bg-transparent border-collapse text-left">
                                    <thead className="text-paper-primary">
                                        <tr>
                                            <th className="py-2 px-2 text-xs uppercase font-semibold border-b border-gray-200">Código</th>
                                            <th className="py-2 px-2 text-xs uppercase font-semibold border-b border-gray-200">Nombre Sección</th>
                                            <th className="py-2 px-2 text-xs uppercase font-semibold border-b border-gray-200">Tipo</th>
                                            <th className="py-2 px-2 text-xs uppercase font-semibold border-b border-gray-200 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
                                        ) : collections.map((col) => (
                                            <tr key={col.id}>
                                                <td className="py-3 px-2 border-b border-[#dddddd] text-sm"><code className="text-[#e83e8c] text-[87.5%]">{col.code}</code></td>
                                                <td className="py-3 px-2 border-b border-[#dddddd] text-sm">{col.name} <br/><small className="text-gray-500 text-[80%]">{col.description}</small></td>
                                                <td className="py-3 px-2 border-b border-[#dddddd] text-sm">
                                                    <span className={`inline-block px-2 py-1 text-[11px] font-bold leading-none text-white rounded-full bg-paper-${getBadgeColor(col.type)}`}>
                                                        {col.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 border-b border-[#dddddd] text-right text-sm">
                                                    <button 
                                                        className="inline-flex items-center justify-center gap-1 bg-paper-primary hover:bg-[#4bc2c5] text-white py-1 px-2 rounded text-xs font-semibold shadow-md transition-all duration-300"
                                                        onClick={() => navigate(`/admin/cms/edit/${col.id}`)}
                                                    >
                                                        <Edit size={14} />
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