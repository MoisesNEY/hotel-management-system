import React, { useState, useEffect, useRef } from 'react';
import {
    Trash2,
    Search,
    Copy,
    ExternalLink,
    FolderOpen,
    Plus
} from 'lucide-react';
import { fileService } from '../../../services/admin/fileService';
import type { StoredFile } from '../../../types/fileTypes';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Table from '../../components/shared/Table';
import Loader from '../../components/shared/Loader';

const FileManagerView: React.FC = () => {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolder, setCurrentFolder] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const folders = [
        { name: 'Raíz', value: '' },
        { name: 'WebContent', value: 'cms' },
        { name: 'Habitaciones', value: 'room-types' },
        { name: 'Servicios', value: 'services' },
        { name: 'Perfiles', value: 'profiles' }
    ];

    useEffect(() => {
        loadData();
    }, [currentFolder]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fileService.listFiles(currentFolder);
            setFiles(data);
        } catch (error) {
            console.error("Error cargando archivos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadData();
            return;
        }
        setLoading(true);
        try {
            const data = await fileService.searchFiles(searchQuery, currentFolder);
            setFiles(data);
        } catch (error) {
            console.error("Error buscando archivos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await fileService.uploadFile(file, currentFolder);
            loadData();
        } catch (error) {
            console.error("Error subiendo archivo", error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = (url: string) => {
        setFileToDelete(url);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            await fileService.deleteFile(fileToDelete);
            setFiles(files.filter(f => f.url !== fileToDelete));
            setDeleteModalOpen(false);
            setFileToDelete(null);
        } catch (error) {
            console.error("Error eliminando archivo", error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('URL copiada al portapapeles');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const columns = [
        {
            header: "Vista",
            accessor: 'url' as keyof StoredFile,
            cell: (item: StoredFile) => (
                <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </div>
            )
        },
        {
            header: "Nombre / Key",
            accessor: 'name' as keyof StoredFile,
            cell: (item: StoredFile) => (
                <div className="max-w-xs overflow-hidden">
                    <div className="font-bold text-gray-900 dark:text-white truncate" title={item.name}>{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">{item.key}</div>
                </div>
            )
        },
        {
            header: "Tamaño",
            accessor: 'size' as keyof StoredFile,
            cell: (item: StoredFile) => (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatSize(item.size)}
                </span>
            )
        },
        {
            header: "Modificado",
            accessor: 'lastModified' as keyof StoredFile,
            cell: (item: StoredFile) => (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(item.lastModified).toLocaleDateString()}
                </span>
            )
        },
        {
            header: "Acciones",
            accessor: 'key' as keyof StoredFile,
            cell: (item: StoredFile) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.url)}
                        title="Copiar URL"
                    >
                        <Copy size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(item.url, '_blank')}
                        title="Ver original"
                    >
                        <ExternalLink size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item.url)}
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ),
            headerClassName: "text-right"
        }
    ];

    return (
        <div className="content">
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Biblioteca de Documentos</h2>
                        <p className="text-gray-500 dark:text-gray-400">Gestiona y organiza archivos almacenados en S3 para el sistema</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                        />
                        <Button
                            variant="primary"
                            icon={uploading ? <Loader /> : <Plus size={18} />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Subiendo...' : 'Nuevo Documento'}
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <Card>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                            <FolderOpen size={18} className="text-gray-400 shrink-0" />
                            {folders.map(folder => (
                                <button
                                    key={folder.value}
                                    onClick={() => setCurrentFolder(folder.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${currentFolder === folder.value
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {folder.name}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
                </Card>

                {/* File Gallery/Table */}
                <Card>
                    <Table
                        data={files}
                        columns={columns}
                        keyExtractor={(item) => item.key}
                        isLoading={loading}
                        emptyMessage="No se encontraron documentos en esta carpeta."
                    />
                </Card>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {
                deleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                                    <Trash2 className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    ¿Eliminar documento?
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                    ¿Estás seguro de que deseas eliminar esta imagen de S3? Esta acción no se puede deshacer.
                                </p>

                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 justify-center rounded-xl py-3 h-auto text-base"
                                        onClick={() => setDeleteModalOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="danger" // Using danger variant as requested for consistency
                                        className="flex-1 justify-center rounded-xl py-3 h-auto text-base shadow-lg shadow-rose-500/20"
                                        onClick={confirmDelete}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default FileManagerView;
