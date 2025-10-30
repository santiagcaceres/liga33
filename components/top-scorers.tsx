"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Trophy, Users, TrendingUp, Award, Star } from "lucide-react"

interface Player {
  id: number
  name: string
  team: string
  goals: number
  assists: number
  matches: number
  avgGoals: number
  position: string
  age: number
  trend: "up" | "down" | "same"
  recentGoals: number[]
}

const playersData: Player[] = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    team: "Deportivo Central",
    goals: 12,
    assists: 4,
    matches: 8,
    avgGoals: 1.5,
    position: "Delantero",
    age: 28,
    trend: "up",
    recentGoals: [2, 1, 0, 3, 1],
  },
  {
    id: 2,
    name: "Miguel Santos",
    team: "Racing FC",
    goals: 10,
    assists: 6,
    matches: 8,
    avgGoals: 1.25,
    position: "Mediocampista",
    age: 25,
    trend: "up",
    recentGoals: [1, 2, 1, 0, 2],
  },
  {
    id: 3,
    name: "Juan Pérez",
    team: "Club Atlético Unidos",
    goals: 8,
    assists: 3,
    matches: 8,
    avgGoals: 1.0,
    position: "Delantero",
    age: 30,
    trend: "same",
    recentGoals: [1, 0, 1, 1, 0],
  },
  {
    id: 4,
    name: "Diego López",
    team: "Independiente Sur",
    goals: 7,
    assists: 5,
    matches: 8,
    avgGoals: 0.88,
    position: "Mediocampista",
    age: 26,
    trend: "down",
    recentGoals: [0, 1, 0, 2, 0],
  },
  {
    id: 5,
    name: "Roberto García",
    team: "Boca Juniors Local",
    goals: 6,
    assists: 2,
    matches: 8,
    avgGoals: 0.75,
    position: "Delantero",
    age: 24,
    trend: "up",
    recentGoals: [1, 0, 1, 1, 1],
  },
  {
    id: 6,
    name: "Fernando Castro",
    team: "Vélez Local",
    goals: 5,
    assists: 4,
    matches: 8,
    avgGoals: 0.63,
    position: "Mediocampista",
    age: 29,
    trend: "up",
    recentGoals: [0, 1, 0, 0, 1],
  },
  {
    id: 7,
    name: "Andrés Silva",
    team: "San Lorenzo FC",
    goals: 5,
    assists: 1,
    matches: 8,
    avgGoals: 0.63,
    position: "Delantero",
    age: 27,
    trend: "same",
    recentGoals: [1, 0, 2, 0, 0],
  },
  {
    id: 8,
    name: "Pablo Morales",
    team: "Estudiantes Unidos",
    goals: 4,
    assists: 3,
    matches: 8,
    avgGoals: 0.5,
    position: "Mediocampista",
    age: 23,
    trend: "down",
    recentGoals: [0, 0, 1, 0, 1],
  },
  {
    id: 9,
    name: "Luis Martínez",
    team: "Tigre Deportivo",
    goals: 4,
    assists: 1,
    matches: 8,
    avgGoals: 0.5,
    position: "Delantero",
    age: 31,
    trend: "same",
    recentGoals: [0, 1, 0, 0, 1],
  },
  {
    id: 10,
    name: "Jorge Pérez",
    team: "Gimnasia FC",
    goals: 3,
    assists: 2,
    matches: 8,
    avgGoals: 0.38,
    position: "Mediocampista",
    age: 22,
    trend: "up",
    recentGoals: [0, 0, 0, 1, 1],
  },
  {
    id: 11,
    name: "Martín López",
    team: "Club Atlético Unidos",
    goals: 3,
    assists: 4,
    matches: 8,
    avgGoals: 0.38,
    position: "Mediocampista",
    age: 26,
    trend: "same",
    recentGoals: [1, 0, 0, 1, 0],
  },
  {
    id: 12,
    name: "Carlos Ruiz",
    team: "San Lorenzo FC",
    goals: 3,
    assists: 1,
    matches: 8,
    avgGoals: 0.38,
    position: "Delantero",
    age: 25,
    trend: "up",
    recentGoals: [0, 0, 1, 0, 1],
  },
]

