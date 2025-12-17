import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import RoomTypes from '../components/RoomTypes';
import Services from '../components/Services';
import Testimonials from '../components/HotelGallery';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  const { isAuthenticated, isInitialized, hasProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si la autenticación ya inicializó y sabemos que el usuario NO tiene perfil incompleto
    // (hasProfile es false explícitamente), redirigir a completar información.
    // Si hasProfile es null (cargando) o true (completo), no hacemos nada.
    if (isInitialized && isAuthenticated && hasProfile === false) {
      console.log('[LandingPage] Profile missing (global state), redirecting to /customer');
      navigate('/customer');
    }
  }, [isInitialized, isAuthenticated, hasProfile, navigate]);

  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <Features />
      <RoomTypes />
      <Services />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default LandingPage;