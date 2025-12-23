import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, ChevronDown, ChevronUp, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { CollectionType, type AssetCollection } from '../../../types/adminTypes';
import { AssetCollectionService } from '../../../services/admin/assetCollectionService';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';

const CMSList: React.FC = () => {
    const [collections, setCollections] = useState<AssetCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false); // Collapsed by default as requested
    const [successModal, setSuccessModal] = useState<{ open: boolean, message: string }>({ open: false, message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const [togglingId, setTogglingId] = useState<number | null>(null);

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

    const handleToggleActive = async (collection: AssetCollection) => {
        if (!collection.id) return;
        setTogglingId(collection.id);
        try {
            const updated = { ...collection, isActive: !collection.isActive };
            await AssetCollectionService.update(updated);
            setCollections(collections.map(c => c.id === collection.id ? updated : c));
        } catch (error) {
            console.error("Error toggling status", error);
            alert("No se pudo cambiar el estado de la sección.");
        } finally {
            setTogglingId(null);
        }
    };

    const getBadgeColor = (type?: AssetCollection['type']) => {
        switch (type) {
            case CollectionType.SINGLE_IMAGE: return 'bg-cyan-500'; // Info
            case CollectionType.GALLERY: return 'bg-emerald-500'; // Success
            case CollectionType.MAP_EMBED: return 'bg-amber-500'; // Warning
            default: return 'bg-rose-500'; // Danger/Secondary default
        }
    };

    // Define columns for the Table component
    const columns = [
        {
            header: "Código",
            accessor: 'code' as keyof AssetCollection,
            cell: (item: AssetCollection) => <code className="text-[#e83e8c] dark:text-rose-400 text-[10px] font-mono bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">{item.code}</code>
        },
        {
            header: "Nombre Sección",
            accessor: 'name' as keyof AssetCollection,
            cell: (item: AssetCollection) => (
                <div>
                    <span className="font-bold text-gray-900 dark:text-white tracking-tight">{item.name}</span>
                    <br />
                    <small className="text-gray-500 dark:text-gray-400 font-medium">{item.description}</small>
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
            header: "Estado",
            accessor: 'isActive' as keyof AssetCollection,
            cell: (item: AssetCollection) => (
                <button
                    onClick={() => handleToggleActive(item)}
                    disabled={togglingId === item.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${item.isActive !== false
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                            : 'bg-gray-50 dark:bg-white/[0.02] text-gray-400 border border-gray-100 dark:border-white/10'
                        }`}
                >
                    {togglingId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : item.isActive !== false ? (
                        <Eye size={14} />
                    ) : (
                        <EyeOff size={14} />
                    )}
                    {item.isActive !== false ? 'Visible' : 'Oculto'}
                </button>
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

    const handleCreateTemplate = async (template: { code: string, name: string, type: string, description: string }) => {
        try {
            // Ver si ya existe
            const exists = collections.find(c => c.code === template.code);
            if (exists) {
                navigate(`/admin/cms/edit/${exists.id}`);
                return;
            }

            // Crear
            await AssetCollectionService.create(template as AssetCollection);
            await loadData();
            setSuccessModal({
                open: true,
                message: `Plantilla '${template.name}' creada con éxito.`
            });
        } catch (error) {
            console.error("Error creando plantilla", error);
            alert("No se pudo crear la plantilla.");
        }
    };

    const templates = [
        { code: 'HOME_HERO', name: 'Portada Principal', type: CollectionType.SINGLE_IMAGE, description: 'Imagen y texto principal de la web' },
        { code: 'HOME_FEATURES', name: 'Características', type: CollectionType.TEXT_LIST, description: 'Iconos y textos de servicios destacados' },
        { code: 'HOME_GALLERY', name: 'Galería Hotel', type: CollectionType.GALLERY, description: 'Fotos de las instalaciones' },
        { code: 'HOTEL_FACILITIES', name: 'Amenidades Hotel', type: CollectionType.TEXT_LIST, description: 'Resumen de servicios (ej: 120 hab, Spa)' },
        { code: 'FOOTER_INFO', name: 'Pie de Página', type: CollectionType.SINGLE_IMAGE, description: 'Frase inspiradora y copyright' },
        { code: 'HEADER_FEATURES', name: 'Encabezado: Características', type: CollectionType.SINGLE_IMAGE, description: 'Título y descripción de la sección Características' },
        { code: 'HEADER_ROOMS', name: 'Encabezado: Habitaciones', type: CollectionType.SINGLE_IMAGE, description: 'Título y descripción de la sección Habitaciones' },
        { code: 'HEADER_SERVICES', name: 'Encabezado: Servicios', type: CollectionType.SINGLE_IMAGE, description: 'Título y descripción de la sección Servicios' },
        { code: 'HEADER_GALLERY', name: 'Encabezado: Galería', type: CollectionType.SINGLE_IMAGE, description: 'Título y descripción de la sección Galería' },
        { code: 'CONTACT_INFO', name: 'Datos de Contacto', type: CollectionType.TEXT_LIST, description: 'Teléfono, Email y Redes Sociales' },
        { code: 'SOCIAL_NETWORKS', name: 'Redes Sociales', type: CollectionType.TEXT_LIST, description: 'Enlaces a Facebook, Instagram, Twitter, etc.' },
        { code: 'MAIN_LOCATION', name: 'Ubicación Mapa', type: CollectionType.MAP_EMBED, description: 'URL de iframe de Google Maps' },
    ];

    return (
        <div className="content">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full px-4">
                    <Card
                        title={
                            <div className="flex items-center justify-between w-full">
                                <span>Plantillas Sugeridas</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="text-gray-400 hover:text-gold-default"
                                    icon={showTemplates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                >
                                    {showTemplates ? 'Ocultar' : 'Mostrar'}
                                </Button>
                            </div>
                        }
                        subtitle="Secciones críticas de la Landing Page"
                        className="mb-6 overflow-hidden"
                    >
                        {showTemplates && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-300">
                                {templates.map((t) => (
                                    <div
                                        key={t.code}
                                        className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-md transition-all duration-300 group"
                                    >
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t.name}</h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{t.description}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-[10px] uppercase tracking-widest font-bold border border-gray-200 dark:border-white/10 group-hover:border-gold-default/50 group-hover:text-gold-default"
                                            onClick={() => handleCreateTemplate(t)}
                                        >
                                            {collections.find(c => c.code === t.code) ? 'Ver Sección' : 'Configurar'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

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

            {/* Success Modal */}
            <Modal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ ...successModal, open: false })}
                size="sm"
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-emerald-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Operación Exitosa!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                        {successModal.message}
                    </p>
                    <div className="flex justify-center">
                        <Button
                            variant="primary"
                            onClick={() => setSuccessModal({ ...successModal, open: false })}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
                        >
                            Aceptar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CMSList;