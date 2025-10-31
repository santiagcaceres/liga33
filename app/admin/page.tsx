import AdminDashboard from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <AdminDashboard />
      </div>
    </div>
  )
}
