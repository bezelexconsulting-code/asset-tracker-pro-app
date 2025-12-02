'use client'

import { useState, useEffect } from 'react'
import { 
  LogIn, 
  LogOut, 
  Clock, 
  User, 
  Package, 
  Search, 
  Calendar,
  Nfc,
  CheckCircle,
  XCircle,
  AlertCircle,
  History
} from 'lucide-react'
import { NFCManager } from '@/lib/nfc'

interface CheckInOutRecord {
  id: string
  itemId: string
  itemName: string
  userId: string
  userName: string
  action: 'CHECK_IN' | 'CHECK_OUT'
  timestamp: string
  location?: string
  notes?: string
  nfcTagId?: string
}

interface Item {
  id: string
  name: string
  serialNumber?: string
  nfcTagId?: string
  status: 'AVAILABLE' | 'CHECKED_OUT' | 'IN_MAINTENANCE' | 'RETIRED'
  currentAssignee?: string
}

export default function CheckInOutPage() {
  const [records, setRecords] = useState<CheckInOutRecord[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const nfcManager = new NFCManager()

  // Mock data
  useEffect(() => {
    // Check NFC support
    setNfcSupported(nfcManager.isSupported())

    // Load mock data
    setTimeout(() => {
      const mockItems: Item[] = [
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          serialNumber: 'DL001234',
          nfcTagId: 'nfc_001',
          status: 'AVAILABLE'
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          serialNumber: 'MS002345',
          status: 'CHECKED_OUT',
          currentAssignee: 'John Doe'
        },
        {
          id: '3',
          name: 'Office Chair',
          serialNumber: 'CH003456',
          status: 'AVAILABLE'
        }
      ]

      const mockRecords: CheckInOutRecord[] = [
        {
          id: '1',
          itemId: '2',
          itemName: 'Wireless Mouse',
          userId: 'user1',
          userName: 'John Doe',
          action: 'CHECK_OUT',
          timestamp: '2024-01-20T09:30:00Z',
          location: 'Office A',
          notes: 'For presentation setup'
        },
        {
          id: '2',
          itemId: '1',
          itemName: 'Laptop Dell XPS 13',
          userId: 'user2',
          userName: 'Jane Smith',
          action: 'CHECK_IN',
          timestamp: '2024-01-19T17:15:00Z',
          location: 'IT Department',
          nfcTagId: 'nfc_001'
        }
      ]

      setItems(mockItems)
      setRecords(mockRecords)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleNFCScan = async () => {
    if (!nfcSupported) {
      alert('NFC is not supported on this device')
      return
    }

    setIsScanning(true)
    setScanResult(null)

    try {
      const result = await nfcManager.readSingleTag()
      setScanResult(result?.id || null)
      
      // Find item by NFC tag
      const foundItem = items.find(item => item.nfcTagId === result?.id)
      if (foundItem) {
        setSelectedItem(foundItem)
      } else {
        alert('No item found with this NFC tag')
      }
    } catch (error) {
      console.error('NFC scan failed:', error)
      alert('Failed to scan NFC tag. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleCheckIn = () => {
    if (!selectedItem || !selectedUser) {
      alert('Please select an item and user')
      return
    }

    if (selectedItem.status !== 'CHECKED_OUT') {
      alert('This item is not currently checked out')
      return
    }

    const newRecord: CheckInOutRecord = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      userId: selectedUser,
      userName: selectedUser, // In real app, get from user database
      action: 'CHECK_IN',
      timestamp: new Date().toISOString(),
      location: location || undefined,
      notes: notes || undefined,
      nfcTagId: scanResult || undefined
    }

    setRecords([newRecord, ...records])
    
    // Update item status
    setItems(items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, status: 'AVAILABLE', currentAssignee: undefined }
        : item
    ))

    // Reset form
    setSelectedItem(null)
    setSelectedUser('')
    setNotes('')
    setLocation('')
    setScanResult(null)

    alert('Item checked in successfully!')
  }

  const handleCheckOut = () => {
    if (!selectedItem || !selectedUser) {
      alert('Please select an item and user')
      return
    }

    if (selectedItem.status !== 'AVAILABLE') {
      alert('This item is not available for checkout')
      return
    }

    const newRecord: CheckInOutRecord = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      userId: selectedUser,
      userName: selectedUser, // In real app, get from user database
      action: 'CHECK_OUT',
      timestamp: new Date().toISOString(),
      location: location || undefined,
      notes: notes || undefined,
      nfcTagId: scanResult || undefined
    }

    setRecords([newRecord, ...records])
    
    // Update item status
    setItems(items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, status: 'CHECKED_OUT', currentAssignee: selectedUser }
        : item
    ))

    // Reset form
    setSelectedItem(null)
    setSelectedUser('')
    setNotes('')
    setLocation('')
    setScanResult(null)

    alert('Item checked out successfully!')
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CHECKED_OUT':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'IN_MAINTENANCE':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'CHECKED_OUT': return 'bg-red-100 text-red-800'
      case 'IN_MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check In / Check Out</h1>
            <p className="text-gray-600">Manage item check-ins and check-outs with time tracking</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Check In/Out Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Check In/Out</h2>

            {/* NFC Scanning */}
            {nfcSupported && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Nfc className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">NFC Quick Scan</span>
                  </div>
                  <button
                    onClick={handleNFCScan}
                    disabled={isScanning}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isScanning ? 'Scanning...' : 'Scan Tag'}
                  </button>
                </div>
                {scanResult && (
                  <div className="text-sm text-blue-700">
                    Scanned NFC Tag: <span className="font-mono">{scanResult}</span>
                  </div>
                )}
              </div>
            )}

            {/* Item Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search & Select Item
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      selectedItem?.id === item.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          SN: {item.serialNumber || 'N/A'}
                          {item.nfcTagId && (
                            <span className="ml-2 inline-flex items-center">
                              <Nfc className="h-3 w-3 text-green-600 mr-1" />
                              NFC
                            </span>
                          )}
                        </div>
                        {item.currentAssignee && (
                          <div className="text-sm text-blue-600">
                            Assigned to: {item.currentAssignee}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User/Operator
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter user name or ID"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCheckIn}
                disabled={!selectedItem || !selectedUser || selectedItem.status !== 'CHECKED_OUT'}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!selectedItem || !selectedUser || selectedItem.status !== 'AVAILABLE'}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Check Out
              </button>
            </div>

            {/* Current Selection Info */}
            {selectedItem && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Selected: {selectedItem.name}</div>
                  <div className="text-gray-600">Status: {selectedItem.status.replace('_', ' ')}</div>
                  {selectedItem.currentAssignee && (
                    <div className="text-gray-600">Current Assignee: {selectedItem.currentAssignee}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {records.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    record.action === 'CHECK_IN' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {record.action === 'CHECK_IN' ? (
                      <LogIn className={`h-4 w-4 ${
                        record.action === 'CHECK_IN' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    ) : (
                      <LogOut className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {record.itemName}
                      </p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.action === 'CHECK_IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.action.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {record.userName}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                      {record.location && (
                        <div className="mt-1 text-gray-500">
                          Location: {record.location}
                        </div>
                      )}
                      {record.notes && (
                        <div className="mt-1 text-gray-500">
                          Notes: {record.notes}
                        </div>
                      )}
                      {record.nfcTagId && (
                        <div className="mt-1 flex items-center text-green-600">
                          <Nfc className="h-3 w-3 mr-1" />
                          <span className="text-xs font-mono">{record.nfcTagId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {records.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500">Check-in and check-out activities will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Full History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Check In/Out History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.itemName}</div>
                            {record.nfcTagId && (
                              <div className="text-xs text-green-600 flex items-center mt-1">
                                <Nfc className="h-3 w-3 mr-1" />
                                {record.nfcTagId}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.action === 'CHECK_IN' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {record.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.location || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}