"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Plus,
  Save,
  Trophy,
  Users,
  Target,
  Trash2,
  Eye,
  EyeOff,
  Shuffle,
  AlertCircle,
  Newspaper,
  Upload,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Match {
  id: number
  round: number
  group: string
  home: string
  away: string
  date: string
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("results")

  const [selectedRound, setSelectedRound] = useState("1")
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const [showDrawConfirm, setShowDrawConfirm] = useState(false)
  const [showResultConfirm, setShowResultConfirm] = useState(false)
  const [showDraw, setShowDraw] = useState(false)
  const [drawResults, setDrawResults] = useState<string[]>([])

  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null)

  const fixtures: Match[] = []

  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [homeGoals, setHomeGoals] = useState([{ player: "", minute: "" }])
  const [awayGoals, setAwayGoals] = useState([{ player: "", minute: "" }])
  const [homeYellowCards, setHomeYellowCards] = useState([{ player: "", minute: "" }])
  const [awayYellowCards, setAwayYellowCards] = useState([{ player: "", minute: "" }])
  const [homeRedCards, setHomeRedCards] = useState([{ player: "", minute: "" }])
  const [awayRedCards, setAwayRedCards] = useState([{ player: "", minute: "" }])

  // Team management state
  const [newTeam, setNewTeam] = useState({ name: "", coach: "" })

  // Player management state
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    team: "",
    cedula: "",
    age: "",
    number: "",
  })

  const teams: { id: string; name: string }[] = []

  const players: Record<string, string[]> = {}

  const handleLogin = () => {
    if (password === "liga33admin") {
      setIsAuthenticated(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
  }

  useEffect(() => {
    if (selectedMatchId !== null) {
      setHomeScore("")
      setAwayScore("")
      setHomeGoals([{ player: "", minute: "" }])
      setAwayGoals([{ player: "", minute: "" }])
      setHomeYellowCards([{ player: "", minute: "" }])
      setAwayYellowCards([{ player: "", minute: "" }])
      setHomeRedCards([{ player: "", minute: "" }])
      setAwayRedCards([{ player: "", minute: "" }])
    }
  }, [selectedMatchId])

  const addIncident = (type: "goal" | "yellow" | "red", team: "home" | "away") => {
    if (type === "goal") {
      if (team === "home") {
        setHomeGoals([...homeGoals, { player: "", minute: "" }])
      } else {
        setAwayGoals([...awayGoals, { player: "", minute: "" }])
      }
    } else if (type === "yellow") {
      if (team === "home") {
        setHomeYellowCards([...homeYellowCards, { player: "", minute: "" }])
      } else {
        setAwayYellowCards([...awayYellowCards, { player: "", minute: "" }])
      }
    } else if (type === "red") {
      if (team === "home") {
        setHomeRedCards([...homeRedCards, { player: "", minute: "" }])
      } else {
        setAwayRedCards([...awayRedCards, { player: "", minute: "" }])
      }
    }
  }

  const removeIncident = (type: "goal" | "yellow" | "red", team: "home" | "away", index: number) => {
    if (type === "goal") {
      if (team === "home") {
        setHomeGoals(homeGoals.filter((_, i) => i !== index))
      } else {
        setAwayGoals(awayGoals.filter((_, i) => i !== index))
      }
    } else if (type === "yellow") {
      if (team === "home") {
        setHomeYellowCards(homeYellowCards.filter((_, i) => i !== index))
      } else {
        setAwayYellowCards(awayYellowCards.filter((_, i) => i !== index))
      }
    } else if (type === "red") {
      if (team === "home") {
        setHomeRedCards(homeRedCards.filter((_, i) => i !== index))
      } else {
        setAwayRedCards(awayRedCards.filter((_, i) => i !== index))
      }
    }
  }

  const updateIncident = (
    type: "goal" | "yellow" | "red",
    team: "home" | "away",
    index: number,
    field: "player" | "minute",
    value: string,
  ) => {
    if (type === "goal") {
      if (team === "home") {
        const updated = [...homeGoals]
        updated[index][field] = value
        setHomeGoals(updated)
      } else {
        const updated = [...awayGoals]
        updated[index][field] = value
        setAwayGoals(updated)
      }
    } else if (type === "yellow") {
      if (team === "home") {
        const updated = [...homeYellowCards]
        updated[index][field] = value
        setHomeYellowCards(updated)
      } else {
        const updated = [...awayYellowCards]
        updated[index][field] = value
        setAwayYellowCards(updated)
      }
    } else if (type === "red") {
      if (team === "home") {
        const updated = [...homeRedCards]
        updated[index][field] = value
        setHomeRedCards(updated)
      } else {
        const updated = [...awayRedCards]
        updated[index][field] = value
        setAwayRedCards(updated)
      }
    }
  }

  const handleSubmitResult = () => {
    const selectedMatch = fixtures.find((m) => m.id === selectedMatchId)
    if (!selectedMatch) return

    console.log("[v0] Submitting match result:", {
      match: selectedMatch,
      homeScore,
      awayScore,
      homeGoals,
      awayGoals,
      homeYellowCards,
      awayYellowCards,
      homeRedCards,
      awayRedCards,
    })
    alert("Resultado guardado exitosamente! Las estadísticas se actualizaron automáticamente.")
    setShowResultConfirm(false)
    // Reset form
    setSelectedMatchId(null)
    setHomeScore("")
    setAwayScore("")
    setHomeGoals([{ player: "", minute: "" }])
    setAwayGoals([{ player: "", minute: "" }])
    setHomeYellowCards([{ player: "", minute: "" }])
    setAwayYellowCards([{ player: "", minute: "" }])
    setHomeRedCards([{ player: "", minute: "" }])
    setAwayRedCards([{ player: "", minute: "" }])
  }

  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewsImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewNews({ ...newNews, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTeam = () => {
    console.log("[v0] Adding new team:", newTeam)
    alert("Equipo agregado exitosamente!")
    setNewTeam({ name: "", coach: "" })
  }

  const handleAddPlayer = () => {
    console.log("[v0] Adding new player:", newPlayer)
    alert("Jugador agregado exitosamente!")
    setNewPlayer({ name: "", team: "", cedula: "", age: "", number: "" })
  }

  const handleAddNews = () => {
    console.log("[v0] Adding new news:", newNews)
    alert("Noticia agregada exitosamente!")
    setNewNews({ title: "", content: "", image: "", date: new Date().toISOString().split("T")[0] })
    setNewsImageFile(null)
  }

  const performDraw = () => {
    console.log("[v0] Performing draw with real data from database")
    alert("El sorteo se realizará con los datos reales de los clasificados una vez conectada la base de datos")
    setShowDrawConfirm(false)
  }

  const roundMatches = fixtures.filter((m) => m.round === Number.parseInt(selectedRound))
  const selectedMatch = fixtures.find((m) => m.id === selectedMatchId)

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-primary/30">
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
          <p className="text-xs text-gray-500 text-center">Contraseña de prueba: liga33admin</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="w-6 h-6" />
              Panel de Administración - Liga 33
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Cerrar Sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="draw">Sorteo</TabsTrigger>
              <TabsTrigger value="teams">Equipos</TabsTrigger>
              <TabsTrigger value="players">Jugadores</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-6">
              <Card className="border-primary/30 bg-gradient-to-r from-black via-primary/10 to-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Newspaper className="w-5 h-5" />
                    Gestión de Noticias
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Agrega noticias con imagen banner y texto (máximo 4 noticias)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título de la Noticia</Label>
                    <Input
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      placeholder="Ej: Gran victoria de Deportivo Central"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenido</Label>
                    <Textarea
                      value={newNews.content}
                      onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      placeholder="Escribe el contenido de la noticia..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={newNews.date}
                      onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagen Banner</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={handleNewsImageUpload} className="flex-1" />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {newNews.image && (
                      <div className="mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border border-primary/30">
                        <img
                          src={newNews.image || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleAddNews}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={!newNews.title || !newNews.content || !newNews.image}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Noticia
                  </Button>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Noticias Publicadas (0/4)</h3>
                    <div className="text-center py-8 text-gray-500">
                      <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay noticias publicadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card className="border-primary/30 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Trophy className="w-5 h-5" />
                    Cargar Resultado de Partido
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Selecciona una fecha y partido. Los goles y tarjetas se sumarán automáticamente a las tablas
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fixtures.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
                      <p className="text-lg">No hay partidos cargados</p>
                      <p className="text-sm">
                        Primero debes agregar equipos y crear el fixture de la Copa Libertadores
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Seleccionar Fecha</Label>
                        <Select
                          value={selectedRound}
                          onValueChange={(value) => {
                            setSelectedRound(value)
                            setSelectedMatchId(null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fecha" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Fecha 1</SelectItem>
                            <SelectItem value="2">Fecha 2</SelectItem>
                            <SelectItem value="3">Fecha 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Seleccionar Partido</Label>
                        <div className="grid gap-2">
                          {roundMatches.map((match) => (
                            <Button
                              key={match.id}
                              variant={selectedMatchId === match.id ? "default" : "outline"}
                              className={`w-full justify-start h-auto py-3 ${
                                selectedMatchId === match.id
                                  ? "bg-gradient-to-r from-primary to-primary/80"
                                  : "border-primary/30"
                              }`}
                              onClick={() => setSelectedMatchId(match.id)}
                            >
                              <div className="flex flex-col items-start w-full">
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold">
                                    {match.home} vs {match.away}
                                  </span>
                                  <Badge variant="outline" className="ml-2">
                                    Grupo {match.group}
                                  </Badge>
                                </div>
                                <span className="text-xs opacity-80">{match.date}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {selectedMatch && (
                        <>
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <h3 className="font-semibold text-lg text-center mb-2">
                              {selectedMatch.home} vs {selectedMatch.away}
                            </h3>
                            <p className="text-sm text-center text-gray-600">
                              Fecha {selectedMatch.round} - Grupo {selectedMatch.group}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Goles {selectedMatch.home}</Label>
                              <Input
                                type="number"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                placeholder="0"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Goles {selectedMatch.away}</Label>
                              <Input
                                type="number"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Goleadores Local */}
                          <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">⚽ Goleadores {selectedMatch.home}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("goal", "home")}
                                className="border-green-300 text-green-600 hover:bg-green-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Gol
                              </Button>
                            </div>
                            {homeGoals.map((goal, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={goal.player}
                                    onValueChange={(value) => updateIncident("goal", "home", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["deportivo-central"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={goal.minute}
                                    onChange={(e) => updateIncident("goal", "home", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("goal", "home", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Amarillas Local */}
                          <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                🟨 Tarjetas Amarillas {selectedMatch.home}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("yellow", "home")}
                                className="border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Amarilla
                              </Button>
                            </div>
                            {homeYellowCards.map((card, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={card.player}
                                    onValueChange={(value) => updateIncident("yellow", "home", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["deportivo-central"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={card.minute}
                                    onChange={(e) => updateIncident("yellow", "home", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("yellow", "home", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Rojas Local */}
                          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">🟥 Tarjetas Rojas {selectedMatch.home}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("red", "home")}
                                className="border-red-300 text-red-600 hover:bg-red-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Roja
                              </Button>
                            </div>
                            {homeRedCards.map((card, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={card.player}
                                    onValueChange={(value) => updateIncident("red", "home", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["deportivo-central"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={card.minute}
                                    onChange={(e) => updateIncident("red", "home", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("red", "home", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Goleadores Visitante */}
                          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">⚽ Goleadores {selectedMatch.away}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("goal", "away")}
                                className="border-blue-300 text-blue-600 hover:bg-blue-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Gol
                              </Button>
                            </div>
                            {awayGoals.map((goal, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={goal.player}
                                    onValueChange={(value) => updateIncident("goal", "away", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["racing-fc"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={goal.minute}
                                    onChange={(e) => updateIncident("goal", "away", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("goal", "away", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Amarillas Visitante */}
                          <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                🟨 Tarjetas Amarillas {selectedMatch.away}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("yellow", "away")}
                                className="border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Amarilla
                              </Button>
                            </div>
                            {awayYellowCards.map((card, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={card.player}
                                    onValueChange={(value) => updateIncident("yellow", "away", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["racing-fc"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={card.minute}
                                    onChange={(e) => updateIncident("yellow", "away", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("yellow", "away", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Rojas Visitante */}
                          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">🟥 Tarjetas Rojas {selectedMatch.away}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("red", "away")}
                                className="border-red-300 text-red-600 hover:bg-red-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Roja
                              </Button>
                            </div>
                            {awayRedCards.map((card, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Select
                                    value={card.player}
                                    onValueChange={(value) => updateIncident("red", "away", index, "player", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {players["racing-fc"]?.map((player) => (
                                        <SelectItem key={player} value={player}>
                                          {player}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-20">
                                  <Input
                                    placeholder="Min"
                                    value={card.minute}
                                    onChange={(e) => updateIncident("red", "away", index, "minute", e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIncident("red", "away", index)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => setShowResultConfirm(true)}
                            className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                            disabled={!homeScore || !awayScore}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Resultado y Actualizar Tablas
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draw" className="space-y-6">
              <Card className="border-green-200 bg-gradient-to-r from-green-950 via-green-900/20 to-green-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shuffle className="w-6 h-6 text-green-600" />
                    Sorteo de Clasificados
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Realiza el sorteo automático de los 8 equipos clasificados para los octavos de final
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setShowDrawConfirm(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Realizar Sorteo Automático
                  </Button>

                  {showDraw && drawResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <h3 className="font-semibold text-lg text-center">Cruces de Octavos de Final</h3>
                      <div className="grid gap-3">
                        {drawResults.map((matchup, index) => (
                          <Card key={index} className="border-primary/30 bg-card">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <Badge className="bg-primary">Partido {index + 1}</Badge>
                                <span className="font-semibold text-center flex-1">{matchup}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-6">
              <Card className="border-primary/30 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Users className="w-5 h-5" />
                    Gestión de Equipos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del Equipo</Label>
                      <Input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Ej: Deportivo Central"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Director Técnico</Label>
                      <Input
                        value={newTeam.coach}
                        onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddTeam}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={!newTeam.name || !newTeam.coach}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                  </Button>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Equipos Registrados</h3>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No hay equipos registrados</p>
                      <p className="text-sm">Agrega equipos usando el formulario de arriba</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
              <Card className="border-primary/30 bg-gradient-to-r from-black via-primary/10 to-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Target className="w-5 h-5" />
                    Gestión de Jugadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="Ej: Carlos Rodríguez"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cédula</Label>
                      <Input
                        value={newPlayer.cedula}
                        onChange={(e) => setNewPlayer({ ...newPlayer, cedula: e.target.value })}
                        placeholder="Ej: 12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Equipo</Label>
                      <Select
                        value={newPlayer.team}
                        onValueChange={(value) => setNewPlayer({ ...newPlayer, team: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deportivo-central">Deportivo Central</SelectItem>
                          <SelectItem value="racing-fc">Racing FC</SelectItem>
                          <SelectItem value="unidos">Club Atlético Unidos</SelectItem>
                          <SelectItem value="independiente">Independiente Sur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Edad</Label>
                      <Input
                        type="number"
                        value={newPlayer.age}
                        onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                        placeholder="25"
                        min="16"
                        max="45"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        type="number"
                        value={newPlayer.number}
                        onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                        placeholder="10"
                        min="1"
                        max="99"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddPlayer}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={!newPlayer.name || !newPlayer.team || !newPlayer.cedula}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Jugador
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showDrawConfirm} onOpenChange={setShowDrawConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Confirmar Sorteo
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas realizar el sorteo de los clasificados? Esta acción generará los cruces de
              octavos de final de forma aleatoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDraw}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Confirmar Sorteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResultConfirm} onOpenChange={setShowResultConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Confirmar Resultado
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas guardar este resultado? Los goles y tarjetas se sumarán automáticamente a las
              tablas y estadísticas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitResult}
              className="bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
            >
              Confirmar y Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
