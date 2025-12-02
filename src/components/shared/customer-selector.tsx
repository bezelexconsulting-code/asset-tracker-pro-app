'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2 } from 'lucide-react'

interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  status: string
}

interface CustomerSelectorProps {
  onCustomerChange: (customerId: string) => void
  selectedCustomer?: string
}

export default function CustomerSelector({ onCustomerChange, selectedCustomer }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Select 
        value={selectedCustomer} 
        onValueChange={onCustomerChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-left shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-gray-500" />
            <SelectValue placeholder={isLoading ? "Loading customers..." : "SELECT CUSTOMER"} />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <SelectItem value="all" className="py-3 px-4 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-medium">All Customers</span>
            </div>
          </SelectItem>
          {customers.map((customer) => (
            <SelectItem 
              key={customer.id} 
              value={customer.id}
              className="py-3 px-4 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-gray-900">{customer.companyName}</span>
                <span className="text-sm text-gray-500">{customer.contactName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}