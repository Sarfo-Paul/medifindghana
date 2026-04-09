import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Pill, DollarSign, CheckCircle, XCircle, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SearchResult {
  id: number;
  pharmacy: {
    id: number;
    name: string;
    address: string;
    city: string;
    region: string;
    phone: string | null;
  };
  drug: {
    id: number;
    name: string;
    genericName: string | null;
    category: string;
  };
  price: number | null;
  quantity: number;
  inStock: boolean;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('drugName') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price');

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

  // when query params change, update state and run search
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('drugName') || '';
    const r = searchParams.get('region') || '';
    const c = searchParams.get('city') || '';
    setSearchTerm(q);
    setRegion(r);
    setCity(c);
    if (q) {
      performSearch(q, r, c);
    } else {
      setIsLoading(false);
      setResults([]);
      setFilteredResults([]);
    }
  }, [searchParams.toString()]);

  useEffect(() => {
    filterAndSortResults();
  }, [showInStockOnly, sortBy, results]);

  const performSearch = async (drugParam?: string, regionParam?: string, cityParam?: string) => {
    const drug = (drugParam !== undefined ? drugParam : searchTerm || '').trim();
    const rg = regionParam !== undefined ? regionParam : region;
    const ct = cityParam !== undefined ? cityParam : city;

    if (!drug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('drugName', drug);
      if (rg) params.set('region', rg);
      if (ct) params.set('city', ct);

      const response = await axios.get(`http://localhost:3001/api/search?${params.toString()}`);
      setResults(response.data);
      setFilteredResults(response.data);
    } catch (error) {
      toast.error('Failed to search for drugs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortResults = () => {
    let filtered = results;

    if (showInStockOnly) {
      filtered = filtered.filter(result => result.inStock);
    }

    // Sort results
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || Infinity) - (b.price || Infinity);
        case 'name':
          return a.drug.name.localeCompare(b.drug.name);
        case 'pharmacy':
          return a.pharmacy.name.localeCompare(b.pharmacy.name);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('drugName', searchTerm.trim());
    if (region) params.set('region', region);
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for drugs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Medications</h1>
          <p className="text-gray-600 mt-2">Find drugs across pharmacies in Ghana</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Medications
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setCity('');
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Regions</option>
                  {regions.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Filters and Results Header */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredResults.length} results for "{searchTerm}"
                </h2>
                {region && (
                  <p className="text-gray-600 mt-1">
                    in {region}
                    {city && `, ${city}`}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInStockOnly}
                      onChange={(e) => setShowInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In stock only</span>
                  </label>
                </div>

                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="price">Sort by: Price (Low to High)</option>
                    <option value="name">Sort by: Drug Name</option>
                    <option value="pharmacy">Sort by: Pharmacy Name</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResults.map((result) => (
              <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Drug Info */}
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <Pill className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{result.drug.name}</h3>
                          {result.drug.genericName && (
                            <p className="text-gray-500">({result.drug.genericName})</p>
                          )}
                          <div className="mt-2">
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                              {result.drug.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pharmacy Info */}
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                          <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{result.pharmacy.name}</h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{result.pharmacy.address}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {result.pharmacy.city}, {result.pharmacy.region}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price and Availability */}
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-lg font-bold text-gray-900">
                              {result.price ? `GHS ${result.price.toFixed(2)}` : 'Price not set'}
                            </span>
                          </div>
                          <div className={`flex items-center ${result.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {result.inStock ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-1" />
                                <span className="font-medium">In Stock</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 mr-1" />
                                <span className="font-medium">Out of Stock</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p>Quantity available: {result.quantity}</p>
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Tips */}
        {!searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-blue-600 font-medium mb-2">Use Generic Names</div>
                <p className="text-sm text-gray-600">Try searching for generic names like "Paracetamol" instead of brand names</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-blue-600 font-medium mb-2">Filter by Location</div>
                <p className="text-sm text-gray-600">Select a region or city to find pharmacies near you</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-blue-600 font-medium mb-2">Check Availability</div>
                <p className="text-sm text-gray-600">Use the "In stock only" filter to see currently available drugs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;