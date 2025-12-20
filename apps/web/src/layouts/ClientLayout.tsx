import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from '../components/ClientHeader';
import Footer from '../components/Footer';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37]/30 flex flex-col">
      <ClientHeader />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
