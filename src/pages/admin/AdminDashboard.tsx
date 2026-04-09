import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-blue-600">{stats.totalPharmacies}</div>
            <div className="text-sm text-gray-600">Pharmacies</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-green-600">{stats.totalDrugs}</div>
            <div className="text-sm text-gray-600">Drugs</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Users</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-orange-600">{stats.availableDrugs}</div>
            <div className="text-sm text-gray-600">Available Drugs</div>
          </div>
        </div>
      ) : (
        <div>Loading stats...</div>
      )}

      <div className="mt-8">
        <Link to="/admin/users" className="inline-block bg-blue-600 text-white px-4 py-2 rounded mr-2">
          Manage Users
        </Link>
        <Link to="/pharmacies" className="inline-block bg-green-600 text-white px-4 py-2 rounded">
          Manage Pharmacies
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
