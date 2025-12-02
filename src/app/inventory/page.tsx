'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  Upload,
  Nfc,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsCard } from '@/components/ui/stats-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'

interface Item {
  id: string
  name: string
  description?: string
  category?: string
  serialNumber?: string
  barcode?: string
  nfcTagId?: string
  location?: string
  status: 'AVAILABLE' | 'CHECKED_OUT' | 'IN_MAINTENANCE' | 'RETIRED' | 'LOST' | 'DAMAGED'
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  manufacturer?: string
  model?: string
  warranty?: string
  createdAt: string
  updatedAt: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockItems: Item[] = [
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          description: 'High-performance ultrabook for development work',
          category: 'Electronics',
          serialNumber: 'DL001234',
          barcode: '123456789012',
          nfcTagId: 'nfc_001',
          location: 'Office A - Desk 12',
          status: 'AVAILABLE',
          purchaseDate: '2024-01-15',
          purchasePrice: 1299.99,
          currentValue: 1100.00,
          manufacturer: 'Dell',
          model: 'XPS 13 9320',
          warranty: '2026-01-15',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with USB receiver',
          category: 'Accessories',
          serialNumber: 'MS002345',
          location: 'Storage Room B',
          status: 'CHECKED_OUT',
          purchaseDate: '2024-02-01',
          purchasePrice: 29.99,
          currentValue: 25.00,
          manufacturer: 'Logitech',
          model: 'MX Master 3',
          createdAt: '2024-02-01T14:30:00Z',
          updatedAt: '2024-02-01T14:30:00Z'
        },
        {
          id: '3',
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          category: 'Furniture',
          serialNumber: 'CH003456',
          location: 'Office A - Workstation 5',
          status: 'IN_MAINTENANCE',
          purchaseDate: '2023-12-10',
          purchasePrice: 299.99,
          currentValue: 250.00,
          manufacturer: 'Herman Miller',
          model: 'Aeron',
          warranty: '2028-12-10',
          createdAt: '2023-12-10T09:15:00Z',
          updatedAt: '2024-01-20T16:45:00Z'
        }
      ]
      setItems(mockItems)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)))
  const statuses = ['AVAILABLE', 'CHECKED_OUT', 'IN_MAINTENANCE', 'RETIRED', 'LOST', 'DAMAGED']

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === '' || item.category === selectedCategory
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800' // ACTIVE - Green
      case 'CHECKED_OUT': return 'bg-orange-100 text-orange-800' // IN-TRANSIT - Orange
      case 'IN_MAINTENANCE': return 'bg-red-100 text-red-800' // MAINTENANCE - Red
      case 'RETIRED': return 'bg-gray-100 text-gray-800'
      case 'LOST': return 'bg-purple-100 text-purple-800'
      case 'DAMAGED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const handleEdit = (item: Item) => {
    setSelectedItem(item)
    setShowAddModal(true)
  }

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== itemId))
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 mobile-nav-safe">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Inventory Management"
            description="Manage your inventory items, track status, and monitor assets"
            icon={Package}
            gradient="blue"
            actions={
              <div className="flex gap-3">
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
                <Button variant="success" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            }
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Items"
              value={items.length.toString()}
              icon={Package}
              gradient="blue"
            />
            
            <StatsCard
              title="Available"
              value={items.filter(item => item.status === 'AVAILABLE').length.toString()}
              icon={CheckCircle}
              gradient="green"
            />
            
            <StatsCard
              title="Checked Out"
              value={items.filter(item => item.status === 'CHECKED_OUT').length.toString()}
              icon={Clock}
              gradient="blue"
            />
            
            <StatsCard
              title="Maintenance"
              value={items.filter(item => item.status === 'IN_MAINTENANCE').length.toString()}
              icon={AlertTriangle}
              gradient="orange"
            />
          </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {item.serialNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.nfcTagId ? (
                        <div className="flex items-center text-green-600">
                          <Nfc className="h-4 w-4 mr-1" />
                          <span className="text-xs">Tagged</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No Tag</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
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
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or add a new item.</p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredItems.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredItems.length} of {items.length} items
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{selectedItem.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-900">{selectedItem.category || '-'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{selectedItem.description || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedItem.serialNumber || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedItem.barcode || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NFC Tag ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedItem.nfcTagId || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900">{selectedItem.location || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <p className="text-sm text-gray-900">{selectedItem.manufacturer || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <p className="text-sm text-gray-900">{selectedItem.model || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.purchaseDate ? new Date(selectedItem.purchaseDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.purchasePrice ? `$${selectedItem.purchasePrice.toFixed(2)}` : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.currentValue ? `$${selectedItem.currentValue.toFixed(2)}` : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Until</label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.warranty ? new Date(selectedItem.warranty).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedItem)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}