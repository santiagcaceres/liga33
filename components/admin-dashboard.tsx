"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react" // Import Calendar icon

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
  Edit,
  X,
} from "lucide-react"
import { createTeam, deleteTeam, updateTeam, getTeams } from "@/lib/actions/teams" // Import updateTeam
import { createPlayer, deletePlayer, getPlayersByTournament, updatePlayer } from "@/lib/actions/players"
import { createNews, getNews, deleteNews } from "@/lib/actions/news"
import { useToast } from "@/hooks/use-toast"
import { createMatch, deleteMatch, updateMatchResult, getMatches } from "@/lib/actions/matches" // Import match actions
import MatchDetailsDisplay from "@/components/match-details-display" // Fixed import to match kebab-case filename
import { createClient } from "@/lib/supabase/client" // Fixed import path from utils to lib
import { getTournaments } from "@/lib/actions/tournaments"
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
import { createByeWeek, getByeWeeks, deleteByeWeek } from "@/lib/actions/bye-weeks"
import {
  getGroups,
  getStandingsByTournament,
  assignTeamToGroup,
  removeTeamFromGroup,
  createGroup,
  deleteGroup,
} from "@/lib/actions/groups"

interface Match {
  id: number
  round: number | string // Allow string for playoff rounds
  group: string
  home: string
  away: string
  date: string
  // Added properties for match creation and display
  group_id?: number
  home_team_id?: number
  away_team_id?: number
  match_date?: string
  match_time?: string // Added match_time
  field?: string // Added field
  home_score?: number
  away_score?: number
  played?: boolean
  home_team?: { name: string; id: number; ci: string } // Added CI to player interface for fetching
  away_team?: { name: string; id: number; ci: string } // Added CI to player interface for fetching
  copa_groups?: { name: string; id: number }
}

interface Team {
  id: number
  name: string
  coach: string
  logo_url?: string // Added logo_url to Team interface
  group_id?: string | number | null // Added group_id to Team interface, allow null
  tournament_id: number // Added tournament_id to Team interface
}

interface Player {
  id: number
  name: string
  cedula: string
  number: number
  team_id: number
  teams?: { name: string; id: number; tournament_id: number } // Added tournament_id to player's team relation
  goals?: number
  yellow_cards?: number
  red_cards?: number
  suspended?: boolean
}

interface News {
  id: number
  title: string
  content: string
  image_url?: string // Changed from image to image_url
  published_date?: string // Changed from date to published_date
  tournament_id?: number // Added tournament_id to News interface
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("results")
  const { toast } = useToast()

  const [selectedTournament, setSelectedTournament] = useState<number>(1) // Default: Copa Libertadores
  const [tournaments, setTournaments] = useState<any[]>([])
  const [tournamentTab, setTournamentTab] = useState<"libertadores" | "femenino">("libertadores") // 'libertadores' o 'femenino'

  const [showTournamentDialog, setShowTournamentDialog] = useState(false)
  const [pendingTournamentTab, setPendingTournamentTab] = useState<"libertadores" | "femenino">("libertadores")

