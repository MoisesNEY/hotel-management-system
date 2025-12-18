import React from 'react';
import {
    LayoutDashboard,
    BedDouble,
    CalendarCheck,
    Utensils,
    Users,
    MapPin,
    Bell,
    Table2,
    User,
    Monitor
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Import views
import Dashboard from './views/Dashboard/Dashboard';
import RoomsView from './views/Rooms/RoomsView';
import RoomTypesView from './views/RoomTypes/RoomTypesView';
import BookingsView from './views/Bookings/BookingsView'; // Imported
import ServicesView from './views/Services/ServicesView';
import CustomersView from './views/Customers/CustomersView'; // Imported
import MapsView from './views/Maps/MapsView';
import NotificationsView from './views/Notifications/NotificationsView';
import UserProfileView from './views/UserProfile/UserProfileView';
import TablesView from './views/Tables/TablesView';
import CMSList from './views/CMS/CMSList';
import CMSEditor from './views/CMS/CMSEditor';

export interface RouteConfig {
    path: string;
    name: string;
    icon: LucideIcon;
    component: React.ComponentType;
    layout: string;
    hidden?: boolean;
}

const routes: RouteConfig[] = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: LayoutDashboard,
        component: Dashboard,
        layout: '/admin'
    },
    {
        path: '/rooms',
        name: 'Habitaciones',
        icon: BedDouble,
        component: RoomsView,
        layout: '/admin'
    },
    {
        path: '/room-types',
        name: 'Tipos Hab.',
        icon: Table2, // Reusing Table icon or similar for generic config
        component: RoomTypesView,
        layout: '/admin'
    },
    {
        path: '/bookings',
        name: 'Reservas',
        icon: CalendarCheck,
        component: BookingsView,
        layout: '/admin'
    },
    {
        path: '/services',
        name: 'Servicios',
        icon: Utensils,
        component: ServicesView,
        layout: '/admin'
    },
    {
        path: '/customers',
        name: 'Clientes',
        icon: Users,
        component: CustomersView,
        layout: '/admin'
    },
    {
        path: '/maps',
        name: 'Mapas',
        icon: MapPin,
        component: MapsView,
        layout: '/admin'
    },
    {
        path: '/notifications',
        name: 'Notificaciones',
        icon: Bell,
        component: NotificationsView,
        layout: '/admin'
    },
    {
        path: '/user-profile',
        name: 'Perfil',
        icon: User,
        component: UserProfileView,
        layout: '/admin'
    },
    {
        path: '/tables',
        name: 'Tablas',
        icon: Table2,
        component: TablesView,
        layout: '/admin'
    },
    // --- NUEVA SECCIÓN DE CMS ---
    {
        path: '/cms',
        name: 'Sitio Web', // Nombre en el Sidebar
        icon: Monitor,     // Icono
        component: CMSList,
        layout: '/admin'
    },
    // --- RUTA OCULTA PARA EDICIÓN ---
    // Esta ruta existe para el Router, pero debemos ocultarla del Sidebar
    {
        path: '/cms/edit/:id',
        name: 'Editor CMS',
        icon: Monitor, 
        component: CMSEditor,
        layout: '/admin',
        hidden: true // <--- Propiedad clave
    },
];

export default routes;
