export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function FeaturesPage() {
  return (
    <main className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Features</h1>
      <ul className="space-y-2 text-gray-700">
        <li>Admin portal: add/pause/delete clients and technicians</li>
        <li>Client portal: manage assets, view technician activity</li>
        <li>Technician mobile app (PWA): check in/out, maintenance logs</li>
        <li>Branding: logo + company name visible across portals</li>
        <li>Basic dashboards and exports (CSV/Excel)</li>
      </ul>
    </main>
  )
}
