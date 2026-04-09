import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, Search, Filter, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  region: string;
  city: string;
  phone: string | null;
  openingHours: string | null;
  drugs: Array<{
    drug: {
      name: string;
    };
    price: number | null;
    inStock: boolean;
  }>;
}

const PharmaciesPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const regions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Volta', 
    'Eastern', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo'
  ];

  const citiesByRegion: Record<string, string[]> = {
    'Greater Accra': ['Accra', 'Tema', 'Madina', 'Dansoman', 'Labadi'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong', 'Konongo'],
    'Western': ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Elubo'],
    'Central': ['Cape Coast', 'Kasoa', 'Winneba', 'Mankessim', 'Saltpond'],
    'Volta': ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Sogakope'],
    'Eastern': ['Koforidua', 'Nsawam', 'Akosombo', 'Aburi', 'Suhum'],
    'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla', 'Walewale'],
    'Upper East': ['Bolgatanga', 'Navrongo', 'Bawku', 'Zebilla', 'Sandema'],
    'Upper West': ['Wa', 'Lawra', 'Tumu', 'Jirapa', 'Nandom'],
    'Brong-Ahafo': ['Sunyani', 'Techiman', 'Wenchi', 'Bechem', 'Dormaa']
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    filterPharmacies();
  }, [searchTerm, selectedRegion, selectedCity, pharmacies]);

  const navigate = useNavigate();

  const fetchPharmacies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pharmacies');
      setPharmacies(response.data);
      setFilteredPharmacies(response.data);
    } catch (error) {
      // provide more detailed error feedback for debugging
      // eslint-disable-next-line no-console
      console.error('Failed to fetch pharmacies', error);
      const msg = error?.response?.data?.error || error?.message || 'Failed to load pharmacies';
      toast.error(`Failed to load pharmacies: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = pharmacies;

    if (searchTerm) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(pharmacy => pharmacy.region === selectedRegion);
    }

    if (selectedCity) {
      filtered = filtered.filter(pharmacy => pharmacy.city === selectedCity);
    }

    setFilteredPharmacies(filtered);
  };

  const getAvailableDrugsCount = (pharmacy: Pharmacy) => {
    return pharmacy.drugs.filter(drug => drug.inStock).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pharmacies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pharmacies in Ghana</h1>
          <p className="text-gray-600 mt-2">Find licensed pharmacies near you</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Pharmacies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by name or address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pharmacies..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedCity('');
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedRegion}
              >
                <option value="">All Cities</option>
                {selectedRegion && citiesByRegion[selectedRegion]?.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredPharmacies.length}</span> pharmacies
            {selectedRegion && ` in ${selectedRegion}`}
            {selectedCity && `, ${selectedCity}`}
          </p>
        </div>

        {/* Pharmacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-gray-300" />
                        <span className="ml-2 text-sm text-gray-500">4.0</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    {getAvailableDrugsCount(pharmacy)} drugs available
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{pharmacy.address}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{pharmacy.city}, {pharmacy.region}</span>
                  </div>

                  {pharmacy.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${pharmacy.phone}`} className="text-sm hover:text-blue-600">
                        {pharmacy.phone}
                      </a>
                    </div>
                  )}

                  {pharmacy.openingHours && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{pharmacy.openingHours}</span>
                    </div>
                  )}
                </div>

                {/* Available Drugs Preview */}
                {pharmacy.drugs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Available Drugs</h4>
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.drugs.slice(0, 3).map((drug, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            drug.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {drug.drug.name}
                          {drug.price && ` - GHS ${drug.price.toFixed(2)}`}
                        </div>
                      ))}
                      {pharmacy.drugs.length > 3 && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{pharmacy.drugs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button onClick={() => navigate(`/pharmacies/${pharmacy.id}`)} className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPharmacies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmaciesPage;