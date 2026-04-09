import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSearch?: (drug: string, region?: string, city?: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (onSearch) {
      onSearch(searchTerm.trim(), region, city);
      return;
    }

    const params = new URLSearchParams();
    params.set('drugName', searchTerm);
    if (region) params.set('region', region);
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search for Medications
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter drug name (e.g., Paracetamol, Amoxicillin)"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCity('');
              }}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!region}
            >
              <option value="">All Cities</option>
              {region && citiesByRegion[region]?.map((cityName) => (
                <option key={cityName} value={cityName}>{cityName}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <Search className="w-5 h-5 mr-2" />
          Search Medications
        </button>
      </div>
    </form>
  );
};

export default SearchForm;