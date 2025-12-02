'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { Users, Package, Scan, FileSpreadsheet, Search, Building2, Plus, UserPlus, TrendingUp, Activity, Clock, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClientInfo {
  companyName: string;
  contactName: string;
  logo?: string;
  primaryColor?: string;
  workerLimit: number;
  pricePerWorker: number;
}

interface SubClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface Asset {
  id: string;
  name: string;
  category?: string;
  serialNumber?: string;
  nfcTagId?: string;
  status: string;
  location?: string;
}

interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status: string;
  paymentStatus: string;
  monthlyFee: number;
  startDate: string;
}

export default function ClientDashboard() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [subClients, setSubClients] = useState<SubClient[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    startDate: '',
    endDate: '',
    subClientId: '',
    includeExported: false
  });
  const [newClient, setNewClient] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    contactPerson: '' 
  });
  const [newAsset, setNewAsset] = useState({ 
    name: '', 
    category: '', 
    serialNumber: '', 
    nfcTagId: '', 
    location: '', 
    subClientId: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setClientInfo({
          companyName: 'TechCorp Solutions',
          contactName: 'John Smith',
          logo: '/api/placeholder/40/40',
          primaryColor: '#3B82F6',
          workerLimit: 50,
          pricePerWorker: 25
        });

        setSubClients([
          { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0123', status: 'Active', createdAt: '2024-01-15' },
          { id: '2', name: 'Beta Industries', email: 'info@beta.com', phone: '+1-555-0124', status: 'Active', createdAt: '2024-02-01' },
          { id: '3', name: 'Gamma LLC', email: 'hello@gamma.com', phone: '+1-555-0125', status: 'Inactive', createdAt: '2024-02-15' }
        ]);

        setAssets([
          { id: '1', name: 'Laptop Dell XPS 13', category: 'Electronics', serialNumber: 'DL001', nfcTagId: 'NFC001', status: 'Active', location: 'Office A' },
          { id: '2', name: 'Office Chair', category: 'Furniture', serialNumber: 'CH001', nfcTagId: 'NFC002', status: 'Active', location: 'Office B' },
          { id: '3', name: 'Projector Epson', category: 'Electronics', serialNumber: 'EP001', nfcTagId: 'NFC003', status: 'Maintenance', location: 'Conference Room' }
        ]);

        setWorkers([
          { id: '1', name: 'Alice Johnson', email: 'alice@techcorp.com', phone: '+1-555-0201', position: 'Manager', department: 'IT', status: 'Active', paymentStatus: 'Paid', monthlyFee: 25, startDate: '2024-01-01' },
          { id: '2', name: 'Bob Wilson', email: 'bob@techcorp.com', phone: '+1-555-0202', position: 'Developer', department: 'Engineering', status: 'Active', paymentStatus: 'Paid', monthlyFee: 25, startDate: '2024-01-15' },
          { id: '3', name: 'Carol Davis', email: 'carol@techcorp.com', phone: '+1-555-0203', position: 'Designer', department: 'Design', status: 'Active', paymentStatus: 'Pending', monthlyFee: 25, startDate: '2024-02-01' }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddClient = async () => {
    try {
      const newSubClient: SubClient = {
        id: Date.now().toString(),
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setSubClients([...subClients, newSubClient]);
      setNewClient({ name: '', email: '', phone: '', address: '', contactPerson: '' });
      setShowAddClient(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleAddAsset = async () => {
    try {
      const newAssetData: Asset = {
        id: Date.now().toString(),
        name: newAsset.name,
        category: newAsset.category,
        serialNumber: newAsset.serialNumber,
        nfcTagId: newAsset.nfcTagId,
        status: 'Active',
        location: newAsset.location
      };
      
      setAssets([...assets, newAssetData]);
      setNewAsset({ name: '', category: '', serialNumber: '', nfcTagId: '', location: '', subClientId: '' });
      setShowAddAsset(false);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = assets.map(asset => ({
        Name: asset.name,
        Category: asset.category,
        'Serial Number': asset.serialNumber,
        'NFC Tag ID': asset.nfcTagId,
        Status: asset.status,
        Location: asset.location
      }));
      
      console.log('Exporting data:', data);
      
      setShowExportModal(false);
      setExportOptions({ startDate: '', endDate: '', subClientId: '', includeExported: false });
      
      if (data.length > 0) {
        console.log('Export successful');
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PageHeader
        title={clientInfo?.companyName || 'Asset Tracker Pro'}
        description={'Welcome back, ' + (clientInfo?.contactName || 'User')}
        icon={Activity}
        gradient="blue"
        actions={
          <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'clients', label: 'My Clients', icon: Building2 },
              { id: 'assets', label: 'Assets', icon: Package },
              { id: 'workers', label: 'Workers', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Quick Scan</h3>
                      <p className="text-sm text-blue-700 mt-1">Scan assets instantly</p>
                    </div>
                    <div className="bg-blue-600 p-3 rounded-xl">
                      <Scan className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Start Scanning
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Add Asset</h3>
                      <p className="text-sm text-green-700 mt-1">Register new items</p>
                    </div>
                    <div className="bg-green-600 p-3 rounded-xl">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => setShowAddAsset(true)}
                  >
                    Add Asset
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">Export Data</h3>
                      <p className="text-sm text-purple-700 mt-1">Download reports</p>
                    </div>
                    <div className="bg-purple-600 p-3 rounded-xl">
                      <FileSpreadsheet className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowExportModal(true)}
                  >
                    Export to Excel
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Clients"
                value={subClients.length.toString()}
                icon={Building2}
                trend={{ value: 12, isPositive: true }}
                className="bg-white/80 backdrop-blur-sm border-gray-200/50"
              />
              <StatsCard
                title="Active Assets"
                value={assets.filter(a => a.status === 'Active').length.toString()}
                icon={Package}
                trend={{ value: 8, isPositive: true }}
                className="bg-white/80 backdrop-blur-sm border-gray-200/50"
              />
              <StatsCard
                title="Active Workers"
                value={workers.filter(w => w.status === 'Active').length.toString()}
                icon={Users}
                trend={{ value: 5, isPositive: true }}
                className="bg-white/80 backdrop-blur-sm border-gray-200/50"
              />
              <StatsCard
                title="Monthly Revenue"
                value={'$' + workers.reduce((sum, w) => sum + w.monthlyFee, 0).toString()}
                icon={TrendingUp}
                trend={{ value: 15, isPositive: true }}
                className="bg-white/80 backdrop-blur-sm border-gray-200/50"
              />
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your assets and workers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Asset scanned', item: 'Laptop Dell XPS 13', time: '2 minutes ago', type: 'scan' },
                    { action: 'Worker added', item: 'Alice Johnson', time: '1 hour ago', type: 'user' },
                    { action: 'Asset updated', item: 'Office Chair', time: '3 hours ago', type: 'update' },
                    { action: 'Client registered', item: 'Acme Corp', time: '1 day ago', type: 'client' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={'p-2 rounded-full ' + (
                          activity.type === 'scan' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'user' ? 'bg-green-100 text-green-600' :
                          activity.type === 'update' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-purple-100 text-purple-600'
                        )}>
                          {activity.type === 'scan' && <Scan className="w-4 h-4" />}
                          {activity.type === 'user' && <UserPlus className="w-4 h-4" />}
                          {activity.type === 'update' && <Package className="w-4 h-4" />}
                          {activity.type === 'client' && <Building2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.item}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Clients</h2>
              <Button onClick={() => setShowAddClient(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>

            <div className="grid gap-6">
              {subClients.map((client) => (
                <Card key={client.id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-500">Created: {client.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {subClients.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first client</p>
                <Button onClick={() => setShowAddClient(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => setShowAddAsset(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {assets.filter(asset => 
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (asset.category && asset.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((asset) => (
                <Card key={asset.id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-600">{asset.category} • {asset.serialNumber}</p>
                          <p className="text-sm text-gray-500">Location: {asset.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={asset.status === 'Active' ? 'default' : asset.status === 'Maintenance' ? 'destructive' : 'secondary'}>
                          {asset.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Scan className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Workers</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </div>

            <div className="grid gap-4">
              {workers.map((worker) => (
                <Card key={worker.id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 p-3 rounded-xl">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                          <p className="text-sm text-gray-600">{worker.position} • {worker.department}</p>
                          <p className="text-sm text-gray-500">${worker.monthlyFee}/month • Started: {worker.startDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={worker.paymentStatus === 'Paid' ? 'default' : 'destructive'}>
                          {worker.paymentStatus}
                        </Badge>
                        <Badge variant={worker.status === 'Active' ? 'default' : 'secondary'}>
                          {worker.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Create a new client profile for your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Company Name"
              value={newClient.name}
              onChange={(e) => setNewClient({...newClient, name: e.target.value})}
            />
            <Input
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({...newClient, email: e.target.value})}
            />
            <Input
              placeholder="Phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
            />
            <Input
              placeholder="Address"
              value={newClient.address}
              onChange={(e) => setNewClient({...newClient, address: e.target.value})}
            />
            <Input
              placeholder="Contact Person"
              value={newClient.contactPerson}
              onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClient(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient} disabled={!newClient.name.trim()}>
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Register a new asset in your inventory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Asset Name"
              value={newAsset.name}
              onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
            />
            <Input
              placeholder="Category"
              value={newAsset.category}
              onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
            />
            <Input
              placeholder="Serial Number"
              value={newAsset.serialNumber}
              onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
            />
            <Input
              placeholder="NFC Tag ID"
              value={newAsset.nfcTagId}
              onChange={(e) => setNewAsset({...newAsset, nfcTagId: e.target.value})}
            />
            <Input
              placeholder="Location"
              value={newAsset.location}
              onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAsset(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset} disabled={!newAsset.name.trim()}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Excel</DialogTitle>
            <DialogDescription>Configure your export settings and download the data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={exportOptions.startDate}
                  onChange={(e) => setExportOptions({...exportOptions, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={exportOptions.endDate}
                  onChange={(e) => setExportOptions({...exportOptions, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client Filter</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={exportOptions.subClientId}
                onChange={(e) => setExportOptions({...exportOptions, subClientId: e.target.value})}
              >
                <option value="">All Clients</option>
                {subClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeExported"
                checked={exportOptions.includeExported}
                onChange={(e) => setExportOptions({...exportOptions, includeExported: e.target.checked})}
              />
              <label htmlFor="includeExported" className="text-sm text-gray-700">Include previously exported data</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}