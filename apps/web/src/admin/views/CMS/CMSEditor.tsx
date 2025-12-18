import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Edit } from 'lucide-react';
import { CollectionType, defaultWebContent, type AssetCollection, type WebContent } from '../../../types/adminTypes';
import { AssetCollectionService } from '../../../services/admin/assetCollectionService';
import { WebContentService } from '../../../services/admin/webContentService';

const CMSEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [collection, setCollection] = useState<AssetCollection | null>(null);
    const [contents, setContents] = useState<WebContent[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para el formulario de edición (Modal simulado o Inline)
    const [editingItem, setEditingItem] = useState<WebContent | null>(null);

    useEffect(() => {
        if (id) loadData(Number(id));
    }, [id]);

    const loadData = async (collectionId: number) => {
        try {
            const colRes = await AssetCollectionService.find(collectionId);
            setCollection(colRes.data);

            // Cargar items ordenados
            const contentRes = await WebContentService.query({ 
                'collectionId.equals': collectionId,
                sort: 'sortOrder,asc' 
            });
            setContents(contentRes.data);
        } catch (error) {
            console.error("Error loading details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async () => {
        if (!editingItem || !collection) return;

        try {
            const payload = { ...editingItem, collection: collection }; // Relacionar
            if (payload.id) {
                await WebContentService.update(payload);
            } else {
                await WebContentService.create(payload);
            }
            setEditingItem(null); // Cerrar editor
            loadData(collection.id!); // Recargar lista
        } catch (error) {
            alert("Error guardando contenido");
        }
    };

    const handleDelete = async (itemId: number) => {
        if(!window.confirm("¿Seguro de eliminar este elemento?")) return;
        await WebContentService.delete(itemId);
        if (collection) loadData(collection.id!);
    };

    // --- RENDERIZADORES SEGÚN TIPO ---

    const renderGalleryEditor = () => (
        <div className="flex flex-wrap -mx-4">
            {contents.map((item) => (
                <div className="w-full md:w-1/3 px-4 mb-4" key={item.id}>
                    <div className="bg-white rounded shadow-card flex flex-col h-full">
                        <img src={item.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-[200px] object-cover rounded-t" alt="..." />
                        <div className="flex-auto p-4">
                            <h5 className="text-lg font-semibold mb-2">{item.title}</h5>
                            <p className="text-gray-600 text-sm mb-4">{item.subtitle}</p>
                            <div className="flex justify-between mt-auto">
                                <button className="bg-paper-info hover:bg-[#4ab4d1] text-white py-1 px-3 rounded text-sm transition-colors" onClick={() => setEditingItem(item)}>Editar</button>
                                <button className="bg-paper-danger hover:bg-[#eb7446] text-white py-1 px-3 rounded text-sm transition-colors" onClick={() => handleDelete(item.id!)}>Borrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="w-full md:w-1/3 px-4 mb-4">
                <div 
                    className="bg-white rounded shadow-card h-full min-h-[300px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setEditingItem({ ...defaultWebContent, collection })}
                >
                    <div className="text-center text-gray-400">
                        <Plus size={48} className="mx-auto mb-2" />
                        <p>Agregar Imagen</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTextListEditor = () => (
        <div className="block w-full overflow-x-auto">
            <button className="bg-paper-success hover:bg-[#63c38e] text-white py-2 px-4 rounded shadow mb-4 inline-flex items-center gap-2" onClick={() => setEditingItem({ ...defaultWebContent, collection })}>
                <Plus size={16} /> Agregar Elemento
            </button>
            <table className="w-full max-w-full mb-4 bg-transparent border-collapse text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-2 px-2 border-b border-gray-200 font-semibold text-gray-600">Orden</th>
                        <th className="py-2 px-2 border-b border-gray-200 font-semibold text-gray-600">Título (Label)</th>
                        <th className="py-2 px-2 border-b border-gray-200 font-semibold text-gray-600">Subtítulo (Valor)</th>
                        <th className="py-2 px-2 border-b border-gray-200 font-semibold text-gray-600">Acción (Link)</th>
                        <th className="py-2 px-2 border-b border-gray-200 font-semibold text-gray-600">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {contents.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-2 border-b border-gray-100">{item.sortOrder}</td>
                            <td className="py-2 px-2 border-b border-gray-100">{item.title}</td>
                            <td className="py-2 px-2 border-b border-gray-100">{item.subtitle}</td>
                            <td className="py-2 px-2 border-b border-gray-100"><code className="text-[#e83e8c] text-sm">{item.actionUrl}</code></td>
                            <td className="py-2 px-2 border-b border-gray-100">
                                <button className="bg-paper-info text-white p-1 rounded mr-2 hover:bg-[#4ab4d1]" onClick={() => setEditingItem(item)}><Edit size={14}/></button>
                                <button className="bg-paper-danger text-white p-1 rounded hover:bg-[#eb7446]" onClick={() => handleDelete(item.id!)}><Trash2 size={14}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Formulario Modal/Overlay simple
    const renderEditForm = () => {
        if (!editingItem) return null;
        return (
            <div className="fixed inset-0 bg-black/50 z-[1050] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h4 className="m-0 text-xl font-semibold">{editingItem.id ? 'Editar Elemento' : 'Nuevo Elemento'}</h4>
                    </div>
                    <div className="p-6 overflow-y-auto flex-auto">
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-700 font-medium">Título</label>
                            <input 
                                className="block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-paper-primary focus:outline-none" 
                                value={editingItem.title || ''} 
                                onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-700 font-medium">Subtítulo / Descripción</label>
                            <textarea 
                                className="block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-paper-primary focus:outline-none" 
                                value={editingItem.subtitle || ''} 
                                onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                            />
                        </div>
                        
                        {(collection?.type === CollectionType.GALLERY || collection?.type === CollectionType.SINGLE_IMAGE) && (
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-700 font-medium">URL de Imagen</label>
                                <input 
                                    className="block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-paper-primary focus:outline-none" 
                                    value={editingItem.imageUrl || ''} 
                                    onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                                    placeholder="https://..."
                                />
                                {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="preview" className="mt-2 h-[100px] object-cover rounded" />}
                            </div>
                        )}

                        {(collection?.type === CollectionType.TEXT_LIST || collection?.type === CollectionType.MAP_EMBED) && (
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-700 font-medium">Action URL / Iframe Src</label>
                                <input 
                                    className="block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-paper-primary focus:outline-none" 
                                    value={editingItem.actionUrl || ''} 
                                    onChange={e => setEditingItem({...editingItem, actionUrl: e.target.value})}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap -mx-4">
                            <div className="w-1/2 px-4">
                                <div className="mb-4">
                                    <label className="block mb-1 text-gray-700 font-medium">Orden</label>
                                    <input 
                                        type="number" 
                                        className="block w-full px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-paper-primary focus:outline-none" 
                                        value={editingItem.sortOrder || 1} 
                                        onChange={e => setEditingItem({...editingItem, sortOrder: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="w-1/2 px-4 pt-8">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox text-paper-primary h-5 w-5"
                                        checked={editingItem.isActive !== false} 
                                        onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})}
                                    />
                                    <span className="ml-2 text-gray-700">Activo</span>
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="p-4 border-t border-gray-200 text-right bg-gray-50 rounded-b-lg">
                        <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => setEditingItem(null)}>Cancelar</button>
                        <button className="bg-paper-primary hover:bg-[#4bc2c5] text-white font-bold py-2 px-4 rounded shadow" onClick={handleSaveItem}>Guardar</button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-4 text-center">Cargando editor...</div>;
    if (!collection) return <div className="p-4 text-center text-red-500">Colección no encontrada</div>;

    return (
        <div className="content">
            {renderEditForm()}
            <div className="flex flex-wrap -mx-4">
                <div className="w-full px-4">
                    <div className="bg-white rounded shadow-card mb-8">
                        <div className="p-4 bg-transparent border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h4 className="mt-0 mb-1 text-xl font-semibold text-[#252422]">Editando: {collection.name}</h4>
                                <p className="text-[#9a9a9a] text-sm">Tipo: <code className="text-[#e83e8c]">{collection.type}</code></p>
                            </div>
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded inline-flex items-center" onClick={() => navigate('/admin/cms')}>
                                <ArrowLeft size={16} className="mr-1"/> Volver
                            </button>
                        </div>
                        <div className="p-4">
                            {collection.type === CollectionType.GALLERY && renderGalleryEditor()}
                            {collection.type === CollectionType.TEXT_LIST && renderTextListEditor()}
                            {collection.type === CollectionType.MAP_EMBED && renderTextListEditor()} {/* Reusamos tabla para mapa por simplicidad */}
                            
                            {collection.type === CollectionType.SINGLE_IMAGE && (
                                <div className="bg-paper-info/10 border border-paper-info text-paper-info px-4 py-3 rounded relative mb-4">
                                     <span className="block sm:inline">Para el Hero (Single Image), usa el botón de editar en la lista de abajo. Solo debería haber 1 elemento.</span>
                                </div>
                            )}
                            {collection.type === CollectionType.SINGLE_IMAGE && renderTextListEditor()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSEditor;