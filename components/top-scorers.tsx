"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Scorer {
  player_id: number
  player_name: string
  team_name: string
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

      const { data: goalsData, error } = await supabase.from("goals").select(`
          player_id,
          players (
            name,
            teams (
              name
            )
          )
        `)

      if (error) {
        console.error("[v0] Error loading scorers:", error)
        setLoading(false)
        return
      }

      const scorersMap = new Map<number, Scorer>()

      goalsData?.forEach((goal: any) => {
        const playerId = goal.player_id
        const playerName = goal.players?.name || "Desconocido"
        const teamName = goal.players?.teams?.name || "Sin equipo"

        if (scorersMap.has(playerId)) {
          const scorer = scorersMap.get(playerId)!
          scorer.goals += 1
        } else {
          scorersMap.set(playerId, {
            player_id: playerId,
            player_name: playerName,
            team_name: teamName,
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
            <div className="overflow-x-auto">
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
                      className={`border-b border-primary/20 ${index === 0 ? "bg-primary/10" : ""}`}
                    >
                      <td className="p-3 font-semibold text-primary">{index + 1}</td>
                      <td className="p-3 font-medium">{scorer.player_name}</td>
                      <td className="p-3 text-muted-foreground">{scorer.team_name}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                          {scorer.goals}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
