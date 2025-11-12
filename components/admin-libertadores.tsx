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
import { Trophy, Users, UserPlus, Calendar, Plus, Pencil, Trash2, Eye, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTeamsByTournament, createTeam, updateTeam, deleteTeam } from "@/lib/actions/teams"
import { getPlayersByTournament, createPlayer, updatePlayer, deletePlayer } from "@/lib/actions/players"
import { getMatchesByTournament, createMatch, updateMatchResult } from "@/lib/actions/matches"
import { getGroupsByTournament, getTeamsByGroup } from "@/lib/actions/groups"

export default function AdminLibertadores() {
  const { toast } = useToast()
  const TOURNAMENT_ID = 1 // Copa Libertadores

  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)

  const [viewMode, setViewMode] = useState<"all" | "group" | "round">("all")
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const [localGoals, setLocalGoals] = useState<any[]>([])
  const [localCards, setLocalCards] = useState<any[]>([])

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<any[]>([])
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<any[]>([])

  const [teamsInGroup, setTeamsInGroup] = useState<any[]>([])

  const [playerTeamFilter, setPlayerTeamFilter] = useState<string>("all")
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>("")

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [teamsData, playersData, matchesData, groupsData] = await Promise.all([
        getTeamsByTournament(TOURNAMENT_ID),
        getPlayersByTournament(TOURNAMENT_ID),
        getMatchesByTournament(TOURNAMENT_ID),
        getGroupsByTournament(TOURNAMENT_ID),
      ])

      setTeams(teamsData)
      setPlayers(playersData)
      setMatches(matchesData)
      setGroups(groupsData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      const result = await createMatch(formData)
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Partido creado correctamente",
          className: "border-yellow-500/50 bg-gray-900 text-white",
        })
        setShowMatchForm(false)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-yellow-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  const loadTeamsInGroup = async (groupId: number) => {
    try {
      const teamsData = await getTeamsByGroup(groupId)
      setTeamsInGroup(teamsData)
    } catch (error) {
      console.error("[v0] Error loading teams in group:", error)
    }
  }

  const filteredMatches = matches.filter((match) => {
    if (viewMode === "group" && selectedGroup) {
      return match.group_id === selectedGroup
    }
    if (viewMode === "round" && selectedRound) {
      return match.round === selectedRound
    }
    return true
  })

  const uniqueRounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      await createTeam(formData)
      toast({
        title: "Éxito",
        description: "Equipo creado correctamente",
        className: "border-yellow-500/50 bg-gray-900 text-white",
      })
      setShowTeamForm(false)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleUpdateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingTeam) return

    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      await updateTeam(editingTeam.id, formData)
      toast({
        title: "Éxito",
        description: "Equipo actualizado correctamente",
        className: "border-yellow-500/50 bg-gray-900 text-white",
      })
      setEditingTeam(null)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleDeleteTeam(id: number) {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return

    try {
      await deleteTeam(id)
      toast({
        title: "Éxito",
        description: "Equipo eliminado correctamente",
        className: "border-yellow-500/50 bg-gray-900 text-white",
      })
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleCreatePlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      const result = await createPlayer(formData)
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Jugador creado correctamente",
          className: "border-yellow-500/50 bg-gray-900 text-white",
        })
        setShowPlayerForm(false)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-yellow-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleUpdatePlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingPlayer) return

    const formData = new FormData(e.currentTarget)

    try {
      await updatePlayer(editingPlayer.id, formData)
      toast({
        title: "Éxito",
        description: "Jugador actualizado correctamente",
        className: "border-yellow-500/50 bg-gray-900 text-white",
      })
      setEditingPlayer(null)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleDeletePlayer(id: number) {
    if (!confirm("¿Estás seguro de eliminar este jugador?")) return

    try {
      await deletePlayer(id)
      toast({
        title: "Éxito",
        description: "Jugador eliminado correctamente",
        className: "border-yellow-500/50 bg-gray-900 text-white",
      })
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  async function handleUpdateResult(e: React.FormEvent<HTMLFormElement>) {
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
          className: "border-yellow-500/50 bg-gray-900 text-white",
        })
        setShowResultForm(false)
        setSelectedMatch(null)
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-yellow-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  const loadMatchDetails = async (match: any) => {
    setSelectedMatch(match)
    setShowResultForm(true)

    try {
      const [homePlayers, awayPlayers] = await Promise.all([
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.home_team_id),
        ),
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.away_team_id),
        ),
      ])

      setLocalGoals([])
      setLocalCards([])
      setHomeTeamPlayers(homePlayers)
      setAwayTeamPlayers(awayPlayers)
    } catch (error) {
      console.error("[v0] Error loading match details:", error)
    }
  }

  const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.currentTarget)
    const teamId = Number.parseInt(formData.get("team_id") as string)
    const playerId = Number.parseInt(formData.get("player_id") as string)
    const minute = formData.get("minute") as string

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === playerId)

    const newGoal = {
      id: Date.now(), // Temporary ID
      team_id: teamId,
      player_id: playerId,
      minute: minute || null,
      players: { name: player?.name },
    }

    setLocalGoals([...localGoals, newGoal])
    e.currentTarget.reset()
  }

  const handleRemoveGoal = (goalId: number) => {
    setLocalGoals(localGoals.filter((g) => g.id !== goalId))
  }

  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.currentTarget)
    const teamId = Number.parseInt(formData.get("team_id") as string)
    const playerId = Number.parseInt(formData.get("player_id") as string)
    const minute = formData.get("minute") as string
    const cardType = formData.get("card_type") as string

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === playerId)

    const newCard = {
      id: Date.now(), // Temporary ID
      team_id: teamId,
      player_id: playerId,
      minute: minute || null,
      card_type: cardType,
      players: { name: player?.name },
    }

    setLocalCards([...localCards, newCard])
    e.currentTarget.reset()
  }

  const handleRemoveCard = (cardId: number) => {
    setLocalCards(localCards.filter((c) => c.id !== cardId))
  }

  const homeScore = localGoals.filter((g) => g.team_id === selectedMatch?.home_team_id).length
  const awayScore = localGoals.filter((g) => g.team_id === selectedMatch?.away_team_id).length

  async function handleSaveResult() {
    if (!selectedMatch) return

    console.log("[v0] Saving result with goals:", localGoals.length, "cards:", localCards.length)
    console.log("[v0] Calculated score:", homeScore, "-", awayScore)

    try {
      const result = await updateMatchResult(selectedMatch.id, homeScore, awayScore, localGoals, localCards)

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Resultado guardado correctamente",
          className: "border-yellow-500/50 bg-gray-900 text-white",
        })
        setShowResultForm(false)
        setSelectedMatch(null)
        setLocalGoals([])
        setLocalCards([])
        loadAllData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-yellow-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-yellow-500/50 bg-gray-900",
      })
    }
  }

  const filteredPlayers = players.filter((player) => {
    const matchesTeam = playerTeamFilter === "all" || player.team_id.toString() === playerTeamFilter
    const matchesSearch =
      player.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) || player.cedula.includes(playerSearchQuery)
    return matchesTeam && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              Admin: Copa Libertadores
            </h1>
            <p className="text-sm text-gray-400 mt-1">Formato: Grupos + Eliminatorias</p>
          </div>
        </div>
        <Link href="/admin/femenina">
          <Button variant="outline" className="border-pink-500/50 text-pink-500 hover:bg-pink-500/10 bg-transparent">
            Cambiar a Femenina
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-gray-800 to-gray-900">
        <CardContent className="p-6">
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
              <TabsTrigger value="teams">
                <Users className="w-4 h-4 mr-2" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="players">
                <UserPlus className="w-4 h-4 mr-2" />
                Jugadores
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Calendar className="w-4 h-4 mr-2" />
                Partidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-yellow-500">Equipos ({teams.length})</h3>
                <Button onClick={() => setShowTeamForm(!showTeamForm)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Equipo
                </Button>
              </div>

              {showTeamForm && (
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Crear Equipo</CardTitle>
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
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
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
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Editar Equipo</CardTitle>
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
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
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
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-3" />
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
                          className="border-yellow-500/50"
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
                <h3 className="text-xl font-semibold text-yellow-500">Jugadores ({filteredPlayers.length})</h3>
                <Button
                  onClick={() => setShowPlayerForm(!showPlayerForm)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Jugador
                </Button>
              </div>

              <Card className="border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-search" className="text-yellow-500 mb-2 block">
                        Buscar Jugador
                      </Label>
                      <Input
                        id="player-search"
                        placeholder="Buscar por nombre o cédula..."
                        value={playerSearchQuery}
                        onChange={(e) => setPlayerSearchQuery(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-team-filter" className="text-yellow-500 mb-2 block">
                        Filtrar por Equipo
                      </Label>
                      <Select value={playerTeamFilter} onValueChange={setPlayerTeamFilter}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Todos los equipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los equipos</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showPlayerForm && (
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Crear Jugador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePlayer} className="space-y-4">
                      <div>
                        <Label htmlFor="player-name">Nombre del Jugador</Label>
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
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
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
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Editar Jugador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePlayer} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-player-name">Nombre del Jugador</Label>
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
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
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
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-3" />
                  <p>Cargando jugadores...</p>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {players.length === 0 ? (
                    <>
                      <p>No hay jugadores registrados</p>
                      <p className="text-sm mt-2">Crea tu primer jugador para comenzar</p>
                    </>
                  ) : (
                    <p>No se encontraron jugadores con los filtros aplicados</p>
                  )}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredPlayers.map((player) => (
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
                          className="border-yellow-500/50"
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
                <h3 className="text-xl font-semibold text-yellow-500">Partidos ({matches.length})</h3>
                <Button onClick={() => setShowMatchForm(!showMatchForm)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Partido
                </Button>
              </div>

              {showMatchForm && (
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Crear Partido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateMatch} className="space-y-4">
                      <div>
                        <Label htmlFor="match-group_id">Grupo</Label>
                        <Select
                          name="group_id"
                          required
                          onValueChange={(value) => {
                            loadTeamsInGroup(Number.parseInt(value))
                          }}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Seleccionar grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                Grupo {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="home_team_id">Equipo Local</Label>
                          <Select name="home_team_id" required>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamsInGroup.map((tg) => (
                                <SelectItem key={tg.teams.id} value={tg.teams.id.toString()}>
                                  {tg.teams.name}
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
                              {teamsInGroup.map((tg) => (
                                <SelectItem key={tg.teams.id} value={tg.teams.id.toString()}>
                                  {tg.teams.name}
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
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
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

              <Card className="border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Label className="text-yellow-500">Filtrar por:</Label>
                    <Button
                      size="sm"
                      variant={viewMode === "all" ? "default" : "outline"}
                      onClick={() => {
                        setViewMode("all")
                        setSelectedGroup(null)
                        setSelectedRound(null)
                      }}
                      className={viewMode === "all" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    >
                      Todos
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "group" ? "default" : "outline"}
                      onClick={() => setViewMode("group")}
                      className={viewMode === "group" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Por Grupo
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "round" ? "default" : "outline"}
                      onClick={() => setViewMode("round")}
                      className={viewMode === "round" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Por Fecha
                    </Button>

                    {viewMode === "group" && (
                      <Select
                        value={selectedGroup?.toString()}
                        onValueChange={(value) => setSelectedGroup(Number.parseInt(value))}
                      >
                        <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              Grupo {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

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
                <Card className="border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Asignar Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-white text-center">
                      <p className="font-semibold">
                        {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedMatch.match_date} - Grupo {selectedMatch.copa_groups?.name}
                      </p>
                      <div className="text-4xl font-bold text-yellow-500 mt-4">
                        {homeScore} - {awayScore}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Marcador calculado automáticamente según los goles</p>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-yellow-500 mb-3">Goles ({localGoals.length})</h4>

                      {localGoals.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {localGoals.map((goal: any) => (
                            <div key={goal.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                              <span className="text-sm text-white">
                                {goal.players?.name} - Min {goal.minute || "?"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveGoal(goal.id)}
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
                            <SelectValue placeholder="Jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-yellow-500">
                              {selectedMatch.home_team?.name}
                            </div>
                            {homeTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-yellow-500 border-t">
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
                          <Button type="submit" size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                            +
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-yellow-500 mb-3">
                        Tarjetas Amarillas ({localCards.filter((c) => c.card_type === "yellow").length})
                      </h4>

                      {localCards.filter((c: any) => c.card_type === "yellow").length > 0 && (
                        <div className="mb-4 space-y-2">
                          {localCards
                            .filter((c: any) => c.card_type === "yellow")
                            .map((card: any) => (
                              <div key={card.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span className="text-sm text-white">
                                  {card.players?.name} - Min {card.minute || "?"}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveCard(card.id)}
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
                            <SelectValue placeholder="Jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-yellow-500">
                              {selectedMatch.home_team?.name}
                            </div>
                            {homeTeamPlayers.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} (#{player.number})
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-yellow-500 border-t">
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
                          <Button type="submit" size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                            +
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="border-t border-gray-700 pt-4 flex gap-2">
                      <Button onClick={handleSaveResult} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                        Guardar Resultado Completo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowResultForm(false)
                          setSelectedMatch(null)
                          setLocalGoals([])
                          setLocalCards([])
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-3" />
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
                            Fecha {match.round} - Grupo {match.copa_groups?.name} - {match.match_date}
                            {match.field && ` - ${match.field}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => loadMatchDetails(match)}
                          className="bg-yellow-600 hover:bg-yellow-700"
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
