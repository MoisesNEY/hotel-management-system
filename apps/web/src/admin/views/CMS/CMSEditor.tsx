import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Edit } from 'lucide-react';
import { CollectionType, defaultWebContent, type AssetCollection, type WebContent } from '../../../types/adminTypes';
import { AssetCollectionService } from '../../../services/admin/assetCollectionService';
import { WebContentService } from '../../../services/admin/webContentService';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Table from '../../components/shared/Table';
import Card from '../../components/shared/Card';

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
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
                        <img src={item.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-[200px] object-cover" alt="..." />
                        <div className="flex-auto p-4 flex flex-col">
                            <h5 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h5>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.subtitle}</p>
                            <div className="flex gap-2 mt-auto">
                                <Button size="sm" variant="info" onClick={() => setEditingItem(item)}>Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id!)}>Borrar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="w-full md:w-1/3 px-4 mb-4">
                <div 
                    className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-full min-h-[300px]"
                    onClick={() => setEditingItem({ ...defaultWebContent, collection })}
                >
                    <div className="text-center text-gray-400">
                        <Plus size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Agregar Imagen</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTextListEditor = () => {
        const columns = [
            { header: "Orden", accessor: 'sortOrder' as keyof WebContent },
            { header: "Título", accessor: 'title' as keyof WebContent },
            { header: "Subtítulo", accessor: 'subtitle' as keyof WebContent },
            { 
                header: "Links", 
                accessor: 'actionUrl' as keyof WebContent, 
                cell: (item: WebContent) => <code className="text-pink-500 text-xs bg-pink-50 px-1 py-0.5 rounded">{item.actionUrl}</code> 
            },
            { 
                header: "Acciones", 
                accessor: 'id' as keyof WebContent, 
                cell: (item: WebContent) => (
                    <div className="flex gap-1">
                        <Button size="sm" variant="info" iconOnly icon={<Edit size={14}/>} onClick={() => setEditingItem(item)} />
                        <Button size="sm" variant="danger" iconOnly icon={<Trash2 size={14}/>} onClick={() => handleDelete(item.id!)} />
                    </div>
                )
            }
        ];

        return (
            <div className="block w-full">
                <div className="mb-4">
                     <Button variant="success" onClick={() => setEditingItem({ ...defaultWebContent, collection })} icon={<Plus size={16} />}>
                        Agregar Elemento
                    </Button>
                </div>
                <Table 
                    data={contents}
                    columns={columns}
                    keyExtractor={(item) => item.id || Math.random()}
                    emptyMessage="No hay elementos en esta lista."
                    striped={true}
                />
            </div>
        );
    };

    // Formulario Modal/Overlay simple
    const renderEditForm = () => {
        if (!editingItem) return null;
        return (
            <div className="fixed inset-0 bg-black/50 z-[1050] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="m-0 text-xl font-semibold text-gray-800">{editingItem.id ? 'Editar Elemento' : 'Nuevo Elemento'}</h4>
                        <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="text-2xl leading-none">&times;</span>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-auto space-y-4">
                        <Input 
                            label="Título" 
                            value={editingItem.title || ''} 
                            onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                            placeholder="Ingrese el título principal"
                        />
                        
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">Subtítulo / Descripción</label>
                            <textarea 
                                className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-paper-primary focus:border-paper-primary transition-colors min-h-[100px]"
                                value={editingItem.subtitle || ''} 
                                onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                                placeholder="Ingrese una descripción breve..."
                            />
                        </div>

                        {(collection?.type === CollectionType.GALLERY || collection?.type === CollectionType.SINGLE_IMAGE) && (
                            <div className="space-y-2">
                                <Input 
                                    label="URL de Imagen" 
                                    value={editingItem.imageUrl || ''} 
                                    onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                                {editingItem.imageUrl && (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 h-[150px] bg-gray-50 flex items-center justify-center">
                                         <img src={editingItem.imageUrl} alt="preview" className="h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        )}

                        {(collection?.type === CollectionType.TEXT_LIST || collection?.type === CollectionType.MAP_EMBED) && (
                            <Input 
                                label="Action URL / Iframe Src" 
                                value={editingItem.actionUrl || ''} 
                                onChange={e => setEditingItem({...editingItem, actionUrl: e.target.value})}
                                placeholder="https://..."
                            />
                        )}

                        <div className="flex flex-wrap -mx-2">
                            <div className="w-1/2 px-2">
                                <Input 
                                    label="Orden" 
                                    type="number" 
                                    value={editingItem.sortOrder || 1} 
                                    onChange={e => setEditingItem({...editingItem, sortOrder: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="w-1/2 px-2 flex items-center pt-6">
                                <label className="inline-flex items-center cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 text-paper-primary bg-gray-100 border-gray-300 rounded focus:ring-paper-primary focus:ring-2 transition duration-200"
                                        checked={editingItem.isActive !== false} 
                                        onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})}
                                    />
                                    <span className="ml-2 text-gray-700 font-medium">Activo</span>
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="p-5 border-t border-gray-100 text-right bg-gray-50 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSaveItem}>Guardar Cambios</Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando editor...</div>;
    if (!collection) return <div className="p-10 text-center text-red-500 font-medium">Colección no encontrada</div>;

    return (
        <div className="content">
            {renderEditForm()}
            <Card title={`Editando: ${collection.name}`} subtitle={`Tipo: ${collection.type}`} className="pb-4">
                 <div className="mb-6 flex justify-end">
                      <Button variant="light" size="sm" onClick={() => navigate('/admin/cms')} icon={<ArrowLeft size={16}/>}>
                        Volver al listado
                      </Button>
                 </div>
                 
                 {collection.type === CollectionType.GALLERY && renderGalleryEditor()}
                 {collection.type === CollectionType.TEXT_LIST && renderTextListEditor()}
                 {collection.type === CollectionType.MAP_EMBED && renderTextListEditor()} 
                 
                 {collection.type === CollectionType.SINGLE_IMAGE && (
                     <div className="bg-paper-info/10 border border-paper-info/30 text-paper-info px-4 py-3 rounded-lg flex items-start gap-3 mb-6">
                          <div className="mt-1"><Edit size={18}/></div>
                          <span className="text-sm font-medium">Para el Hero (Single Image), usa el botón de editar en la lista de abajo. Solo debería haber 1 elemento.</span>
                     </div>
                 )}
                 {collection.type === CollectionType.SINGLE_IMAGE && renderTextListEditor()}
            </Card>
        </div>
    );
};

export default CMSEditor;