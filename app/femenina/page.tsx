"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowLeft, Trophy, Calendar, Target, Users, FileText, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import LoadingAnimation from "@/components/loading-animation"
import WhatsAppButton from "@/components/whatsapp-button"
import LeagueStandings from "@/components/league-standings"
import LeagueFixtures from "@/components/league-fixtures"
import LeagueTopScorers from "@/components/league-top-scorers"
import LeagueTeamsRoster from "@/components/league-teams-roster"
import NewsSection from "@/components/news-section"
import { RainAlert } from "@/components/rain-alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRainStatus } from "@/lib/actions/rain-status"

export default function FemeninaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const lastShown = localStorage.getItem("lastLoadingShownFemenina")
      if (!lastShown) return true

      const twentyMinutes = 20 * 60 * 1000
      const timeSinceLastShown = Date.now() - Number.parseInt(lastShown, 10)

      return timeSinceLastShown >= twentyMinutes
    }
    return true
  })

  const [activeSection, setActiveSection] = useState<string>("inicio")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [showRainAlert, setShowRainAlert] = useState(false)

  useEffect(() => {
    async function checkRainSuspensions() {
      const result = await getRainStatus()
      if (result.success && result.active) {
        setShowRainAlert(true)
      }
    }
    checkRainSuspensions()
  }, [])

  const handleLoadingComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastLoadingShownFemenina", Date.now().toString())
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <LoadingAnimation
        onComplete={handleLoadingComplete}
        logoUrl="/images/logo-20fem.png"
        shadowColor="rgba(236, 72, 153, 0.8)"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <WhatsAppButton />

      {showRainAlert && <RainAlert message="Partidos suspendidos por lluvia" onClose={() => setShowRainAlert(false)} />}

      <header className="bg-gradient-to-r from-black via-pink-500/20 to-black text-white shadow-lg border-b border-pink-500/30">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-pink-500/20"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <button
                onClick={() => setActiveSection("inicio")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img src="/images/logo-20fem.png" alt="Liga 33" className="w-20 h-20 md:w-32 md:h-32 object-contain" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight text-pink-500">Liga 33</h1>
                  <p className="text-purple-400 text-sm md:text-base font-semibold">SuperLiga Femenina</p>
                </div>
              </button>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-pink-500/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>

            <nav className="hidden md:flex gap-4 lg:gap-6">
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-500/20 hover:text-pink-500 text-sm lg:text-base"
                onClick={() => setActiveSection("tabla")}
              >
                Tabla de Posiciones
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-500/20 hover:text-pink-500 text-sm lg:text-base"
                onClick={() => setActiveSection("equipos")}
              >
                Equipos
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-500/20 hover:text-pink-500 text-sm lg:text-base"
                onClick={() => setActiveSection("fixtures")}
              >
                Fixtures
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-500/20 hover:text-pink-500 text-sm lg:text-base"
                onClick={() => setActiveSection("goleadoras")}
              >
                Goleadoras
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-500/20 hover:text-pink-500 text-sm lg:text-base"
                onClick={() => setActiveSection("noticias")}
              >
                Noticias
              </Button>
            </nav>
          </div>

          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-pink-500/30 pt-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-500/20 hover:text-pink-500 justify-start"
                  onClick={() => {
                    setActiveSection("tabla")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Tabla de Posiciones
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-500/20 hover:text-pink-500 justify-start"
                  onClick={() => {
                    setActiveSection("equipos")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Equipos
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-500/20 hover:text-pink-500 justify-start"
                  onClick={() => {
                    setActiveSection("fixtures")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Fixtures
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-500/20 hover:text-pink-500 justify-start"
                  onClick={() => {
                    setActiveSection("goleadoras")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Goleadoras
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-500/20 hover:text-pink-500 justify-start"
                  onClick={() => {
                    setActiveSection("noticias")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Noticias
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {activeSection === "inicio" && (
            <div className="space-y-8">
              <div className="text-center text-white mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-pink-500">SuperLiga Femenina 2025</h2>
                <p className="text-gray-300 text-lg mb-8">Formato de liga - Todos contra todos</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                      <h3 className="text-xl font-bold mb-2">Tabla de Posiciones</h3>
                      <p className="text-gray-400 text-sm">Seguí la clasificación en tiempo real</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                      <h3 className="text-xl font-bold mb-2">Fixtures</h3>
                      <p className="text-gray-400 text-sm">Calendario completo de partidos</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                    <CardContent className="p-6 text-center">
                      <Target className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                      <h3 className="text-xl font-bold mb-2">Goleadoras</h3>
                      <p className="text-gray-400 text-sm">Ranking de máximas anotadoras</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                      <h3 className="text-xl font-bold mb-2">Equipos</h3>
                      <p className="text-gray-400 text-sm">Planteles completos</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <NewsSection tournamentColor="pink" />

              <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-500">
                    <FileText className="w-6 h-6" />
                    Reglamento Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Descarga el reglamento oficial de la SuperLiga Femenina 2025. Incluye sistema de competencia, reglas
                    del juego y normativas específicas.
                  </p>
                  <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                    <li>Sistema de puntuación y clasificación</li>
                    <li>Reglamento completo del torneo</li>
                    <li>Normativas y procedimientos</li>
                  </ul>
                  <Button
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = "/reglamento-femenina.txt"
                      link.download = "Reglamento_SuperLiga_Femenina_2025.txt"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reglamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "tabla" && <LeagueStandings />}
          {activeSection === "fixtures" && <LeagueFixtures />}
          {activeSection === "goleadoras" && <LeagueTopScorers />}
          {activeSection === "equipos" && <LeagueTeamsRoster />}
          {activeSection === "noticias" && (
            <div className="text-white">
              <NewsSection />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-black via-pink-500/10 to-black text-white py-6 md:py-8 mt-8 md:mt-12 border-t border-pink-500/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/logo-20fem.png" alt="Liga 33" className="w-12 h-12 object-contain" />
                <h3 className="text-lg font-bold text-pink-500">Liga 33</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base font-semibold">
                MUCHO MAS QUE FUTBOL, MAS FUTBOL Y DEL BUENO
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-pink-500">Información</h3>
              <div className="space-y-2 text-gray-300 text-sm md:text-base">
                <div>📍 Complejo Deportivo HF</div>
                <div>📞 +598 94 107 059</div>
                <div>📧 info@liga33.com</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-pink-500">Horarios</h3>
              <div className="text-gray-300 text-sm md:text-base">
                <div className="font-semibold">Sábados: 17:00 - 21:00</div>
              </div>
            </div>
          </div>
          <div className="border-t border-pink-500/30 mt-6 md:mt-8 pt-4 text-center text-gray-400 text-sm md:text-base">
            <p>
              &copy; 2025 Liga 33. Todos los derechos reservados. Desarrollado por{" "}
              <a
                href="https://www.launchbyteuy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-500/80 transition-colors underline"
              >
                LaunchByte
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
