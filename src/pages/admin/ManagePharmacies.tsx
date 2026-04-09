import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PharmacyItem {
  id: number;
  name: string;
  address: string;
  region: string;
  city: string;
}

const ManagePharmacies: React.FC = () => {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/admin/pharmacies');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pharmacies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this pharmacy?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/pharmacies/${id}`);
      fetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Pharmacies</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name} <span className="text-sm text-gray-500">({p.city})</span></div>
                <div className="text-sm text-gray-600">{p.address} · {p.region}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => deleteItem(p.id)} className="px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePharmacies;
