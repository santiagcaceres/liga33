"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "59894107059" // +598 94 107 059 sin espacios ni símbolos
    const message = "Hola! Me interesa inscribirme en Liga 33. ¿Podrían darme más información?"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">Inscribirme</span>
    </Button>
  )
}
