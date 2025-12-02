export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  return (
    <main className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Asset Tracker Pro</h1>
      <p className="text-gray-700 mb-6">A simple, scalable asset tracking platform with Admin, Client, and Technician portals.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a className="p-4 rounded-lg border bg-white hover:shadow" href="/features">
          <h2 className="font-semibold">Features</h2>
          <p className="text-sm text-gray-600">Overview of capabilities and how it works</p>
        </a>
        <a className="p-4 rounded-lg border bg-white hover:shadow" href="/download">
          <h2 className="font-semibold">Download Technician App</h2>
          <p className="text-sm text-gray-600">Install the mobile PWA or get the link</p>
        </a>
        <a className="p-4 rounded-lg border bg-white hover:shadow" href="/login">
          <h2 className="font-semibold">Login</h2>
          <p className="text-sm text-gray-600">Admin and Client portals</p>
        </a>
      </div>
    </main>
  )
}
