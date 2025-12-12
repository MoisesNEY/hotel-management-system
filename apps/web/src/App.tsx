import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import './App.css';
import './styles/landing.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerDetailsPage />} />
    </Routes>
  );
}

export default App;
