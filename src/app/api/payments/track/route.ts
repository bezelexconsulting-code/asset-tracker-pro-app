import { NextRequest, NextResponse } from 'next/server'

interface PaymentData {
  invoiceId: string
  bankTransferReference: string
  paidAmount: number
  paidAt: string
  notes?: string
}

interface Payment {
  id: string
  invoiceId: string
  bankTransferReference: string
  paidAmount: number
  paidAt: string
  notes?: string
  createdAt: string
  verifiedBy?: string
  verifiedAt?: string
}

// Mock database - in real app, this would be replaced with actual database operations
let payments: Payment[] = [
  {
    id: '1',
    invoiceId: '1',
    bankTransferReference: 'TXN-20240210-001',
    paidAmount: 875.00,
    paidAt: '2024-02-10T10:30:00Z',
    createdAt: '2024-02-10T10:35:00Z',
    verifiedBy: 'admin@company.com',
    verifiedAt: '2024-02-10T11:00:00Z',
    notes: 'Payment verified via bank statement'
  }
]

export async function POST(request: NextRequest) {
  try {
    const body: PaymentData = await request.json()
    
    // Validate required fields
    if (!body.invoiceId || !body.bankTransferReference || !body.paidAmount || !body.paidAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if payment already exists for this invoice
    const existingPayment = payments.find(payment => payment.invoiceId === body.invoiceId)
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already recorded for this invoice' },
        { status: 400 }
      )
    }

    // Create new payment record
    const newPayment: Payment = {
      id: (payments.length + 1).toString(),
      invoiceId: body.invoiceId,
      bankTransferReference: body.bankTransferReference,
      paidAmount: body.paidAmount,
      paidAt: body.paidAt,
      notes: body.notes,
      createdAt: new Date().toISOString()
    }

    // Add to mock database
    payments.push(newPayment)

    // In a real app, you would also update the invoice status to 'PAID'
    // and set the paidAt and bankTransferReference fields

    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Payment recorded successfully'
    })

  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const clientId = searchParams.get('clientId')

    let filteredPayments = payments

    // Filter by invoice ID if provided
    if (invoiceId) {
      filteredPayments = filteredPayments.filter(payment => payment.invoiceId === invoiceId)
    }

    // In a real app, you would join with invoices table to filter by clientId
    // For now, we'll just return all payments if clientId is provided

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      total: filteredPayments.length
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, verifiedBy, notes } = body
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Find and update payment
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId)
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment verification
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      notes: notes || payments[paymentIndex].notes
    }

    return NextResponse.json({
      success: true,
      payment: payments[paymentIndex],
      message: 'Payment verification updated successfully'
    })

  } catch (error) {
    console.error('Error updating payment verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}