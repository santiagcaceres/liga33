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
import { Trophy, Users, UserPlus, Calendar, Plus, Pencil, Trash2, X, Loader2, Coffee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTeamsByTournament, createTeam, updateTeam, deleteTeam } from "@/lib/actions/teams"
import { getPlayersByTournament, createPlayer, updatePlayer, deletePlayer } from "@/lib/actions/players"
import { getMatchesByTournament, createMatch, updateMatchResult } from "@/lib/actions/matches"
import { createByeWeek, getByeWeeks, deleteByeWeek } from "@/lib/actions/bye-weeks"
// Removed: import { getGroupsByTournament } from "@/lib/actions/groups" // Import getGroupsByTournament

export default function AdminFemenina() {
  const { toast } = useToast()
  const TOURNAMENT_ID = 2 // SuperLiga Femenina

  // Removed: const [defaultGroupId, setDefaultGroupId] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)
  const [isUpdatingPlayer, setIsUpdatingPlayer] = useState(false)
  const [isCreatingMatch, setIsCreatingMatch] = useState(false)
  const [isCreatingByeWeek, setIsCreatingByeWeek] = useState(false)

  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [byeWeeks, setByeWeeks] = useState<any[]>([])

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [showByeWeekForm, setShowByeWeekForm] = useState(false)

  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const [localGoals, setLocalGoals] = useState<any[]>([])
  const [localCards, setLocalCards] = useState<any[]>([])

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<any[]>([])
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<any[]>([])

  const [viewMode, setViewMode] = useState<"all" | "round">("all")
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  const [playerTeamFilter, setPlayerTeamFilter] = useState<string>("all")
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>("")

  const filteredPlayers = players.filter((player) => {
    const matchesTeam = playerTeamFilter === "all" || player.team_id.toString() === playerTeamFilter
    const matchesSearch =
      player.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) || player.cedula.includes(playerSearchQuery)
    return matchesTeam && matchesSearch
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    console.log("[v0] 🚀 Admin Femenina: Loading all data in parallel...")
    const startTime = Date.now()

    try {
      const [teamsData, playersData, matchesData, byeWeeksData] = await Promise.all([
        getTeamsByTournament(TOURNAMENT_ID),
        getPlayersByTournament(TOURNAMENT_ID),
        getMatchesByTournament(TOURNAMENT_ID),
        getByeWeeks(TOURNAMENT_ID),
      ])

      setTeams(teamsData)
      setPlayers(playersData)
      setMatches(matchesData)
      setByeWeeks(byeWeeksData)

      const endTime = Date.now()
      console.log(`[v0] ✅ Admin Femenina data loaded in ${endTime - startTime}ms`)
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
    setIsCreatingTeam(true) // Show loading state
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
    } finally {
      setIsCreatingTeam(false) // Hide loading state
    }
  }

  const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeam) return

    setIsUpdatingTeam(true) // Show loading state
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
    } finally {
      setIsUpdatingTeam(false) // Hide loading state
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
    setIsCreatingPlayer(true) // Show loading state
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
    } finally {
      setIsCreatingPlayer(false) // Hide loading state
    }
  }

  const handleUpdatePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPlayer) return

    setIsUpdatingPlayer(true) // Show loading state
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
    } finally {
      setIsUpdatingPlayer(false) // Hide loading state
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
      const [homePlayers, awayPlayers] = await Promise.all([
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.home_team_id),
        ),
        getPlayersByTournament(TOURNAMENT_ID).then((allPlayers) =>
          allPlayers.filter((p: any) => p.team_id === match.away_team_id),
        ),
      ])

      setLocalGoals(match.goals || [])
      setLocalCards(match.cards || [])
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
    const selects = e.currentTarget.querySelectorAll('button[role="combobox"]')
    selects.forEach((select) => {
      const valueSpan = select.querySelector("span")
      if (valueSpan) valueSpan.textContent = select === selects[0] ? "Equipo" : "Jugadora"
    })
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
    const selects = e.currentTarget.querySelectorAll('button[role="combobox"]')
    selects.forEach((select) => {
      const valueSpan = select.querySelector("span")
      if (valueSpan) valueSpan.textContent = select === selects[0] ? "Equipo" : "Jugadora"
    })
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
          className: "border-pink-500/50 bg-gray-900 text-white",
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

  const handleCreateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] ============ HANDLE CREATE MATCH START ============")

    // Removed group check - women's tournament doesn't use groups
    // if (!defaultGroupId) {
    //   toast({
    //     title: "Error",
    //     description: "No se pudo obtener el grupo por defecto. Ejecuta el script 010_create_femenino_group.sql",
    //     variant: "destructive",
    //     className: "border-pink-500/50 bg-gray-900",
    //   })
    //   console.error("[v0] ❌ Cannot create match: defaultGroupId is null")
    //   return
    // }

    setIsCreatingMatch(true) // Show loading state
    const formData = new FormData(e.currentTarget)

    console.log("[v0] Form data before append:", {
      home_team_id: formData.get("home_team_id"),
      away_team_id: formData.get("away_team_id"),
      round: formData.get("round"),
      match_date: formData.get("match_date"),
      match_time: formData.get("match_time"),
      field: formData.get("field"),
    })

    formData.append("tournament_id", TOURNAMENT_ID.toString())
    formData.append("group_id", "0")

    console.log("[v0] Form data after append:", {
      home_team_id: formData.get("home_team_id"),
      away_team_id: formData.get("away_team_id"),
      group_id: formData.get("group_id"),
      tournament_id: formData.get("tournament_id"),
      round: formData.get("round"),
      match_date: formData.get("match_date"),
      match_time: formData.get("match_time"),
      field: formData.get("field"),
    })

    try {
      console.log("[v0] Calling createMatch...")
      const result = await createMatch(formData)
      console.log("[v0] createMatch result:", result)

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Partido creado correctamente",
          className: "border-pink-500/50 bg-gray-900 text-white",
        })
        setShowMatchForm(false)
        await loadAllData()
        console.log("[v0] ✅ Match created and data reloaded")
      } else {
        console.error("[v0] ❌ createMatch failed:", result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          className: "border-pink-500/50 bg-gray-900",
        })
      }
    } catch (error: any) {
      console.error("[v0] ❌ Exception in handleCreateMatch:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    } finally {
      setIsCreatingMatch(false) // Hide loading state
      console.log("[v0] ============ HANDLE CREATE MATCH END ============")
    }
  }

  const handleCreateByeWeek = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreatingByeWeek(true)
    const formData = new FormData(e.currentTarget)
    formData.append("tournament_id", TOURNAMENT_ID.toString())

    try {
      await createByeWeek(formData)
      toast({
        title: "Éxito",
        description: "Fecha libre creada correctamente",
        className: "border-pink-500/50 bg-gray-900 text-white",
      })
      setShowByeWeekForm(false)
      loadAllData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        className: "border-pink-500/50 bg-gray-900",
      })
    } finally {
      setIsCreatingByeWeek(false)
    }
  }

  const handleDeleteByeWeek = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta fecha libre?")) return

    try {
      await deleteByeWeek(id)
      toast({
        title: "Éxito",
        description: "Fecha libre eliminada correctamente",
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
            <TabsList className="grid w-full grid-cols-4 bg-gray-700/50">
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
              <TabsTrigger value="byeweeks">
                <Coffee className="w-4 h-4 mr-2" />
                Fechas Libres
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
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isCreatingTeam}>
                          {isCreatingTeam ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear"
                          )}
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
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isUpdatingTeam}>
                          {isUpdatingTeam ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar"
                          )}
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
                <h3 className="text-xl font-semibold text-pink-500">Jugadoras ({filteredPlayers.length})</h3>
                <Button onClick={() => setShowPlayerForm(!showPlayerForm)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Jugadora
                </Button>
              </div>

              {/* Filter players by team and search query */}
              <Card className="border-pink-500/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-search" className="text-pink-500 mb-2 block">
                        Buscar Jugadora
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
                      <Label htmlFor="player-team-filter" className="text-pink-500 mb-2 block">
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
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isCreatingPlayer}>
                          {isCreatingPlayer ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear"
                          )}
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
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isUpdatingPlayer}>
                          {isUpdatingPlayer ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar"
                          )}
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
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {players.length === 0 ? (
                    <>
                      <p>No hay jugadoras registradas</p>
                      <p className="text-sm mt-2">Crea tu primera jugadora para comenzar</p>
                    </>
                  ) : (
                    <p>No se encontraron jugadoras con los filtros aplicados</p>
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
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isCreatingMatch}>
                          {isCreatingMatch ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creando Partido...
                            </>
                          ) : (
                            "Crear Partido"
                          )}
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
                    <CardTitle className="text-pink-500">Asignar Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-white text-center">
                      <p className="font-semibold">
                        {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                      </p>
                      <p className="text-sm text-gray-400">{selectedMatch.match_date}</p>
                      <div className="text-4xl font-bold text-pink-500 mt-4">
                        {homeScore} - {awayScore}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Marcador calculado automáticamente según los goles</p>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-pink-500 mb-3">Goles ({localGoals.length})</h4>

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

                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold text-pink-500 mb-3">
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

                    <div className="border-t border-gray-700 pt-4 flex gap-2">
                      <Button onClick={handleSaveResult} className="flex-1 bg-pink-600 hover:bg-pink-700">
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
                            {match.played ? `Resultado: ${match.home_score} - ${match.away_score}` : "VS"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fecha {match.round} - {match.match_date}
                            {match.field && ` - ${match.field}`}
                          </p>
                        </div>
                        {!match.played ? (
                          <Button
                            size="sm"
                            onClick={() => loadMatchDetails(match)}
                            className="bg-pink-600 hover:bg-pink-700"
                          >
                            Asignar Resultado
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadMatchDetails(match)}
                              className="border-pink-500/50 text-pink-500"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="byeweeks" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-pink-500">Fechas Libres ({byeWeeks.length})</h3>
                <Button onClick={() => setShowByeWeekForm(!showByeWeekForm)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Fecha Libre
                </Button>
              </div>

              {showByeWeekForm && (
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Crear Fecha Libre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateByeWeek} className="space-y-4">
                      <div>
                        <Label htmlFor="bye_team_id">Equipo</Label>
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
                      <div>
                        <Label htmlFor="bye_round">Fecha/Jornada</Label>
                        <Input
                          id="bye_round"
                          name="round"
                          type="number"
                          min="1"
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isCreatingByeWeek}>
                          {isCreatingByeWeek ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear"
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowByeWeekForm(false)}>
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
                  <p>Cargando fechas libres...</p>
                </div>
              ) : byeWeeks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay fechas libres registradas</p>
                  <p className="text-sm mt-2">Crea la primera fecha libre para comenzar</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {byeWeeks.map((byeWeek: any) => (
                    <div key={byeWeek.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Coffee className="w-6 h-6 text-pink-500" />
                        <div>
                          <p className="text-white font-medium">{byeWeek.teams?.name}</p>
                          <p className="text-sm text-gray-400">Fecha {byeWeek.round} - Descanso</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteByeWeek(byeWeek.id)}
                        className="border-red-500/50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
