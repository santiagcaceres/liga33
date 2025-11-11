"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Users, Calendar, Trophy, Settings, Eye, EyeOff, ImageIcon } from "lucide-react"
import { getTeams, addTeam, deleteTeam } from "@/lib/actions/teams"
import { getPlayersByTournament, addPlayer, deletePlayer } from "@/lib/actions/players"
import { getMatches, addMatch, deleteMatch, updateMatchResult } from "@/lib/actions/matches"
import { getNews, addNews, deleteNews } from "@/lib/actions/news"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const TOURNAMENT_ID = 2 // SuperLiga Femenina

export default function AdminFemenina() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // State
  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [newsList, setNewsList] = useState<any[]>([])

  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [isLoadingNews, setIsLoadingNews] = useState(false)

  const [selectedRound, setSelectedRound] = useState("1")
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const [showResultConfirm, setShowResultConfirm] = useState(false)

  // Forms
  const [newTeam, setNewTeam] = useState({ name: "", logo_url: "" })
  const [newPlayer, setNewPlayer] = useState({ name: "", team_id: "", position: "", number: "" })
  const [newMatch, setNewMatch] = useState({
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    match_time: "",
    field: "",
    round: "1",
  })
  const [matchResult, setMatchResult] = useState({ match_id: "", home_score: "", away_score: "" })
  const [newNewsItem, setNewNewsItem] = useState({ title: "", content: "", image_url: "" })

  // Auth
  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
      toast({ title: "Acceso concedido", description: "Bienvenido al panel de administración de SuperLiga Femenina" })
    } else {
      toast({ title: "Error", description: "Contraseña incorrecta", variant: "destructive" })
    }
  }

  // Load data
  const loadTeams = async () => {
    setIsLoadingTeams(true)
    try {
      const allTeams = await getTeams()
      const filteredTeams = allTeams.filter((team) => team.tournament_id === TOURNAMENT_ID)
      setTeams(filteredTeams)
    } catch (error) {
      console.error("Error loading teams:", error)
      toast({ title: "Error", description: "No se pudieron cargar los equipos", variant: "destructive" })
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const loadPlayers = async () => {
    setIsLoadingPlayers(true)
    try {
      const filteredPlayers = await getPlayersByTournament(TOURNAMENT_ID)
      setPlayers(filteredPlayers)
    } catch (error) {
      console.error("Error loading players:", error)
      toast({ title: "Error", description: "No se pudieron cargar los jugadores", variant: "destructive" })
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  const loadMatches = async () => {
    setIsLoadingMatches(true)
    try {
      const allMatches = await getMatches()
      const filteredMatches = allMatches.filter((m: any) => m.tournament_id === TOURNAMENT_ID)
      setMatches(filteredMatches || [])
    } catch (error) {
      console.error("Error loading matches:", error)
      toast({ title: "Error", description: "No se pudieron cargar los partidos", variant: "destructive" })
    } finally {
      setIsLoadingMatches(false)
    }
  }

  const loadNews = async () => {
    setIsLoadingNews(true)
    try {
      const newsResult = await getNews()
      const newsForTournament = newsResult.filter((n: any) => n.tournament_id === TOURNAMENT_ID)
      setNewsList(newsForTournament)
    } catch (error) {
      console.error("Error loading news:", error)
      toast({ title: "Error", description: "No se pudieron cargar las noticias", variant: "destructive" })
    } finally {
      setIsLoadingNews(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadTeams()
      loadPlayers()
      loadMatches()
    }
  }, [isAuthenticated])

  // CRUD operations
  const handleAddTeam = async () => {
    if (!newTeam.name) {
      toast({ title: "Error", description: "El nombre del equipo es requerido", variant: "destructive" })
      return
    }
    try {
      await addTeam({ ...newTeam, tournament_id: TOURNAMENT_ID })
      toast({ title: "Éxito", description: "Equipo agregado correctamente" })
      setNewTeam({ name: "", logo_url: "" })
      loadTeams()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el equipo", variant: "destructive" })
    }
  }

  const handleDeleteTeam = async (id: number) => {
    try {
      await deleteTeam(id)
      toast({ title: "Éxito", description: "Equipo eliminado correctamente" })
      loadTeams()
      loadPlayers()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el equipo", variant: "destructive" })
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.team_id) {
      toast({ title: "Error", description: "Nombre y equipo son requeridos", variant: "destructive" })
      return
    }
    try {
      await addPlayer({
        name: newPlayer.name,
        team_id: Number.parseInt(newPlayer.team_id),
        position: newPlayer.position,
        number: newPlayer.number ? Number.parseInt(newPlayer.number) : null,
      })
      toast({ title: "Éxito", description: "Jugadora agregada correctamente" })
      setNewPlayer({ name: "", team_id: "", position: "", number: "" })
      loadPlayers()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar la jugadora", variant: "destructive" })
    }
  }

  const handleDeletePlayer = async (id: number) => {
    try {
      await deletePlayer(id)
      toast({ title: "Éxito", description: "Jugadora eliminada correctamente" })
      loadPlayers()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la jugadora", variant: "destructive" })
    }
  }

  const handleAddMatch = async () => {
    if (!newMatch.home_team_id || !newMatch.away_team_id || !newMatch.match_date) {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" })
      return
    }
    try {
      await addMatch({
        home_team_id: Number.parseInt(newMatch.home_team_id),
        away_team_id: Number.parseInt(newMatch.away_team_id),
        match_date: newMatch.match_date,
        match_time: newMatch.match_time || "20:00",
        field: newMatch.field,
        round: Number.parseInt(newMatch.round),
        group_id: null,
        tournament_id: TOURNAMENT_ID,
      })
      toast({ title: "Éxito", description: "Partido agregado correctamente" })
      setNewMatch({
        home_team_id: "",
        away_team_id: "",
        match_date: "",
        match_time: "",
        field: "",
        round: "1",
      })
      loadMatches()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el partido", variant: "destructive" })
    }
  }

  const handleDeleteMatch = async (id: number) => {
    try {
      await deleteMatch(id)
      toast({ title: "Éxito", description: "Partido eliminado correctamente" })
      loadMatches()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el partido", variant: "destructive" })
    }
  }

  const handleUpdateMatchResult = async () => {
    if (!matchResult.match_id || matchResult.home_score === "" || matchResult.away_score === "") {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" })
      return
    }
    setSelectedMatchId(Number.parseInt(matchResult.match_id))
    setShowResultConfirm(true)
  }

  const confirmUpdateResult = async () => {
    try {
      await updateMatchResult(
        Number.parseInt(matchResult.match_id),
        Number.parseInt(matchResult.home_score),
        Number.parseInt(matchResult.away_score),
      )
      toast({ title: "Éxito", description: "Resultado actualizado correctamente" })
      setMatchResult({ match_id: "", home_score: "", away_score: "" })
      setShowResultConfirm(false)
      setSelectedMatchId(null)
      loadMatches()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el resultado", variant: "destructive" })
    }
  }

  const handleAddNews = async () => {
    if (!newNewsItem.title || !newNewsItem.content) {
      toast({ title: "Error", description: "Título y contenido son requeridos", variant: "destructive" })
      return
    }
    try {
      await addNews({ ...newNewsItem, tournament_id: TOURNAMENT_ID })
      toast({ title: "Éxito", description: "Noticia agregada correctamente" })
      setNewNewsItem({ title: "", content: "", image_url: "" })
      loadNews()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar la noticia", variant: "destructive" })
    }
  }

  const handleDeleteNews = async (id: number) => {
    try {
      await deleteNews(id)
      toast({ title: "Éxito", description: "Noticia eliminada correctamente" })
      loadNews()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la noticia", variant: "destructive" })
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-pink-600/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-pink-600">
            <Settings className="w-6 h-6" />
            Admin SuperLiga Femenina
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
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full bg-pink-600 hover:bg-pink-700">
            Ingresar
          </Button>
          <div className="text-center">
            <Link href="/admin/libertadores" className="text-sm text-pink-600 hover:underline">
              Ir a Admin Copa Libertadores
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-pink-400">
              <Trophy className="w-8 h-8" />
              Panel de Administración - SuperLiga Femenina
            </CardTitle>
            <CardDescription className="text-gray-300">
              Gestiona equipos, jugadoras, partidos y noticias de la SuperLiga Femenina
            </CardDescription>
            <div className="mt-4">
              <Link href="/admin/libertadores">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  Ir a Admin Copa Libertadores
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-700/50 p-1 h-auto gap-2">
            <TabsTrigger value="teams" className="data-[state=active]:bg-pink-600 py-3">
              <Users className="w-4 h-4 mr-2" />
              Equipos
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-pink-600 py-3">
              <Users className="w-4 h-4 mr-2" />
              Jugadoras
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-pink-600 py-3">
              <Calendar className="w-4 h-4 mr-2" />
              Partidos
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-pink-600 py-3" onClick={loadNews}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Noticias
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Agregar Equipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Equipo</Label>
                    <Input
                      placeholder="Nombre del equipo"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL del Logo</Label>
                    <Input
                      placeholder="URL del logo"
                      value={newTeam.logo_url}
                      onChange={(e) => setNewTeam({ ...newTeam, logo_url: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddTeam} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Equipo
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Lista de Equipos ({teams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTeams ? (
                  <p className="text-center text-muted-foreground">Cargando equipos...</p>
                ) : teams.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay equipos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {team.logo_url && (
                            <img
                              src={team.logo_url || "/placeholder.svg"}
                              alt={team.name}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <Button
                          onClick={() => handleDeleteTeam(team.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Agregar Jugadora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Jugadora</Label>
                    <Input
                      placeholder="Nombre completo"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Equipo</Label>
                    <Select
                      value={newPlayer.team_id}
                      onValueChange={(value) => setNewPlayer({ ...newPlayer, team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Posición</Label>
                    <Input
                      placeholder="Ej: Delantera, Mediocampista"
                      value={newPlayer.position}
                      onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      type="number"
                      placeholder="Número de camiseta"
                      value={newPlayer.number}
                      onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddPlayer} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Jugadora
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Lista de Jugadoras ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlayers ? (
                  <p className="text-center text-muted-foreground">Cargando jugadoras...</p>
                ) : players.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay jugadoras registradas</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {player.name} {player.number ? `#${player.number}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {player.teams?.name} {player.position ? `• ${player.position}` : ""}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeletePlayer(player.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Agregar Partido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipo Local</Label>
                    <Select
                      value={newMatch.home_team_id}
                      onValueChange={(value) => setNewMatch({ ...newMatch, home_team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo local" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Equipo Visitante</Label>
                    <Select
                      value={newMatch.away_team_id}
                      onValueChange={(value) => setNewMatch({ ...newMatch, away_team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo visitante" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jornada</Label>
                    <Select
                      value={newMatch.round}
                      onValueChange={(value) => setNewMatch({ ...newMatch, round: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((round) => (
                          <SelectItem key={round} value={round.toString()}>
                            Jornada {round}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={newMatch.match_date}
                      onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={newMatch.match_time}
                      onChange={(e) => setNewMatch({ ...newMatch, match_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cancha</Label>
                    <Input
                      placeholder="Nombre de la cancha"
                      value={newMatch.field}
                      onChange={(e) => setNewMatch({ ...newMatch, field: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddMatch} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Partido
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Actualizar Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label>Partido</Label>
                    <Select
                      value={matchResult.match_id}
                      onValueChange={(value) => setMatchResult({ ...matchResult, match_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((match) => (
                          <SelectItem key={match.id} value={match.id.toString()}>
                            {match.home_team?.name} vs {match.away_team?.name} - Jornada {match.round}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Goles Local</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={matchResult.home_score}
                      onChange={(e) => setMatchResult({ ...matchResult, home_score: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goles Visitante</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={matchResult.away_score}
                      onChange={(e) => setMatchResult({ ...matchResult, away_score: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateMatchResult} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700">
                  Actualizar Resultado
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Lista de Partidos ({matches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMatches ? (
                  <p className="text-center text-muted-foreground">Cargando partidos...</p>
                ) : matches.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay partidos registrados</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {match.home_team?.name} vs {match.away_team?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Jornada {match.round} • {match.match_date}
                            {match.played && (
                              <span className="ml-2 text-pink-400">
                                ({match.home_score} - {match.away_score})
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeleteMatch(match.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Agregar Noticia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      placeholder="Título de la noticia"
                      value={newNewsItem.title}
                      onChange={(e) => setNewNewsItem({ ...newNewsItem, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenido</Label>
                    <Textarea
                      placeholder="Contenido de la noticia"
                      value={newNewsItem.content}
                      onChange={(e) => setNewNewsItem({ ...newNewsItem, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL de Imagen</Label>
                    <Input
                      placeholder="URL de la imagen"
                      value={newNewsItem.image_url}
                      onChange={(e) => setNewNewsItem({ ...newNewsItem, image_url: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddNews} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Noticia
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur border-pink-600/30">
              <CardHeader>
                <CardTitle className="text-pink-400">Lista de Noticias ({newsList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNews ? (
                  <p className="text-center text-muted-foreground">Cargando noticias...</p>
                ) : newsList.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay noticias registradas</p>
                ) : (
                  <div className="space-y-2">
                    {newsList.map((news) => (
                      <div
                        key={news.id}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{news.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteNews(news.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog */}
      <Dialog open={showResultConfirm} onOpenChange={setShowResultConfirm}>
        <DialogContent className="bg-gray-800 border-pink-600/30">
          <DialogHeader>
            <DialogTitle className="text-pink-400">Confirmar Resultado</DialogTitle>
            <DialogDescription className="text-gray-300">
              ¿Confirmas que el resultado es correcto? Esto actualizará las estadísticas y la tabla de posiciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmUpdateResult} className="bg-pink-600 hover:bg-pink-700">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