export default function TopScorers() {
  const [selectedCategory, setSelectedCategory] = useState("goals")

  const topGoalScorers = [...playersData].sort((a, b) => b.goals - a.goals)
  const topAssists = [...playersData].sort((a, b) => b.assists - a.assists)
  const topAverage = [...playersData].sort((a, b) => b.avgGoals - a.avgGoals)
  const youngTalents = [...playersData].filter((p) => p.age <= 25).sort((a, b) => b.goals - a.goals)

  const getPositionColor = (pos: number) => {
    if (pos === 1) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
    if (pos === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
    if (pos === 3) return "bg-gradient-to-r from-orange-600 to-red-600 text-white"
    return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
    }
  }

  const getPositionBadgeColor = (position: string) => {
    switch (position) {
      case "Delantero":
        return "bg-red-500 text-white"
      case "Mediocampista":
        return "bg-blue-500 text-white"
      case "Defensor":
        return "bg-green-500 text-white"
      case "Arquero":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-pink-600" />
            Estadísticas de Jugadores - Liga 33
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="goals" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="goals">Goleadores</TabsTrigger>
              <TabsTrigger value="assists">Asistencias</TabsTrigger>
              <TabsTrigger value="average">Promedio</TabsTrigger>
              <TabsTrigger value="young">Jóvenes</TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-4">
              <div className="grid gap-4">
                {topGoalScorers.map((player, index) => (
                  <Card
                    key={player.id}
                    className={`border-pink-200 ${
                      index < 3
                        ? "bg-gradient-to-r from-pink-50 to-purple-50"
                        : "bg-gradient-to-r from-gray-50 to-purple-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionColor(index + 1)}`}
                          >
                            {index + 1}
                          </Badge>
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                          {index === 1 && <Award className="w-6 h-6 text-gray-400" />}
                          {index === 2 && <Star className="w-6 h-6 text-orange-600" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPositionBadgeColor(player.position)}>{player.position}</Badge>
                          {getTrendIcon(player.trend)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="font-bold text-lg">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.team}</div>
                          <div className="text-xs text-gray-500">Edad: {player.age} años</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-pink-600">{player.goals}</div>
                            <div className="text-xs text-gray-500">Goles</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-600">{player.assists}</div>
                            <div className="text-xs text-gray-500">Asist.</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-purple-600">{player.avgGoals.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Prom.</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-2">Últimos 5 partidos:</div>
                          <div className="flex gap-1">
                            {player.recentGoals.map((goals, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  goals > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                                }`}
                              >
                                {goals}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assists" className="space-y-4">
              <div className="grid gap-4">
                {topAssists.map((player, index) => (
                  <Card
                    key={player.id}
                    className={`border-blue-200 ${
                      index < 3
                        ? "bg-gradient-to-r from-blue-50 to-purple-50"
                        : "bg-gradient-to-r from-gray-50 to-blue-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionColor(index + 1)}`}
                          >
                            {index + 1}
                          </Badge>
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        </div>
                        <Badge className={getPositionBadgeColor(player.position)}>{player.position}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-bold text-lg">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.team}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{player.assists}</div>
                            <div className="text-xs text-gray-500">Asistencias</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-pink-600">{player.goals}</div>
                            <div className="text-xs text-gray-500">Goles</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-purple-600">{player.goals + player.assists}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="average" className="space-y-4">
              <div className="grid gap-4">
                {topAverage.map((player, index) => (
                  <Card
                    key={player.id}
                    className={`border-purple-200 ${
                      index < 3
                        ? "bg-gradient-to-r from-purple-50 to-pink-50"
                        : "bg-gradient-to-r from-gray-50 to-purple-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionColor(index + 1)}`}
                          >
                            {index + 1}
                          </Badge>
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        </div>
                        <Badge className={getPositionBadgeColor(player.position)}>{player.position}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-bold text-lg">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.team}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-purple-600">{player.avgGoals.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Promedio</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-pink-600">{player.goals}</div>
                            <div className="text-xs text-gray-500">Goles</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-600">{player.matches}</div>
                            <div className="text-xs text-gray-500">Partidos</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="young" className="space-y-4">
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">Talentos Jóvenes (25 años o menos)</span>
                </div>
                <p className="text-sm text-gray-600">Los jugadores más prometedores de la liga</p>
              </div>

              <div className="grid gap-4">
                {youngTalents.map((player, index) => (
                  <Card key={player.id} className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionColor(index + 1)}`}
                          >
                            {index + 1}
                          </Badge>
                          <Star className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">{player.age} años</Badge>
                          <Badge className={getPositionBadgeColor(player.position)}>{player.position}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-bold text-lg">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.team}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{player.goals}</div>
                            <div className="text-xs text-gray-500">Goles</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-600">{player.assists}</div>
                            <div className="text-xs text-gray-500">Asist.</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-purple-600">{player.avgGoals.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Prom.</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-600">156</div>
              <div className="text-sm text-gray-600">Goles Totales</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">89</div>
              <div className="text-sm text-gray-600">Asistencias</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">1.95</div>
              <div className="text-sm text-gray-600">Goles por Partido</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-sm text-gray-600">Jóvenes Talentos</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
