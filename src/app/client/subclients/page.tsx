'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Users, Edit, Trash2, Eye, FileSpreadsheet } from 'lucide-react';

interface SubClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  nfcTapCount?: number;
}

export default function SubClientsPage() {
  const [subClients, setSubClients] = useState<SubClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubClient, setSelectedSubClient] = useState<SubClient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newSubClient, setNewSubClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchSubClients();
  }, []);

  const fetchSubClients = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData: SubClient[] = [
        {
          id: '1',
          name: 'John2',
          email: 'john2@security.com',
          phone: '+1234567890',
          status: 'ACTIVE',
          createdAt: '2024-01-15',
          nfcTapCount: 25
        },
        {
          id: '2',
          name: 'Security Team Alpha',
          email: 'alpha@security.com',
          phone: '+1234567891',
          status: 'ACTIVE',
          createdAt: '2024-01-10',
          nfcTapCount: 42
        }
      ];
      setSubClients(mockData);
    } catch (error) {
      console.error('Error fetching subclients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubClient = async () => {
    try {
      // Mock API call - replace with actual implementation
      const newId = Date.now().toString();
      const subclient: SubClient = {
        id: newId,
        name: newSubClient.name,
        email: newSubClient.email,
        phone: newSubClient.phone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
        nfcTapCount: 0
      };
      
      setSubClients([...subClients, subclient]);
      setNewSubClient({ name: '', email: '', phone: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding subclient:', error);
    }
  };

  const handleExportExcel = async (subClientId: string, subClientName: string) => {
    try {
      // Mock Excel export - replace with actual API call
      console.log(`Exporting Excel for ${subClientName}`);
      alert(`Excel export initiated for ${subClientName}. The file will be downloaded shortly.`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const filteredSubClients = subClients.filter(subclient =>
    subclient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subclient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSubClients = subClients.length;
  const activeSubClients = subClients.filter(sc => sc.status === 'ACTIVE').length;
  const totalNFCTaps = subClients.reduce((sum, sc) => sum + (sc.nfcTapCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clients</h1>
        <p className="text-gray-600">Manage your clients and track their NFC tag activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalSubClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeSubClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileSpreadsheet className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total NFC Taps</p>
              <p className="text-2xl font-bold text-gray-900">{totalNFCTaps}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search clients..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* SubClients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFC Taps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubClients.map((subclient) => (
                <tr key={subclient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subclient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subclient.email}</div>
                    <div className="text-sm text-gray-500">{subclient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subclient.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subclient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subclient.nfcTapCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subclient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExportExcel(subclient.id, subclient.name)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                        title="Export Excel"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubClient(subclient);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this client?')) {
                            setSubClients(subClients.filter(sc => sc.id !== subclient.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SubClient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newSubClient.name}
                  onChange={(e) => setNewSubClient({...newSubClient, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newSubClient.email}
                  onChange={(e) => setNewSubClient({...newSubClient, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newSubClient.phone}
                  onChange={(e) => setNewSubClient({...newSubClient, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSubClient({ name: '', email: '', phone: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubClient}
                disabled={!newSubClient.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}