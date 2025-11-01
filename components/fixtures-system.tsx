"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Match {
  id: number
  home_team: { name: string }
  away_team: { name: string }
  match_date: string
  round: number
  played: boolean
  home_score?: number
  away_score?: number
  copa_groups: { name: string }
}

export default function FixturesSystem() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      console.log("[v0] Loading matches for fixtures...")
      const supabase = createClient()

      const today = new Date()
      today.setHours(0, 0, 0, 0) // Resetear a medianoche
      const todayISO = today.toISOString()

      console.log("[v0] Filtering matches from:", todayISO)

      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          match_date,
          round,
          played,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name),
          copa_groups(name)
        `,
        )
        .eq("played", false)
        .gte("match_date", todayISO)
        .order("match_date", { ascending: true })
        .order("round", { ascending: true })

      if (error) {
        console.error("[v0] Error loading matches:", error)
      } else {
        console.log("[v0] Matches loaded:", { total: data?.length || 0, matches: data })
      }

      setMatches(data || [])
      setLoading(false)
    }

    loadMatches()
  }, [])

  console.log("[v0] Upcoming matches to display:", { total: matches.length, matches })

  if (loading) {
    return (
      <Card className="border-primary/30 bg-card">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Cargando partidos...</div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="w-6 h-6" />
            Próximos Partidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay partidos próximos</p>
            <p className="text-sm">No hay partidos programados desde hoy en adelante</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="w-6 h-6" />
            Próximos Partidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(matches.map((m) => m.round)))
              .sort((a, b) => a - b)
              .map((round) => (
                <div key={round} className="space-y-2">
                  <h3 className="font-semibold text-primary">Fecha {round}</h3>
                  <div className="grid gap-3">
                    {matches
                      .filter((m) => m.round === round)
                      .map((match) => (
                        <Card key={match.id} className="border-primary/30 bg-primary/5">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">
                                    {match.home_team.name} vs {match.away_team.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {match.copa_groups.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(match.match_date).toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
