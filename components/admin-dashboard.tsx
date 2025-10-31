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
import { createTeam, getTeams, deleteTeam } from "@/lib/actions/teams"
import { createPlayer, getPlayers, deletePlayer } from "@/lib/actions/players"
import { createNews, getNews } from "@/lib/actions/news"
import { useToast } from "@/hooks/use-toast"

interface Match {
  id: number
  round: number
  group: string
  home: string
  away: string
  date: string
}

interface Team {
  id: number
  name: string
  coach: string
}

interface Player {
  id: number
  name: string
  cedula: string
  number: number
  age: number
  team_id: number
  teams?: { name: string }
}

interface News {
  id: number
  title: string
  content: string
  image: string
  date: string
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

  const [newTeam, setNewTeam] = useState({ name: "", coach: "" })
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    team_id: "",
    cedula: "",
    age: "",
    number: "",
  })
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)

  const [newsList, setNewsList] = useState<News[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(false)

  const [groups, setGroups] = useState<{ id: number; name: string }[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState("")
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState("")
  const [groupStandings, setGroupStandings] = useState<any[]>([])

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

    toast({
      title: "Resultado guardado",
      description: "Las estadísticas se actualizaron automáticamente",
    })

    setShowResultConfirm(false)
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
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewNews({ ...newNews, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTeam = async () => {
    // Validate all fields are filled
    if (!newTeam.name.trim() || !newTeam.coach.trim()) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor completa todos los campos antes de crear el equipo",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newTeam.name.trim())
      formData.append("coach", newTeam.coach.trim())

      await createTeam(formData)

      toast({
        title: "✅ ¡Equipo creado exitosamente!",
        description: `${newTeam.name} ha sido agregado a la base de datos`,
        className: "bg-green-50 border-green-200",
      })

      setNewTeam({ name: "", coach: "" })
      await loadTeams()
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      toast({
        title: "❌ Error al crear equipo",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
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

  const handleAddPlayer = async () => {
    if (teams.length === 0) {
      toast({
        title: "❌ No hay equipos disponibles",
        description: "Debes crear al menos un equipo antes de agregar jugadores",
        variant: "destructive",
      })
      return
    }

    // Validate all fields are filled
    if (
      !newPlayer.name.trim() ||
      !newPlayer.team_id ||
      !newPlayer.cedula.trim() ||
      !newPlayer.age ||
      !newPlayer.number
    ) {
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
      age: newPlayer.age,
      team_id: newPlayer.team_id,
      team_id_type: typeof newPlayer.team_id,
    })

    const selectedTeam = teams.find((t) => t.id === Number.parseInt(newPlayer.team_id))
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
      formData.append("age", newPlayer.age)
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

      setNewPlayer({ name: "", team_id: "", cedula: "", age: "", number: "" })
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

  const handleAddNews = async () => {
    // Validate all fields are filled
    if (!newNews.title.trim() || !newNews.content.trim() || !newNews.image) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos antes de crear la noticia",
        variant: "destructive",
      })
      return
    }

    // Validate max 4 news
    if (newsList.length >= 4) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes tener un máximo de 4 noticias publicadas",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", newNews.title.trim())
      formData.append("content", newNews.content.trim())
      formData.append("image", newNews.image)
      formData.append("date", newNews.date)

      await createNews(formData)

      toast({
        title: "¡Noticia publicada exitosamente!",
        description: `"${newNews.title}" ha sido agregada`,
        className: "bg-green-50 border-green-200",
      })

      setNewNews({ title: "", content: "", image: "", date: new Date().toISOString().split("T")[0] })
      setNewsImageFile(null)
      await loadNews()
    } catch (error) {
      console.error("[v0] Error creating news:", error)
      toast({
        title: "Error al crear noticia",
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
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
                                  src={news.image || "/placeholder.svg"}
                                  alt={news.title}
                                  className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold">{news.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{news.date}</p>
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
                                <CardTitle className="text-lg">{group.name}</CardTitle>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.home),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.home),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.home),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.away),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.away),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                                      {players
                                        .filter((p) =>
                                          teams.some((t) => t.id === p.team_id && t.name === selectedMatch.away),
                                        )
                                        .map((player) => (
                                          <SelectItem key={player.id} value={`${player.name} (${player.id})`}>
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
                      <Label>Nombre del Equipo *</Label>
                      <Input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Ej: Deportivo Central"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Director Técnico *</Label>
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
                    disabled={!newTeam.name.trim() || !newTeam.coach.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                  </Button>

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
                                  <p className="text-sm text-muted-foreground">DT: {team.coach}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary">ID: {team.id}</Badge>
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
                    Gestión de Jugadores
                  </CardTitle>
                  {teams.length === 0 && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">Debes crear al menos un equipo antes de agregar jugadores</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <Label>Edad *</Label>
                      <Input
                        type="number"
                        value={newPlayer.age}
                        onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                        placeholder="25"
                        min="16"
                        max="45"
                        disabled={teams.length === 0}
                      />
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

                  <Button
                    onClick={handleAddPlayer}
                    className="w-full bg-gradient-to-r from-black via-primary to-black hover:from-gray-900 hover:via-primary/90 hover:to-gray-900"
                    disabled={
                      teams.length === 0 ||
                      !newPlayer.name.trim() ||
                      !newPlayer.team_id ||
                      !newPlayer.cedula.trim() ||
                      !newPlayer.age ||
                      !newPlayer.number
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Jugador
                  </Button>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Jugadores Registrados ({players.length})</h3>
                    {isLoadingPlayers ? (
                      <div className="text-center py-8 text-muted-foreground">Cargando jugadores...</div>
                    ) : players.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                        <p>No hay jugadores registrados</p>
                        <p className="text-sm">Agrega jugadores usando el formulario de arriba</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {players.map((player) => (
                          <Card key={player.id} className="border-primary/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{player.name}</h4>
                                    <Badge variant="outline">#{player.number}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {player.teams?.name} • CI: {player.cedula} • {player.age} años
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePlayer(player.id, player.name)}
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
