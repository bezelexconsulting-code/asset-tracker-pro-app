'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, Eye, Plus, DollarSign, Users, CreditCard, TrendingUp, CheckCircle, Clock, AlertTriangle, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsCard } from '@/components/ui/stats-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Client {
  id: string
  name: string
  email: string
  deviceLimit: number
  activeDevices: number
  pricePerDevice: number
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  totalRevenue: number
  lastPayment?: string
}

interface Invoice {
  id: string
  clientId: string
  clientName: string
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

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'clients'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Mock data
  const stats = {
    totalRevenue: 45750.00,
    monthlyRevenue: 12500.00,
    totalClients: 25,
    activeDevices: 485,
    pendingInvoices: 8,
    overdueInvoices: 2
  }

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'TechCorp Solutions',
      email: 'admin@techcorp.com',
      deviceLimit: 50,
      activeDevices: 35,
      pricePerDevice: 25.00,
      status: 'ACTIVE',
      totalRevenue: 8750.00,
      lastPayment: '2024-01-15'
    },
    {
      id: '2',
      name: 'Global Industries',
      email: 'billing@global.com',
      deviceLimit: 100,
      activeDevices: 85,
      pricePerDevice: 22.00,
      status: 'ACTIVE',
      totalRevenue: 18700.00,
      lastPayment: '2024-01-20'
    },
    {
      id: '3',
      name: 'StartupXYZ',
      email: 'finance@startupxyz.com',
      deviceLimit: 20,
      activeDevices: 15,
      pricePerDevice: 30.00,
      status: 'PENDING',
      totalRevenue: 1800.00
    }
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'TechCorp Solutions',
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
      clientId: '2',
      clientName: 'Global Industries',
      invoiceNumber: 'INV-2024-002',
      amount: 1870.00,
      deviceCount: 85,
      pricePerDevice: 22.00,
      billingPeriodStart: '2024-01-01',
      billingPeriodEnd: '2024-01-31',
      status: 'PAID',
      dueDate: '2024-02-15',
      paidAt: '2024-02-12',
      bankTransferReference: 'TXN-20240212-002'
    },
    {
      id: '3',
      clientId: '1',
      clientName: 'TechCorp Solutions',
      invoiceNumber: 'INV-2024-003',
      amount: 900.00,
      deviceCount: 36,
      pricePerDevice: 25.00,
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      status: 'PENDING',
      dueDate: '2024-03-15'
    },
    {
      id: '4',
      clientId: '3',
      clientName: 'StartupXYZ',
      invoiceNumber: 'INV-2024-004',
      amount: 450.00,
      deviceCount: 15,
      pricePerDevice: 30.00,
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      status: 'OVERDUE',
      dueDate: '2024-03-10'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'PENDING':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'OVERDUE':
      case 'SUSPENDED':
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
      case 'SUSPENDED':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Billing Management"
          description="Manage client billing, invoices, and payments"
          icon={DollarSign}
          gradient="blue"
          actions={
            <Button variant="gradient" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            gradient="green"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={TrendingUp}
            gradient="blue"
          />
          <StatsCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            icon={Users}
            gradient="purple"
          />
          <StatsCard
            title="Active Devices"
            value={stats.activeDevices.toString()}
            icon={CreditCard}
            gradient="orange"
          />
          <StatsCard
            title="Pending"
            value={stats.pendingInvoices.toString()}
            icon={Clock}
            gradient="orange"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueInvoices.toString()}
            icon={AlertTriangle}
            gradient="red"
          />
        </div>

        {/* Tabs */}
        <Card className="mb-6">

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Invoices
                </div>
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Clients
                </div>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Invoices */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{invoice.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Clients */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
                  <div className="space-y-3">
                    {clients
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .slice(0, 5)
                      .map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.activeDevices} devices</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${client.totalRevenue.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">${client.pricePerDevice}/device</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Invoice
                </button>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
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
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice.clientName}</div>
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
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
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
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Clients Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Devices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.activeDevices} / {client.deviceLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${client.pricePerDevice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${client.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                            {getStatusIcon(client.status)}
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.lastPayment || 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
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
            </div>
          )}
        </Card>

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
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.clientName}</p>
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