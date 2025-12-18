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
                <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-4" key={item.id}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative group">
                            <img src={item.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-[220px] object-cover" alt="..." />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Button size="sm" variant="info" onClick={() => setEditingItem(item)}>Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id!)}>Borrar</Button>
                            </div>
                        </div>
                        <div className="flex-auto p-5 flex flex-col">
                            <h5 className="text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{item.title}</h5>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-2">{item.subtitle}</p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-4">
                <div 
                    className="bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:border-gold-default/50 transition-all duration-300 h-full min-h-[300px] group"
                    onClick={() => setEditingItem({ ...defaultWebContent, collection })}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:bg-gold-default/10 transition-all duration-300">
                            <Plus size={32} className="text-gray-400 group-hover:text-gold-default transition-colors" />
                        </div>
                        <p className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Agregar Imagen</p>
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
                cell: (item: WebContent) => <code className="text-[#e83e8c] dark:text-rose-400 text-[10px] font-mono bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">{item.actionUrl}</code> 
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
                <div className="mb-6">
                     <Button variant="primary" onClick={() => setEditingItem({ ...defaultWebContent, collection })} leftIcon={<Plus size={16} />}>
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
            <div className="fixed inset-0 bg-black/60 z-[1050] flex items-center justify-center p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-gray-100 dark:border-white/10">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                        <h4 className="m-0 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {editingItem.id ? 'Editar Elemento' : 'Nuevo Elemento'}
                        </h4>
                        <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
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
                            <label className="block mb-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Subtítulo / Descripción</label>
                            <textarea 
                                className="block w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold-default focus:border-gold-default transition-all min-h-[120px]"
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
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 h-[180px] bg-gray-50 dark:bg-black/20 flex items-center justify-center p-2">
                                         <img src={editingItem.imageUrl} alt="preview" className="h-full w-full object-cover rounded-xl" />
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

                        <div className="flex flex-wrap -mx-2 pt-2">
                            <div className="w-1/2 px-2">
                                <Input 
                                    label="Orden" 
                                    type="number" 
                                    value={editingItem.sortOrder || 1} 
                                    onChange={e => setEditingItem({...editingItem, sortOrder: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="w-1/2 px-2 flex items-center pt-6">
                                <label className="inline-flex items-center cursor-pointer select-none group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 text-gold-default bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-lg focus:ring-gold-default focus:ring-offset-0 transition duration-200 cursor-pointer"
                                            checked={editingItem.isActive !== false} 
                                            onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})}
                                        />
                                        <span className="ml-3 text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Activo en Web</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 text-right bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSaveItem}>Guardar Cambios</Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-gold-default/30 border-t-gold-default rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest text-xs uppercase">Cargando Editor de Contenido...</p>
        </div>
    );
    if (!collection) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="p-10 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">Colección no encontrada</p>
        </div>
    );

    return (
        <div className="content">
            {renderEditForm()}
            <Card title={`Sección: ${collection.name}`} subtitle={`ID: ${collection.code} • Tipo: ${collection.type}`} className="pb-8 overflow-visible">
                 <div className="mb-8 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/cms')} leftIcon={<ArrowLeft size={16}/>}>
                        Volver al listado de contenido
                      </Button>
                 </div>
                 
                 {collection.type === CollectionType.GALLERY && renderGalleryEditor()}
                 {collection.type === CollectionType.TEXT_LIST && renderTextListEditor()}
                 {collection.type === CollectionType.MAP_EMBED && renderTextListEditor()} 
                 
                 {collection.type === CollectionType.SINGLE_IMAGE && (
                     <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 px-5 py-4 rounded-2xl flex items-start gap-4 mb-8 shadow-sm">
                          <div className="mt-0.5 bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg"><Edit size={18}/></div>
                          <span className="text-sm font-medium leading-relaxed">Para el Hero (Single Image), usa el botón de editar en la lista de abajo. Solo debería haber 1 elemento activo para un diseño óptimo.</span>
                     </div>
                 )}
                 {collection.type === CollectionType.SINGLE_IMAGE && renderTextListEditor()}
            </Card>
        </div>
    );
};

export default CMSEditor;