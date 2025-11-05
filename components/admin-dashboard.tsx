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
import { createTeam, getTeams, deleteTeam, updateTeam } from "@/lib/actions/teams" // Import updateTeam
import { createPlayer, getPlayers, deletePlayer } from "@/lib/actions/players"
import { createNews, getNews, deleteNews } from "@/lib/actions/news"
import { useToast } from "@/hooks/use-toast"
import { createMatch, getMatches, deleteMatch, updateMatchResult } from "@/lib/actions/matches" // Import match actions
import MatchDetailsDisplay from "@/components/match-details-display" // Fixed import to match kebab-case filename
import { createClient } from "@/lib/supabase/client" // Fixed import path from utils to lib

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
}

interface Player {
  id: number
  name: string
  cedula: string
  number: number
  team_id: number
  teams?: { name: string; id: number }
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
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("results")
  const { toast } = useToast()

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

  const [newTeam, setNewTeam] = useState({ name: "", logo_url: "" })
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

  const loadMatchDetails = async (matchId: number) => {
    const supabase = await createClient()

    const { data: goals } = await supabase.from("goals").select("*, players(name, ci)").eq("match_id", matchId)

    const { data: cards } = await supabase.from("cards").select("*, players(name, ci)").eq("match_id", matchId)

    return { goals: goals || [], cards: cards || [] }
  }

  useEffect(() => {
    loadTeams()
    loadGroups() // Load groups on mount
    loadPlayers()
  }, [])

  // Players will be loaded only when needed

  useEffect(() => {
    if (activeTab === "news") {
      loadNews()
    }
  }, [activeTab])

  const loadMatches = async () => {
    setIsLoadingMatches(true)
    const matchesData = await getMatches()
    setMatches(matchesData)
    setIsLoadingMatches(false)
  }

