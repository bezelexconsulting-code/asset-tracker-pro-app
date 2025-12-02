'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Nfc, 
  Search, 
  Package, 
  Users, 
  Wrench, 
  Camera, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Item {
  id: string
  name: string
  description?: string
  category: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  location?: string
  condition: string
  status: 'AVAILABLE' | 'ASSIGNED' | 'CHECKED_OUT' | 'IN_MAINTENANCE' | 'RETIRED'
  nfcTagId?: string
  assignedTo?: string
  assignedToName?: string
  images: string[]
  lastCheckedIn?: string
  lastCheckedOut?: string
  nextMaintenance?: string
  createdAt: string
}

interface NFCReadResult {
  tagId: string
  data?: any
}

export default function NFCAssetTracker() {
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      name: 'Motorola Radio XPR7550',
      description: 'Digital two-way radio',
      category: 'Communication',
      serialNumber: 'XPR001',
      model: 'XPR7550',
      manufacturer: 'Motorola',
      location: 'Equipment Room A',
      condition: 'Good',
      status: 'AVAILABLE',
      nfcTagId: 'NFC001',
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-15',
      nextMaintenance: '2024-03-15'
    },
    {
      id: '2',
      name: 'Safety Helmet',
      description: 'Hard hat with chin strap',
      category: 'Safety Equipment',
      serialNumber: 'SH002',
      location: 'Storage B',
      condition: 'Excellent',
      status: 'ASSIGNED',
      assignedTo: 'user1',
      assignedToName: 'John Smith',
      nfcTagId: 'NFC002',
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-14',
      lastCheckedOut: '2024-01-20'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showNFCModal, setShowNFCModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isNFCReading, setIsNFCReading] = useState(false)
  const [nfcResult, setNfcResult] = useState<NFCReadResult | null>(null)
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    location: '',
    condition: 'Good',
    nfcTagId: ''
  })

  const [newImages, setNewImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // NFC Functions
  const startNFCReading = async () => {
    setIsNFCReading(true);
    try {
      if ('NDEFReader' in window) {
        // Real Web NFC API implementation
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener('reading', async ({ message, serialNumber }: any) => {
          const tagId = serialNumber || `NFC${Date.now()}`;
          
          const mockNFCData = {
            tagId: tagId,
            data: {
              timestamp: new Date().toISOString(),
              location: 'Current Location',
              message: message.records.map((record: any) => ({
                recordType: record.recordType,
                data: record.data
              }))
            }
          };
          
          setNfcResult(mockNFCData);
          setIsNFCReading(false);
          
          // Check if this NFC tag is associated with an item
          const existingItem = items.find(item => item.nfcTagId === mockNFCData.tagId);
          if (existingItem) {
            setSelectedItem(existingItem);
            setShowItemModal(true);
          }
        });
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
          ndef.stop();
          setIsNFCReading(false);
        }, 30000);
        
      } else {
        // Fallback for browsers without NFC support
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockNFCData = {
          tagId: `NFC${Date.now()}`,
          data: {
            timestamp: new Date().toISOString(),
            location: 'Current Location'
          }
        };
        
        setNfcResult(mockNFCData);
        setIsNFCReading(false);
        
        // Check if this NFC tag is associated with an item
        const existingItem = items.find(item => item.nfcTagId === mockNFCData.tagId);
        if (existingItem) {
          setSelectedItem(existingItem);
          setShowItemModal(true);
        }
      }
    } catch (error) {
      console.error('NFC reading failed:', error);
      setIsNFCReading(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const imageUrl = URL.createObjectURL(file)
      setNewImages(prev => [...prev, imageUrl])
    })
  }

  const removeImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const addNewItem = () => {
    if (!newItem.name || !newItem.category) return

    const item: Item = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      category: newItem.category,
      serialNumber: newItem.serialNumber,
      model: newItem.model,
      manufacturer: newItem.manufacturer,
      location: newItem.location,
      condition: newItem.condition as any,
      status: 'AVAILABLE',
      nfcTagId: newItem.nfcTagId || nfcResult?.tagId,
      images: newImages.length > 0 ? newImages : ['/api/placeholder/300/200'],
      createdAt: new Date().toISOString().split('T')[0]
    }

    setItems(prev => [item, ...prev])
    setNewItem({
      name: '',
      description: '',
      category: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      location: '',
      condition: 'Good',
      nfcTagId: ''
    })
    setNewImages([])
    setShowItemModal(false)
    setNfcResult(null)
  }

  const checkInOut = async (itemId: string, type: 'CHECK_IN' | 'CHECK_OUT') => {
    try {
      const response = await fetch('/api/check-in-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          action: type.toLowerCase(),
          location: 'Current Location',
          notes: `${type === 'CHECK_IN' ? 'Checked in' : 'Checked out'} via NFC scan`
        }),
      });

      if (response.ok) {
        const checkInOutRecord = await response.json();
        
        // Update local items state
        setItems(prev => prev.map(item => {
          if (item.id === itemId) {
            const now = new Date().toISOString()
            return {
              ...item,
              status: type === 'CHECK_OUT' ? 'CHECKED_OUT' : 'AVAILABLE',
              lastCheckedIn: type === 'CHECK_IN' ? now : item.lastCheckedIn,
              lastCheckedOut: type === 'CHECK_OUT' ? now : item.lastCheckedOut,
              lastCheckInOut: checkInOutRecord
            }
          }
          return item
        }));

        // Show success message
        alert(`Item ${type === 'CHECK_IN' ? 'checked in' : 'checked out'} successfully!`);
        
        // Export to Excel with timestamp
        exportToExcel([{
          action: type,
          itemName: items.find(i => i.id === itemId)?.name,
          timestamp: new Date().toISOString(),
          location: 'Current Location'
        }])
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Check-in/out failed:', error);
      alert('Failed to process check-in/out. Please try again.');
    }
  }

  const exportToExcel = async (data?: any[]) => {
    try {
      const exportData = data || items.map(item => ({
        'Item ID': item.id,
        'Name': item.name,
        'Description': item.description,
        'Serial Number': item.serialNumber,
        'Category': item.category,
        'Location': item.location,
        'Status': item.status,
        'NFC Tag ID': item.nfcTagId || 'Not Assigned',
        'Assigned To': item.assignedTo || 'Unassigned',
        'Last Check-In': item.lastCheckedIn || '',
        'Last Check-Out': item.lastCheckedOut || '',
        'Created Date': item.createdAt
      }));

      const response = await fetch('/api/excel-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'items',
          data: exportData,
          includeImages: false
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `asset_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Excel file exported successfully!');
      } else {
        const error = await response.json();
        alert(`Export failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_OUT': return 'bg-yellow-100 text-yellow-800'
      case 'IN_MAINTENANCE': return 'bg-red-100 text-red-800'
      case 'RETIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))]
  const statuses = ['all', 'AVAILABLE', 'ASSIGNED', 'CHECKED_OUT', 'IN_MAINTENANCE', 'RETIRED']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Nfc className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">NFC Asset Tracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNFCModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Nfc className="h-5 w-5 mr-2" />
                Read NFC Tag
              </button>
              <button
                onClick={() => setShowItemModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item
              </button>
              <button
                onClick={() => exportToExcel(filteredItems)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => item.status === 'AVAILABLE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => item.status === 'ASSIGNED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => item.status === 'IN_MAINTENANCE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-video relative bg-gray-100">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                {item.nfcTagId && (
                  <div className="absolute top-2 left-2">
                    <Nfc className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {item.category}
                  </div>
                  {item.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {item.location}
                    </div>
                  )}
                  {item.assignedToName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {item.assignedToName}
                    </div>
                  )}
                  {item.serialNumber && (
                    <div className="flex items-center">
                      <span className="text-xs">S/N: {item.serialNumber}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowItemModal(true)
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  
                  {item.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => checkInOut(item.id, 'CHECK_OUT')}
                      className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Check Out
                    </button>
                  ) : item.status === 'CHECKED_OUT' ? (
                    <button
                      onClick={() => checkInOut(item.id, 'CHECK_IN')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Check In
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No items match your search criteria.' : 'Start by adding your first item.'}
            </p>
          </div>
        )}
      </div>

      {/* NFC Reading Modal */}
      {showNFCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">NFC Tag Reader</h2>
                <button
                  onClick={() => {
                    setShowNFCModal(false)
                    setIsNFCReading(false)
                    setNfcResult(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="text-center">
                {!isNFCReading && !nfcResult && (
                  <>
                    <Nfc className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">Hold your device near an NFC tag to read it</p>
                    <button
                      onClick={startNFCReading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Reading
                    </button>
                  </>
                )}

                {isNFCReading && (
                  <>
                    <div className="animate-pulse">
                      <Nfc className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    </div>
                    <p className="text-gray-600">Reading NFC tag...</p>
                  </>
                )}

                {nfcResult && (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Tag Read Successfully!</p>
                    <p className="text-gray-600 mb-4">Tag ID: {nfcResult.tagId}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowNFCModal(false)
                          setShowItemModal(true)
                          setNewItem(prev => ({ ...prev, nfcTagId: nfcResult.tagId }))
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add New Item
                      </button>
                      <button
                        onClick={() => {
                          setShowNFCModal(false)
                          setNfcResult(null)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/View Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedItem ? 'Item Details' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowItemModal(false)
                    setSelectedItem(null)
                    setNewItem({
                      name: '',
                      description: '',
                      category: '',
                      serialNumber: '',
                      model: '',
                      manufacturer: '',
                      location: '',
                      condition: 'Good',
                      nfcTagId: ''
                    })
                    setNewImages([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedItem ? (
                // View Mode
                <div className="space-y-6">
                  {/* Images */}
                   {selectedItem.images.length > 0 && (
                     <div>
                       <h3 className="text-lg font-medium text-gray-900 mb-3">Images</h3>
                       <div className="grid grid-cols-4 gap-3">
                         {selectedItem.images.map((image, index) => (
                           <div key={index} className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                             <img
                               src={image}
                               alt={`${selectedItem.name} ${index + 1}`}
                               className="w-full h-full object-cover"
                             />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{selectedItem.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-gray-900">{selectedItem.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <p className="text-gray-900">{selectedItem.serialNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <p className="text-gray-900">{selectedItem.model || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{selectedItem.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedItem.nfcTagId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NFC Tag ID</label>
                        <p className="text-gray-900">{selectedItem.nfcTagId}</p>
                      </div>
                    )}
                    {selectedItem.assignedToName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <p className="text-gray-900">{selectedItem.assignedToName}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-gray-900">{selectedItem.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Add Mode
                <div className="space-y-4">
                  {/* Image Upload */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                       {newImages.length > 0 ? (
                         <div className="grid grid-cols-4 gap-2 mb-4">
                           {newImages.map((image, index) => (
                             <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                               <img
                                 src={image}
                                 alt={`Upload ${index + 1}`}
                                 className="w-full h-full object-cover"
                               />
                               <button
                                 onClick={() => removeImage(index)}
                                 className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                               >
                                 ×
                               </button>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <>
                           <Camera className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                           <p className="text-gray-600 mb-2 text-sm">Add images of the item</p>
                         </>
                       )}
                       <button
                         onClick={() => fileInputRef.current?.click()}
                         className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                       >
                         Choose Images
                       </button>
                       <input
                         ref={fileInputRef}
                         type="file"
                         accept="image/*"
                         multiple
                         onChange={handleImageUpload}
                         className="hidden"
                       />
                     </div>
                   </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Motorola Radio"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="Communication">Communication</option>
                        <option value="Safety Equipment">Safety Equipment</option>
                        <option value="Tools">Tools</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={newItem.serialNumber}
                        onChange={(e) => setNewItem(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={newItem.model}
                        onChange={(e) => setNewItem(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={newItem.manufacturer}
                        onChange={(e) => setNewItem(prev => ({ ...prev, manufacturer: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newItem.location}
                        onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {nfcResult && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NFC Tag ID</label>
                      <input
                        type="text"
                        value={newItem.nfcTagId || nfcResult.tagId}
                        onChange={(e) => setNewItem(prev => ({ ...prev, nfcTagId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowItemModal(false)
                        setNewItem({
                          name: '',
                          description: '',
                          category: '',
                          serialNumber: '',
                          model: '',
                          manufacturer: '',
                          location: '',
                          condition: 'Good',
                          nfcTagId: ''
                        })
                        setNewImages([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewItem}
                      disabled={!newItem.name || !newItem.category}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}