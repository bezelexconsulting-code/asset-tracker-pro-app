'use client'

import { useState, useEffect } from 'react'
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  Filter,
  User,
  Package,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsCard } from '@/components/ui/stats-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'

interface MaintenanceRecord {
  id: string
  itemId: string
  itemName: string
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'INSPECTION'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scheduledDate: string
  completedDate?: string
  assignedTo?: string
  description: string
  notes?: string
  cost?: number
  partsUsed?: string[]
  nextMaintenanceDate?: string
  createdAt: string
  updatedAt: string
}

interface Item {
  id: string
  name: string
  serialNumber?: string
  location?: string
  status: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history' | 'overdue'>('scheduled')

  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'PREVENTIVE' as MaintenanceRecord['type'],
    priority: 'MEDIUM' as MaintenanceRecord['priority'],
    scheduledDate: '',
    assignedTo: '',
    description: '',
    notes: '',
    cost: '',
    partsUsed: '',
    nextMaintenanceDate: ''
  })

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockItems: Item[] = [
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          serialNumber: 'DL001234',
          location: 'Office A - Desk 12',
          status: 'AVAILABLE',
          lastMaintenanceDate: '2024-01-15',
          nextMaintenanceDate: '2024-04-15'
        },
        {
          id: '2',
          name: 'Office Chair',
          serialNumber: 'CH003456',
          location: 'Office A - Workstation 5',
          status: 'IN_MAINTENANCE',
          lastMaintenanceDate: '2023-12-10',
          nextMaintenanceDate: '2024-02-10'
        },
        {
          id: '3',
          name: 'Printer HP LaserJet',
          serialNumber: 'HP004567',
          location: 'Print Room',
          status: 'AVAILABLE',
          lastMaintenanceDate: '2024-01-01',
          nextMaintenanceDate: '2024-03-01'
        }
      ]

      const mockRecords: MaintenanceRecord[] = [
        {
          id: '1',
          itemId: '2',
          itemName: 'Office Chair',
          type: 'CORRECTIVE',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          scheduledDate: '2024-01-20T09:00:00Z',
          assignedTo: 'John Smith',
          description: 'Replace broken wheel and adjust height mechanism',
          notes: 'Customer reported squeaking noise and unstable height',
          cost: 45.99,
          partsUsed: ['Wheel assembly', 'Height adjustment cylinder'],
          createdAt: '2024-01-18T10:00:00Z',
          updatedAt: '2024-01-20T09:30:00Z'
        },
        {
          id: '2',
          itemId: '1',
          itemName: 'Laptop Dell XPS 13',
          type: 'PREVENTIVE',
          status: 'SCHEDULED',
          priority: 'MEDIUM',
          scheduledDate: '2024-02-15T14:00:00Z',
          assignedTo: 'Jane Doe',
          description: 'Quarterly maintenance: clean fans, update software, check battery',
          nextMaintenanceDate: '2024-05-15',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: '3',
          itemId: '3',
          itemName: 'Printer HP LaserJet',
          type: 'PREVENTIVE',
          status: 'OVERDUE',
          priority: 'MEDIUM',
          scheduledDate: '2024-01-15T10:00:00Z',
          assignedTo: 'Mike Johnson',
          description: 'Replace toner cartridge and clean print heads',
          createdAt: '2024-01-10T12:00:00Z',
          updatedAt: '2024-01-10T12:00:00Z'
        },
        {
          id: '4',
          itemId: '1',
          itemName: 'Laptop Dell XPS 13',
          type: 'INSPECTION',
          status: 'COMPLETED',
          priority: 'LOW',
          scheduledDate: '2024-01-10T11:00:00Z',
          completedDate: '2024-01-10T11:30:00Z',
          assignedTo: 'Jane Doe',
          description: 'Monthly inspection of hardware components',
          notes: 'All components functioning normally. No issues found.',
          createdAt: '2024-01-08T09:00:00Z',
          updatedAt: '2024-01-10T11:30:00Z'
        }
      ]

      setItems(mockItems)
      setRecords(mockRecords)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === '' || record.type === selectedType
    const matchesStatus = selectedStatus === '' || record.status === selectedStatus
    const matchesPriority = selectedPriority === '' || record.priority === selectedPriority

    // Filter by tab
    let matchesTab = true
    if (activeTab === 'scheduled') {
      matchesTab = record.status === 'SCHEDULED' || record.status === 'IN_PROGRESS'
    } else if (activeTab === 'overdue') {
      matchesTab = record.status === 'OVERDUE'
    } else if (activeTab === 'history') {
      matchesTab = record.status === 'COMPLETED' || record.status === 'CANCELLED'
    }

    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return <Calendar className="h-4 w-4" />
      case 'CORRECTIVE': return <Wrench className="h-4 w-4" />
      case 'EMERGENCY': return <AlertTriangle className="h-4 w-4" />
      case 'INSPECTION': return <Eye className="h-4 w-4" />
      default: return <Wrench className="h-4 w-4" />
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.itemId || !formData.description || !formData.scheduledDate) {
      alert('Please fill in all required fields')
      return
    }

    const selectedItem = items.find(item => item.id === formData.itemId)
    if (!selectedItem) {
      alert('Selected item not found')
      return
    }

    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      itemId: formData.itemId,
      itemName: selectedItem.name,
      type: formData.type,
      status: 'SCHEDULED',
      priority: formData.priority,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      assignedTo: formData.assignedTo || undefined,
      description: formData.description,
      notes: formData.notes || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      partsUsed: formData.partsUsed ? formData.partsUsed.split(',').map(p => p.trim()) : undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRecords([newRecord, ...records])
    setShowAddModal(false)
    resetForm()
    alert('Maintenance record created successfully!')
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      scheduledDate: '',
      assignedTo: '',
      description: '',
      notes: '',
      cost: '',
      partsUsed: '',
      nextMaintenanceDate: ''
    })
  }

  const handleStatusUpdate = (recordId: string, newStatus: MaintenanceRecord['status']) => {
    setRecords(records.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            status: newStatus,
            completedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : record.completedDate,
            updatedAt: new Date().toISOString()
          }
        : record
    ))
  }

  const handleDelete = (recordId: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      setRecords(records.filter(record => record.id !== recordId))
    }
  }

  const getTabCounts = () => {
    return {
      scheduled: records.filter(r => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS').length,
      overdue: records.filter(r => r.status === 'OVERDUE').length,
      history: records.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED').length
    }
  }

  const tabCounts = getTabCounts()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="h-64" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Maintenance Management"
          description="Schedule, track, and manage maintenance activities"
          icon={Wrench}
          gradient="orange"
          actions={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Scheduled"
            value={tabCounts.scheduled}
            icon={Calendar}
            gradient="blue"
          />
          
          <StatsCard
            title="Overdue"
            value={tabCounts.overdue}
            icon={AlertTriangle}
            gradient="red"
          />
          
          <StatsCard
            title="Completed"
            value={records.filter(r => r.status === 'COMPLETED').length}
            icon={CheckCircle}
            gradient="green"
          />
          
          <StatsCard
            title="In Progress"
            value={records.filter(r => r.status === 'IN_PROGRESS').length}
            icon={Wrench}
            gradient="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                Scheduled ({tabCounts.scheduled})
              </button>
              <button
                onClick={() => setActiveTab('overdue')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'overdue'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overdue ({tabCounts.overdue})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History ({tabCounts.history})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search maintenance records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="min-w-40">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="INSPECTION">Inspection</option>
                </select>
              </div>
              
              <div className="min-w-40">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('')
                  setSelectedStatus('')
                  setSelectedPriority('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item & Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(record.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{record.itemName}</div>
                          <div className="text-sm text-gray-500">{record.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {record.assignedTo || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(record.priority)}`}>
                        {record.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowDetailsModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {record.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStatusUpdate(record.id, 'IN_PROGRESS')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Start Work"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
                        )}
                        {record.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(record.id, 'COMPLETED')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id)}
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
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
              <p className="text-gray-500">Try adjusting your filters or schedule new maintenance.</p>
            </div>
          )}
        </div>

        {/* Add Maintenance Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Schedule Maintenance</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item *
                      </label>
                      <select
                        value={formData.itemId}
                        onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select an item</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.serialNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as MaintenanceRecord['type']})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PREVENTIVE">Preventive</option>
                        <option value="CORRECTIVE">Corrective</option>
                        <option value="EMERGENCY">Emergency</option>
                        <option value="INSPECTION">Inspection</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as MaintenanceRecord['priority']})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <input
                        type="text"
                        placeholder="Enter technician name"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Describe the maintenance work to be performed"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parts/Materials Needed
                    </label>
                    <input
                      type="text"
                      placeholder="Enter parts separated by commas"
                      value={formData.partsUsed}
                      onChange={(e) => setFormData({...formData, partsUsed: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Maintenance Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextMaintenanceDate}
                      onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Any additional notes or instructions"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        resetForm()
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Schedule Maintenance
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Maintenance Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                    <p className="text-sm text-gray-900">{selectedRecord.itemName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="flex items-center">
                      {getTypeIcon(selectedRecord.type)}
                      <span className="ml-2 text-sm text-gray-900">{selectedRecord.type}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRecord.priority)}`}>
                      {selectedRecord.priority}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                      {selectedRecord.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedRecord.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                  
                  {selectedRecord.completedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedRecord.completedDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <p className="text-sm text-gray-900">{selectedRecord.assignedTo || 'Unassigned'}</p>
                  </div>
                  
                  {selectedRecord.cost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                      <p className="text-sm text-gray-900">${selectedRecord.cost.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900">{selectedRecord.description}</p>
                  </div>
                  
                  {selectedRecord.partsUsed && selectedRecord.partsUsed.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecord.partsUsed.map((part, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-sm text-gray-900">{selectedRecord.notes}</p>
                    </div>
                  )}
                  
                  {selectedRecord.nextMaintenanceDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedRecord.nextMaintenanceDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
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