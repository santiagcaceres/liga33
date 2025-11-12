"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, UserPlus, Calendar, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTeamsByTournament, createTeam, updateTeam, deleteTeam } from "@/lib/actions/teams"
import { getPlayersByTournament, createPlayer, updatePlayer, deletePlayer } from "@/lib/actions/players"
import { getMatchesByTournament, createMatch, updateMatchResult } from "@/lib/actions/matches"
import { addGoal, deleteGoal, getMatchGoals } from "@/lib/actions/goals"
import { addCard, deleteCard, getMatchCards } from "@/lib/actions/cards"

export default function AdminFemenina() {
  const { toast } = useToast()
  const TOURNAMENT_ID = 2 // SuperLiga Femenina

  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)

  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const [matchGoals, setMatchGoals] = useState<any[]>([])
  const [matchCards, setMatchCards] = useState<any[]>([])
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<any[]>([])
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<any[]>([])

  const [viewMode, setViewMode] = useState<"all" | "round">("all")
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [teamsData, playersData, matchesData] = await Promise.all([
        getTeamsByTournament(TOURNAMENT_ID),
        getPlayersByTournament(TOURNAMENT_ID),
        getMatchesByTournament(TOURNAMENT_ID),
      ])

      setTeams(teamsData)
      setPlayers(playersData)
      setMatches(matchesData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      await createTeam(formData)
      toast({
        title: "Éxito",
        description: "Equipo creado correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      setShowTeamForm(false)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeam) return

    const formData = new FormData(e.currentTarget)

    try {
      await updateTeam(editingTeam.id, formData)
      toast({
        title: "Éxito",
        description: "Equipo actualizado correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      setEditingTeam(null)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return

    try {
      await deleteTeam(id)
      toast({
        title: "Éxito",
        description: "Equipo eliminado correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleCreatePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      const result = await createPlayer(formData)
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Jugadora creada correctamente",
          className: "border-pink-500/50 bg-gray-900 text-white",
        })
        setShowPlayerForm(false)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-pink-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleUpdatePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPlayer) return

    const formData = new FormData(e.currentTarget)

    try {
      await updatePlayer(editingPlayer.id, formData)
      toast({
        title: "Éxito",
        description: "Jugadora actualizada correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      setEditingPlayer(null)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleDeletePlayer = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta jugadora?")) return

    try {
      await deletePlayer(id)
      toast({
        title: "Éxito",
        description: "Jugadora eliminada correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleUpdateResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.currentTarget)
    const homeScore = Number.parseInt(formData.get("home_score") as string)
    const awayScore = Number.parseInt(formData.get("away_score") as string)

    try {
      const result = await updateMatchResult(selectedMatch.id, homeScore, awayScore, [], [])
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Resultado actualizado correctamente",
          className: "border-pink-500/50 bg-gray-900 text-white",
        })
        setShowResultForm(false)
        setSelectedMatch(null)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-pink-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const loadMatchDetails = async (match: any) => {
    setSelectedMatch(match)
    setShowResultForm(true)

    try {
      const [goals, cards, homePlayers, awayPlayers] = await Promise.all([
        getMatchGoals(match.id),
        getMatchCards(match.id),
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.home_team_id),
        ),
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.away_team_id),
        ),
      ])

      setMatchGoals(goals)
      setMatchCards(cards)
      setHomeTeamPlayers(homePlayers)
      setAwayTeamPlayers(awayPlayers)
    } catch (error) {
      console.error("[v0] Error loading match details:", error)
    }
  }

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.currentTarget)
    formData.append("match_id", selectedMatch.id.toString())

    try {
      await addGoal(formData)
      toast({
        title: "Éxito",
        description: "Gol agregado correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadMatchDetails(selectedMatch)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm("¿Eliminar este gol?")) return

    try {
      await deleteGoal(goalId)
      toast({
        title: "Éxito",
        description: "Gol eliminado correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadMatchDetails(selectedMatch)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.currentTarget)
    formData.append("match_id", selectedMatch.id.toString())

    try {
      await addCard(formData)
      toast({
        title: "Éxito",
        description: "Tarjeta agregada correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadMatchDetails(selectedMatch)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("¿Eliminar esta tarjeta?")) return

    try {
      await deleteCard(cardId)
      toast({
        title: "Éxito",
        description: "Tarjeta eliminada correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      loadMatchDetails(selectedMatch)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const handleCreateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())
    formData.append("group_id", "0")

    try {
      const result = await createMatch(formData)
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Partido creado correctamente",
          className: "border-pink-500/50 bg-gray-900 text-white",
        })
        setShowMatchForm(false)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-pink-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    }
  }

  const filteredMatches = matches.filter((match) => {
    if (viewMode === "round" && selectedRound) {
      return match.round === selectedRound
    }
    return true
  })

  const uniqueRounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
              Admin: SuperLiga Femenina
            </h1>
            <p className="text-sm text-gray-400 mt-1">Formato: Todos contra Todos</p>
          </div>
        </div>
        <Link href="/admin/libertadores">
          <Button
            variant="outline"
            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
          >
            Cambiar a Libertadores
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-pink-500/50 bg-gradient-to-br from-gray-800 to-gray-900">
        <CardContent className="p-6">
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
              <TabsTrigger value="teams">
                <Users className="w-4 h-4 mr-2" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="players">
                <UserPlus className="w-4 h-4 mr-2" />
                Jugadoras
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Calendar className="w-4 h-4 mr-2" />
                Partidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-pink-500">Equipos ({teams.length})</h3>
                <Button onClick={() => setShowTeamForm(!showTeamForm)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Equipo
                </Button>
              </div>

              {showTeamForm && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Crear Equipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateTeam} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre del Equipo</Label>
                        <Input id="name" name="name" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="logo">Logo del Equipo</Label>
                        <Input
                          id="logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          className="bg-gray-800 border-gray-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">Selecciona una imagen desde tu computadora</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Crear
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowTeamForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {editingTeam && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Editar Equipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateTeam} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Nombre del Equipo</Label>
                        <Input
                          id="edit-name"
                          name="name"
                          defaultValue={editingTeam.name}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-logo">Logo del Equipo</Label>
                        {editingTeam.logo_url && (
                          <div className="mb-2">
                            <img
                              src={editingTeam.logo_url || "/placeholder.svg"}
                              alt="Logo actual"
                              className="w-16 h-16 object-contain border border-gray-700 rounded p-1"
                            />
                            <p className="text-xs text-gray-400 mt-1">Logo actual</p>
                          </div>
                        )}
                        <Input
                          id="edit-logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          className="bg-gray-800 border-gray-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Selecciona una nueva imagen o déjalo vacío para mantener el actual
                        </p>
                        <input type="hidden" name="logo_url" value={editingTeam.logo_url || ""} />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Guardar
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingTeam(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
                  <p>Cargando equipos...</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay equipos registrados</p>
                  <p className="text-sm mt-2">Crea tu primer equipo para comenzar</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {teams.map((team) => (
                    <div key={team.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {team.logo_url && (
                          <img
                            src={team.logo_url || "/placeholder.svg"}
                            alt={team.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        )}
                        <span className="text-white font-medium">{team.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTeam(team)}
                          className="border-pink-500/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTeam(team.id)}
                          className="border-red-500/50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="players" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-pink-500">Jugadoras ({players.length})</h3>
                <Button onClick={() => setShowPlayerForm(!showPlayerForm)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Jugadora
                </Button>
              </div>

              {showPlayerForm && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Crear Jugadora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePlayer} className="space-y-4">
                      <div>
                        <Label htmlFor="player-name">Nombre de la Jugadora</Label>
                        <Input id="player-name" name="name" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="cedula">Cédula</Label>
                        <Input id="cedula" name="cedula" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="number">Número de Camiseta</Label>
                        <Input
                          id="number"
                          name="number"
                          type="number"
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="team_id">Equipo</Label>
                        <Select name="team_id" required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
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
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Crear
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowPlayerForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {editingPlayer && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Editar Jugadora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePlayer} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-player-name">Nombre de la Jugadora</Label>
                        <Input
                          id="edit-player-name"
                          name="name"
                          defaultValue={editingPlayer.name}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-cedula">Cédula</Label>
                        <Input
                          id="edit-cedula"
                          name="cedula"
                          defaultValue={editingPlayer.cedula}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-number">Número de Camiseta</Label>
                        <Input
                          id="edit-number"
                          name="number"
                          type="number"
                          defaultValue={editingPlayer.number}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-team_id">Equipo</Label>
                        <Select name="team_id" defaultValue={editingPlayer.team_id.toString()} required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
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
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Guardar
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingPlayer(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
                  <p>Cargando jugadoras...</p>
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay jugadoras registradas</p>
                  <p className="text-sm mt-2">Crea tu primera jugadora para comenzar</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{player.name}</p>
                        <p className="text-sm text-gray-400">
                          #{player.number} - {player.teams?.name} - CI: {player.cedula}
                        </p>
                        <p className="text-xs text-gray-500">
                          Goles: {player.goals} | Amarillas: {player.yellow_cards} | Rojas: {player.red_cards}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPlayer(player)}
                          className="border-pink-500/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePlayer(player.id)}
                          className="border-red-500/50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matches" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-pink-500">Partidos ({matches.length})</h3>
                <Button onClick={() => setShowMatchForm(!showMatchForm)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Partido
                </Button>
              </div>

              {showMatchForm && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Crear Partido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateMatch} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="home_team_id">Equipo Local</Label>
                          <Select name="home_team_id" required>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Seleccionar" />
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
                        <div>
                          <Label htmlFor="away_team_id">Equipo Visitante</Label>
                          <Select name="away_team_id" required>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Seleccionar" />
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="match_date">Fecha</Label>
                          <Input
                            id="match_date"
                            name="match_date"
                            type="date"
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="match_time">Hora</Label>
                          <Input
                            id="match_time"
                            name="match_time"
                            type="time"
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="round">Fecha/Jornada</Label>
                          <Input
                            id="round"
                            name="round"
                            type="number"
                            min="1"
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="field">Cancha</Label>
                          <Input
                            id="field"
                            name="field"
                            placeholder="Ej: Cancha 1"
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Crear Partido
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowMatchForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className="border-pink-500/30">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Label className="text-pink-500">Filtrar por:</Label>
                    <Button
                      size="sm"
                      variant={viewMode === "all" ? "default" : "outline"}
                      onClick={() => {
                        setViewMode("all")
                        setSelectedRound(null)
                      }}
                      className={viewMode === "all" ? "bg-pink-600 hover:bg-pink-700" : ""}
                    >
                      Todos
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "round" ? "default" : "outline"}
                      onClick={() => setViewMode("round")}
                      className={viewMode === "round" ? "bg-pink-600 hover:bg-pink-700" : ""}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Por Fecha
                    </Button>

                    {viewMode === "round" && (
                      <Select
                        value={selectedRound?.toString()}
                        onValueChange={(value) => setSelectedRound(Number.parseInt(value))}
                      >
                        <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueRounds.map((round) => (
                            <SelectItem key={round} value={round.toString()}>
                              Fecha {round}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>

              {showResultForm && selectedMatch && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Asignar Resultado y Detalles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateResult} className="space-y-4">
                      <div className="text-white text-center mb-4">
                        <p className="font-semibold">
                          {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                        </p>
                        <p className="text-sm text-gray-400">{selectedMatch.match_date}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="home_score">{selectedMatch.home_team?.name}</Label>
                          <Input
                            id="home_score"
                            name="home_score"
                            type="number"
                            min="0"
                            defaultValue={selectedMatch.home_score}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="away_score">{selectedMatch.away_team?.name}</Label>
                          <Input
                            id="away_score"
                            name="away_score"
                            type="number"
                            min="0"
                            defaultValue={selectedMatch.away_score}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                          Guardar Resultado
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowResultForm(false)
                            setSelectedMatch(null)
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>

                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-pink-500 mb-3">Goles</h4>

                      {matchGoals.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {matchGoals.map((goal: any) => (
                            <div key={goal.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                              <span className="text-sm text-white">
                                {goal.players?.name} - Min {goal.minute || "?"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleAddGoal} className="grid grid-cols-3 gap-2">
                        <Select name="team_id" required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={selectedMatch.home_team_id.toString()}>
                              {selectedMatch.home_team?.name}
                            </SelectItem>
                            <SelectItem value={selectedMatch.away_team_id.toString()}>
                              {selectedMatch.away_team?.name}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select name="player_id" required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Jugadora" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-pink-500">
                              {selectedMatch.home_team?.name}
                            </div>
                            {homeTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-pink-500 border-t">
                              {selectedMatch.away_team?.name}
                            </div>
                            {awayTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Input
                            name="minute"
                            type="number"
                            min="0"
                            max="120"
                            placeholder="Min"
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button type="submit" size="sm" className="bg-pink-600 hover:bg-pink-700">
                            +
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-pink-500 mb-3">Tarjetas Amarillas</h4>

                      {matchCards.filter((c: any) => c.card_type === "yellow").length > 0 && (
                        <div className="mb-4 space-y-2">
                          {matchCards
                            .filter((c: any) => c.card_type === "yellow")
                            .map((card: any) => (
                              <div key={card.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span className="text-sm text-white">
                                  {card.players?.name} - Min {card.minute || "?"}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCard(card.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}

                      <form onSubmit={handleAddCard} className="grid grid-cols-3 gap-2">
                        <input type="hidden" name="card_type" value="yellow" />
                        <Select name="team_id" required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={selectedMatch.home_team_id.toString()}>
                              {selectedMatch.home_team?.name}
                            </SelectItem>
                            <SelectItem value={selectedMatch.away_team_id.toString()}>
                              {selectedMatch.away_team?.name}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select name="player_id" required>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Jugadora" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-pink-500">
                              {selectedMatch.home_team?.name}
                            </div>
                            {homeTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-pink-500 border-t">
                              {selectedMatch.away_team?.name}
                            </div>
                            {awayTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Input
                            name="minute"
                            type="number"
                            min="0"
                            max="120"
                            placeholder="Min"
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button type="submit" size="sm" className="bg-pink-600 hover:bg-pink-700">
                            +
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
                    <p>Cargando partidos...</p>
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No hay partidos{viewMode !== "all" ? " en este filtro" : ""}
                  </div>
                ) : (
                  filteredMatches.map((match) => (
                    <div key={match.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {match.home_team?.name} vs {match.away_team?.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {match.played ? `Resultado: ${match.home_score} - ${match.away_score}` : "Por jugar"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fecha {match.round} - {match.match_date}
                            {match.field && ` - ${match.field}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => loadMatchDetails(match)}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          {match.played ? "Editar" : "Asignar"} Resultado
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
