import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, Package, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Drug {
  id: number;
  name: string;
  genericName: string | null;
  category: string;
  description: string | null;
  dosageForm: string | null;
  strength: string | null;
  pharmacyDrugs: Array<{
    pharmacy: {
      name: string;
      city: string;
      region: string;
    };
    price: number | null;
    inStock: boolean;
  }>;
}

const DrugsPage: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'Prescription',
    'Over-the-Counter',
    'Herbal',
    'Antibiotic',
    'Analgesic',
    'Antimalarial',
    'Antihypertensive',
    'Diabetic',
    'Vitamins',
    'Other'
  ];

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    filterDrugs();
  }, [searchTerm, selectedCategory, drugs]);

  const fetchDrugs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/drugs');
      setDrugs(response.data);
      setFilteredDrugs(response.data);
    } catch (error) {
      toast.error('Failed to load drugs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDrugs = () => {
    let filtered = drugs;

    if (searchTerm) {
      filtered = filtered.filter(drug =>
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.genericName && drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(drug => drug.category === selectedCategory);
    }

    setFilteredDrugs(filtered);
  };

  const getAvailabilityCount = (drug: Drug) => {
    return drug.pharmacyDrugs.filter(pd => pd.inStock).length;
  };

  const getAveragePrice = (drug: Drug) => {
    const prices = drug.pharmacyDrugs
      .filter(pd => pd.price !== null && pd.inStock)
      .map(pd => pd.price!);
    
    if (prices.length === 0) return null;
    
    const sum = prices.reduce((a, b) => a + b, 0);
    return sum / prices.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drugs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Drugs Database</h1>
          <p className="text-gray-600 mt-2">Browse and search for medications available in Ghana</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Drugs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by drug name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search drugs (e.g., Paracetamol, Amoxicillin)..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredDrugs.length}</span> drugs
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Drugs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrugs.map((drug) => {
            const availabilityCount = getAvailabilityCount(drug);
            const averagePrice = getAveragePrice(drug);

            return (
              <div key={drug.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Pill className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{drug.name}</h3>
                        {drug.genericName && (
                          <p className="text-sm text-gray-500">({drug.genericName})</p>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      availabilityCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {availabilityCount} available
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span className="text-sm">{drug.category}</span>
                      </div>
                      
                      {averagePrice && (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">GHS {averagePrice.toFixed(2)} avg</span>
                        </div>
                      )}
                    </div>

                    {drug.strength && (
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span className="text-sm">Strength: {drug.strength}</span>
                      </div>
                    )}

                    {drug.dosageForm && (
                      <div className="flex items-center text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span className="text-sm">Form: {drug.dosageForm}</span>
                      </div>
                    )}

                    {drug.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{drug.description}</p>
                    )}
                  </div>

                  {/* Available Pharmacies Preview */}
                  {drug.pharmacyDrugs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Available At</h4>
                      <div className="space-y-2">
                        {drug.pharmacyDrugs.slice(0, 2).map((pharmacyDrug, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{pharmacyDrug.pharmacy.name}</p>
                              <p className="text-xs text-gray-500">{pharmacyDrug.pharmacy.city}, {pharmacyDrug.pharmacy.region}</p>
                            </div>
                            <div className="flex items-center">
                              {pharmacyDrug.price && (
                                <span className="text-sm font-medium text-green-600 mr-2">
                                  GHS {pharmacyDrug.price.toFixed(2)}
                                </span>
                              )}
                              <div className={`w-2 h-2 rounded-full ${
                                pharmacyDrug.inStock ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </div>
                        ))}
                        {drug.pharmacyDrugs.length > 2 && (
                          <p className="text-sm text-gray-500 text-center">
                            +{drug.pharmacyDrugs.length - 2} more pharmacies
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                    View Availability
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDrugs.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drugs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Drug Categories Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Drug Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const count = drugs.filter(d => d.category === category).length;
              return (
                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Pill className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{category}</div>
                  <div className="text-sm text-gray-500">{count} drugs</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugsPage;