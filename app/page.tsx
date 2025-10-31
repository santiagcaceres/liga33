"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import LoadingAnimation from "@/components/loading-animation"
import FixturesSystem from "@/components/fixtures-system"
import TopScorers from "@/components/top-scorers"
import WhatsAppButton from "@/components/whatsapp-button"
import CopaLibertadores from "@/components/copa-libertadores"
import TeamsRoster from "@/components/teams-roster"
import HomeSection from "@/components/home-section"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const lastShown = localStorage.getItem("lastLoadingShown")
      if (!lastShown) return true

      const twentyMinutes = 20 * 60 * 1000 // 20 minutes in milliseconds
      const timeSinceLastShown = Date.now() - Number.parseInt(lastShown, 10)

      return timeSinceLastShown >= twentyMinutes
    }
    return true
  })

  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeSection") || "inicio"
    }
    return "inicio"
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeSection", activeSection)
    }
  }, [activeSection])

  const handleLoadingComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastLoadingShown", Date.now().toString())
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <WhatsAppButton />

      <header className="bg-gradient-to-r from-black via-primary/20 to-black text-white shadow-lg border-b border-primary/30">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSection("inicio")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo-liga33.png" alt="Liga 33" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight text-primary">Liga 33</h1>
                <p className="text-gray-300 text-sm md:text-base">Copa Libertadores</p>
              </div>
            </button>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>

            <nav className="hidden md:flex gap-4 lg:gap-6">
              <Button
                variant="ghost"
                className="text-white hover:bg-primary/20 hover:text-primary text-sm lg:text-base"
                onClick={() => setActiveSection("inicio")}
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-primary/20 hover:text-primary text-sm lg:text-base"
                onClick={() => setActiveSection("copa")}
              >
                Copa Libertadores
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-primary/20 hover:text-primary text-sm lg:text-base"
                onClick={() => setActiveSection("equipos")}
              >
                Equipos
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-primary/20 hover:text-primary text-sm lg:text-base"
                onClick={() => setActiveSection("fixtures")}
              >
                Fixtures
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-primary/20 hover:text-primary text-sm lg:text-base"
                onClick={() => setActiveSection("goleadores")}
              >
                Goleadores
              </Button>
            </nav>
          </div>

          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-primary/30 pt-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/20 hover:text-primary justify-start"
                  onClick={() => {
                    setActiveSection("inicio")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Inicio
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/20 hover:text-primary justify-start"
                  onClick={() => {
                    setActiveSection("copa")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Copa Libertadores
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/20 hover:text-primary justify-start"
                  onClick={() => {
                    setActiveSection("equipos")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Equipos
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/20 hover:text-primary justify-start"
                  onClick={() => {
                    setActiveSection("fixtures")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Fixtures
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/20 hover:text-primary justify-start"
                  onClick={() => {
                    setActiveSection("goleadores")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Goleadores
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {activeSection === "inicio" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <HomeSection onNavigate={setActiveSection} />
          </div>
        </section>
      )}

      {activeSection === "copa" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CopaLibertadores />
          </div>
        </section>
      )}

      {activeSection === "equipos" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <TeamsRoster />
          </div>
        </section>
      )}

      {/* {activeSection === "admin" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <AdminDashboard />
          </div>
        </section>
      )} */}

      {activeSection === "goleadores" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <TopScorers />
          </div>
        </section>
      )}

      {activeSection === "fixtures" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <FixturesSystem />
          </div>
        </section>
      )}

      <footer className="bg-gradient-to-r from-black via-primary/10 to-black text-white py-6 md:py-8 mt-8 md:mt-12 border-t border-primary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-liga33.png" alt="Liga 33" className="w-8 h-8 object-contain" />
                <h3 className="text-lg font-bold text-primary">Liga 33</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base">
                La liga de fútbol más competitiva de la región. Seguí toda la acción de la Copa Libertadores.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary">Información</h3>
              <div className="space-y-2 text-gray-300 text-sm md:text-base">
                <div>📍 Complejo Deportivo HF</div>
                <div>📞 +598 94 107 059</div>
                <div>📧 info@liga33.com</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary">Horarios</h3>
              <div className="text-gray-300 text-sm md:text-base">
                <div>Sábados: 14:00 - 20:00</div>
                <div>Domingos: 14:00 - 19:00</div>
                <div>Entrenamientos: Lun-Vie 18:00-21:00</div>
              </div>
            </div>
          </div>
          <div className="border-t border-primary/30 mt-6 md:mt-8 pt-4 text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2025 Liga 33. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
