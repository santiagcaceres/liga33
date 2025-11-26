"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Scorer {
  player_id: number
  player_name: string
  team_name: string
  team_logo: string
  goals: number
}

export default function TopScorers() {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScorers()
  }, [])

  const loadScorers = async () => {
    try {
      const supabase = await createClient()

      const { data: goalsData, error } = await supabase
        .from("goals")
        .select(`
          player_id,
          players (
            name,
            teams!inner (
              name,
              logo_url,
              tournament_id
            )
          )
        `)
        .eq("players.teams.tournament_id", 1)

      if (error) {
        console.error("[v0] Error loading scorers:", error)
        setLoading(false)
        return
      }

      const scorersMap = new Map<number, Scorer>()

      goalsData?.forEach((goal: any) => {
        const playerId = goal.player_id
        const playerName = goal.players?.name
        const teamName = goal.players?.teams?.name
        const teamLogo = goal.players?.teams?.logo_url

        if (!playerName || !teamName || playerName === "Desconocido" || teamName === "Sin equipo") {
          return // Skip this goal
        }

        if (scorersMap.has(playerId)) {
          const scorer = scorersMap.get(playerId)!
          scorer.goals += 1
        } else {
          scorersMap.set(playerId, {
            player_id: playerId,
            player_name: playerName,
            team_name: teamName,
            team_logo: teamLogo || "",
            goals: 1,
          })
        }
      })

      const scorersArray = Array.from(scorersMap.values())
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10) // Top 10 goleadores

      setScorers(scorersArray)
    } catch (error) {
      console.error("[v0] Error in loadScorers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="w-6 h-6" />
              Tabla de Goleadores - Copa Libertadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary animate-pulse" />
              <p className="text-lg">Cargando goleadores...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-6 h-6" />
            Tabla de Goleadores - Copa Libertadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scorers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
              <p className="text-lg">No hay goleadores registrados</p>
              <p className="text-sm">
                Los goleadores se actualizarán automáticamente cuando el administrador cargue los resultados de los
                partidos
              </p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/30">
                      <th className="text-left p-3 w-16">#</th>
                      <th className="text-left p-3">Jugador</th>
                      <th className="text-left p-3">Equipo</th>
                      <th className="text-center p-3 w-24">Goles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorers.map((scorer, index) => (
                      <tr
                        key={scorer.player_id}
                        className={`border-b border-primary/20 transition-colors ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30"
                            : "hover:bg-primary/5"
                        }`}
                      >
                        <td className="p-3 font-semibold text-primary">{index + 1}</td>
                        <td className={`p-3 ${index === 0 ? "font-bold text-xl" : "font-semibold text-lg"}`}>
                          {scorer.player_name}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={scorer.team_logo || "/placeholder.svg"}
                              alt={scorer.team_name}
                              className="w-6 h-6 object-contain"
                            />
                            <span className="text-muted-foreground">{scorer.team_name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full font-bold ${
                              index === 0
                                ? "w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-xl shadow-lg"
                                : "w-10 h-10 bg-primary/20 text-primary"
                            }`}
                          >
                            {scorer.goals}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2">
                {scorers.map((scorer, index) => (
                  <div
                    key={scorer.player_id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`font-bold ${index === 0 ? "text-yellow-500 text-lg" : "text-primary text-sm"}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${index === 0 ? "text-lg" : "text-base"}`}>
                          {scorer.player_name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <img
                            src={scorer.team_logo || "/placeholder.svg"}
                            alt={scorer.team_name}
                            className="w-4 h-4 object-contain"
                          />
                          <span>{scorer.team_name}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${
                        index === 0
                          ? "w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-lg shadow-lg"
                          : "w-8 h-8 bg-primary/20 text-primary text-sm"
                      }`}
                    >
                      {scorer.goals}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
