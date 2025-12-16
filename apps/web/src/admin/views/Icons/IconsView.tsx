import React, { useState } from 'react';
import {
    Home, Settings, User, Mail, Bell, Search, Tag,
    Trash, Edit, Download, Upload, Share2, Copy,
    CheckCircle, XCircle, AlertCircle, Info, HelpCircle,
    ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
    Menu, X, Plus, Minus,
    Lock, Unlock, Eye, EyeOff, LogIn, LogOut,
    Folder, File, Image, Video, Music, FileText,
    Phone, DollarSign, CreditCard, ShoppingCart,
    Users, UserPlus, UserMinus, UserCheck, UserX,
    Code, Terminal, Database, Server, Package, GitBranch,
    Layers, Grid, List, Layout, Maximize, Minimize
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
            name: 'Usuario',
            icons: [
                { Icon: User, name: 'User' },
                { Icon: Users, name: 'Users' },
                { Icon: UserPlus, name: 'UserPlus' },
                { Icon: UserMinus, name: 'UserMinus' },
                { Icon: UserCheck, name: 'UserCheck' },
                { Icon: UserX, name: 'UserX' },
                { Icon: LogIn, name: 'LogIn' },
                { Icon: LogOut, name: 'LogOut' }
            ]
        },
        {
            name: 'Comunicación',
            icons: [
                { Icon: Mail, name: 'Mail' },
                { Icon: Bell, name: 'Bell' },
                { Icon: Phone, name: 'Phone' },
                { Icon: Share2, name: 'Share2' }
            ]
        },
        {
            name: 'Acciones',
            icons: [
                { Icon: Plus, name: 'Plus' },
                { Icon: Minus, name: 'Minus' },
                { Icon: Edit, name: 'Edit' },
                { Icon: Trash, name: 'Trash' },
                { Icon: Copy, name: 'Copy' },
                { Icon: Download, name: 'Download' },
                { Icon: Upload, name: 'Upload' },
                { Icon: X, name: 'X' }
            ]
        },
        {
            name: 'Estado',
            icons: [
                { Icon: CheckCircle, name: 'CheckCircle' },
                { Icon: XCircle, name: 'XCircle' },
                { Icon: AlertCircle, name: 'AlertCircle' },
                { Icon: Info, name: 'Info' },
                { Icon: HelpCircle, name: 'HelpCircle' }
            ]
        },
        {
            name: 'Archivos',
            icons: [
                { Icon: Folder, name: 'Folder' },
                { Icon: File, name: 'File' },
                { Icon: FileText, name: 'FileText' },
                { Icon: Image, name: 'Image' },
                { Icon: Video, name: 'Video' },
                { Icon: Music, name: 'Music' }
            ]
        },
        {
            name: 'Seguridad',
            icons: [
                { Icon: Lock, name: 'Lock' },
                { Icon: Unlock, name: 'Unlock' },
                { Icon: Eye, name: 'Eye' },
                { Icon: EyeOff, name: 'EyeOff' }
            ]
        },
        {
            name: 'Comercio',
            icons: [
                { Icon: ShoppingCart, name: 'ShoppingCart' },
                { Icon: CreditCard, name: 'CreditCard' },
                { Icon: DollarSign, name: 'DollarSign' },
                { Icon: Tag, name: 'Tag' }
            ]
        },
        {
            name: 'Desarrollo',
            icons: [
                { Icon: Code, name: 'Code' },
                { Icon: Terminal, name: 'Terminal' },
                { Icon: Database, name: 'Database' },
                { Icon: Server, name: 'Server' },
                { Icon: Package, name: 'Package' },
                { Icon: GitBranch, name: 'GitBranch' }
            ]
        },
        {
            name: 'Layout',
            icons: [
                { Icon: Layout, name: 'Layout' },
                { Icon: Grid, name: 'Grid' },
                { Icon: List, name: 'List' },
                { Icon: Layers, name: 'Layers' },
                { Icon: Maximize, name: 'Maximize' },
                { Icon: Minimize, name: 'Minimize' }
            ]
        }
    ];

    const filteredCategories = iconCategories.map(category => ({
        ...category,
        icons: category.icons.filter(icon =>
            icon.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.icons.length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Iconos Lucide React</h1>
                <p className="text-gray-600">
                    Galería de iconos disponibles en el proyecto. Todos los iconos son de{' '}
                    <a
                        href="https://lucide.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Lucide React
                    </a>
                </p>
            </div>

            {/* Search */}
            <Card className="shadow-md border-none">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar iconos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </Card>

            {/* Icons Grid */}
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category, catIndex) => (
                    <Card key={catIndex} title={category.name} className="shadow-md border-none">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {category.icons.map(({ Icon, name }, iconIndex) => (
                                <div
                                    key={iconIndex}
                                    className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                                    title={name}
                                >
                                    <Icon className="w-8 h-8 text-gray-700 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-xs text-gray-600 mt-2 text-center">
                                        {name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))
            ) : (
                <Card className="shadow-md border-none">
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron iconos</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default IconsView;