  const handleCreateMatch = async () => {
    if (
      !newMatch.group_id ||
      !newMatch.home_team_id ||
      !newMatch.away_team_id ||
      !newMatch.round ||
      !newMatch.match_date
    ) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos para crear el partido.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("group_id", newMatch.group_id)
    formData.append("home_team_id", newMatch.home_team_id)
    formData.append("away_team_id", newMatch.away_team_id)
    formData.append("round", newMatch.round)
    formData.append("match_date", newMatch.match_date)
    if (newMatch.match_time) formData.append("match_time", newMatch.match_time)
    if (newMatch.field) formData.append("field", newMatch.field)

    const result = await createMatch(formData)

    if (result.success) {
      toast({
        title: "✅ ¡Partido creado exitosamente!",
        description: "El partido ha sido agregado al calendario.",
        className: "bg-green-50 border-green-200",
      })
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
    } else {
      toast({
        title: `❌ Error al crear partido`,
        description: result.error || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMatch = async (matchId: number, homeTeam: string, awayTeam: string) => {
    if (!confirm(`¿Estás seguro de eliminar el partido ${homeTeam} vs ${awayTeam}?`)) {
      return
    }

    const result = await deleteMatch(matchId)

    if (result.success) {
      toast({
        title: "✅ ¡Partido eliminado!",
        description: `El partido ${homeTeam} vs ${awayTeam} ha sido eliminado.`,
        className: "bg-green-50 border-green-200",
      })
      await loadMatches()
    } else {
      toast({
        title: `❌ Error al eliminar partido`,
        description: result.error || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const teamsInSelectedGroup = selectedGroupForMatch
    ? groupStandings
        .filter((s: any) => s.copa_groups?.id === Number.parseInt(selectedGroupForMatch))
        .map((s: any) => s.teams)
        .filter(Boolean)
    : []

  const loadTeams = async () => {
    setIsLoadingTeams(true)
    try {
      const data = await getTeams()
      setTeams(data)
    } catch (error) {
      console.error("[v0] Error loading teams:", error)
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
      const data = await getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error("[v0] Error loading players:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los jugadores",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  const loadNews = async () => {
    setIsLoadingNews(true)
    try {
      const data = await getNews()
      setNewsList(data)
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

  const loadGroups = async () => {
    setIsLoadingGroups(true)
    try {
      const { getGroups, getGroupStandings } = await import("@/lib/actions/groups")
      const groupsData = await getGroups()
      const standingsData = await getGroupStandings()
      setGroups(groupsData)
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

  useEffect(() => {
    if (isAuthenticated) {
      loadTeams()
      loadPlayers()
      loadGroups()
      loadNews()
      loadMatches()
    }
  }, [isAuthenticated])

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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "❌ Archivo inválido",
          description: "Por favor selecciona una imagen JPG o PNG",
          variant: "destructive",
        })
        return
      }

      setTeamLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewTeam({ ...newTeam, logo_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.logo_url) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos incluyendo la foto del equipo",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newTeam.name.trim())
      // Assuming logo_url is a data URL, it needs to be handled appropriately on the backend
      // If backend expects a file, this needs adjustment. For now, passing as is.
      if (teamLogoFile) {
        formData.append("logo", teamLogoFile) // Assuming backend expects 'logo' for file upload
      } else {
        formData.append("logo_url", newTeam.logo_url) // Fallback if no file is selected but logo_url exists
      }

      if (editingTeam) {
        // Update existing team
        await updateTeam(editingTeam.id, formData) // Pass formData to updateTeam
        toast({
          title: "✅ ¡Equipo actualizado exitosamente!",
          description: `${newTeam.name} ha sido actualizado`,
          className: "bg-green-50 border-green-200",
        })
        setEditingTeam(null)
      } else {
        // Create new team
        await createTeam(formData) // Pass formData to createTeam
        toast({
          title: "✅ ¡Equipo creado exitosamente!",
          description: `${newTeam.name} ha sido agregado a la base de datos`,
          className: "bg-green-50 border-green-200",
        })
      }

      setNewTeam({ name: "", logo_url: "" })
      setTeamLogoFile(null)
      await loadTeams()
    } catch (error) {
      console.error("[v0] Error creating/updating team:", error)
      toast({
        title: `❌ Error al ${editingTeam ? "actualizar" : "crear"} equipo`,
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setNewTeam({
      name: team.name,
      logo_url: team.logo_url || "",
    })
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEditTeam = () => {
    setEditingTeam(null)
    setNewTeam({ name: "", logo_url: "" })
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
      const { createGroup } = await import("@/lib/actions/groups")
      await createGroup(newGroupName.trim())

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
      const { assignTeamToGroup } = await import("@/lib/actions/groups")
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
      await loadGroups()
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
      const { removeTeamFromGroup } = await import("@/lib/actions/groups")
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
      const { deleteGroup } = await import("@/lib/actions/groups")
      await deleteGroup(groupId)

      toast({
        title: "✅ ¡Grupo eliminado!",
        description: `${groupName} ha sido eliminado exitosamente`,
        className: "bg-green-50 border-green-200",
      })

      await loadGroups()
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
    if (teams.length === 0) {
      toast({
        title: "❌ No hay equipos disponibles",
        description: "Debes crear al menos un equipo antes de agregar jugadores",
        variant: "destructive",
      })
      return
    }

    if (!newPlayer.name.trim() || !newPlayer.team_id || !newPlayer.cedula.trim() || !newPlayer.number) {
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
    console.log("[v0] Available teams:", teams)

    if (!selectedTeam) {
      toast({
        title: "❌ Error de sincronización",
        description: "El equipo seleccionado no está disponible. Por favor recarga la página e intenta nuevamente.",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newPlayer.name.trim())
      formData.append("cedula", newPlayer.cedula.trim())
      formData.append("number", newPlayer.number)
      formData.append("team_id", newPlayer.team_id)

      console.log("[v0] Calling createPlayer with formData")
      const result = await createPlayer(formData)

      if (!result.success) {
        toast({
          title: "❌ Error al crear jugador",
          description: result.error || "Ocurrió un error inesperado",
          variant: "destructive",
        })
        return
      }

      const teamName = selectedTeam.name

      toast({
        title: "✅ ¡Jugador creado exitosamente!",
        description: `${newPlayer.name} ha sido agregado a ${teamName}`,
        className: "bg-green-50 border-green-200",
      })

      setNewPlayer({ name: "", team_id: "", cedula: "", number: "" })
      await loadPlayers()
    } catch (error) {
      console.error("[v0] Error creating player:", error)
      toast({
        title: "❌ Error al crear jugador",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
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
      const formData = new FormData()
      formData.append("name", newPlayer.name.trim())
      formData.append("cedula", newPlayer.cedula.trim())
      formData.append("number", newPlayer.number)
      formData.append("team_id", newPlayer.team_id)

      const { updatePlayer } = await import("@/lib/actions/players")
      await updatePlayer(editingPlayer.id, formData)

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
      formData.append("image_url", newNews.image)
      formData.append("published_date", newNews.date)

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

  const performDraw = () => {
    console.log("[v0] Performing draw with real data from database")
    toast({
      title: "Sorteo realizado",
      description: "El sorteo se realizará con los datos reales de los clasificados",
    })
    setShowDrawConfirm(false)
    // Implement actual draw logic here if needed
    // For now, it's just a confirmation placeholder
    setDrawResults(["Equipo A vs Equipo B", "Equipo C vs Equipo D"]) // Example results
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
  const roundMatches = matches.filter((m) => m.round === Number.parseInt(selectedRound))
  const selectedMatch = matches.find((m) => m.id === selectedMatchId) // Use fetched matches

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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
              <TabsTrigger value="matches">Partidos</TabsTrigger>
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
              <Card className="border-primary/30 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Calendar className="w-5 h-5" />
                    Gestión de Partidos
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Crea los partidos de cada fecha. Solo pueden enfrentarse equipos del mismo grupo.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create Match Section */}
                  <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/30">
                    <h3 className="font-semibold">Crear Nuevo Partido</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Seleccionar Grupo *</Label>
                        <Select
                          value={selectedGroupForMatch}
                          onValueChange={(value) => {
                            setSelectedGroupForMatch(value)
                            setNewMatch({ ...newMatch, group_id: value, home_team_id: "", away_team_id: "" })
                          }}
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

                      <div className="space-y-2">
                        <Label>Jornada/Fecha *</Label>
                        <Input
                          type="number"
                          value={newMatch.round}
                          onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
                          placeholder="Ej: 1"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Equipo Local *</Label>
                        <Select
                          value={newMatch.home_team_id}
                          onValueChange={(value) => setNewMatch({ ...newMatch, home_team_id: value })}
                          disabled={!selectedGroupForMatch || teamsInSelectedGroup.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar equipo local" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamsInSelectedGroup.map((team: any) => (
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
                          disabled={!selectedGroupForMatch || teamsInSelectedGroup.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar equipo visitante" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamsInSelectedGroup
                              .filter((team: any) => team.id.toString() !== newMatch.home_team_id)
                              .map((team: any) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha del Partido *</Label>
                        <Input
                          type="date"
                          value={newMatch.match_date}
                          onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hora del Partido</Label>
                        <Input
                          type="time"
                          value={newMatch.match_time}
                          onChange={(e) => setNewMatch({ ...newMatch, match_time: e.target.value })}
                          placeholder="Ej: 17:00"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Cancha</Label>
                        <Input
                          type="text"
                          value={newMatch.field}
                          onChange={(e) => setNewMatch({ ...newMatch, field: e.target.value })}
                          placeholder="Ej: Cancha 1, Cancha Principal"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateMatch}
                      className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                      disabled={
                        !newMatch.group_id ||
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
                          .sort((a, b) => a - b)
                          .map((round) => (
                            <div key={round} className="space-y-2">
                              <h4 className="font-semibold text-sm text-primary">Fecha {round}</h4>
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
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
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
                        Primero debes agregar equipos y crear el fixture de la Copa Libertadores
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Seleccionar Fecha</Label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(matches.map((m) => m.round)))
                            .sort((a, b) => a - b)
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
                                Fecha {round}
                              </Button>
                            ))}
                          <Button
                            variant={selectedRound === "cuartos" ? "default" : "outline"}
                            className={
                              selectedRound === "cuartos"
                                ? "bg-gradient-to-r from-primary to-primary/80"
                                : "border-primary/30"
                            }
                            onClick={() => {
                              setSelectedRound("cuartos")
                              setSelectedMatchId(null)
                            }}
                          >
                            Cuartos de Final
                          </Button>
                          <Button
                            variant={selectedRound === "semi" ? "default" : "outline"}
                            className={
                              selectedRound === "semi"
                                ? "bg-gradient-to-r from-primary to-primary/80"
                                : "border-primary/30"
                            }
                            onClick={() => {
                              setSelectedRound("semi")
                              setSelectedMatchId(null)
                            }}
                          >
                            Semifinales
                          </Button>
                          <Button
                            variant={selectedRound === "final" ? "default" : "outline"}
                            className={
                              selectedRound === "final"
                                ? "bg-gradient-to-r from-primary to-primary/80"
                                : "border-primary/30"
                            }
                            onClick={() => {
                              setSelectedRound("final")
                              setSelectedMatchId(null)
                            }}
                          >
                            Final
                          </Button>
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
                                          {new Date(match.match_date).toLocaleDateString("es-ES")}
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
                                <p className="text-sm text-center text-muted-foreground">
                                  Cancha: {selectedMatch.field}
                                </p>
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
                                      onValueChange={(value) =>
                                        updateIncident("yellow", "home", index, "player", value)
                                      }
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
                                      onChange={(e) =>
                                        updateIncident("yellow", "home", index, "minute", e.target.value)
                                      }
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
                                      onValueChange={(value) =>
                                        updateIncident("yellow", "away", index, "player", value)
                                      }
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
                                      onChange={(e) =>
                                        updateIncident("yellow", "away", index, "minute", e.target.value)
                                      }
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
                  <div className="space-y-2">
                    <Label>Nombre del Equipo *</Label>
                    <Input
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Ej: Deportivo Central"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto del Equipo (JPG o PNG) *</Label>
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
                      Selecciona una imagen JPG o PNG desde tu computadora
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

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddTeam}
                      className="flex-1 bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                      disabled={!newTeam.name.trim() || !newTeam.logo_url}
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
                      <div className="grid gap-3">
                        {teams.map((team) => (
                          <Card key={team.id} className="border-primary/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{team.name}</h4>
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
                        className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                        disabled={
                          teams.length === 0 ||
                          !newPlayer.name.trim() ||
                          !newPlayer.team_id ||
                          !newPlayer.cedula.trim() ||
                          !newPlayer.number
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Jugador
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
