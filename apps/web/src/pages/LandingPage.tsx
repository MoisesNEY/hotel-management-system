import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import RoomTypes from '../components/RoomTypes';
import Services from '../components/Services';
import Testimonials from '../components/HotelGallery';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {


 return (
  <div className="landing-page">
    <Header />
    <Hero />
    <Features />
    <RoomTypes />
    <Services />  
    <section id="galeria">
      <Testimonials />
    </section>
    <Footer />
  </div>
);
}

export default LandingPage;