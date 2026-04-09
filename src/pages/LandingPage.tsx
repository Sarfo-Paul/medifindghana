import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, MapPin, Clock, Users, Award, Building2, Pill, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SearchForm from '../components/SearchForm';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface InlineResult {
  id: number;
  pharmacy: any;
  drug: any;
  price: number | null;
  quantity: number;
  inStock: boolean;
}

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: 'Find Drugs Fast',
      description: 'Search for medications across multiple pharmacies in Ghana'
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: 'Location Based',
      description: 'Find pharmacies near you with real-time availability'
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: 'Verified Pharmacies',
      description: 'All pharmacies are verified and licensed'
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: 'Real-time Updates',
      description: 'Get up-to-date information on drug availability'
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: 'Community Driven',
      description: 'Help others by updating drug availability'
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: 'Trusted Platform',
      description: 'Used by thousands of Ghanaians daily'
    }
  ];

  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPharmacies: 0, totalDrugs: 0, totalUsers: 0, availableDrugs: 0 });
  const [inlineResults, setInlineResults] = useState<InlineResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/announcements');
        setAnnouncements(res.data || []);
      } catch (err) {
        // ignore
      }
    };

    const fetchStats = async () => {
      try {
        const r = await axios.get('http://localhost:3001/api/dashboard/stats');
        setStats(r.data || {});
      } catch (err) {
        // ignore
      }
    };

    fetchAnnouncements();
    fetchStats();
  }, []);

  const handleInlineSearch = async (drug: string, region?: string, city?: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.set('drugName', drug);
      if (region) params.set('region', region);
      if (city) params.set('city', city);

      const res = await axios.get(`http://localhost:3001/api/search?${params.toString()}`);
      setInlineResults(res.data || []);
      // also navigate to search page so user can bookmark if desired
      navigate(`/search?${params.toString()}`);
    } catch (err) {
      setInlineResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('heroSubtitle')}
            </p>
            
            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <SearchForm />
            </div>
            
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t('getStarted')}
                </Link>
                <Link
                  to="/pharmacies"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-100 bg-blue-700/30 rounded-lg hover:bg-blue-700/40 transition-colors"
                >
                  {t('browsePharmacies')}
                </Link>
              </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MediFind Ghana?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make finding medications easy, reliable, and accessible for everyone in Ghana
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalPharmacies || '—'}</div>
              <div className="text-gray-600">Pharmacies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.totalDrugs || '—'}</div>
              <div className="text-gray-600">Drugs Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalUsers || '—'}</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{stats.availableDrugs || '—'}</div>
              <div className="text-gray-600">Available Stock Items</div>
            </div>
          </div>
          {announcements.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">{t('announcements')}</h3>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 bg-white rounded shadow">
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-sm text-gray-600">{a.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Find Your Medications?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Ghanaians who are saving time and money by finding medications faster
          </p>
          <Link
            to="/search"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-green-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>

      {/* Inline search results (if any) */}
      {inlineResults.length > 0 && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold mb-4">Search results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inlineResults.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{r.drug?.name}</h4>
                      <p className="text-sm text-gray-600">{r.pharmacy?.name} — {r.pharmacy?.city}</p>
                      <p className="mt-2 text-sm text-gray-700">{r.price ? `GHS ${r.price.toFixed(2)}` : 'Price not set'}</p>
                    </div>
                    <div className={`ml-4 ${r.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {r.inStock ? (
                        <><CheckCircle className="w-6 h-6" /></>
                      ) : (
                        <><XCircle className="w-6 h-6" /></>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/pharmacies/${r.pharmacy.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;