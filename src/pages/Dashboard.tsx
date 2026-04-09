import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Pill, Users, Package, BarChart3, Clock, MapPin, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalPharmacies: number;
  totalDrugs: number;
  totalUsers: number;
  availableDrugs: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/dashboard/stats')
      ]);
      
      setStats(statsResponse.data);
      
      // Mock recent activities
      setRecentActivities([
        { id: 1, type: 'search', description: 'Searched for Paracetamol', timestamp: '2 hours ago' },
        { id: 2, type: 'pharmacy', description: 'Viewed Medipharm Pharmacy', timestamp: '5 hours ago' },
        { id: 3, type: 'drug', description: 'Checked Amoxicillin availability', timestamp: '1 day ago' },
        { id: 4, type: 'search', description: 'Searched for Malaria drugs', timestamp: '2 days ago' },
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Pharmacies',
      value: stats?.totalPharmacies || 0,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Available Drugs',
      value: stats?.availableDrugs || 0,
      icon: <Pill className="w-6 h-6" />,
      color: 'bg-green-500',
      trend: '+8%'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      trend: '+15%'
    },
    {
      title: 'Drug Categories',
      value: stats?.totalDrugs || 0,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-orange-500',
      trend: '+5%'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your pharmacy search today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value.toLocaleString()}</div>
              <div className="text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {activity.type === 'search' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'pharmacy' && <Building2 className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'drug' && <Pill className="w-5 h-5 text-blue-600" />}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900">Search Drugs</span>
                  </div>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900">Browse Pharmacies</span>
                  </div>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Pill className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900">View All Drugs</span>
                  </div>
                  <Package className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-xl shadow-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{user?.name}</h3>
                <p className="text-blue-100 mb-4">{user?.email}</p>
                <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg">
                  <span className="text-white font-medium">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Regions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Regions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Greater Accra', 'Ashanti', 'Western', 'Central', 'Volta'].map((region) => (
              <div key={region} className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">{region}</div>
                <div className="text-sm text-gray-500">Active pharmacies</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;