  const [selectedRound, setSelectedRound] = useState("1")
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const [showDrawConfirm, setShowDrawConfirm] = useState(false)
  const [showResultConfirm, setShowResultConfirm] = useState(false)
  const [showDraw, setShowDraw] = useState(false)
  const [drawResults, setDrawResults] = useState<string[]>([])

  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image: "", // This will hold the data URL before appending to FormData
    date: new Date().toISOString().split("T")[0],
  })
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null)

  // Remove fixtures array as it's not used
  // const fixtures: Match[] = []

  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [homeGoals, setHomeGoals] = useState([{ player: "", minute: "" }])
  const [awayGoals, setAwayGoals] = useState([{ player: "", minute: "" }])
  const [homeYellowCards, setHomeYellowCards] = useState([{ player: "", minute: "" }])
  const [awayYellowCards, setAwayYellowCards] = useState([{ player: "", minute: "" }])
  const [homeRedCards, setHomeRedCards] = useState([{ player: "", minute: "" }])
  const [awayRedCards, setAwayRedCards] = useState([{ player: "", minute: "" }])

  const [newTeam, setNewTeam] = useState({ name: "", logo_url: "", group_id: "" }) // Added group_id to newTeam state
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [teamLogoFile, setTeamLogoFile] = useState<File | null>(null)

  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    team_id: "",
    cedula: "",
    number: "",
  })
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const [playerFilterTeam, setPlayerFilterTeam] = useState<string>("all")
  const [playerSearchTerm, setPlayerSearchTerm] = useState<string>("")

  const [newsList, setNewsList] = useState<News[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(false)

  const [groups, setGroups] = useState<{ id: number; name: string }[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState("")
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState("")
  const [groupStandings, setGroupStandings] = useState<any[]>([])

  const [matches, setMatches] = useState<any[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [newMatch, setNewMatch] = useState({
    group_id: "",
    home_team_id: "",
    away_team_id: "",
    round: "",
    match_date: "",
    match_time: "",
    field: "",
  })
  const [selectedGroupForMatch, setSelectedGroupForMatch] = useState("")

  // Add bye week management for femenina
  const [byeWeeks, setByeWeeks] = useState<any[]>([])
  const [newByeWeek, setNewByeWeek] = useState({
    team_id: "",
    round: "",
  })

  const confirmTournamentChange = async () => {
    console.log("[v0] ============ TOURNAMENT CHANGE START ============")
    console.log("[v0] Changing from", tournamentTab, "to", pendingTournamentTab)

    const newTournamentTab = pendingTournamentTab
    const newTournamentId = pendingTournamentTab === "libertadores" ? 1 : 2

    setShowTournamentDialog(false)

    console.log("[v0] Resetting all state...")

    // Reset form states
    setNewTeam({ name: "", logo_url: "", group_id: "" })
    setTeamLogoFile(null)
    setNewPlayer({ name: "", cedula: "", team_id: "", number: "" })
    setNewMatch({
      group_id: "",
      home_team_id: "",
      away_team_id: "",
      match_date: "",
      match_time: "",
      round: "",
      field: "",
    })

    // Reset selections
    setSelectedMatchId(null)
    setEditingPlayer(null)
    setEditingTeam(null)
    setSelectedGroupForMatch("")

    setTeams([])
    setPlayers([])
    setMatches([])
    setNewsList([])
    setGroups([])
    setGroupStandings([])
    setByeWeeks([])

    console.log("[v0] State reset complete. Now setting tournament and reloading...")

    setTournamentTab(newTournamentTab)
    setSelectedTournament(newTournamentId)

    try {
      console.log("[v0] Starting fresh data load for tournament:", newTournamentId)

      // Set loading states
      setIsLoadingTeams(true)
      setIsLoadingPlayers(true)

      // Load teams first
      const teamsResult = await getTeams(newTournamentId)
      console.log("[v0] Loaded teams after tournament change:", teamsResult)
      setTeams(teamsResult)
      setIsLoadingTeams(false)

      // Load players with new tournament
      const playersResult = await getPlayersByTournament(newTournamentId)
      console.log("[v0] Loaded players after tournament change:", playersResult)
      setPlayers(playersResult)
      setIsLoadingPlayers(false)

      // Load other data
      const matchesResult = await getMatches()
      const matchesForTournament = matchesResult.filter((m: any) => m.tournament_id === newTournamentId)
      console.log("[v0] Loaded matches after tournament change:", matchesForTournament)
      setMatches(matchesForTournament)

      const newsResult = await getNews()
      const newsForTournament = newsResult.filter((n: any) => n.tournament_id === newTournamentId)
      setNewsList(newsForTournament)

      // Load tournament-specific data
      if (newTournamentTab === "libertadores") {
        const groupsResult = await getGroups()
        setGroups(groupsResult)
        const standingsResult = await getStandingsByTournament(newTournamentId)
        setGroupStandings(standingsResult)
      } else {
        // Load bye weeks for femenina
        const byeWeeksResult = await getByeWeeks(newTournamentId)
        setByeWeeks(byeWeeksResult)
      }

      console.log("[v0] ============ TOURNAMENT CHANGE COMPLETE ============")
    } catch (error) {
      console.error("[v0] Error loading data after tournament change:", error)
      setIsLoadingTeams(false)
      setIsLoadingPlayers(false)
    }

    toast({
      title: "Torneo cambiado",
      description: `Ahora estás gestionando: ${pendingTournamentTab === "libertadores" ? "Copa Libertadores" : "SuperLiga Femenina"}`,
    })
  }

  const cancelTournamentChange = () => {
    setShowTournamentDialog(false)
  }

  const loadMatchDetails = async (matchId: number) => {
    const supabase = await createClient()

    const { data: goals } = await supabase.from("goals").select("*, players(name, ci)").eq("match_id", matchId)

    const { data: cards } = await supabase.from("cards").select("*, players(name, ci)").eq("match_id", matchId)

    return { goals: goals || [], cards: cards || [] }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadTournaments()
    }
  }, [isAuthenticated])

  const loadTournaments = async () => {
    try {
      const data = await getTournaments()
      setTournaments(data)
      if (data.length > 0) {
        // Set default tournament based on tournamentTab state
        if (tournamentTab === "libertadores") {
          setSelectedTournament(1)
        } else if (tournamentTab === "femenino") {
          setSelectedTournament(2)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading tournaments:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los torneos",
        variant: "destructive",
      })
    }
  }

  const loadTeams = async () => {
    setIsLoadingTeams(true)
    try {
      console.log("[v0] ============ LOADING TEAMS START ============")
      console.log("[v0] Current selectedTournament:", selectedTournament)

      // const { getTeams } = await import("@/lib/actions/teams") // Already imported
      const allTeams = await getTeams() // Fetch all teams

      console.log("[v0] All teams fetched from DB:", allTeams)
      console.log("[v0] Total teams:", allTeams.length)

      const filteredTeams = allTeams.filter((team) => team.tournament_id === selectedTournament)

      console.log("[v0] Teams filtered for tournament", selectedTournament, ":", filteredTeams)
      console.log("[v0] Filtered teams count:", filteredTeams.length)

      setTeams(filteredTeams)
      console.log("[v0] ============ LOADING TEAMS END ============")
    } catch (error) {
      console.error("[v0] ❌ Error loading teams:", error)
      console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const loadPlayers = async () => {
    setIsLoadingPlayers(true)
    try {
      console.log("[v0] ============ LOADING PLAYERS START ============")
      console.log("[v0] Current selectedTournament:", selectedTournament)

      // const { getPlayersByTournament } = await import("@/lib/actions/players") // Already imported
      const filteredPlayers = await getPlayersByTournament(selectedTournament)

      console.log("[v0] Players loaded for tournament", selectedTournament, ":", filteredPlayers.length)
      console.log(
        "[v0] Sample players:",
        filteredPlayers.slice(0, 3).map((p) => ({
          name: p.name,
          team_id: p.team_id,
          team_name: p.teams?.name,
          tournament_id: p.teams?.tournament_id,
        })),
      )

      setPlayers(filteredPlayers)
      console.log("[v0] ============ LOADING PLAYERS END ============")
    } catch (error) {
      console.error("[v0] ❌ Error loading players:", error)
      console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "Error",
        description: "No se pudieron cargar los jugadores",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  const loadMatches = async () => {
    setIsLoadingMatches(true)
    try {
      // const { getMatches } = await import("@/lib/actions/matches") // Already imported
      const allMatches = await getMatches()
      const filteredMatches = allMatches.filter((m: any) => m.tournament_id === selectedTournament)
      setMatches(filteredMatches || [])
    } catch (error) {
      console.error("[v0] Error loading matches:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los partidos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMatches(false)
    }
  }

  // Effect to load data when tournament changes or user is authenticated
  useEffect(() => {
    if (isAuthenticated && selectedTournament) {
      const loadDataSequentially = async () => {
        console.log("[v0] ============ LOADING DATA SEQUENTIALLY ============")
        console.log("[v0] Selected tournament:", selectedTournament)
        console.log("[v0] Tournament tab:", tournamentTab)

        console.log("[v0] Clearing existing data arrays...")
        setTeams([])
        setPlayers([])
        setMatches([])
        setNewsList([])

        // Load teams first
        console.log("[v0] Loading teams...")
        await loadTeams()

        // Load groups if Libertadores
        if (tournamentTab === "libertadores") {
          console.log("[v0] Loading groups for Libertadores...")
          await loadGroups()
        } else {
          console.log("[v0] Clearing groups data for Femenina...")
          setGroups([])
          setGroupStandings([])
        }

        // Then load players and matches (they depend on teams being loaded)
        console.log("[v0] Loading players and matches in parallel...")
        await Promise.all([loadPlayers(), loadMatches()])

        console.log("[v0] ============ DATA LOADING COMPLETE ============")
      }

      loadDataSequentially()
    }
  }, [selectedTournament, tournamentTab, isAuthenticated])

  // Load news when the news tab is active
  const loadNews = async () => {
    setIsLoadingNews(true)
    try {
      const data = await getNews() // Assuming getNews is available and fetches news
      const filteredNews = data.filter((n: any) => n.tournament_id === selectedTournament)
      setNewsList(filteredNews)
    } catch (error) {
      console.error("[v0] Error loading news:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las noticias",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNews(false)
    }
  }

  useEffect(() => {
    if (activeTab === "news") {
      loadNews()
    }
  }, [activeTab])

  // Effect to load bye weeks specifically for the Femenina tournament
  useEffect(() => {
    if (selectedTournament === 2) {
      // Only for femenina
      loadByeWeeks()
    }
  }, [selectedTournament])

  const loadByeWeeks = async () => {
    console.log("[v0] ============ LOAD BYE WEEKS START ============")
    console.log("[v0] Selected tournament:", selectedTournament)

    try {
      const data = await getByeWeeks(selectedTournament)
      console.log("[v0] ✅ Bye weeks loaded:", data.length)
      setByeWeeks(data)
    } catch (error) {
      console.error("[v0] ❌ Error loading bye weeks:", error)
      toast({
        title: "Error al cargar fechas libres",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
    console.log("[v0] ============ LOAD BYE WEEKS END ============")
  }

  const handleCreateByeWeek = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] ============ HANDLE CREATE BYE WEEK START ============")
    console.log("[v0] New bye week state:", newByeWeek)
    console.log("[v0] Selected tournament:", selectedTournament)

    if (!newByeWeek.team_id || !newByeWeek.round) {
      toast({
        title: "Error",
        description: "Debes seleccionar un equipo y una fecha",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("tournament_id", selectedTournament.toString())
      formData.append("team_id", newByeWeek.team_id)
      formData.append("round", newByeWeek.round)

      console.log("[v0] FormData prepared:", {
        tournament_id: selectedTournament,
        team_id: newByeWeek.team_id,
        round: newByeWeek.round,
      })

      await createByeWeek(formData)

      toast({
        title: "Fecha libre creada",
        description: "La fecha libre se ha registrado exitosamente",
        className: "bg-green-50 border-green-200",
      })

      setNewByeWeek({ team_id: "", round: "" })
      await loadByeWeeks()
    } catch (error) {
      console.error("[v0] ❌ Error creating bye week:", error)
      console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "Error al crear fecha libre",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
    console.log("[v0] ============ HANDLE CREATE BYE WEEK END ============")
  }

  const handleDeleteByeWeek = async (id: number, teamName: string, round: number) => {
    if (!confirm(`¿Eliminar fecha libre de ${teamName} en Fecha ${round}?`)) return

    try {
      await deleteByeWeek(id)
      toast({
        title: "Fecha libre eliminada",
        description: "La fecha libre se ha eliminado exitosamente",
        className: "bg-green-50 border-green-200",
      })
      await loadByeWeeks()
    } catch (error) {
      console.error("[v0] Error deleting bye week:", error)
      toast({
        title: "Error al eliminar fecha libre",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const loadGroups = async () => {
    setIsLoadingGroups(true)
    try {
      // const { getGroups, getGroupStandings } = await import("@/lib/actions/groups") // Already imported
      const groupsData = await getGroups()
      setGroups(groupsData)

      const standingsData = await getStandingsByTournament(selectedTournament) // Filter standings by tournament
      setGroupStandings(standingsData)
    } catch (error) {
      console.error("[v0] Error loading groups:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los grupos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const handleLogin = () => {
    if (password === "liga33admin") {
      setIsAuthenticated(true)
    } else {
      toast({
        title: "Error",
        description: "Contraseña incorrecta",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
  }

  // This effect might be redundant given the main useEffect listening to selectedTournament and tournamentTab.
  // However, it ensures data is loaded if isAuthenticated becomes true while already on a specific tournament tab.
  useEffect(() => {
    if (isAuthenticated && selectedTournament) {
      loadTeams()
      loadPlayers()
      if (tournamentTab === "libertadores") {
        loadGroups()
      } else {
        loadByeWeeks() // Load bye weeks for Femenina
      }
      loadNews()
      loadMatches()
    }
  }, [isAuthenticated, selectedTournament, tournamentTab]) // Added tournamentTab as dependency

  // Effect to reset match-specific states when a new match is selected
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

  const handleSubmitResult = async () => {
    const selectedMatch = matches.find((m) => m.id === selectedMatchId)
    if (!selectedMatch) {
      toast({
        title: "Error",
        description: "Partido no encontrado.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] DEBUG - homeGoals array:", homeGoals)
    console.log("[v0] DEBUG - awayGoals array:", awayGoals)
    console.log("[v0] DEBUG - homeYellowCards array:", homeYellowCards)
    console.log("[v0] DEBUG - awayYellowCards array:", awayYellowCards)
    console.log("[v0] DEBUG - homeRedCards array:", homeRedCards)
    console.log("[v0] DEBUG - awayRedCards array:", awayRedCards)

    const calculatedHomeScore = homeGoals.filter((g) => g.player).length
    const calculatedAwayScore = awayGoals.filter((g) => g.player).length

    const goalsData = [
      ...homeGoals
        .filter((g) => g.player)
        .map((g) => {
          const player_id = Number.parseInt(g.player)
          const minute = g.minute ? Number.parseInt(g.minute) : 0
          console.log("[v0] Processing home goal:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.home_team_id,
            minute,
          }
        }),
      ...awayGoals
        .filter((g) => g.player)
        .map((g) => {
          const player_id = Number.parseInt(g.player)
          const minute = g.minute ? Number.parseInt(g.minute) : 0
          console.log("[v0] Processing away goal:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.away_team_id,
            minute,
          }
        }),
    ]

    const cardsData = [
      ...homeYellowCards
        .filter((c) => c.player)
        .map((c) => {
          const player_id = Number.parseInt(c.player)
          const minute = c.minute ? Number.parseInt(c.minute) : 0
          console.log("[v0] Processing home yellow card:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.home_team_id,
            card_type: "yellow" as const,
            minute,
          }
        }),
      ...awayYellowCards
        .filter((c) => c.player)
        .map((c) => {
          const player_id = Number.parseInt(c.player)
          const minute = c.minute ? Number.parseInt(c.minute) : 0
          console.log("[v0] Processing away yellow card:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.away_team_id,
            card_type: "yellow" as const,
            minute,
          }
        }),
      ...homeRedCards
        .filter((c) => c.player)
        .map((c) => {
          const player_id = Number.parseInt(c.player)
          const minute = c.minute ? Number.parseInt(c.minute) : 0
          console.log("[v0] Processing home red card:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.home_team_id,
            card_type: "red" as const,
            minute,
          }
        }),
      ...awayRedCards
        .filter((c) => c.player)
        .map((c) => {
          const player_id = Number.parseInt(c.player)
          const minute = c.minute ? Number.parseInt(c.minute) : 0
          console.log("[v0] Processing away red card:", { player_id, minute })
          return {
            player_id,
            team_id: selectedMatch.away_team_id,
            card_type: "red" as const,
            minute,
          }
        }),
    ]

    console.log("[v0] Submitting match result:", {
      matchId: selectedMatch.id,
      homeScore: calculatedHomeScore,
      awayScore: calculatedAwayScore,
      goals: goalsData,
      cards: cardsData,
    })

    try {
      const result = await updateMatchResult(
        selectedMatch.id,
        calculatedHomeScore,
        calculatedAwayScore,
        goalsData,
        cardsData,
      )

      console.log("[v0] updateMatchResult response:", result)

      if (result.results) {
        console.log("[v0] ✅ Goals inserted:", result.results.goalsInserted)
        console.log("[v0] ❌ Goals failed:", result.results.goalsFailed)
        console.log("[v0] ✅ Cards inserted:", result.results.cardsInserted)
        console.log("[v0] ❌ Cards failed:", result.results.cardsFailed)
        console.log("[v0] ✅ Players updated:", result.results.playersUpdated)
        console.log("[v0] ❌ Players failed:", result.results.playersFailed)
        if (result.results.errors && result.results.errors.length > 0) {
          console.log("[v0] 🔴 ERRORS:")
          result.results.errors.forEach((error: string, index: number) => {
            console.log(`[v0] Error ${index + 1}:`, error)
            toast({
              title: "Error en actualización",
              description: `Hubo un problema al actualizar las estadísticas: ${error}`,
              variant: "destructive",
            })
          })
        }
      }

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Error al guardar el resultado.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "✅ Resultado guardado",
        description: `${selectedMatch.home_team?.name} ${calculatedHomeScore} - ${calculatedAwayScore} ${selectedMatch.away_team?.name}. Las estadísticas se actualizaron automáticamente.`,
      })

      await loadMatches()
      await loadPlayers()

      setShowResultConfirm(false)
      setSelectedMatchId(null)
      setHomeGoals([{ player: "", minute: "" }])
      setAwayGoals([{ player: "", minute: "" }])
      setHomeYellowCards([{ player: "", minute: "" }])
      setAwayYellowCards([{ player: "", minute: "" }])
      setHomeRedCards([{ player: "", minute: "" }])
      setAwayRedCards([{ player: "", minute: "" }])
    } catch (error: any) {
      console.error("[v0] Error saving match result:", error)
      toast({
        title: "Error",
        description: error.message || "Error al guardar el resultado",
        variant: "destructive",
      })
    }
  }

  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewsImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewNews({ ...newNews, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] ============ TEAM LOGO UPLOAD ============")
      console.log("[v0] File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.log("[v0] ❌ Invalid file type:", file.type)
        toast({
          title: "❌ Archivo inválido",
          description: "Por favor selecciona una imagen JPG o PNG",
          variant: "destructive",
        })
        return
      }

      setTeamLogoFile(file)
      console.log("[v0] ✅ Logo file stored in state")

      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("[v0] ✅ Logo preview generated")
        setNewTeam({ ...newTeam, logo_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTeam = async () => {
    console.log("[v0] ============ HANDLE ADD TEAM START ============")
    console.log("[v0] handleAddTeam called with:", {
      newTeam,
      teamLogoFile: teamLogoFile ? `File: ${teamLogoFile.name}` : "null",
      selectedTournament,
      editingTeam,
    })

    if (!newTeam.name.trim()) {
      toast({
        title: "⚠️ Campo incompleto",
        description: "Por favor ingresa el nombre del equipo",
        variant: "destructive",
      })
      return
    }

    // Logo is required only for new teams
    if (!editingTeam && !teamLogoFile && !newTeam.logo_url) {
      toast({
        title: "⚠️ Campo incompleto",
        description: "Por favor sube una foto del equipo",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newTeam.name.trim())

      if (teamLogoFile) {
        console.log("[v0] Adding new logo file to FormData")
        formData.append("logo", teamLogoFile)
      } else if (editingTeam && editingTeam.logo_url) {
        console.log("[v0] Preserving existing logo_url:", editingTeam.logo_url)
        formData.append("logo_url", editingTeam.logo_url)
      } else if (newTeam.logo_url) {
        console.log("[v0] Using logo_url from state")
        formData.append("logo_url", newTeam.logo_url)
      }

      // Append group_id only if it's not empty and tournament is Libertadores
      if (tournamentTab === "libertadores" && newTeam.group_id) {
        formData.append("group_id", newTeam.group_id)
      }

      formData.append("tournament_id", selectedTournament.toString())

      console.log("[v0] FormData contents:")
      for (const [key, value] of formData.entries()) {
        if (key === "logo" && value instanceof File) {
          console.log(`[v0]   ${key}: File(${value.name}, ${value.size} bytes)`)
        } else {
          console.log(`[v0]   ${key}:`, value)
        }
      }

      if (editingTeam) {
        console.log("[v0] Updating team:", editingTeam.id)
        await updateTeam(editingTeam.id, formData)
        toast({
          title: "✅ ¡Equipo actualizado exitosamente!",
          description: `${newTeam.name} ha sido actualizado`,
          className: "bg-green-50 border-green-200",
        })
        setEditingTeam(null)
      } else {
        console.log("[v0] Creating new team...")
        const result = await createTeam(formData)
        console.log("[v0] createTeam result:", result)
        toast({
          title: "✅ ¡Equipo creado exitosamente!",
          description: `${newTeam.name} ha sido agregado a la base de datos`,
          className: "bg-green-50 border-green-200",
        })
      }

      setNewTeam({ name: "", logo_url: "", group_id: "" })
      setTeamLogoFile(null)

      console.log("[v0] Reloading teams...")
      await loadTeams()

      document.querySelector("[data-teams-list]")?.scrollIntoView({ behavior: "smooth", block: "nearest" })

      console.log("[v0] ✅ Team operation completed successfully")
    } catch (error: any) {
      console.error("[v0] ❌ Error creating/updating team:", error)
      console.error("[v0] Error details:", error.message)
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo guardar el equipo",
        variant: "destructive",
      })
    }
    console.log("[v0] ============ HANDLE ADD TEAM END ============")
  }

  const handleEditTeam = (team: Team) => {
    console.log("[v0] ============ EDIT TEAM CLICKED ============")
    console.log("[v0] Team to edit:", team)

    setEditingTeam(team)
    setNewTeam({
      name: team.name,
      logo_url: team.logo_url || "",
      group_id: team.group_id?.toString() || "", // Ensure group_id is string or empty
    })
    setTeamLogoFile(null) // Reset file, keep existing logo_url

    console.log("[v0] Edit mode activated, state set")
    console.log("[v0] ============ EDIT TEAM CLICKED END ============")

    // Find the form element and scroll it into view instead
    const formElement = document.querySelector("[data-team-form]")
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  const handleCancelEditTeam = () => {
    console.log("[v0] Cancelling team edit")
    setEditingTeam(null)
    setNewTeam({ name: "", logo_url: "", group_id: "" })
    setTeamLogoFile(null)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Campo incompleto",
        description: "Por favor ingresa el nombre del grupo",
        variant: "destructive",
      })
      return
    }

    try {
      // const { createGroup } = await import("@/lib/actions/groups") // Already imported
      await createGroup(newGroupName.trim(), selectedTournament) // Pass tournament_id

      toast({
        title: "¡Grupo creado exitosamente!",
        description: `${newGroupName} ha sido creado`,
        className: "bg-green-50 border-green-200",
      })

      setNewGroupName("")
      await loadGroups()
    } catch (error) {
      console.error("[v0] Error creating group:", error)
      toast({
        title: "Error al crear grupo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleAssignTeamToGroup = async () => {
    if (!selectedTeamForAssignment || !selectedGroupForAssignment) {
      toast({
        title: "Campos incompletos",
        description: "Por favor selecciona un equipo y un grupo",
        variant: "destructive",
      })
      return
    }

    try {
      // const { assignTeamToGroup } = await import("@/lib/actions/groups") // Already imported
      await assignTeamToGroup(Number.parseInt(selectedTeamForAssignment), Number.parseInt(selectedGroupForAssignment))

      const teamName = teams.find((t) => t.id === Number.parseInt(selectedTeamForAssignment))?.name
      const groupName = groups.find((g) => g.id === Number.parseInt(selectedGroupForAssignment))?.name

      toast({
        title: "✅ ¡Equipo asignado exitosamente!",
        description: `${teamName} ha sido asignado a ${groupName}`,
        className: "bg-green-50 border-green-200",
      })

      setSelectedTeamForAssignment("")
      setSelectedGroupForAssignment("")
      await loadGroups() // Reload groups to reflect assignments
      await loadTeams() // Reload teams to ensure their group_id is updated if necessary for display
    } catch (error) {
      console.error("[v0] Error assigning team to group:", error)
      toast({
        title: "❌ Error al asignar equipo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleRemoveTeamFromGroup = async (teamId: number, teamName: string, groupName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${teamName} de ${groupName}?`)) {
      return
    }

    try {
      // const { removeTeamFromGroup } = await import("@/lib/actions/groups") // Already imported
      await removeTeamFromGroup(teamId)

      toast({
        title: "✅ ¡Equipo eliminado del grupo!",
        description: `${teamName} ha sido eliminado de ${groupName}`,
        className: "bg-green-50 border-green-200",
      })

      await loadGroups()
    } catch (error) {
      console.error("[v0] Error removing team from group:", error)
      toast({
        title: "❌ Error al eliminar equipo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar ${groupName}? Esto también eliminará todos los equipos asignados a este grupo.`,
      )
    ) {
      return
    }

    try {
      // const { deleteGroup } = await import("@/lib/actions/groups") // Already imported
      await deleteGroup(groupId)

      toast({
        title: "✅ ¡Grupo eliminado!",
        description: `${groupName} ha sido eliminado exitosamente`,
        className: "bg-green-50 border-green-200",
      })

      await loadGroups()
      await loadTeams() // Reload teams as their group association might be removed
    } catch (error) {
      console.error("[v0] Error deleting group:", error)
      toast({
        title: "❌ Error al eliminar grupo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleAddPlayer = async () => {
    console.log("[v0] ============ ADD PLAYER START ============")
    console.log("[v0] Current teams:", teams.length)
    console.log("[v0] Current selectedTournament:", selectedTournament)
    console.log("[v0] New player data:", newPlayer)

    if (teams.length === 0) {
      console.error("[v0] ❌ No teams available")
      toast({
        title: "❌ No hay equipos disponibles",
        description: "Debes crear al menos un equipo antes de agregar jugadores",
        variant: "destructive",
      })
      return
    }

    if (!newPlayer.name.trim() || !newPlayer.team_id || !newPlayer.cedula.trim() || !newPlayer.number) {
      console.error("[v0] ❌ Incomplete fields:", {
        name: !!newPlayer.name.trim(),
        team_id: !!newPlayer.team_id,
        cedula: !!newPlayer.cedula.trim(),
        number: !!newPlayer.number,
      })
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos antes de crear el jugador",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Attempting to create player with data:", {
      name: newPlayer.name,
      cedula: newPlayer.cedula,
      number: newPlayer.number,
      team_id: newPlayer.team_id,
      team_id_type: typeof newPlayer.team_id,
    })

    const selectedTeam = teams.find((t) => t.id === Number.parseInt(newPlayer.team_id, 10))
    console.log("[v0] Selected team:", selectedTeam)
    console.log(
      "[v0] Available teams for dropdown:",
      teams.map((t) => ({ id: t.id, name: t.name, tournament_id: t.tournament_id })),
    )

    if (!selectedTeam) {
      console.error("[v0] ❌ Team not found in current list")
      toast({
        title: "❌ Error de sincronización",
        description: "El equipo seleccionado no está disponible. Por favor recarga la página e intenta nuevamente.",
        variant: "destructive",
      })
      return
    }

    setIsAddingPlayer(true)

    try {
      const formData = new FormData()
      formData.append("name", newPlayer.name.trim())
      formData.append("cedula", newPlayer.cedula.trim())
      formData.append("number", newPlayer.number)
      formData.append("team_id", newPlayer.team_id)
      formData.append("tournament_id", selectedTournament.toString())

      console.log("[v0] FormData for createPlayer:")
      for (const [key, value] of formData.entries()) {
        console.log(`[v0]   ${key}: ${value}`)
      }

      console.log("[v0] Calling createPlayer with formData")
      const result = await createPlayer(formData)

      console.log("[v0] createPlayer result:", result)

      if (!result.success) {
        console.error("[v0] ❌ Create player failed:", result.error)
        toast({
          title: "❌ Error al crear jugador",
          description: result.error || "Ocurrió un error inesperado",
          variant: "destructive",
        })
        return
      }

      const teamName = selectedTeam.name

      console.log("[v0] ✅ Player created successfully")
      toast({
        title: "✅ ¡Jugador creado exitosamente!",
        description: `${newPlayer.name} ha sido agregado a ${teamName}`,
        className: "bg-green-50 border-green-200",
      })

      setNewPlayer({ name: "", team_id: "", cedula: "", number: "" })
      await loadPlayers()
      console.log("[v0] ============ ADD PLAYER END ============")
    } catch (error) {
      console.error("[v0] ❌ Error creating player:", error)
      console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
      toast({
        title: "❌ Error al crear jugador",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsAddingPlayer(false)
    }
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setNewPlayer({
      name: player.name,
      team_id: player.team_id.toString(),
      cedula: player.cedula,
      number: player.number.toString(),
    })
    // Scroll to top of the form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return

    if (!newPlayer.name.trim() || !newPlayer.team_id || !newPlayer.cedula.trim() || !newPlayer.number) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos antes de actualizar el jugador",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] DEBUG - Updating player with data:", {
        id: editingPlayer?.id,
        name: newPlayer.name,
        cedula: newPlayer.cedula,
        team_id: newPlayer.team_id,
        number: newPlayer.number,
      })

      const formData = new FormData()
      formData.append("name", newPlayer.name)
      formData.append("team_id", newPlayer.team_id)
      formData.append("cedula", newPlayer.cedula)
      formData.append("number", newPlayer.number)

      console.log("[v0] DEBUG - FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`)
      }

      // const { updatePlayer } = await import("@/lib/actions/players") // Already imported
      const result = await updatePlayer(editingPlayer.id, formData)

      console.log("[v0] DEBUG - Update result:", result)

      const selectedTeam = teams.find((t) => t.id === Number.parseInt(newPlayer.team_id, 10))

      toast({
        title: "✅ ¡Jugador actualizado exitosamente!",
        description: `${newPlayer.name} ha sido actualizado en ${selectedTeam?.name}`,
        className: "bg-green-50 border-green-200",
      })

      setNewPlayer({ name: "", team_id: "", cedula: "", number: "" })
      setEditingPlayer(null)
      await loadPlayers()
    } catch (error) {
      console.error("[v0] Error updating player:", error)
      toast({
        title: "❌ Error al actualizar jugador",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingPlayer(null)
    setNewPlayer({ name: "", team_id: "", cedula: "", number: "" })
  }

  const handleAddNews = async () => {
    // Validate all fields are filled
    if (!newNews.title.trim() || !newNews.content.trim() || !newNews.image) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos antes de crear la noticia",
        variant: "destructive",
      })
      return
    }

    // Validate max 4 news
    if (newsList.length >= 4) {
      toast({
        title: "❌ Límite alcanzado",
        description: "Solo puedes tener un máximo de 4 noticias publicadas",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", newNews.title.trim())
      formData.append("content", newNews.content.trim())
      formData.append("image_url", newNews.image) // Use image_url field for the base64 string
      formData.append("published_date", newNews.date)
      formData.append("tournament_id", selectedTournament.toString()) // Add tournament_id

      await createNews(formData)

      toast({
        title: "✅ ¡Noticia publicada exitosamente!",
        description: `"${newNews.title}" ha sido agregada`,
        className: "bg-green-50 border-green-200",
      })

      setNewNews({ title: "", content: "", image: "", date: new Date().toISOString().split("T")[0] })
      setNewsImageFile(null)
      await loadNews()
    } catch (error) {
      console.error("[v0] Error creating news:", error)
      toast({
        title: "❌ Error al crear noticia",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const performDraw = async () => {
    console.log("[v0] Performing draw with real data from database")

    const supabase = createClient()

    // Get all team_groups with their teams and groups
    const { data: teamGroups, error } = await supabase
      .from("team_groups")
      .select(`
        *,
        teams (
          id,
          name,
          logo_url
        ),
        copa_groups (
          id,
          name
        )
      `)
      .eq("tournament_id", selectedTournament) // Added tournament filter
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false })

    if (error || !teamGroups) {
      toast({
        title: "Error al realizar sorteo",
        description: "No se pudieron cargar los datos de los equipos",
        variant: "destructive",
      })
      return
    }

    // Group teams by their group
    const groupedTeams: { [key: string]: any[] } = {}
    teamGroups.forEach((tg: any) => {
      const groupName = tg.copa_groups?.name || "Sin grupo"
      if (!groupedTeams[groupName]) {
        groupedTeams[groupName] = []
      }
      groupedTeams[groupName].push(tg)
    })

    // Get top 2 from each group
    const qualified: any[] = []
    const thirdPlaceTeams: any[] = []

    Object.keys(groupedTeams).forEach((groupName) => {
      const teams = groupedTeams[groupName]
      // Top 2 qualify directly
      if (teams[0]) qualified.push(teams[0])
      if (teams[1]) qualified.push(teams[1])
      // Third place goes to separate array
      if (teams[2]) thirdPlaceTeams.push(teams[2])
    })

    // Sort third place teams by points, goal difference, goals for
    thirdPlaceTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_for - a.goals_for
    })

    // Add best 2 third place teams
    if (thirdPlaceTeams[0]) qualified.push(thirdPlaceTeams[0])
    if (thirdPlaceTeams[1]) qualified.push(thirdPlaceTeams[1])

    console.log("[v0] Qualified teams:", qualified.length)

    if (qualified.length < 8) {
      toast({
        title: "Error al realizar sorteo",
        description: `Solo hay ${qualified.length} equipos clasificados. Se necesitan 8 equipos.`,
        variant: "destructive",
      })
      return
    }

    // Shuffle qualified teams for random draw
    const shuffled = [...qualified].sort(() => Math.random() - 0.5)

    // Create matchups (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5)
    const matchups: string[] = []
    for (let i = 0; i < 4; i++) {
      const team1 = shuffled[i]?.teams?.name || "Equipo desconocido"
      const team2 = shuffled[7 - i]?.teams?.name || "Equipo desconocido"
      matchups.push(`${team1} vs ${team2}`)
    }

    // Save draw results to database
    const drawData = []
    for (let i = 0; i < 4; i++) {
      drawData.push({
        match_number: i + 1,
        team1_id: shuffled[i]?.team_id,
        team2_id: shuffled[7 - i]?.team_id,
        tournament_id: selectedTournament, // Added tournament_id
      })
    }

    const { error: deleteError } = await supabase.from("draws").delete().eq("tournament_id", selectedTournament) // Delete by tournament
    if (deleteError) console.error("[v0] Error deleting previous draws:", deleteError)

    const { error: insertError } = await supabase.from("draws").insert(drawData)
    if (insertError) {
      console.error("[v0] Error inserting draws:", insertError)
      toast({
        title: "Error al guardar el sorteo",
        description: "No se pudieron guardar los cruces en la base de datos.",
        variant: "destructive",
      })
    }

    toast({
      title: "Sorteo realizado exitosamente",
      description: `Se generaron ${matchups.length} cruces de octavos de final`,
    })

    setShowDrawConfirm(false)
    setDrawResults(matchups)
    setShowDraw(true)
  }

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    toast({
      title: "Eliminando equipo...",
      description: `Se está eliminando el equipo ${teamName}.`,
    })
    try {
      await deleteTeam(teamId)
      toast({
        title: "¡Equipo eliminado!",
        description: `${teamName} ha sido eliminado exitosamente.`,
        className: "bg-green-50 border-green-200",
      })
      await loadTeams()
    } catch (error) {
      console.error("[v0] Error deleting team:", error)
      toast({
        title: "Error al eliminar equipo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    toast({
      title: "Eliminando jugador...",
      description: `Se está eliminando al jugador ${playerName}.`,
    })
    try {
      await deletePlayer(playerId)
      toast({
        title: "¡Jugador eliminado!",
        description: `${playerName} ha sido eliminado exitosamente.`,
        className: "bg-green-50 border-green-200",
      })
      await loadPlayers()
    } catch (error) {
      console.error("[v0] Error deleting player:", error)
      toast({
        title: "Error al eliminar jugador",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNews = async (newsId: number, newsTitle: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la noticia "${newsTitle}"?`)) {
      return
    }

    try {
      await deleteNews(newsId)
      toast({
        title: "✅ ¡Noticia eliminada!",
        description: `"${newsTitle}" ha sido eliminada exitosamente`,
        className: "bg-green-50 border-green-200",
      })
      await loadNews()
    } catch (error) {
      console.error("[v0] Error deleting news:", error)
      toast({
        title: "❌ Error al eliminar noticia",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = players.filter((player) => {
    const matchesTeam = playerFilterTeam === "all" || player.team_id.toString() === playerFilterTeam
    const matchesSearch = !playerSearchTerm || player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
    return matchesTeam && matchesSearch
  })

  // Filter matches by selected round for results tab
  const roundMatches = matches.filter((m) => {
    if (selectedRound === "cuartos") return m.round === "cuartos"
    if (selectedRound === "semi") return m.round === "semi"
    if (selectedRound === "final") return m.round === "final"
    return m.round === Number.parseInt(selectedRound)
  })

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) // Use fetched matches

  // Get teams for the selected group for match creation
  const teamsInSelectedGroup = teams.filter((team) => {
    const group = groups.find((g) => g.id.toString() === selectedGroupForMatch)
    if (!group) return false
    const teamIdsInGroup = groupStandings
      .filter((standing: any) => standing.copa_groups?.id === group.id)
      .map((standing: any) => standing.team_id)
    return teamIdsInGroup.includes(team.id)
  })

  // Function to create a new match
  const handleCreateMatch = async () => {
    console.log("[v0] ============ CREATING MATCH START ============")
    console.log("[v0] Tournament:", tournamentTab, "ID:", selectedTournament)
    console.log("[v0] New match data:", newMatch)

    const requiredFieldsMissing =
      tournamentTab === "libertadores"
        ? !newMatch.group_id ||
          !newMatch.home_team_id ||
          !newMatch.away_team_id ||
          !newMatch.round ||
          !newMatch.match_date
        : !newMatch.home_team_id || !newMatch.away_team_id || !newMatch.round || !newMatch.match_date

    if (requiredFieldsMissing) {
      console.log("[v0] ❌ Required fields missing")
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("tournament_id", selectedTournament.toString())

      if (tournamentTab === "libertadores") {
        formData.append("group_id", newMatch.group_id)
      }

      formData.append("home_team_id", newMatch.home_team_id)
      formData.append("away_team_id", newMatch.away_team_id)
      formData.append("round", newMatch.round)
      formData.append("match_date", newMatch.match_date)
      formData.append("match_time", newMatch.match_time || "")
      formData.append("field", newMatch.field || "")

      console.log("[v0] FormData prepared:")
      for (const [key, value] of formData.entries()) {
        console.log(`[v0]   ${key}:`, value)
      }

      const result = await createMatch(formData)
      console.log("[v0] ✅ Match created successfully:", result)

      toast({
        title: "✅ ¡Partido creado!",
        description: "El partido ha sido agregado exitosamente.",
        className: "bg-green-50 border-green-200",
      })

      // Reset form
      setNewMatch({
        group_id: "",
        home_team_id: "",
        away_team_id: "",
        round: "",
        match_date: "",
        match_time: "",
        field: "",
      })
      setSelectedGroupForMatch("")

      await loadMatches()
      console.log("[v0] ============ CREATING MATCH END ============")
    } catch (error) {
      console.error("[v0] ❌ Error creating match:", error)
      console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "❌ Error al crear partido",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  // Function to delete a match
  const handleDeleteMatch = async (matchId: number, homeTeamName?: string, awayTeamName?: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el partido ${homeTeamName} vs ${awayTeamName}?`)) {
      return
    }

    try {
      await deleteMatch(matchId)
      toast({
        title: "✅ ¡Partido eliminado!",
        description: `El partido ${homeTeamName} vs ${awayTeamName} ha sido eliminado exitosamente`,
        className: "bg-green-50 border-green-200",
      })
      await loadMatches()
    } catch (error) {
      console.error("[v0] Error deleting match:", error)
      toast({
        title: "❌ Error al eliminar partido",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleTournamentChange = (value: string) => {
    console.log("[v0] ============ HANDLE TOURNAMENT CHANGE ============")
    console.log("[v0] Value received:", value)
    setPendingTournamentTab(value as "libertadores" | "femenino")
    setShowTournamentDialog(true)
  }

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
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Cerrar Sesión
          </Button>
        </div>

        <Card className="border-2 border-primary/50 bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Seleccionar Torneo
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">Gestiona diferentes competiciones de forma independiente</p>
          </CardHeader>
          <CardContent>
            <div
              className={`mb-4 p-4 rounded-lg border-2 ${
                tournamentTab === "libertadores" ? "bg-primary/10 border-primary" : "bg-pink-500/10 border-pink-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      tournamentTab === "libertadores" ? "bg-primary" : "bg-pink-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-gray-400">Torneo Activo:</p>
                    <p className="text-lg font-bold text-white">
                      {tournamentTab === "libertadores" ? "Copa Libertadores" : "SuperLiga Femenina"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    tournamentTab === "libertadores" ? "border-primary text-primary" : "border-pink-500 text-pink-500"
                  }`}
                >
                  ID: {selectedTournament}
                </Badge>
              </div>
            </div>

            <Tabs value={tournamentTab} onValueChange={handleTournamentChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 p-1 h-auto gap-2">
                <TabsTrigger
                  value="libertadores"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200 py-3 px-4 rounded-md"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Copa Libertadores</span>
                    <span className="text-xs opacity-70">Formato: Grupos + Eliminatorias</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="femenino"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 transition-all duration-200 py-3 px-4 rounded-md"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">SuperLiga Femenina</span>
                    <span className="text-xs opacity-70">Formato: Todos contra Todos</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-200">
                  <strong>Importante:</strong> Al cambiar de torneo, asegúrate de guardar todos los cambios pendientes.
                  Los datos de cada torneo se gestionan de forma independiente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className={`grid w-full ${tournamentTab === "libertadores" ? "grid-cols-2 md:grid-cols-7" : "grid-cols-2 md:grid-cols-6"} bg-gray-800 border-2 ${
              tournamentTab === "libertadores" ? "border-primary/30" : "border-pink-500/30"
            }`}
          >
            <TabsTrigger value="news">Noticias</TabsTrigger>
            {tournamentTab === "libertadores" && <TabsTrigger value="groups">Grupos</TabsTrigger>}
            <TabsTrigger value="matches">Partidos</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            {tournamentTab === "libertadores" && <TabsTrigger value="draw">Sorteo</TabsTrigger>}
            <TabsTrigger value="teams">Equipos</TabsTrigger>
            <TabsTrigger value="players">Jugadores</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <Card className="border-primary/30 bg-card">
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
                  <Label>Título de la Noticia *</Label>
                  <Input
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    placeholder="Ej: Gran victoria de Deportivo Central"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenido *</Label>
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
                  <Label>Imagen Banner *</Label>
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
                  disabled={!newNews.title || !newNews.content || !newNews.image || newsList.length >= 4}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Noticia
                </Button>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Noticias Publicadas ({newsList.length}/4)</h3>
                  {isLoadingNews ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando noticias...</div>
                  ) : newsList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay noticias publicadas</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {newsList.map((news) => (
                        <Card key={news.id} className="border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={news.image_url || "/placeholder.svg"}
                                alt={news.title}
                                className="w-24 h-24 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{news.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{news.published_date}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteNews(news.id, news.title)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card className="border-primary/30 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Trophy className="w-5 h-5" />
                  Gestión de Grupos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Crea los grupos de la Copa Libertadores y asigna equipos a cada grupo
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Group Section */}
                <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/30">
                  <h3 className="font-semibold">Crear Nuevo Grupo</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ej: Grupo A"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateGroup}
                      className="bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                      disabled={!newGroupName.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Grupo
                    </Button>
                  </div>
                </div>

                {/* Assign Team to Group Section */}
                <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/30">
                  <h3 className="font-semibold">Asignar Equipo a Grupo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seleccionar Equipo</Label>
                      <Select
                        value={selectedTeamForAssignment}
                        onValueChange={setSelectedTeamForAssignment}
                        disabled={teams.length === 0}
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
                      <Label>Seleccionar Grupo</Label>
                      <Select
                        value={selectedGroupForAssignment}
                        onValueChange={setSelectedGroupForAssignment}
                        disabled={groups.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAssignTeamToGroup}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={!selectedTeamForAssignment || !selectedGroupForAssignment}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Asignar Equipo
                  </Button>
                </div>

                {/* Display Groups and Teams */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Grupos Creados ({groups.length})</h3>
                  {isLoadingGroups ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando grupos...</div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No hay grupos creados</p>
                      <p className="text-sm">Crea grupos usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {groups.map((group) => {
                        const teamsInGroup = groupStandings.filter((s: any) => s.copa_groups?.id === group.id)
                        return (
                          <Card key={group.id} className="border-primary/30">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteGroup(group.id, group.name)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Eliminar Grupo
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {teamsInGroup.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay equipos asignados</p>
                              ) : (
                                <div className="space-y-2">
                                  {teamsInGroup.map((standing: any) => (
                                    <div
                                      key={standing.id}
                                      className="flex items-center justify-between p-2 bg-background rounded border border-primary/20"
                                    >
                                      <span className="font-medium">{standing.teams?.name}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-primary">
                                          {standing.points} pts • {standing.played} PJ
                                        </Badge>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveTeamFromGroup(
                                              standing.team_id,
                                              standing.teams?.name,
                                              group.name,
                                            )
                                          }
                                          className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {selectedTournament === 2 && (
              <Card className="border-pink-500/30 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-500">
                    <Calendar className="w-5 h-5" />
                    Fechas Libres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateByeWeek} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Equipo</label>
                        <Select
                          value={newByeWeek.team_id}
                          onValueChange={(value) => setNewByeWeek({ ...newByeWeek, team_id: value })}
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
                      <div>
                        <label className="text-sm font-medium mb-2 block">Fecha</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Número de fecha"
                          value={newByeWeek.round}
                          onChange={(e) => setNewByeWeek({ ...newByeWeek, round: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Fecha Libre
                        </Button>
                      </div>
                    </div>
                  </form>

                  {byeWeeks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium mb-3">Fechas Libres Registradas</h3>
                      {byeWeeks.map((bye) => (
                        <div
                          key={bye.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className="bg-pink-500">{bye.round}</Badge>
                            <span className="font-medium">{bye.teams.name}</span>
                            <span className="text-sm text-gray-400">- Fecha Libre</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteByeWeek(bye.id, bye.teams.name, bye.round)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className={selectedTournament === 1 ? "border-primary/30" : "border-pink-500/30"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Calendar className="w-5 h-5" />
                  Gestión de Partidos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tournamentTab === "libertadores"
                    ? "Programa los partidos de la fase de grupos"
                    : "Programa los partidos de la liga"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Create Match Section */}
                <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/30">
                  <h3 className="font-semibold">Crear Nuevo Partido</h3>

                  {tournamentTab === "libertadores" && (
                    <div className="space-y-2">
                      <Label>Grupo *</Label>
                      <Select
                        value={newMatch.group_id}
                        onValueChange={(value) => {
                          setNewMatch({ ...newMatch, group_id: value, home_team_id: "", away_team_id: "" })
                          setSelectedGroupForMatch(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Equipo Local *</Label>
                      <Select
                        value={newMatch.home_team_id}
                        onValueChange={(value) => setNewMatch({ ...newMatch, home_team_id: value })}
                        disabled={tournamentTab === "libertadores" && !newMatch.group_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo local" />
                        </SelectTrigger>
                        <SelectContent>
                          {(tournamentTab === "femenino" ? teams : teamsInSelectedGroup).map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Equipo Visitante *</Label>
                      <Select
                        value={newMatch.away_team_id}
                        onValueChange={(value) => setNewMatch({ ...newMatch, away_team_id: value })}
                        disabled={tournamentTab === "libertadores" && !newMatch.group_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo visitante" />
                        </SelectTrigger>
                        <SelectContent>
                          {(tournamentTab === "femenino" ? teams : teamsInSelectedGroup)
                            .filter((team) => team.id.toString() !== newMatch.home_team_id)
                            .map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha *</Label>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha {tournamentTab === "libertadores" ? "*" : "(Jornada) *"}</Label>
                      <Input
                        type="text"
                        value={newMatch.round}
                        onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
                        placeholder={tournamentTab === "libertadores" ? "Ej: 1, 2, 3..." : "Ej: 1, 2, 3..."}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cancha</Label>
                      <Input
                        type="text"
                        value={newMatch.field}
                        onChange={(e) => setNewMatch({ ...newMatch, field: e.target.value })}
                        placeholder="Ej: Cancha Principal"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateMatch}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={
                      (tournamentTab === "libertadores" && !newMatch.group_id) ||
                      !newMatch.home_team_id ||
                      !newMatch.away_team_id ||
                      !newMatch.round ||
                      !newMatch.match_date
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Partido
                  </Button>
                </div>

                {/* Display Matches */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Partidos Creados ({matches.length})</h3>
                  {isLoadingMatches ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando partidos...</div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No hay partidos creados</p>
                      <p className="text-sm">Crea partidos usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Group matches by round */}
                      {Array.from(new Set(matches.map((m) => m.round)))
                        .sort((a, b) => {
                          // Custom sort for "cuartos", "semi", "final" to come after numbers
                          const order = ["cuartos", "semi", "final"]
                          if (typeof a === "number" && typeof b === "number") return a - b
                          if (typeof a === "number" && order.includes(b as string)) return -1
                          if (order.includes(a as string) && typeof b === "number") return 1
                          if (typeof a === "string" && typeof b === "string") {
                            const indexA = order.indexOf(a)
                            const indexB = order.indexOf(b)
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB
                          }
                          return 0 // Default sort if types are mixed or not in order
                        })
                        .map((round) => (
                          <div key={round} className="space-y-2">
                            <h4 className="font-semibold text-sm text-primary">
                              {round === "cuartos"
                                ? "Cuartos de Final"
                                : round === "semi"
                                  ? "Semifinales"
                                  : round === "final"
                                    ? "Final"
                                    : `Fecha ${round}`}
                            </h4>
                            <div className="grid gap-2">
                              {matches
                                .filter((m) => m.round === round)
                                .map((match) => (
                                  <Card key={match.id} className="border-primary/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                              {match.home_team?.name} vs {match.away_team?.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {match.copa_groups?.name}
                                            </Badge>
                                            {match.played && (
                                              <Badge className="bg-green-600 text-xs">
                                                {match.home_score} - {match.away_score}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(match.match_date).toLocaleDateString("es-ES", {
                                              weekday: "short",
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </p>
                                          {match.played && <MatchDetailsDisplay matchId={match.id} />}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteMatch(match.id, match.home_team?.name, match.away_team?.name)
                                          }
                                          className="border-red-300 text-red-600 hover:bg-red-50"
                                          disabled={match.played}
                                          title={
                                            match.played
                                              ? "No se puede eliminar un partido ya jugado"
                                              : "Eliminar partido"
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
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
                  Agrega los goleadores y tarjetas. Los goles se calcularán automáticamente.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
                    <p className="text-lg">No hay partidos cargados</p>
                    <p className="text-sm">
                      {tournamentTab === "libertadores"
                        ? "Primero debes agregar equipos y crear el fixture de la Copa Libertadores"
                        : "Primero debes agregar equipos y crear el fixture de la SuperLiga Femenina"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Seleccionar Fecha</Label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(matches.map((m) => m.round)))
                          .sort((a, b) => {
                            // Custom sort for "cuartos", "semi", "final" to come after numbers
                            const order = ["cuartos", "semi", "final"]
                            if (typeof a === "number" && typeof b === "number") return a - b
                            if (typeof a === "number" && order.includes(b as string)) return -1
                            if (order.includes(a as string) && typeof b === "number") return 1
                            if (typeof a === "string" && typeof b === "string") {
                              const indexA = order.indexOf(a)
                              const indexB = order.indexOf(b)
                              if (indexA !== -1 && indexB !== -1) return indexA - indexB
                            }
                            return 0 // Default sort if types are mixed or not in order
                          })
                          .map((round) => (
                            <Button
                              key={round}
                              variant={selectedRound === round.toString() ? "default" : "outline"}
                              className={
                                selectedRound === round.toString()
                                  ? "bg-gradient-to-r from-primary to-primary/80"
                                  : "border-primary/30"
                              }
                              onClick={() => {
                                setSelectedRound(round.toString())
                                setSelectedMatchId(null)
                              }}
                            >
                              {round === "cuartos"
                                ? "Cuartos de Final"
                                : round === "semi"
                                  ? "Semifinales"
                                  : round === "final"
                                    ? "Final"
                                    : `Fecha ${round}`}
                            </Button>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Seleccionar Partido</Label>
                      {Array.from(new Set(roundMatches.map((m) => m.copa_groups?.name)))
                        .filter(Boolean)
                        .map((groupName) => (
                          <div key={groupName} className="space-y-2">
                            <h4 className="text-sm font-semibold text-primary">{groupName}</h4>
                            <div className="grid gap-2">
                              {roundMatches
                                .filter((m) => m.copa_groups?.name === groupName)
                                .map((match) => (
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
                                          {match.home_team?.name} vs {match.away_team?.name}
                                        </span>
                                        {match.played && (
                                          <Badge className="bg-green-600 text-xs ml-2">
                                            {match.home_score} - {match.away_score}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs opacity-80">
                                        {new Date(match.match_date).toLocaleDateString("es-ES", {
                                          weekday: "short",
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </Button>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>

                    {selectedMatch && selectedMatch.played ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg border border-primary/30">
                          <p className="text-center text-muted-foreground mb-4">
                            Este partido ya ha finalizado. No se pueden agregar más goles o tarjetas.
                          </p>
                          <MatchDetailsDisplay matchId={selectedMatch.id} />
                        </div>
                      </div>
                    ) : (
                      selectedMatch && (
                        <>
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <h3 className="font-semibold text-lg text-center mb-2">
                              {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                            </h3>
                            <p className="text-sm text-center text-muted-foreground">
                              Fecha {selectedMatch.round} - Grupo {selectedMatch.copa_groups?.name}
                            </p>
                            {selectedMatch.field && (
                              <p className="text-sm text-center text-muted-foreground">Cancha: {selectedMatch.field}</p>
                            )}
                            {selectedMatch.match_time && (
                              <p className="text-sm text-center text-muted-foreground">
                                Hora: {selectedMatch.match_time}
                              </p>
                            )}
                          </div>

                          {/* Goleadores Local */}
                          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-primary">
                                ⚽ Goleadores {selectedMatch.home_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("goal", "home")}
                                className="border-primary/30 text-primary hover:bg-primary/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.home_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Amarillas Local */}
                          <div className="space-y-3 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-yellow-500">
                                🟨 Tarjetas Amarillas {selectedMatch.home_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("yellow", "home")}
                                className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.home_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Rojas Local */}
                          <div className="space-y-3 p-4 bg-red-500/5 rounded-lg border border-red-500/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-red-500">
                                🟥 Tarjetas Rojas {selectedMatch.home_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("red", "home")}
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.home_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Goleadores Visitante */}
                          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-primary">
                                ⚽ Goleadores {selectedMatch.away_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("goal", "away")}
                                className="border-primary/30 text-primary hover:bg-primary/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.away_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Amarillas Visitante */}
                          <div className="space-y-3 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-yellow-500">
                                🟨 Tarjetas Amarillas {selectedMatch.away_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("yellow", "away")}
                                className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.away_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Tarjetas Rojas Visitante */}
                          <div className="space-y-3 p-4 bg-red-500/5 rounded-lg border border-red-500/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold text-red-500">
                                🟥 Tarjetas Rojas {selectedMatch.away_team?.name}
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addIncident("red", "away")}
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
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
                                      {players
                                        .filter((p) =>
                                          teams.some(
                                            (t) => t.id === p.team_id && t.name === selectedMatch.away_team?.name,
                                          ),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
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
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => setShowResultConfirm(true)}
                            className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Resultado y Actualizar Tablas
                          </Button>
                        </>
                      )
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
                  {editingTeam ? "Editar Equipo" : "Gestión de Equipos"}
                </CardTitle>
                {editingTeam && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Editando: <span className="font-semibold text-primary">{editingTeam.name}</span>
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div data-team-form className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre del Equipo *</Label>
                    <Input
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Ej: Deportivo Central"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto del Equipo (JPG o PNG) {!editingTeam && "*"}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleTeamLogoUpload}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" disabled>
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {editingTeam
                        ? "Sube una nueva imagen para cambiar el logo actual (opcional)"
                        : "Selecciona una imagen JPG o PNG desde tu computadora"}
                    </p>
                    {newTeam.logo_url && (
                      <div className="mt-2 w-24 h-24 border border-primary/30 rounded-lg overflow-hidden">
                        <img
                          src={newTeam.logo_url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-contain bg-white"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Add Group selection for new teams */}
                  {tournamentTab === "libertadores" && (
                    <div className="space-y-2">
                      <Label>Grupo</Label>
                      <Select
                        value={newTeam.group_id}
                        onValueChange={(value) => setNewTeam({ ...newTeam, group_id: value === "none" ? "" : value })}
                        disabled={groups.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grupo (si aplica)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin grupo asignado</SelectItem>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddTeam}
                      className="flex-1 bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                      disabled={!newTeam.name.trim() || (!editingTeam && !newTeam.logo_url)}
                    >
                      {editingTeam ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Actualizar Equipo
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Equipo
                        </>
                      )}
                    </Button>
                    {editingTeam && (
                      <Button variant="outline" onClick={handleCancelEditTeam}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Equipos Registrados ({teams.length})</h3>
                  {isLoadingTeams ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando equipos...</div>
                  ) : teams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No hay equipos registrados</p>
                      <p className="text-sm">Agrega equipos usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="grid gap-3" data-teams-list>
                      {teams.map((team) => (
                        <Card key={team.id} className="border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{team.name}</h4>
                                {team.group_id && tournamentTab === "libertadores" && (
                                  <p className="text-sm text-muted-foreground">
                                    Grupo:{" "}
                                    {groups.find((g) => g.id.toString() === team.group_id?.toString())?.name ||
                                      "Desconocido"}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary">ID: {team.id}</Badge>
                                {team.logo_url && (
                                  <img
                                    src={team.logo_url || "/placeholder.svg"}
                                    alt={`${team.name} logo`}
                                    className="w-8 h-8 rounded-full object-contain bg-white"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                                    }}
                                  />
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTeam(team)}
                                  className="border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTeam(team.id, team.name)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card className="border-primary/30 bg-gradient-to-r from-black via-primary/10 to-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5" />
                  {editingPlayer ? "Editar Jugador" : "Gestión de Jugadores"}
                </CardTitle>
                {teams.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">Debes crear al menos un equipo antes de agregar jugadores</p>
                  </div>
                )}
                {editingPlayer && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">Editando: {editingPlayer.name}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      placeholder="Ej: Carlos Rodríguez"
                      disabled={teams.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula *</Label>
                    <Input
                      value={newPlayer.cedula}
                      onChange={(e) => setNewPlayer({ ...newPlayer, cedula: e.target.value })}
                      placeholder="Ej: 12345678"
                      disabled={teams.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Equipo *</Label>
                    <Select
                      value={newPlayer.team_id}
                      onValueChange={(value) => setNewPlayer({ ...newPlayer, team_id: value })}
                      disabled={teams.length === 0}
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
                    <Label>Número *</Label>
                    <Input
                      type="number"
                      value={newPlayer.number}
                      onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                      placeholder="10"
                      min="1"
                      max="99"
                      disabled={teams.length === 0}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingPlayer ? (
                    <>
                      <Button
                        onClick={handleUpdatePlayer}
                        className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700"
                        disabled={
                          teams.length === 0 ||
                          !newPlayer.name.trim() ||
                          !newPlayer.team_id ||
                          !newPlayer.cedula.trim() ||
                          !newPlayer.number
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Actualizar Jugador
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleAddPlayer}
                      disabled={isAddingPlayer}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {isAddingPlayer ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Jugador
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Jugadores Registrados ({players.length})</h3>

                  {players.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-primary/5 rounded-lg border border-primary/30">
                      <div className="space-y-2">
                        <Label>Filtrar por Equipo</Label>
                        <Select value={playerFilterTeam} onValueChange={setPlayerFilterTeam}>
                          <SelectTrigger>
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
                      <div className="space-y-2">
                        <Label>Buscar por Nombre</Label>
                        <Input
                          value={playerSearchTerm}
                          onChange={(e) => setPlayerSearchTerm(e.target.value)}
                          placeholder="Buscar jugador..."
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {isLoadingPlayers ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando jugadores...</div>
                  ) : filteredPlayers.length === 0 && players.length > 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No se encontraron jugadores con los filtros aplicados</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPlayerFilterTeam("all")
                          setPlayerSearchTerm("")
                        }}
                        className="mt-2"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>No hay jugadores registrados</p>
                      <p className="text-sm">Agrega jugadores usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {filteredPlayers.map((player) => (
                        <Card key={player.id} className="border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{player.name}</h4>
                                  <Badge variant="outline">#{player.number}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {player.teams?.name} • CI: {player.cedula}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPlayer(player)}
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePlayer(player.id, player.name)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showTournamentDialog} onOpenChange={setShowTournamentDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-primary/50 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy
                className={`w-6 h-6 ${pendingTournamentTab === "libertadores" ? "text-primary" : "text-pink-500"}`}
              />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Cambiar de Torneo
              </span>
            </AlertDialogTitle>
            <div className="space-y-3 pt-2">
              <AlertDialogDescription className="text-gray-300">
                Estás a punto de cambiar de{" "}
                <span className={`font-bold ${tournamentTab === "libertadores" ? "text-primary" : "text-pink-500"}`}>
                  {tournamentTab === "libertadores" ? "Copa Libertadores" : "SuperLiga Femenina"}
                </span>{" "}
                a{" "}
                <span
                  className={`font-bold ${pendingTournamentTab === "libertadores" ? "text-primary" : "text-pink-500"}`}
                >
                  {pendingTournamentTab === "libertadores" ? "Copa Libertadores" : "SuperLiga Femenina"}
                </span>
              </AlertDialogDescription>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <div className="font-semibold mb-1">Importante:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Se limpiarán todos los formularios</li>
                    <li>Asegúrate de guardar cambios pendientes</li>
                    <li>Los datos de cada torneo son independientes</li>
                  </ul>
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={cancelTournamentChange}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTournamentChange}
              className={`${
                pendingTournamentTab === "libertadores"
                  ? "bg-gradient-to-r from-primary via-blue-500 to-primary hover:from-primary/90 hover:via-blue-500/90 hover:to-primary/90"
                  : "bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 hover:from-pink-700 hover:via-pink-600 hover:to-pink-700"
              } text-white`}
            >
              Cambiar a {pendingTournamentTab === "libertadores" ? "Libertadores" : "Femenino"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
