"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Trophy, Users, Target } from "lucide-react"

interface Match {
  id: number
  home: string
  away: string
  date: string
  time: string
  venue: string
  round: number
  status: "upcoming" | "live" | "finished"
  homeScore?: number
  awayScore?: number
  homeGoals?: string[]
  awayGoals?: string[]
}

const matchesData: Match[] = [
  // Fecha 9 - Próximos partidos
  {
    id: 1,
    home: "Racing FC",
    away: "Deportivo Central",
    date: "2025-01-18",
    time: "15:00",
    venue: "Cancha 1",
    round: 9,
    status: "upcoming",
  },
  {
    id: 2,
    home: "Club Atlético Unidos",
    away: "Independiente Sur",
    date: "2025-01-18",
    time: "17:00",
    venue: "Cancha 2",
    round: 9,
    status: "upcoming",
  },
  {
    id: 3,
    home: "Boca Juniors Local",
    away: "River Plate Regional",
    date: "2025-01-19",
    time: "15:00",
    venue: "Cancha 1",
    round: 9,
    status: "upcoming",
  },
  {
    id: 4,
    home: "San Lorenzo FC",
    away: "Estudiantes Unidos",
    date: "2025-01-19",
    time: "17:00",
    venue: "Cancha 2",
    round: 9,
    status: "upcoming",
  },
  {
    id: 5,
    home: "Vélez Local",
    away: "Huracán Regional",
    date: "2025-01-19",
    time: "19:00",
    venue: "Cancha 1",
    round: 9,
    status: "upcoming",
  },
  {
    id: 6,
    home: "Gimnasia FC",
    away: "Tigre Deportivo",
    date: "2025-01-20",
    time: "15:00",
    venue: "Cancha 2",
    round: 9,
    status: "upcoming",
  },

  // Fecha 8 - Resultados recientes
  {
    id: 7,
    home: "Deportivo Central",
    away: "Boca Juniors Local",
    date: "2025-01-11",
    time: "15:00",
    venue: "Cancha 1",
    round: 8,
    status: "finished",
    homeScore: 3,
    awayScore: 1,
    homeGoals: ["Carlos Rodríguez 15'", "Miguel Torres 34'", "Carlos Rodríguez 67'"],
    awayGoals: ["Roberto García 78'"],
  },
  {
    id: 8,
    home: "Racing FC",
    away: "Club Atlético Unidos",
    date: "2025-01-11",
    time: "17:00",
    venue: "Cancha 2",
    round: 8,
    status: "finished",
    homeScore: 2,
    awayScore: 2,
    homeGoals: ["Miguel Santos 23'", "Diego Fernández 89'"],
    awayGoals: ["Juan Pérez 45'", "Martín López 72'"],
  },
  {
    id: 9,
    home: "Independiente Sur",
    away: "River Plate Regional",
    date: "2025-01-12",
    time: "15:00",
    venue: "Cancha 1",
    round: 8,
    status: "finished",
    homeScore: 1,
    awayScore: 0,
    homeGoals: ["Diego López 56'"],
    awayGoals: [],
  },
  {
    id: 10,
    home: "Estudiantes Unidos",
    away: "San Lorenzo FC",
    date: "2025-01-12",
    time: "17:00",
    venue: "Cancha 2",
    round: 8,
    status: "finished",
    homeScore: 1,
    awayScore: 2,
    homeGoals: ["Pablo Morales 34'"],
    awayGoals: ["Andrés Silva 12'", "Carlos Ruiz 83'"],
  },
  {
    id: 11,
    home: "Huracán Regional",
    away: "Vélez Local",
    date: "2025-01-12",
    time: "19:00",
    venue: "Cancha 1",
    round: 8,
    status: "finished",
    homeScore: 0,
    awayScore: 1,
    homeGoals: [],
    awayGoals: ["Fernando Castro 67'"],
  },
  {
    id: 12,
    home: "Tigre Deportivo",
    away: "Gimnasia FC",
    date: "2025-01-13",
    time: "15:00",
    venue: "Cancha 2",
    round: 8,
    status: "finished",
    homeScore: 1,
    awayScore: 1,
    homeGoals: ["Luis Martínez 45'"],
    awayGoals: ["Jorge Pérez 78'"],
  },
]

