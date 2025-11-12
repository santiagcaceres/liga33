import AdminFemenina from "@/components/admin-femenina"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdminFemeninaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link href="/admin">
            <Button variant="ghost" className="text-white hover:text-pink-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a selección
            </Button>
          </Link>
        </div>
        <AdminFemenina />
      </div>
    </div>
  )
}
