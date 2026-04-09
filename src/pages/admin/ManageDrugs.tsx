import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DrugItem {
  id: number;
  name: string;
  genericName?: string | null;
  category: string;
}

const ManageDrugs: React.FC = () => {
  const [drugs, setDrugs] = useState<DrugItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/admin/drugs');
      setDrugs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch drugs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  const deleteDrug = async (id: number) => {
    if (!confirm('Delete this drug?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/drugs/${id}`);
      fetchDrugs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Drugs</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {drugs.map((d) => (
            <div key={d.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.name} <span className="text-sm text-gray-500">{d.genericName}</span></div>
                <div className="text-sm text-gray-600">Category: {d.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => deleteDrug(d.id)} className="px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDrugs;
