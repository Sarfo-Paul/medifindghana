import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Phone, Clock, Pill, DollarSign } from 'lucide-react';

const PharmacyDetail: React.FC = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/pharmacies/${id}`);
        setPharmacy(res.data);
      } catch (err) {
        setPharmacy(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPharmacy();
  }, [id]);

  if (isLoading) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Loading...</div>;
  if (!pharmacy) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Pharmacy not found</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-2">{pharmacy.name}</h1>
          <p className="text-gray-600 mb-4">{pharmacy.address}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center text-gray-700"><MapPin className="w-4 h-4 mr-2" />{pharmacy.city}, {pharmacy.region}</div>
              {pharmacy.phone && <div className="flex items-center text-gray-700"><Phone className="w-4 h-4 mr-2" />{pharmacy.phone}</div>}
              {pharmacy.openingHours && <div className="flex items-center text-gray-700"><Clock className="w-4 h-4 mr-2" />{pharmacy.openingHours}</div>}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Listed: {new Date(pharmacy.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-3">Available Drugs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pharmacy.drugs && pharmacy.drugs.length > 0 ? (
              pharmacy.drugs.map((pd: any) => (
                <div key={pd.id} className="p-3 border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="font-medium">{pd.drug?.name}</div>
                    {pd.drug?.genericName && <div className="text-sm text-gray-500">{pd.drug.genericName}</div>}
                    <div className="text-sm text-gray-600 mt-1">{pd.drug?.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{pd.inStock ? 'In stock' : 'Out of stock'}</div>
                    <div className="text-lg font-semibold mt-2">{pd.price ? `GHS ${pd.price.toFixed(2)}` : 'Price N/A'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-600">No drugs listed for this pharmacy.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetail;
