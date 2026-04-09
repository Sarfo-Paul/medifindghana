import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Home, Pill, Building2, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('home'), icon: <Home className="w-4 h-4" /> },
    { to: '/search', label: t('searchDrugs'), icon: <Search className="w-4 h-4" /> },
    { to: '/pharmacies', label: t('pharmacies'), icon: <Building2 className="w-4 h-4" /> },
    { to: '/drugs', label: t('drugs'), icon: <Pill className="w-4 h-4" /> }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-2 rounded-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MediFind Ghana <span className="ml-1">🇬🇭</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="flex items-center space-x-2">
              <button
                aria-label="Language toggle"
                onClick={() => setLocale(locale === 'en' ? 'twi' : 'en')}
                className="px-2 py-1 rounded-md text-sm border border-gray-200 bg-white hover:bg-gray-50"
              >
                <span className="mr-2">🇬🇭</span>
                <span className="uppercase text-xs">{locale === 'en' ? 'EN' : 'TWI'}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2">
              <button
                aria-label="Language toggle"
                onClick={() => setLocale(locale === 'en' ? 'twi' : 'en')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 bg-white hover:bg-gray-50"
              >
                <span>🇬🇭</span>
                <span className="uppercase">{locale === 'en' ? 'EN' : 'TWI'}</span>
              </button>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
