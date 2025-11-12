import AdminLibertadores from "@/components/admin-libertadores"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdminLibertadoresPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link href="/admin">
            <Button variant="ghost" className="text-white hover:text-yellow-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a selección
            </Button>
          </Link>
        </div>
        <AdminLibertadores />
      </div>
    </div>
  )
}
