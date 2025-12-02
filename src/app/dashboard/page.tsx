'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomerSelector from '@/components/shared/customer-selector';
import { 
  Package, 
  Users, 
  Wrench, 
  ClipboardCheck, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  DollarSign,
  RefreshCw,
  Eye,
  Search,
  Building2,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalItems: number;
  activeAssignments: number;
  pendingMaintenance: number;
  totalUsers: number;
  monthlyRevenue: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recentActivity: ActivityItem[];
  maintenanceAlerts: MaintenanceAlert[];
  clientMetrics: ClientMetric[];
}

interface ActivityItem {
  id: string;
  type: 'assignment' | 'maintenance' | 'check_in_out' | 'item_created';
  description: string;
  timestamp: string;
  user?: string;
  itemName?: string;
}

interface MaintenanceAlert {
  id: string;
  itemName: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
}

interface ClientMetric {
  id: string;
  name: string;
  itemCount: number;
  activeAssignments: number;
  monthlyBilling: number;
  lastActivity: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Redirect based on user role for non-dashboard access
    if (session.user?.role === 'WORKER') {
      router.push('/nfc-reader');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Fetch recent activity
        const activityResponse = await fetch('/api/dashboard/activity');
        const activityData = activityResponse.ok ? await activityResponse.json() : [];
        
        // Fetch client metrics (for owners)
        let clientMetrics = [];
        if (session?.user?.role === 'OWNER') {
          const clientResponse = await fetch('/api/clients/metrics');
          clientMetrics = clientResponse.ok ? await clientResponse.json() : [];
        }
        
        setStats({
          ...statsData,
          recentActivity: activityData,
          clientMetrics
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 mobile-nav-safe">
      <div className="scan-it-container space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                ASSET TRACKER
              </h1>
              <p className="text-lg text-blue-100">
                Manage and track your physical assets
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={fetchDashboardData} className="bg-white/20 hover:bg-white/30 text-white border-0" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-100 rounded-xl border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">System Online</span>
              </div>
            </div>
          </div>
          
          {/* Customer Selector and Search */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">SELECT CUSTOMER</label>
              <CustomerSelector 
                onCustomerChange={setSelectedCustomer}
                selectedCustomer={selectedCustomer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">SEARCH ASSETS</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Asset Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Assets Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
                <p className="text-sm text-green-600 font-semibold mt-1">All tracked items</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Assets Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Active Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems - stats.pendingMaintenance}</p>
                <p className="text-sm text-green-600 font-semibold mt-1">Currently available</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Maintenance Status Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">In Maintenance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingMaintenance}</p>
                <p className="text-sm text-orange-600 font-semibold mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="scan-it-card-gradient p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="scan-it-activity-item">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-xl ${
                      activity.type === 'assignment' ? 'bg-gradient-to-r from-blue-100 to-indigo-100' :
                      activity.type === 'maintenance' ? 'bg-gradient-to-r from-amber-100 to-orange-100' :
                      'bg-gradient-to-r from-green-100 to-emerald-100'
                    }`}>
                      {activity.type === 'assignment' && <Users className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'maintenance' && <Wrench className="h-5 w-5 text-amber-600" />}
                      {activity.type === 'check_in_out' && <ClipboardCheck className="h-5 w-5 text-green-600" />}
                      {activity.type === 'item_created' && <Package className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>

          {/* Maintenance Alerts */}
          <div className="scan-it-card-gradient p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Alerts</h2>
              <div className="p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-4">
              {stats.maintenanceAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="scan-it-activity-item border-l-4 border-l-red-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{alert.itemName}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.type}</p>
                      <p className="text-xs text-gray-500 mt-2">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button className="scan-it-button-warning text-xs px-3 py-1">
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
              {stats.maintenanceAlerts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No maintenance alerts</p>
              )}
            </div>
          </div>
        </div>

      {/* Client Metrics (Owner only) */}
      {session?.user?.role === 'OWNER' && stats.clientMetrics.length > 0 && (
        <div className="scan-it-card-gradient p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Overview</h2>
            <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="scan-it-table">
            <div className="scan-it-table-header">
              <div className="grid grid-cols-5 gap-4 px-6 py-4">
                <div className="text-sm font-semibold text-gray-900">Client</div>
                <div className="text-sm font-semibold text-gray-900">Assets</div>
                <div className="text-sm font-semibold text-gray-900">Assignments</div>
                <div className="text-sm font-semibold text-gray-900">Monthly Billing</div>
                <div className="text-sm font-semibold text-gray-900">Last Activity</div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.clientMetrics.map((client) => (
                <div key={client.id} className="scan-it-table-row grid grid-cols-5 gap-4 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {client.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{client.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">{client.itemCount}</span>
                    <span className="text-sm text-gray-500 ml-1">items</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900">{client.activeAssignments}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-green-600">${client.monthlyBilling.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    {new Date(client.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="scan-it-card-gradient p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <button 
            className="scan-it-button-primary flex flex-col items-center p-6 h-32 justify-center space-y-3"
            onClick={() => router.push('/inventory')}
          >
            <Package className="h-8 w-8" />
            <span className="font-semibold">View Assets</span>
          </button>
          <button 
            className="scan-it-button-success flex flex-col items-center p-6 h-32 justify-center space-y-3"
            onClick={() => router.push('/assignments')}
          >
            <Users className="h-8 w-8" />
            <span className="font-semibold">Assignments</span>
          </button>
          <button 
            className="scan-it-button-warning flex flex-col items-center p-6 h-32 justify-center space-y-3"
            onClick={() => router.push('/maintenance')}
          >
            <Wrench className="h-8 w-8" />
            <span className="font-semibold">Maintenance</span>
          </button>
          <button 
            className="scan-it-button-outline flex flex-col items-center p-6 h-32 justify-center space-y-3 hover:bg-purple-50"
            onClick={() => router.push('/check-in-out')}
          >
            <ClipboardCheck className="h-8 w-8 text-purple-600" />
            <span className="font-semibold text-purple-600">Check In/Out</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}