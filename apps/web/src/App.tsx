// App.tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import UserProfilePage from './pages/UserProfilePage';

import AdminLayout from './admin/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RequireProfile from './components/RequireProfile';
import RoleGuard from './components/RoleGuard';

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Rutas protegidas que requieren autenticación */}
      <Route element={<ProtectedRoute />}>
        {/* Rutas que requieren perfil completo (o salto explícito) */}
        <Route element={<RequireProfile />}>

          {/* Rutas de Cliente */}
          <Route path="/profile" element={<UserProfilePage />} />
          
        </Route>

        {/* Ruta para llenar detalles (excluida de RequireProfile para evitar ciclo) */}
        <Route path="/customer" element={<CustomerDetailsPage />} />
        
        {/* Rutas Administrativas (Requieren Rol) */}
        <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']} />}>
           <Route path="/admin/*" element={<AdminLayout />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
