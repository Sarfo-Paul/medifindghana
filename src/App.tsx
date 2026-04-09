import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import PharmaciesPage from './pages/PharmaciesPage';
import PharmacyDetail from './pages/PharmacyDetail';
import DrugsPage from './pages/DrugsPage';
import SearchPage from './pages/SearchPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/pharmacies/:id" element={<PharmacyDetail />} />
            <Route path="/drugs" element={<DrugsPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
          <Footer />
          <AIAssistant />
        </div>
      </LanguageProvider>
    </Router>
  );
}

export default App;