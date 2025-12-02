"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'

interface SubClient { id: string; name: string; email?: string }
interface Item { id: string; name: string; serialNumber?: string; category?: string; location?: string }

export default function TechAssetsPage() {
  const [subclients, setSubclients] = useState<SubClient[]>([])
  const [selectedSubClient, setSelectedSubClient] = useState<string>('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', serialNumber: '', category: '', location: '' })
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadSubclients = async () => {
      const res = await fetch('/api/subclients')
      const json = await res.json()
      if (json?.data) setSubclients(json.data)
    }
    loadSubclients()
  }, [])

  const loadItems = async (subClientId?: string) => {
    setLoading(true)
    const url = new URL('/api/items', location.origin)
    if (subClientId) url.searchParams.set('subClientId', subClientId)
    const res = await fetch(url.toString())
    const json = await res.json()
    setItems(Array.isArray(json) ? json : [])
    setLoading(false)
  }

  useEffect(() => {
    loadItems(selectedSubClient || undefined)
  }, [selectedSubClient])

  const createItem = async () => {
    setCreating(true)
    setMessage('')
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subClientId: selectedSubClient })
    })
    const json = await res.json()
    if (res.ok) {
      setForm({ name: '', serialNumber: '', category: '', location: '' })
      setMessage('Asset created')
      loadItems(selectedSubClient || undefined)
    } else {
      setMessage(json?.error || 'Failed to create asset')
    }
    setCreating(false)
  }

  return (
    <main className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Technician Assets</h1>
      <div className="mb-4 flex gap-3 items-center">
        <select className="border rounded p-2" value={selectedSubClient} onChange={e=>setSelectedSubClient(e.target.value)}>
          <option value="">All Subclients</option>
          {subclients.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>loadItems(selectedSubClient || undefined)}>Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Assets</h2>
          {loading ? <p>Loading...</p> : (
            <ul className="divide-y">
              {items.map(it => (
                <li key={it.id} className="py-2 flex justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-600">Serial: {it.serialNumber || '-'}</div>
                    <div className="text-sm text-gray-600">Category: {it.category || '-'}</div>
                    <div className="text-sm text-gray-600">Location: {it.location || '-'}</div>
                  </div>
                  <a className="text-blue-600" href={`/api/items/${it.id}`}>View</a>
                </li>
              ))}
              {items.length === 0 && <li className="py-2 text-gray-600">No assets</li>}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Add Asset</h2>
          <div className="space-y-2">
            <input className="border rounded p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            <input className="border rounded p-2 w-full" placeholder="Serial Number" value={form.serialNumber} onChange={e=>setForm({...form, serialNumber: e.target.value})} />
            <input className="border rounded p-2 w-full" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
            <input className="border rounded p-2 w-full" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
            <button className="px-3 py-2 bg-green-600 text-white rounded" disabled={creating} onClick={createItem}>Create</button>
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
