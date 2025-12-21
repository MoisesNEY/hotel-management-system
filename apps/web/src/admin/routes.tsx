import React from 'react';
import {
    Squares2X2Icon,
    HomeModernIcon,
    CalendarDaysIcon,
    SparklesIcon,
    UsersIcon,
    MapPinIcon,
    UserIcon,
    ComputerDesktopIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

// Import views
import Dashboard from './views/Dashboard/Dashboard';
import RoomsView from './views/Rooms/RoomsView';
import RoomTypesView from './views/RoomTypes/RoomTypesView';
import BookingsView from './views/Bookings/BookingsView'; 
import ServicesView from './views/Services/ServicesView';
import CustomersView from './views/Customers/CustomersView'; 
import MapsView from './views/Maps/MapsView';
import UserProfileView from './views/UserProfile/UserProfileView';
import TablesView from './views/Tables/TablesView';
import CMSList from './views/CMS/CMSList';
import CMSEditor from './views/CMS/CMSEditor';
import EmployeeBookingsView from './views/Employee/EmployeeBookingsView';
import EmployeeServiceRequestsView from './views/Employee/EmployeeServiceRequestsView';
import FileManagerView from './views/FileManager/FileManagerView';

export interface RouteConfig {
  // ...
    path: string;
    name: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    component: React.ComponentType;
    layout: string;
    hidden?: boolean;
}

const routes: RouteConfig[] = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: Squares2X2Icon,
        component: Dashboard,
        layout: '/admin'
    },
    {
        path: '/rooms',
        name: 'Habitaciones',
        icon: HomeModernIcon, // Bed/Room icon
        component: RoomsView,
        layout: '/admin'
    },
    {
        path: '/room-types',
        name: 'Tipos Hab.',
        icon: TableCellsIcon, // Grid icon for data/categories
        component: RoomTypesView,
        layout: '/admin'
    },
    {
        path: '/bookings',
        name: 'Reservas',
        icon: CalendarDaysIcon,
        component: BookingsView,
        layout: '/admin'
    },
    {
        path: '/services',
        name: 'Servicios',
        icon: SparklesIcon, // Sparkles for hotel services (cleaning, amenities)
        component: ServicesView,
        layout: '/admin'
    },
    {
        path: '/employee/bookings',
        name: 'Check-in/Check-out',
        icon: UserGroupIcon,
        component: EmployeeBookingsView,
        layout: '/admin'
    },
    {
        path: '/employee/service-requests',
        name: 'Solicitudes Servicio',
        icon: UserGroupIcon,
        component: EmployeeServiceRequestsView,
        layout: '/admin'
    },
    {
        path: '/customers',
        name: 'Clientes',
        icon: UsersIcon,
        component: CustomersView,
        layout: '/admin'
    },
    {
        path: '/maps',
        name: 'Mapas',
        icon: MapPinIcon,
        component: MapsView,
        layout: '/admin'
    },
    {
        path: '/user-profile',
        name: 'Perfil',
        icon: UserIcon,
        component: UserProfileView,
        layout: '/admin'
    },
    {
        path: '/tables',
        name: 'Tablas',
        icon: ChartBarIcon, // Bar chart for reports/stats center
        component: TablesView,
        layout: '/admin'
    },
    // --- NUEVA SECCIÓN DE CMS ---
    {
        path: '/cms',
        name: 'Sitio Web', // Nombre en el Sidebar
        icon: ComputerDesktopIcon,     // Icono
        component: CMSList,
        layout: '/admin'
    },
    // --- RUTA OCULTA PARA EDICIÓN ---
    // Esta ruta existe para el Router, pero debemos ocultarla del Sidebar
    {
        path: '/cms/edit/:id',
        name: 'Editor CMS',
        icon: ComputerDesktopIcon,
        component: CMSEditor,
        layout: '/admin',
        hidden: true // <--- Propiedad clave
    },
    {
        path: '/files',
        name: 'Documentos',
        icon: DocumentTextIcon,
        component: FileManagerView,
        layout: '/admin'
    },
];

export default routes;
