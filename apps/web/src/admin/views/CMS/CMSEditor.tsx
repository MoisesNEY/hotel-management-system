import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, Edit } from 'lucide-react';
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
        <div className="row">
            {contents.map((item) => (
                <div className="col-md-4 mb-4" key={item.id}>
                    <div className="card">
                        <img src={item.imageUrl || 'https://via.placeholder.com/300'} className="card-img-top" alt="..." style={{height: '200px', objectFit: 'cover'}} />
                        <div className="card-body">
                            <h5 className="card-title">{item.title}</h5>
                            <p className="card-text">{item.subtitle}</p>
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-info btn-sm" onClick={() => setEditingItem(item)}>Editar</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id!)}>Borrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="col-md-4 mb-4">
                <div 
                    className="card d-flex align-items-center justify-content-center" 
                    style={{height: '100%', minHeight: '300px', cursor: 'pointer', border: '2px dashed #ccc'}}
                    onClick={() => setEditingItem({ ...defaultWebContent, collection })}
                >
                    <div className="text-center text-muted">
                        <Plus size={48} />
                        <p>Agregar Imagen</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTextListEditor = () => (
        <div className="table-responsive">
            <button className="btn btn-success mb-3" onClick={() => setEditingItem({ ...defaultWebContent, collection })}>
                <Plus size={16} /> Agregar Elemento
            </button>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Orden</th>
                        <th>Título (Label)</th>
                        <th>Subtítulo (Valor)</th>
                        <th>Acción (Link)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {contents.map(item => (
                        <tr key={item.id}>
                            <td>{item.sortOrder}</td>
                            <td>{item.title}</td>
                            <td>{item.subtitle}</td>
                            <td><code>{item.actionUrl}</code></td>
                            <td>
                                <button className="btn btn-sm btn-info mr-2" onClick={() => setEditingItem(item)}><Edit size={14}/></button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id!)}><Trash2 size={14}/></button>
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
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="card" style={{width: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <div className="card-header">
                        <h4>{editingItem.id ? 'Editar Elemento' : 'Nuevo Elemento'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Título</label>
                            <input 
                                className="form-control" 
                                value={editingItem.title || ''} 
                                onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtítulo / Descripción</label>
                            <textarea 
                                className="form-control" 
                                value={editingItem.subtitle || ''} 
                                onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                            />
                        </div>
                        
                        {(collection?.type === CollectionType.GALLERY || collection?.type === CollectionType.SINGLE_IMAGE) && (
                            <div className="form-group">
                                <label>URL de Imagen</label>
                                <input 
                                    className="form-control" 
                                    value={editingItem.imageUrl || ''} 
                                    onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                                    placeholder="https://..."
                                />
                                {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="preview" className="mt-2" style={{height: 100}} />}
                            </div>
                        )}

                        {(collection?.type === CollectionType.TEXT_LIST || collection?.type === CollectionType.MAP_EMBED) && (
                            <div className="form-group">
                                <label>Action URL / Iframe Src</label>
                                <input 
                                    className="form-control" 
                                    value={editingItem.actionUrl || ''} 
                                    onChange={e => setEditingItem({...editingItem, actionUrl: e.target.value})}
                                />
                            </div>
                        )}

                        <div className="row">
                            <div className="col-6">
                                <div className="form-group">
                                    <label>Orden</label>
                                    <input 
                                        type="number" className="form-control" 
                                        value={editingItem.sortOrder || 1} 
                                        onChange={e => setEditingItem({...editingItem, sortOrder: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="col-6 pt-4">
                                <label className="mr-2">Activo:</label>
                                <input 
                                    type="checkbox" 
                                    checked={editingItem.isActive !== false} 
                                    onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})}
                                />
                            </div>
                        </div>

                    </div>
                    <div className="card-footer text-right">
                        <button className="btn btn-secondary mr-2" onClick={() => setEditingItem(null)}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSaveItem}>Guardar</button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div>Cargando editor...</div>;
    if (!collection) return <div>Colección no encontrada</div>;

    return (
        <div className="content">
            {renderEditForm()}
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="card-title">Editando: {collection.name}</h4>
                                <p className="category">Tipo: <code>{collection.type}</code></p>
                            </div>
                            <button className="btn btn-secondary" onClick={() => navigate('/admin/cms')}>
                                <ArrowLeft size={16} className="mr-1"/> Volver
                            </button>
                        </div>
                        <div className="card-body">
                            {collection.type === CollectionType.GALLERY && renderGalleryEditor()}
                            {collection.type === CollectionType.TEXT_LIST && renderTextListEditor()}
                            {collection.type === CollectionType.MAP_EMBED && renderTextListEditor()} {/* Reusamos tabla para mapa por simplicidad */}
                            
                            {collection.type === CollectionType.SINGLE_IMAGE && (
                                <div className="alert alert-info">
                                    Para el Hero (Single Image), usa el botón de editar en la lista de abajo. Solo debería haber 1 elemento.
                                    {renderTextListEditor()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSEditor;