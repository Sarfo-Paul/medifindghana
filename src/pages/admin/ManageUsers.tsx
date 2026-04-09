import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id: number, role: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.name} <span className="text-sm text-gray-500">({u.email})</span></div>
                <div className="text-sm text-gray-600">Role: {u.role}{u.phone ? ` · ${u.phone}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeRole(u.id, 'USER')} className="px-3 py-1 rounded bg-gray-100">Make User</button>
                <button onClick={() => changeRole(u.id, 'ADMIN')} className="px-3 py-1 rounded bg-blue-100">Make Admin</button>
                <button onClick={() => changeRole(u.id, 'PHARMACY_OWNER')} className="px-3 py-1 rounded bg-yellow-100">Make Owner</button>
                <button onClick={() => deleteUser(u.id)} className="px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