export default function FixturesSystem() {
  const [selectedRound, setSelectedRound] = useState(9)

  const upcomingMatches = matchesData.filter((match) => match.status === "upcoming")
  const finishedMatches = matchesData.filter((match) => match.status === "finished")
  const roundMatches = matchesData.filter((match) => match.round === selectedRound)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "live":
        return "bg-red-500 animate-pulse"
      case "finished":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Próximo"
      case "live":
        return "En Vivo"
      case "finished":
        return "Finalizado"
      default:
        return "Programado"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Fixtures y Resultados - Liga 33
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Próximos Partidos</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="rounds">Por Fecha</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid gap-4">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getStatusColor(match.status)} text-white`}>
                          {getStatusText(match.status)}
                        </Badge>
                        <div className="text-sm text-gray-600">Fecha {match.round}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="text-center md:text-right">
                          <div className="font-bold text-lg">{match.home}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-400 mb-1">VS</div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {formatDate(match.date)} - {match.time}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {match.venue}
                          </div>
                        </div>

                        <div className="text-center md:text-left">
                          <div className="font-bold text-lg">{match.away}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="grid gap-4">
                {finishedMatches.map((match) => (
                  <Card key={match.id} className="border-green-200 bg-gradient-to-r from-green-50 to-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getStatusColor(match.status)} text-white`}>
                          {getStatusText(match.status)}
                        </Badge>
                        <div className="text-sm text-gray-600">Fecha {match.round}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="text-center md:text-right">
                          <div className="font-bold text-lg">{match.home}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {match.homeScore} - {match.awayScore}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(match.date)}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {match.venue}
                          </div>
                        </div>

                        <div className="text-center md:text-left">
                          <div className="font-bold text-lg">{match.away}</div>
                        </div>
                      </div>

                      {/* Goleadores del partido */}
                      {(match.homeGoals?.length || match.awayGoals?.length) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {match.home}
                              </div>
                              {match.homeGoals?.map((goal, i) => (
                                <div key={i} className="text-gray-600 ml-5">
                                  {goal}
                                </div>
                              )) || <div className="text-gray-400 ml-5">Sin goles</div>}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {match.away}
                              </div>
                              {match.awayGoals?.map((goal, i) => (
                                <div key={i} className="text-gray-600 ml-5">
                                  {goal}
                                </div>
                              )) || <div className="text-gray-400 ml-5">Sin goles</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rounds" className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(22)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={selectedRound === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRound(i + 1)}
                    className={selectedRound === i + 1 ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                  >
                    Fecha {i + 1}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                {roundMatches.length > 0 ? (
                  roundMatches.map((match) => (
                    <Card
                      key={match.id}
                      className={`border-purple-200 ${
                        match.status === "finished"
                          ? "bg-gradient-to-r from-green-50 to-purple-50"
                          : "bg-gradient-to-r from-blue-50 to-purple-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${getStatusColor(match.status)} text-white`}>
                            {getStatusText(match.status)}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            {match.status === "upcoming"
                              ? `${match.time} - ${formatDate(match.date)}`
                              : formatDate(match.date)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="text-center md:text-right">
                            <div className="font-bold text-lg">{match.home}</div>
                          </div>

                          <div className="text-center">
                            {match.status === "finished" ? (
                              <div className="text-3xl font-bold text-purple-600">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            ) : (
                              <div className="text-2xl font-bold text-gray-400">VS</div>
                            )}
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {match.venue}
                            </div>
                          </div>

                          <div className="text-center md:text-left">
                            <div className="font-bold text-lg">{match.away}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay partidos programados para esta fecha</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Estadísticas de la fecha */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">9</div>
              <div className="text-sm text-gray-600">Fecha Actual</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Partidos por Fecha</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-sm text-gray-600">Goles Fecha 8</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Clock className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-600">22</div>
              <div className="text-sm text-gray-600">Fechas Totales</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
