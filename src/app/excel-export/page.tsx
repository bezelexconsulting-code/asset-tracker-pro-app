'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, Calendar, Filter, Users, Package, Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ExportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fields: string[]
  lastExported?: string
  recordCount: number
}

interface ExportHistory {
  id: string
  templateName: string
  fileName: string
  exportDate: string
  recordCount: number
  fileSize: string
  status: 'completed' | 'failed' | 'processing'
}

export default function ExcelExport() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: '',
    assignedTo: ''
  })
  const [isExporting, setIsExporting] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const exportTemplates: ExportTemplate[] = [
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Complete inventory list with details, status, and location',
      icon: <Package className="h-6 w-6" />,
      fields: ['Item ID', 'Name', 'Category', 'Status', 'Location', 'Purchase Date', 'Value', 'Condition'],
      lastExported: '2024-01-15',
      recordCount: 1247
    },
    {
      id: 'checkinout',
      name: 'Check-in/Check-out Log',
      description: 'Activity log of all check-in and check-out transactions',
      icon: <Clock className="h-6 w-6" />,
      fields: ['Transaction ID', 'Item', 'User', 'Action', 'Date/Time', 'Location', 'Notes'],
      lastExported: '2024-01-14',
      recordCount: 892
    },
    {
      id: 'maintenance',
      name: 'Maintenance Records',
      description: 'Maintenance history and scheduled maintenance tasks',
      icon: <Wrench className="h-6 w-6" />,
      fields: ['Record ID', 'Item', 'Type', 'Date', 'Technician', 'Status', 'Cost', 'Next Due'],
      lastExported: '2024-01-13',
      recordCount: 156
    },
    {
      id: 'assignments',
      name: 'Asset Assignments',
      description: 'Current and historical asset assignments to users',
      icon: <Users className="h-6 w-6" />,
      fields: ['Assignment ID', 'Item', 'Assigned To', 'Start Date', 'End Date', 'Status', 'Department'],
      lastExported: '2024-01-12',
      recordCount: 634
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and statistics',
      icon: <FileSpreadsheet className="h-6 w-6" />,
      fields: ['Category', 'Total Items', 'Available', 'In Use', 'Maintenance', 'Total Value'],
      recordCount: 12
    }
  ]

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      templateName: 'Inventory Report',
      fileName: 'inventory_report_2024-01-15.xlsx',
      exportDate: '2024-01-15 14:30',
      recordCount: 1247,
      fileSize: '2.3 MB',
      status: 'completed'
    },
    {
      id: '2',
      templateName: 'Check-in/Check-out Log',
      fileName: 'checkinout_log_2024-01-14.xlsx',
      exportDate: '2024-01-14 09:15',
      recordCount: 892,
      fileSize: '1.8 MB',
      status: 'completed'
    },
    {
      id: '3',
      templateName: 'Maintenance Records',
      fileName: 'maintenance_records_2024-01-13.xlsx',
      exportDate: '2024-01-13 16:45',
      recordCount: 156,
      fileSize: '456 KB',
      status: 'failed'
    }
  ]

  const handleExport = async () => {
    if (!selectedTemplate) return
    
    setIsExporting(true)
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // In a real app, this would trigger the actual export
      alert('Export completed! File will be downloaded shortly.')
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'processing':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel Export</h1>
          <p className="text-gray-600">Generate and download Excel reports for your inventory data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h2>
              
              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Report Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-1">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {template.recordCount.toLocaleString()} records
                            </span>
                            {template.lastExported && (
                              <span className="text-xs text-gray-500">
                                Last: {template.lastExported}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </button>
                
                {showAdvancedFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="tools">Tools</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Location</label>
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Locations</option>
                        <option value="warehouse-a">Warehouse A</option>
                        <option value="warehouse-b">Warehouse B</option>
                        <option value="office-main">Main Office</option>
                        <option value="office-branch">Branch Office</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Assigned To</label>
                      <select
                        value={filters.assignedTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Users</option>
                        <option value="john-doe">John Doe</option>
                        <option value="jane-smith">Jane Smith</option>
                        <option value="mike-johnson">Mike Johnson</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  disabled={!selectedTemplate || isExporting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export to Excel
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Field Preview */}
            {selectedTemplate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Fields Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {exportTemplates.find(t => t.id === selectedTemplate)?.fields.map((field, index) => (
                    <div key={index} className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export History</h3>
              
              <div className="space-y-4">
                {exportHistory.map((export_) => (
                  <div key={export_.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{export_.templateName}</h4>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(export_.status)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{export_.fileName}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{export_.exportDate}</span>
                      <span>{export_.fileSize}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {export_.recordCount.toLocaleString()} records
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(export_.status)}`}>
                        {export_.status}
                      </span>
                    </div>
                    
                    {export_.status === 'completed' && (
                      <button className="w-full mt-3 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1">
                        <Download className="h-3 w-3" />
                        Download Again
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                  View All History
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Exports This Month</span>
                  <span className="font-medium text-gray-900">24</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Popular Template</span>
                  <span className="font-medium text-gray-900">Inventory Report</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Data Exported</span>
                  <span className="font-medium text-gray-900">45.2 MB</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">96.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}