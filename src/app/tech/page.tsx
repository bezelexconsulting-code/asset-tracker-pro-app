export const dynamic = 'force-dynamic'
export const revalidate = 0
import Link from 'next/link'

export default function TechHome() {
  return (
    <main className="px-4 py-6">
      <h1 className="text-xl font-bold mb-3">Technician</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link className="p-4 rounded-lg border bg-white" href="/assignments">Assignments</Link>
        <Link className="p-4 rounded-lg border bg-white" href="/inventory">Assets</Link>
        <Link className="p-4 rounded-lg border bg-white" href="/maintenance">Maintenance</Link>
        <Link className="p-4 rounded-lg border bg-white" href="/nfc/tap">NFC Tap</Link>
      </div>
    </main>
  )
}
