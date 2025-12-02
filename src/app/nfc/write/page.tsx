"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'

export default function NFCWritePage() {
  const [status, setStatus] = useState<string>('')
  const [itemId, setItemId] = useState('')
  const [tagData, setTagData] = useState('')

  const writeTag = async () => {
    try {
      if (!('NDEFReader' in window)) {
        setStatus('Web NFC not supported. Use QR fallback.')
        return
      }
      // @ts-ignore
      const ndef = new window.NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: `${location.origin}/api/nfc?tagId=${tagData}` }] })
      setStatus('Tag written successfully')
    } catch (e: any) {
      setStatus(`Write failed: ${e?.message || e}`)
    }
  }

  return (
    <main className="px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Write NFC Tag</h1>
      <div className="space-y-3">
        <input className="border rounded p-2 w-full" placeholder="Item ID" value={itemId} onChange={e=>setItemId(e.target.value)} />
        <input className="border rounded p-2 w-full" placeholder="Tag ID (physical)" value={tagData} onChange={e=>setTagData(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={writeTag}>Write Tag</button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
    </main>
  )
}
