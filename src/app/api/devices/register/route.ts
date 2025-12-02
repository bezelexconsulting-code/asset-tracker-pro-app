import { NextRequest, NextResponse } from 'next/server'

interface DeviceRegistrationData {
  clientId: string
  deviceName: string
  deviceId: string
  deviceType: 'SMARTPHONE' | 'TABLET' | 'LAPTOP' | 'OTHER'
  assignedUser: string
  department: string
}

interface Device {
  id: string
  clientId: string
  deviceName: string
  deviceId: string
  deviceType: 'SMARTPHONE' | 'TABLET' | 'LAPTOP' | 'OTHER'
  assignedUser: string
  department: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  registeredAt: string
  activatedAt?: string
  lastActiveAt?: string
}

interface Client {
  id: string
  name: string
  email: string
  deviceLimit: number
  activeDevices: number
  pricePerDevice: number
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
}

// Mock database - in real app, this would be replaced with actual database operations
let devices: Device[] = [
  {
    id: '1',
    clientId: '1',
    deviceName: 'iPhone 15 Pro - John Doe',
    deviceId: 'IPHONE-001',
    deviceType: 'SMARTPHONE',
    assignedUser: 'John Doe',
    department: 'Sales',
    status: 'ACTIVE',
    registeredAt: '2024-01-01T00:00:00Z',
    activatedAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-01-20T15:30:00Z'
  }
]

let clients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    deviceLimit: 50,
    activeDevices: 35,
    pricePerDevice: 25.00,
    status: 'ACTIVE'
  }
]

export async function POST(request: NextRequest) {
  try {
    const body: DeviceRegistrationData = await request.json()
    
    // Validate required fields
    if (!body.clientId || !body.deviceName || !body.deviceId || 
        !body.deviceType || !body.assignedUser || !body.department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find client
    const client = clients.find(c => c.id === body.clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if client is active
    if (client.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Client account is not active' },
        { status: 400 }
      )
    }

    // Check device limit
    if (client.activeDevices >= client.deviceLimit) {
      return NextResponse.json(
        { error: 'Device limit reached. Please contact support to increase your limit.' },
        { status: 400 }
      )
    }

    // Check if device ID already exists for this client
    const existingDevice = devices.find(d => d.deviceId === body.deviceId && d.clientId === body.clientId)
    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device ID already exists for this client' },
        { status: 400 }
      )
    }

    // Create new device
    const newDevice: Device = {
      id: (devices.length + 1).toString(),
      clientId: body.clientId,
      deviceName: body.deviceName,
      deviceId: body.deviceId,
      deviceType: body.deviceType,
      assignedUser: body.assignedUser,
      department: body.department,
      status: 'PENDING',
      registeredAt: new Date().toISOString()
    }

    // Add to mock database
    devices.push(newDevice)

    // Update client's active device count
    const clientIndex = clients.findIndex(c => c.id === body.clientId)
    if (clientIndex !== -1) {
      clients[clientIndex].activeDevices += 1
    }

    // Calculate billing impact
    const monthlyIncrease = client.pricePerDevice
    const newMonthlyBill = client.activeDevices * client.pricePerDevice

    return NextResponse.json({
      success: true,
      device: newDevice,
      billingImpact: {
        monthlyIncrease,
        newMonthlyBill,
        pricePerDevice: client.pricePerDevice
      },
      message: 'Device registered successfully'
    })

  } catch (error) {
    console.error('Error registering device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    let filteredDevices = devices

    // Filter by client ID if provided
    if (clientId) {
      filteredDevices = filteredDevices.filter(device => device.clientId === clientId)
    }

    // Filter by status if provided
    if (status) {
      filteredDevices = filteredDevices.filter(device => device.status === status)
    }

    return NextResponse.json({
      success: true,
      devices: filteredDevices,
      total: filteredDevices.length
    })

  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, status, activatedAt } = body
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Find and update device
    const deviceIndex = devices.findIndex(device => device.id === deviceId)
    if (deviceIndex === -1) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Update device status
    if (status) {
      devices[deviceIndex].status = status
    }

    if (activatedAt && status === 'ACTIVE') {
      devices[deviceIndex].activatedAt = activatedAt
      devices[deviceIndex].lastActiveAt = activatedAt
    }

    return NextResponse.json({
      success: true,
      device: devices[deviceIndex],
      message: 'Device updated successfully'
    })

  } catch (error) {
    console.error('Error updating device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const clientId = searchParams.get('clientId')
    
    if (!deviceId || !clientId) {
      return NextResponse.json(
        { error: 'Device ID and Client ID are required' },
        { status: 400 }
      )
    }

    // Find device
    const deviceIndex = devices.findIndex(device => device.id === deviceId && device.clientId === clientId)
    if (deviceIndex === -1) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Remove device
    const removedDevice = devices.splice(deviceIndex, 1)[0]

    // Update client's active device count
    const clientIndex = clients.findIndex(c => c.id === clientId)
    if (clientIndex !== -1 && removedDevice.status === 'ACTIVE') {
      clients[clientIndex].activeDevices -= 1
    }

    return NextResponse.json({
      success: true,
      message: 'Device removed successfully',
      device: removedDevice
    })

  } catch (error) {
    console.error('Error removing device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}