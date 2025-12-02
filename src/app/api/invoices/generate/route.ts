import { NextRequest, NextResponse } from 'next/server'

interface InvoiceData {
  clientId: string
  billingPeriodStart: string
  billingPeriodEnd: string
  deviceCount: number
  pricePerDevice: number
  dueDate: string
}

interface Invoice {
  id: string
  clientId: string
  invoiceNumber: string
  amount: number
  deviceCount: number
  pricePerDevice: number
  billingPeriodStart: string
  billingPeriodEnd: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: string
  createdAt: string
  paidAt?: string
  bankTransferReference?: string
}

// Mock database - in real app, this would be replaced with actual database operations
let invoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    invoiceNumber: 'INV-2024-001',
    amount: 875.00,
    deviceCount: 35,
    pricePerDevice: 25.00,
    billingPeriodStart: '2024-01-01',
    billingPeriodEnd: '2024-01-31',
    status: 'PAID',
    dueDate: '2024-02-15',
    createdAt: '2024-01-31T23:59:59Z',
    paidAt: '2024-02-10T10:30:00Z',
    bankTransferReference: 'TXN-20240210-001'
  }
]

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const nextNumber = invoices.length + 1
  return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceData = await request.json()
    
    // Validate required fields
    if (!body.clientId || !body.billingPeriodStart || !body.billingPeriodEnd || 
        !body.deviceCount || !body.pricePerDevice || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate amount
    const amount = body.deviceCount * body.pricePerDevice

    // Create new invoice
    const newInvoice: Invoice = {
      id: (invoices.length + 1).toString(),
      clientId: body.clientId,
      invoiceNumber: generateInvoiceNumber(),
      amount,
      deviceCount: body.deviceCount,
      pricePerDevice: body.pricePerDevice,
      billingPeriodStart: body.billingPeriodStart,
      billingPeriodEnd: body.billingPeriodEnd,
      status: 'PENDING',
      dueDate: body.dueDate,
      createdAt: new Date().toISOString()
    }

    // Add to mock database
    invoices.push(newInvoice)

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: 'Invoice generated successfully'
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
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

    let filteredInvoices = invoices

    // Filter by client ID if provided
    if (clientId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.clientId === clientId)
    }

    // Filter by status if provided
    if (status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status)
    }

    return NextResponse.json({
      success: true,
      invoices: filteredInvoices,
      total: filteredInvoices.length
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}