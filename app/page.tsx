"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Target, Camera, Users, MapPin, Settings, Menu, X } from "lucide-react"
import LoadingAnimation from "@/components/loading-animation"
import StandingsTable from "@/components/standings-table"
import FixturesSystem from "@/components/fixtures-system"
import TopScorers from "@/components/top-scorers"
import AdminDashboard from "@/components/admin-dashboard"
import PhotoGallery from "@/components/photo-gallery"
import NewsSection from "@/components/news-section"
import WhatsAppButton from "@/components/whatsapp-button"
import CopaLibertadores from "@/components/copa-libertadores"
import TeamsRoster from "@/components/teams-roster"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("copa")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <WhatsAppButton />

      <header className="bg-gradient-to-r from-blue-900 via-purple-800 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-liga33.png" alt="Liga 33" className="w-10 h-10 md:w-12 md:h-12" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">Liga 33</h1>
                <p className="text-purple-100 text-sm md:text-base">Temporada 2025</p>
              </div>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>

            <nav className="hidden md:flex gap-4 lg:gap-6">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("copa")}
              >
                Copa Libertadores
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("equipos")}
              >
                Equipos
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("fixtures")}
              >
                Fixtures
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("goleadores")}
              >
                Goleadores
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("galeria")}
              >
                Galería
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 text-sm lg:text-base"
                onClick={() => setActiveSection("admin")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </nav>
          </div>

          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("copa")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Copa Libertadores
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("equipos")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Equipos
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("fixtures")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Fixtures
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("goleadores")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Goleadores
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("galeria")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Galería
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 justify-start"
                  onClick={() => {
                    setActiveSection("admin")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

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
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "galeria" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <PhotoGallery />
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "admin" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <AdminDashboard />
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "goleadores" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <TopScorers />
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "fixtures" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <FixturesSystem />
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "posiciones" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <StandingsTable />
            <div className="mt-8 text-center">
              <Button
                onClick={() => setActiveSection("inicio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "inicio" && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <NewsSection />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              <Card className="text-center border-purple-200 bg-gradient-to-br from-white to-purple-50">
                <CardContent className="pt-4 md:pt-6">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-gray-800">12</div>
                  <div className="text-xs md:text-sm text-gray-600">Equipos</div>
                </CardContent>
              </Card>
              <Card className="text-center border-purple-200 bg-gradient-to-br from-white to-blue-50">
                <CardContent className="pt-4 md:pt-6">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-gray-800">22</div>
                  <div className="text-xs md:text-sm text-gray-600">Fechas</div>
                </CardContent>
              </Card>
              <Card className="text-center border-purple-200 bg-gradient-to-br from-white to-pink-50">
                <CardContent className="pt-4 md:pt-6">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-gray-800">156</div>
                  <div className="text-xs md:text-sm text-gray-600">Goles</div>
                </CardContent>
              </Card>
              <Card className="text-center border-purple-200 bg-gradient-to-br from-white to-purple-50">
                <CardContent className="pt-4 md:pt-6">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-gray-800">8</div>
                  <div className="text-xs md:text-sm text-gray-600">Fecha Actual</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Próximos Partidos */}
              <Card className="lg:col-span-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Próximos Partidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { home: "Racing FC", away: "Deportivo Central", date: "Sáb 15:00", venue: "Cancha 1" },
                      { home: "Unidos", away: "Independiente", date: "Sáb 17:00", venue: "Cancha 2" },
                      { home: "Boca Local", away: "River Plate", date: "Dom 15:00", venue: "Cancha 1" },
                    ].map((match, i) => (
                      <div
                        key={i}
                        className="p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                      >
                        <div className="text-center mb-2">
                          <div className="font-medium text-sm md:text-base">{match.home}</div>
                          <div className="text-xs md:text-sm text-gray-500">vs</div>
                          <div className="font-medium text-sm md:text-base">{match.away}</div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          <div>{match.date}</div>
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {match.venue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={() => setActiveSection("fixtures")}
                  >
                    Ver Todos los Fixtures
                  </Button>
                </CardContent>
              </Card>

              {/* Tabla de Goleadores */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Target className="w-5 h-5 text-pink-600" />
                    Tabla de Goleadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Carlos Rodríguez", team: "Deportivo Central", goals: 12 },
                      { name: "Miguel Santos", team: "Racing FC", goals: 10 },
                      { name: "Juan Pérez", team: "Unidos", goals: 8 },
                      { name: "Diego López", team: "Independiente", goals: 7 },
                      { name: "Roberto García", team: "Boca Local", goals: 6 },
                    ].map((player, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded border border-pink-200"
                      >
                        <div>
                          <div className="font-medium text-sm md:text-base">{player.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{player.team}</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-xs md:text-sm">
                          {player.goals} goles
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                    onClick={() => setActiveSection("goleadores")}
                  >
                    Ver Tabla Completa
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Complejo HF */}
            <div className="mt-6 md:mt-8">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Camera className="w-5 h-5 text-purple-600" />
                    Complejo HF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border border-purple-200 relative overflow-hidden">
                      <video
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/video%201-dIvx1U95P9qf5NI8H6DW6cwD3YW2Yn.mp4"
                        className="w-full h-full object-cover rounded-lg"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        <p>Tu navegador no soporta el elemento de video.</p>
                      </video>
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Complejo Deportivo HF</h3>
                    <p className="text-sm text-gray-600">Instalaciones de primer nivel para Liga 33</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                    onClick={() => setActiveSection("galeria")}
                  >
                    Ver Galería Completa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white py-6 md:py-8 mt-8 md:mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-liga33.png" alt="Liga 33" className="w-8 h-8" />
                <h3 className="text-lg font-bold">Liga 33</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base">
                La liga de fútbol más competitiva de la región. Seguí toda la acción y no te pierdas ningún partido de
                la temporada 2025.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Información</h3>
              <div className="space-y-2 text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Complejo Deportivo HF
                </div>
                <div>📞 +598 94 107 059</div>
                <div>📧 info@liga33.com</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Horarios</h3>
              <div className="text-gray-300 text-sm md:text-base">
                <div>Sábados: 14:00 - 20:00</div>
                <div>Domingos: 14:00 - 19:00</div>
                <div>Entrenamientos: Lun-Vie 18:00-21:00</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-4 text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2025 Liga 33. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
