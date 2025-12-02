'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsCard } from '@/components/ui/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Users, Plus, Search, Filter, Calendar, MapPin, Package, User, Clock, CheckCircle, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react'

interface Assignment {
  id: string
  itemId: string
  itemName: string
  itemCategory: string
  assignedTo: string
  assignedToName: string
  assignedBy: string
  assignedByName: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'overdue' | 'pending'
  location: string
  department: string
  notes?: string
  returnDate?: string
}

interface User {
  id: string
  name: string
  email: string
  department: string
  role: string
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      itemId: 'ITEM001',
      itemName: 'Dell Laptop XPS 13',
      itemCategory: 'Electronics',
      assignedTo: 'user1',
      assignedToName: 'John Doe',
      assignedBy: 'admin1',
      assignedByName: 'Admin User',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      status: 'active',
      location: 'Office Floor 2',
      department: 'IT',
      notes: 'For software development project'
    },
    {
      id: '2',
      itemId: 'ITEM002',
      itemName: 'Office Chair Ergonomic',
      itemCategory: 'Furniture',
      assignedTo: 'user2',
      assignedToName: 'Jane Smith',
      assignedBy: 'admin1',
      assignedByName: 'Admin User',
      startDate: '2024-01-05',
      status: 'active',
      location: 'Office Floor 1',
      department: 'HR',
      notes: 'Permanent assignment'
    },
    {
      id: '3',
      itemId: 'ITEM003',
      itemName: 'iPad Pro 12.9"',
      itemCategory: 'Electronics',
      assignedTo: 'user3',
      assignedToName: 'Mike Johnson',
      assignedBy: 'admin1',
      assignedByName: 'Admin User',
      startDate: '2023-12-15',
      endDate: '2024-01-15',
      status: 'overdue',
      location: 'Office Floor 3',
      department: 'Marketing',
      notes: 'For presentation purposes'
    }
  ])

  const [users] = useState<User[]>([
    { id: 'user1', name: 'John Doe', email: 'john@company.com', department: 'IT', role: 'Developer' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@company.com', department: 'HR', role: 'Manager' },
    { id: 'user3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Marketing', role: 'Specialist' },
    { id: 'user4', name: 'Sarah Wilson', email: 'sarah@company.com', department: 'Finance', role: 'Analyst' }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  const [newAssignment, setNewAssignment] = useState({
    itemId: '',
    itemName: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    location: '',
    department: '',
    notes: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100'
      case 'completed':
        return 'text-blue-700 bg-blue-100'
      case 'overdue':
        return 'text-red-700 bg-red-100'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.itemId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter
    const matchesDepartment = !departmentFilter || assignment.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleCreateAssignment = () => {
    const assignment: Assignment = {
      id: Date.now().toString(),
      itemId: newAssignment.itemId,
      itemName: newAssignment.itemName,
      itemCategory: 'Electronics', // This would come from item lookup
      assignedTo: newAssignment.assignedTo,
      assignedToName: users.find(u => u.id === newAssignment.assignedTo)?.name || '',
      assignedBy: 'admin1',
      assignedByName: 'Admin User',
      startDate: newAssignment.startDate,
      endDate: newAssignment.endDate || undefined,
      status: 'active',
      location: newAssignment.location,
      department: newAssignment.department,
      notes: newAssignment.notes
    }
    
    setAssignments(prev => [...prev, assignment])
    setShowCreateModal(false)
    setNewAssignment({
      itemId: '',
      itemName: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      location: '',
      department: '',
      notes: ''
    })
  }

  const handleReturnItem = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: 'completed', returnDate: new Date().toISOString().split('T')[0] }
        : assignment
    ))
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId))
  }

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    completed: assignments.filter(a => a.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Asset Assignments"
          description="Manage asset assignments to operators and personnel"
          icon={Users}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Assignments"
            value={stats.total}
            icon={Package}
            color="blue"
          />
          
          <StatsCard
            title="Active"
            value={stats.active}
            icon={CheckCircle}
            color="green"
          />
          
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="red"
          />
          
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="pending">Pending</option>
                </select>
                
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Assignment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.itemName}</div>
                        <div className="text-sm text-gray-500">{assignment.itemId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.assignedToName}</div>
                          <div className="text-sm text-gray-500">{assignment.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{assignment.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.startDate}
                        {assignment.endDate && (
                          <span className="text-gray-500"> → {assignment.endDate}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className={`${getStatusColor(assignment.status)} flex items-center gap-1`}>
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setShowDetailsModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {assignment.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnItem(assignment.id)}
                            className="text-green-600 hover:text-green-900 border-green-300"
                          >
                            Return
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Assignment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                  <input
                    type="text"
                    value={newAssignment.itemId}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, itemId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newAssignment.itemName}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, itemName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={newAssignment.assignedTo}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} - {user.department}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newAssignment.startDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={newAssignment.endDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newAssignment.location}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={newAssignment.department}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newAssignment.notes}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter any notes"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Details Modal */}
        {showDetailsModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Item Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedAssignment.itemId}</div>
                    <div><span className="font-medium">Name:</span> {selectedAssignment.itemName}</div>
                    <div><span className="font-medium">Category:</span> {selectedAssignment.itemCategory}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Assignment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Assigned To:</span> {selectedAssignment.assignedToName}</div>
                    <div><span className="font-medium">Department:</span> {selectedAssignment.department}</div>
                    <div><span className="font-medium">Location:</span> {selectedAssignment.location}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Start Date:</span> {selectedAssignment.startDate}</div>
                    {selectedAssignment.endDate && (
                      <div><span className="font-medium">End Date:</span> {selectedAssignment.endDate}</div>
                    )}
                    {selectedAssignment.returnDate && (
                      <div><span className="font-medium">Return Date:</span> {selectedAssignment.returnDate}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status & Management</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                        {getStatusIcon(selectedAssignment.status)}
                        {selectedAssignment.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Assigned By:</span> {selectedAssignment.assignedByName}</div>
                  </div>
                </div>
              </div>
              
              {selectedAssignment.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedAssignment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}