'use client'

import React, { useState } from 'react'
import { Smartphone, DollarSign, CheckCircle, AlertTriangle, CreditCard, Building2, Users, Calendar } from 'lucide-react'

interface DeviceRegistration {
  deviceName: string
  deviceId: string
  deviceType: 'SMARTPHONE' | 'TABLET' | 'LAPTOP' | 'OTHER'
  assignedUser: string
  department: string
}

interface ClientInfo {
  id: string
  name: string
  email: string
  deviceLimit: number
  activeDevices: number
  pricePerDevice: number
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  nextBillingDate: string
}

export default function RegisterDevice() {
  const [step, setStep] = useState<'info' | 'confirmation' | 'success'>('info')
  const [registration, setRegistration] = useState<DeviceRegistration>({
    deviceName: '',
    deviceId: '',
    deviceType: 'SMARTPHONE',
    assignedUser: '',
    department: ''
  })

  // Mock client info - in real app, this would come from authentication
  const clientInfo: ClientInfo = {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    deviceLimit: 50,
    activeDevices: 35,
    pricePerDevice: 25.00,
    status: 'ACTIVE',
    nextBillingDate: '2024-02-15'
  }

  const canAddDevice = clientInfo.activeDevices < clientInfo.deviceLimit && clientInfo.status === 'ACTIVE'
  const monthlyIncrease = clientInfo.pricePerDevice
  const nextBillingAmount = (clientInfo.activeDevices + 1) * clientInfo.pricePerDevice

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAddDevice) return
    setStep('confirmation')
  }

  const confirmRegistration = () => {
    // Here you would make API call to register the device
    console.log('Registering device:', registration)
    setStep('success')
  }

  const resetForm = () => {
    setRegistration({
      deviceName: '',
      deviceId: '',
      deviceType: 'SMARTPHONE',
      assignedUser: '',
      department: ''
    })
    setStep('info')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Device Registered Successfully!</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Registration Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Device:</span> {registration.deviceName}</p>
              <p><span className="font-medium">Device ID:</span> {registration.deviceId}</p>
              <p><span className="font-medium">Type:</span> {registration.deviceType}</p>
              <p><span className="font-medium">Assigned to:</span> {registration.assignedUser}</p>
              <p><span className="font-medium">Department:</span> {registration.department}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Billing Update:</strong> Your monthly bill will increase by ${monthlyIncrease} 
              starting from your next billing cycle on {clientInfo.nextBillingDate}.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Register Another Device
            </button>
            <button
              onClick={() => window.location.href = '/client/billing'}
              className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Go to Billing Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Device Registration</h2>
          
          {/* Device Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Device Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Device Name:</span>
                <p className="font-medium text-gray-900">{registration.deviceName}</p>
              </div>
              <div>
                <span className="text-gray-600">Device ID:</span>
                <p className="font-medium text-gray-900">{registration.deviceId}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium text-gray-900">{registration.deviceType}</p>
              </div>
              <div>
                <span className="text-gray-600">Assigned User:</span>
                <p className="font-medium text-gray-900">{registration.assignedUser}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Department:</span>
                <p className="font-medium text-gray-900">{registration.department}</p>
              </div>
            </div>
          </div>

          {/* Billing Impact */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing Impact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-800">Current monthly bill:</span>
                <span className="font-medium text-yellow-900">
                  ${(clientInfo.activeDevices * clientInfo.pricePerDevice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-800">Monthly increase:</span>
                <span className="font-medium text-yellow-900">+${monthlyIncrease.toFixed(2)}</span>
              </div>
              <div className="border-t border-yellow-300 pt-2 flex justify-between">
                <span className="font-medium text-yellow-900">New monthly bill:</span>
                <span className="font-bold text-yellow-900">${nextBillingAmount.toFixed(2)}</span>
              </div>
              <div className="text-xs text-yellow-700 mt-2">
                * Changes will be reflected in your next billing cycle on {clientInfo.nextBillingDate}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Bank Transfer Details:</strong></p>
              <p>Account Name: Asset Tracker Pro Ltd</p>
              <p>Account Number: 1234567890</p>
              <p>Routing Number: 987654321</p>
              <p className="text-blue-700 mt-3">
                <strong>Note:</strong> Please include your client ID ({clientInfo.id}) in the transfer reference.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('info')}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back to Edit
            </button>
            <button
              onClick={confirmRegistration}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm Registration
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Device</h1>
          <p className="text-gray-600">Add a new device to your account with per-device billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Device Information</h2>

              {!canAddDevice && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Cannot Add Device</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {clientInfo.status !== 'ACTIVE' 
                      ? 'Your account is not active. Please contact support.'
                      : 'You have reached your device limit. Please contact support to increase your limit.'
                    }
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={registration.deviceName}
                    onChange={(e) => setRegistration({...registration, deviceName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., iPhone 15 Pro - John Doe"
                    disabled={!canAddDevice}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={registration.deviceId}
                    onChange={(e) => setRegistration({...registration, deviceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., IPHONE-001"
                    disabled={!canAddDevice}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type *
                  </label>
                  <select
                    required
                    value={registration.deviceType}
                    onChange={(e) => setRegistration({...registration, deviceType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canAddDevice}
                  >
                    <option value="SMARTPHONE">Smartphone</option>
                    <option value="TABLET">Tablet</option>
                    <option value="LAPTOP">Laptop</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned User *
                  </label>
                  <input
                    type="text"
                    required
                    value={registration.assignedUser}
                    onChange={(e) => setRegistration({...registration, assignedUser: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                    disabled={!canAddDevice}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={registration.department}
                    onChange={(e) => setRegistration({...registration, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Sales, Marketing, IT"
                    disabled={!canAddDevice}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canAddDevice}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Register Device
                </button>
              </form>
            </div>
          </div>

          {/* Account Summary */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Account Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Company:</span>
                  <p className="font-medium text-gray-900">{clientInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{clientInfo.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    clientInfo.status === 'ACTIVE' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {clientInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Device Usage */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Device Usage
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Devices Used</span>
                    <span className="font-medium">{clientInfo.activeDevices} / {clientInfo.deviceLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(clientInfo.activeDevices / clientInfo.deviceLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Available slots: {clientInfo.deviceLimit - clientInfo.activeDevices}</p>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per device:</span>
                  <span className="font-medium text-gray-900">${clientInfo.pricePerDevice}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current monthly bill:</span>
                  <span className="font-medium text-gray-900">
                    ${(clientInfo.activeDevices * clientInfo.pricePerDevice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">After adding device:</span>
                  <span className="font-bold text-blue-600">
                    ${((clientInfo.activeDevices + 1) * clientInfo.pricePerDevice).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Next billing: {clientInfo.nextBillingDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h4>
              <p className="text-sm text-blue-800">
                All payments are processed via bank transfer. You will receive an invoice 
                with payment instructions after device registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}