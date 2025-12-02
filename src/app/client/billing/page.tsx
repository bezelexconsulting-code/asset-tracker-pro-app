'use client'

import React, { useState } from 'react'
import { Plus, Smartphone, DollarSign, Calendar, Download, Eye, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'

interface Device {
  id: string
  name: string
  deviceId: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  addedAt: string
  activatedAt?: string
  lastActiveAt?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  deviceCount: number
  pricePerDevice: number
  billingPeriodStart: string
  billingPeriodEnd: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: string
  paidAt?: string
  bankTransferReference?: string
}

export default function ClientBilling() {
  const [activeTab, setActiveTab] = useState<'devices' | 'billing'>('devices')
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [newDevice, setNewDevice] = useState({
    name: '',
    deviceId: ''
  })

  // Mock client data
  const clientInfo = {
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    deviceLimit: 50,
    activeDevices: 35,
    pricePerDevice: 25.00,
    nextBillingDate: '2024-02-15'
  }

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro - John Doe',
      deviceId: 'IPHONE-001',
      status: 'ACTIVE',
      addedAt: '2024-01-01',
      activatedAt: '2024-01-01',
      lastActiveAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 - Jane Smith',
      deviceId: 'SAMSUNG-002',
      status: 'ACTIVE',
      addedAt: '2024-01-05',
      activatedAt: '2024-01-05',
      lastActiveAt: '2024-01-19'
    },
    {
      id: '3',
      name: 'iPad Pro - Marketing Team',
      deviceId: 'IPAD-003',
      status: 'PENDING',
      addedAt: '2024-01-20'
    }
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      amount: 875.00,
      deviceCount: 35,
      pricePerDevice: 25.00,
      billingPeriodStart: '2024-01-01',
      billingPeriodEnd: '2024-01-31',
      status: 'PAID',
      dueDate: '2024-02-15',
      paidAt: '2024-02-10',
      bankTransferReference: 'TXN-20240210-001'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      amount: 900.00,
      deviceCount: 36,
      pricePerDevice: 25.00,
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      status: 'PENDING',
      dueDate: '2024-03-15'
    }
  ])

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'PENDING':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'OVERDUE':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleAddDevice = () => {
    if (devices.length >= clientInfo.deviceLimit) {
      alert('Device limit reached. Please contact support to increase your limit.')
      return
    }

    const device: Device = {
      id: Date.now().toString(),
      ...newDevice,
      status: 'PENDING',
      addedAt: new Date().toISOString().split('T')[0]
    }
    setDevices([...devices, device])
    setNewDevice({ name: '', deviceId: '' })
    setShowAddDeviceModal(false)
  }

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm('Are you sure you want to remove this device? This will stop billing for this device.')) {
      setDevices(devices.filter(d => d.id !== deviceId))
    }
  }

  const monthlyBill = devices.filter(d => d.status === 'ACTIVE').length * clientInfo.pricePerDevice

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Dashboard</h1>
          <p className="text-gray-600">Manage your devices and view billing information</p>
        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{clientInfo.activeDevices}</div>
              <div className="text-sm text-gray-600">Active Devices</div>
              <div className="text-xs text-gray-500">of {clientInfo.deviceLimit} limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${clientInfo.pricePerDevice}</div>
              <div className="text-sm text-gray-600">Per Device/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${monthlyBill}</div>
              <div className="text-sm text-gray-600">Current Monthly Bill</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{clientInfo.nextBillingDate}</div>
              <div className="text-sm text-gray-600">Next Billing Date</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('devices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'devices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Device Management
                </div>
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'billing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing & Invoices
                </div>
              </button>
            </nav>
          </div>

          {/* Device Management Tab */}
          {activeTab === 'devices' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Devices</h3>
                <button
                  onClick={() => setShowAddDeviceModal(true)}
                  disabled={devices.length >= clientInfo.deviceLimit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Device
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{device.name}</div>
                            <div className="text-sm text-gray-500">{device.deviceId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getDeviceStatusColor(device.status)}`}>
                            {getStatusIcon(device.status)}
                            {device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {device.addedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {device.lastActiveAt || 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveDevice(device.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Invoice History</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Devices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.billingPeriodStart} to {invoice.billingPeriodEnd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.deviceCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setShowInvoiceModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Instructions */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Instructions
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Bank Transfer Details:</strong></p>
                  <p>Account Name: Asset Tracker Pro Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Routing Number: 987654321</p>
                  <p>Reference: Please include your invoice number in the transfer reference</p>
                  <p className="mt-3 text-blue-700">
                    <strong>Note:</strong> Payments are processed within 1-2 business days. 
                    Please email us the transfer confirmation with your invoice number.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Device Modal */}
        {showAddDeviceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Device</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., iPhone 15 Pro - John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                  <input
                    type="text"
                    value={newDevice.deviceId}
                    onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., IPHONE-001"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Adding this device will increase your monthly bill by ${clientInfo.pricePerDevice}.
                    The device will be in "Pending" status until activated.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddDeviceModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDevice}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Device
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Billing Period</label>
                  <p className="text-sm text-gray-900">
                    {selectedInvoice.billingPeriodStart} to {selectedInvoice.billingPeriodEnd}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Count</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.deviceCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Device</label>
                    <p className="text-sm text-gray-900">${selectedInvoice.pricePerDevice}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-lg font-bold text-gray-900">${selectedInvoice.amount.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.dueDate}</p>
                </div>

                {selectedInvoice.paidAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid Date</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.paidAt}</p>
                  </div>
                )}

                {selectedInvoice.bankTransferReference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Transfer Reference</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.bankTransferReference}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowInvoiceModal(false)
                    setSelectedInvoice(null)
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}