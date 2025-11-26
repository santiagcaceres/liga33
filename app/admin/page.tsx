"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Settings, Eye, EyeOff, CloudRain } from "lucide-react"
import { getRainStatus, toggleRainStatus } from "@/lib/actions/rain-status"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isRainActive, setIsRainActive] = useState(false)
  const [isTogglingRain, setIsTogglingRain] = useState(false)

  useEffect(() => {
    async function loadRainStatus() {
      if (isAuthenticated) {
        const result = await getRainStatus()
        if (result.success) {
          setIsRainActive(result.active)
        }
      }
    }
    loadRainStatus()
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const toggleRainSuspension = async () => {
    setIsTogglingRain(true)
    const result = await toggleRainStatus()
    if (result.success) {
      setIsRainActive(result.active)
    }
    setIsTogglingRain(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Settings className="w-6 h-6" />
              Panel de Administración
            </CardTitle>
            <p className="text-muted-foreground">Ingresa la contraseña para acceder</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
            >
              Ingresar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-gray-400">Selecciona el torneo que deseas gestionar</p>
        </div>

        <Card className="border-blue-500/50 bg-gradient-to-br from-gray-800 to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-400">
              <CloudRain className="w-6 h-6" />
              Control de Suspensión por Lluvia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-sm">
              Activa este botón para mostrar un aviso de suspensión por lluvia a todos los visitantes de las páginas
              públicas.
            </p>
            <Button
              onClick={toggleRainSuspension}
              disabled={isTogglingRain}
              className={`w-full transition-all ${
                isRainActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              <CloudRain className="w-5 h-5 mr-2" />
              {isTogglingRain
                ? "Actualizando..."
                : isRainActive
                  ? "Lluvia Activa - Click para Desactivar"
                  : "Activar Suspensión por Lluvia"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="border-2 border-yellow-500/50 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-500 transition-all cursor-pointer group"
            onClick={() => router.push("/admin/libertadores")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-500 group-hover:text-yellow-400 transition-colors">
                <Trophy className="w-8 h-8" />
                <div>
                  <div className="text-2xl">Copa Libertadores</div>
                  <div className="text-sm font-normal text-gray-400 mt-1">Formato: Grupos + Eliminatorias</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300 space-y-2">
                <p className="text-sm">Gestiona:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                  <li>Equipos y jugadores masculinos</li>
                  <li>Grupos y partidos de fase de grupos</li>
                  <li>Resultados y estadísticas</li>
                  <li>Tabla de posiciones por grupo</li>
                </ul>
              </div>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Administrar Libertadores</Button>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-pink-500/50 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-pink-500 transition-all cursor-pointer group"
            onClick={() => router.push("/admin/femenina")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-pink-500 group-hover:text-pink-400 transition-colors">
                <Trophy className="w-8 h-8" />
                <div>
                  <div className="text-2xl">SuperLiga Femenina</div>
                  <div className="text-sm font-normal text-gray-400 mt-1">Formato: Todos contra Todos</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300 space-y-2">
                <p className="text-sm">Gestiona:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                  <li>Equipos y jugadoras femeninas</li>
                  <li>Partidos y fechas libres</li>
                  <li>Resultados y estadísticas</li>
                  <li>Tabla general de posiciones</li>
                </ul>
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Administrar Femenina</Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="text-white">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
