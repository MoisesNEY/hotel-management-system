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
    TableCellsIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';

// Import views
import Dashboard from './views/Dashboard/Dashboard';
import RoomsView from './views/Rooms/RoomsView';
import RoomTypesView from './views/RoomTypes/RoomTypesView';
import BookingsView from './views/Bookings/BookingsView';
import WalkInWizard from './views/WalkIn/WalkInWizard'; // Import WalkInWizard
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
import InvoiceList from './views/Finance/InvoiceList';
import InvoiceForm from './views/Finance/InvoiceForm';
import PaymentList from './views/Finance/PaymentList';
import PaymentForm from './views/Finance/PaymentForm';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export interface RouteConfig {
    // ...
    path: string;
    name: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    component: React.ComponentType;
    layout: string;
    hidden?: boolean;
    allowedRoles?: string[];
}

const routes: RouteConfig[] = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: Squares2X2Icon,
        component: Dashboard,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/rooms',
        name: 'Habitaciones',
        icon: HomeModernIcon,
        component: RoomsView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/room-types',
        name: 'Tipos Hab.',
        icon: TableCellsIcon,
        component: RoomTypesView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/bookings',
        name: 'Reservas',
        icon: CalendarDaysIcon,
        component: BookingsView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/walk-in',
        name: 'Walk-In',
        icon: UserPlusIcon,
        component: WalkInWizard,
        layout: '/admin'
    },
    {
        path: '/services',
        name: 'Servicios',
        icon: SparklesIcon,
        component: ServicesView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/employee/bookings',
        name: 'Check-in/Check-out',
        icon: UserGroupIcon,
        component: EmployeeBookingsView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/employee/service-requests',
        name: 'Solicitudes Servicio',
        icon: UserGroupIcon,
        component: EmployeeServiceRequestsView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/customers',
        name: 'Clientes',
        icon: UsersIcon,
        component: CustomersView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/maps',
        name: 'Mapas',
        icon: MapPinIcon,
        component: MapsView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/user-profile',
        name: 'Perfil',
        icon: UserIcon,
        component: UserProfileView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/tables',
        name: 'Tablas',
        icon: ChartBarIcon,
        component: TablesView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    // --- NUEVA SECCIÓN DE CMS ---
    {
        path: '/cms',
        name: 'Sitio Web',
        icon: ComputerDesktopIcon,
        component: CMSList,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    // --- RUTA OCULTA PARA EDICIÓN ---
    // Esta ruta existe para el Router, pero debemos ocultarla del Sidebar
    {
        path: '/cms/edit/:id',
        name: 'Editor CMS',
        icon: ComputerDesktopIcon,
        component: CMSEditor,
        layout: '/admin',
        hidden: true,
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/files',
        name: 'Documentos',
        icon: DocumentTextIcon,
        component: FileManagerView,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    // --- FINANCE MODULE ---
    {
        path: '/invoices',
        name: 'Facturas',
        icon: DocumentTextIcon,
        component: InvoiceList,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN']
    },
    {
        path: '/invoices/new',
        name: 'Nueva Factura',
        icon: DocumentTextIcon,
        component: InvoiceForm,
        layout: '/admin',
        hidden: true,
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/invoices/edit/:id',
        name: 'Editar Factura',
        icon: DocumentTextIcon,
        component: InvoiceForm,
        layout: '/admin',
        hidden: true,
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/payments',
        name: 'Pagos',
        icon: BanknotesIcon,
        component: PaymentList,
        layout: '/admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/payments/new',
        name: 'Nuevo Pago',
        icon: BanknotesIcon,
        component: PaymentForm,
        layout: '/admin',
        hidden: true,
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
    {
        path: '/payments/edit/:id',
        name: 'Editar Pago',
        icon: BanknotesIcon,
        component: PaymentForm,
        layout: '/admin',
        hidden: true,
        allowedRoles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE']
    },
];

export default routes;
