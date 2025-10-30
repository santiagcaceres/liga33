"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Plus,
  Edit,
  Save,
  Trophy,
  Users,
  Target,
  Trash2,
  Eye,
  EyeOff,
  Shuffle,
  AlertCircle,
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

  const fixtures: Match[] = [
    // Fecha 1 - Grupo A
    { id: 1, round: 1, group: "A", home: "Deportivo Central", away: "Racing FC", date: "2025-02-01" },
    { id: 2, round: 1, group: "A", home: "Boca Local", away: "San Lorenzo", date: "2025-02-01" },
    // Fecha 1 - Grupo B
    { id: 3, round: 1, group: "B", home: "Club Atlético Unidos", away: "Independiente Sur", date: "2025-02-01" },
    { id: 4, round: 1, group: "B", home: "River Regional", away: "Estudiantes", date: "2025-02-01" },
    // Fecha 1 - Grupo C
    { id: 5, round: 1, group: "C", home: "Peñarol FC", away: "Nacional", date: "2025-02-01" },
    { id: 6, round: 1, group: "C", home: "Defensor", away: "Cerro", date: "2025-02-01" },
    // Fecha 2 - Grupo A
    { id: 7, round: 2, group: "A", home: "Racing FC", away: "Boca Local", date: "2025-02-08" },
    { id: 8, round: 2, group: "A", home: "San Lorenzo", away: "Deportivo Central", date: "2025-02-08" },
    // Fecha 2 - Grupo B
    { id: 9, round: 2, group: "B", home: "Independiente Sur", away: "River Regional", date: "2025-02-08" },
    { id: 10, round: 2, group: "B", home: "Estudiantes", away: "Club Atlético Unidos", date: "2025-02-08" },
    // Fecha 2 - Grupo C
    { id: 11, round: 2, group: "C", home: "Nacional", away: "Defensor", date: "2025-02-08" },
    { id: 12, round: 2, group: "C", home: "Cerro", away: "Peñarol FC", date: "2025-02-08" },
  ]

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

  const teams = [
    { id: "deportivo-central", name: "Deportivo Central" },
    { id: "racing-fc", name: "Racing FC" },
    { id: "unidos", name: "Club Atlético Unidos" },
    { id: "independiente", name: "Independiente Sur" },
    { id: "boca", name: "Boca Local" },
    { id: "river", name: "River Regional" },
  ]

  const players = {
    "deportivo-central": [
      "Juan Martínez",
      "Pedro Sánchez",
      "Luis García",
      "Carlos Rodríguez",
      "Miguel Torres",
      "Diego López",
      "Roberto Fernández",
      "Andrés Gómez",
      "Fernando Silva",
      "Sebastián Ruiz",
      "Martín Díaz",
    ],
    "racing-fc": [
      "Jorge Ramírez",
      "Pablo Castro",
      "Javier Morales",
      "Ricardo Vega",
      "Alejandro Núñez",
      "Gustavo Herrera",
      "Raúl Mendoza",
      "Eduardo Paredes",
      "Miguel Santos",
      "Daniel Ortiz",
      "Cristian Rojas",
    ],
  }

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

  const performDraw = () => {
    const groups = {
      A: [
        { pos: 1, team: "Deportivo Central", pts: 9, dif: 6 },
        { pos: 2, team: "Racing FC", pts: 6, dif: 2 },
        { pos: 3, team: "Boca Local", pts: 3, dif: -2 },
      ],
      B: [
        { pos: 1, team: "Club Atlético Unidos", pts: 7, dif: 4 },
        { pos: 2, team: "Independiente Sur", pts: 6, dif: 2 },
        { pos: 3, team: "River Regional", pts: 4, dif: 0 },
      ],
      C: [
        { pos: 1, team: "Peñarol FC", pts: 7, dif: 4 },
        { pos: 2, team: "Nacional", pts: 6, dif: 2 },
        { pos: 3, team: "Defensor", pts: 3, dif: -2 },
      ],
    }

    const qualified: string[] = []
    qualified.push(groups.A[0].team)
    qualified.push(groups.A[1].team)
    qualified.push(groups.B[0].team)
    qualified.push(groups.B[1].team)
    qualified.push(groups.C[0].team)
    qualified.push(groups.C[1].team)

    const thirdPlaceTeams = [groups.A[2], groups.B[2], groups.C[2]].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      return b.dif - a.dif
    })

    qualified.push(thirdPlaceTeams[0].team)
    qualified.push(thirdPlaceTeams[1].team)

    const shuffled = [...qualified].sort(() => Math.random() - 0.5)

    const matchups: string[] = []
    for (let i = 0; i < shuffled.length; i += 2) {
      matchups.push(`${shuffled[i]} vs ${shuffled[i + 1]}`)
    }

    setDrawResults(matchups)
    setShowDraw(true)
    setShowDrawConfirm(false)
  }

  const roundMatches = fixtures.filter((m) => m.round === Number.parseInt(selectedRound))
  const selectedMatch = fixtures.find((m) => m.id === selectedMatchId)

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Panel de Administración
          </CardTitle>
          <p className="text-gray-600">Ingresa la contraseña para acceder</p>
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="draw">Sorteo</TabsTrigger>
              <TabsTrigger value="teams">Equipos</TabsTrigger>
              <TabsTrigger value="players">Jugadores</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    Cargar Resultado de Partido
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Selecciona una fecha y partido. Los goles y tarjetas se sumarán automáticamente a las tablas
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
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
                              ? "bg-gradient-to-r from-purple-600 to-pink-600"
                              : "border-purple-200"
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
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
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
                          <Label className="text-base font-semibold">🟨 Tarjetas Amarillas {selectedMatch.home}</Label>
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
                          <Label className="text-base font-semibold">🟨 Tarjetas Amarillas {selectedMatch.away}</Label>
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
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={!homeScore || !awayScore}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Resultado y Actualizar Tablas
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draw" className="space-y-6">
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
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
                          <Card key={index} className="border-purple-200 bg-white">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <Badge className="bg-purple-600">Partido {index + 1}</Badge>
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
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
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
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    disabled={!newTeam.name || !newTeam.coach}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                  </Button>

                  {/* Lista de equipos existentes */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Equipos Registrados</h3>
                    <div className="grid gap-2">
                      {[
                        "Deportivo Central",
                        "Club Atlético Unidos",
                        "Racing FC",
                        "Independiente Sur",
                        "Boca Juniors Local",
                        "River Plate Regional",
                      ].map((team, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="font-medium">{team}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-600 bg-transparent">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-600" />
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
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Confirmar y Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
