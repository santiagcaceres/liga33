"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Match {
  id: number
  home_team: { name: string; logo_url: string }
  away_team: { name: string; logo_url: string }
  match_date: string
  match_time?: string
  field?: string
  round: number
  played: boolean
  home_score?: number
  away_score?: number
  copa_groups: { name: string }
  goals?: Array<{ player_id: number; players: { name: string }; team_id: number }>
  cards?: Array<{ player_id: number; players: { name: string }; card_type: string; team_id: number }>
}

export default function FixturesSystem() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      console.log("[v0] Loading matches for fixtures...")
      const supabase = createClient()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString().split("T")[0]

      console.log("[v0] Filtering matches from:", todayISO)

      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          match_date,
          match_time,
          field,
          round,
          played,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url),
          copa_groups(name),
          goals(player_id, team_id, players(name)),
          cards(player_id, team_id, card_type, players(name))
        `,
        )
        .order("match_date", { ascending: false })
        .order("round", { ascending: false })

      if (error) {
        console.error("[v0] Error loading matches:", error)
      } else {
        console.log("[v0] Matches loaded:", { total: data?.length || 0 })
      }

      setMatches(data || [])
      setLoading(false)
    }

    loadMatches()
  }, [])

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
            Fixture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay partidos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString().split("T")[0]

  const pastMatches = matches.filter((m) => m.played || m.match_date < todayISO)
  const upcomingMatches = matches.filter((m) => !m.played && m.match_date >= todayISO)

  return (
    <div className="space-y-6">
      {pastMatches.length > 0 && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-6 h-6" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(pastMatches.map((m) => m.round)))
                .sort((a, b) => b - a)
                .map((round) => (
                  <div key={round} className="space-y-2">
                    <h3 className="font-semibold text-primary">Fecha {round}</h3>
                    <div className="grid gap-3">
                      {pastMatches
                        .filter((m) => m.round === round)
                        .map((match) => (
                          <Card key={match.id} className="border-primary/30 bg-primary/5">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-2 md:gap-4">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                  {match.home_team.logo_url && (
                                    <img
                                      src={match.home_team.logo_url || "/placeholder.svg"}
                                      alt={match.home_team.name}
                                      className="w-8 h-8 md:w-12 md:h-12 object-contain flex-shrink-0"
                                    />
                                  )}
                                  <span className="font-semibold text-xs md:text-base truncate">
                                    {match.home_team.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-lg md:text-2xl font-bold">
                                    {match.home_score} - {match.away_score}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end min-w-0">
                                  <span className="font-semibold text-xs md:text-base text-right truncate">
                                    {match.away_team.name}
                                  </span>
                                  {match.away_team.logo_url && (
                                    <img
                                      src={match.away_team.logo_url || "/placeholder.svg"}
                                      alt={match.away_team.name}
                                      className="w-8 h-8 md:w-12 md:h-12 object-contain flex-shrink-0"
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {match.copa_groups.name}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>
                                    {new Date(match.match_date).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </div>
                                {match.match_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{match.match_time.slice(0, 5)}</span>
                                  </div>
                                )}
                                {match.field && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{match.field}</span>
                                  </div>
                                )}
                              </div>

                              {match.played && (match.goals?.length > 0 || match.cards?.length > 0) && (
                                <div className="mt-3 pt-3 border-t border-primary/20 space-y-1 text-sm text-muted-foreground">
                                  {match.goals && match.goals.length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-medium">⚽</span>
                                      <div className="flex-1">
                                        {(() => {
                                          const goalsByPlayer = match.goals.reduce(
                                            (acc: Record<string, { name: string; count: number }>, goal) => {
                                              const playerId = goal.player_id.toString()
                                              if (!acc[playerId]) {
                                                acc[playerId] = { name: goal.players.name, count: 0 }
                                              }
                                              acc[playerId].count++
                                              return acc
                                            },
                                            {},
                                          )

                                          return Object.values(goalsByPlayer).map((player, idx) => (
                                            <span key={idx} className="inline-block mr-2">
                                              {player.name}
                                              {player.count > 1 && (
                                                <span className="font-semibold"> x{player.count}</span>
                                              )}
                                            </span>
                                          ))
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  {match.cards && match.cards.filter((c) => c.card_type === "yellow").length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-medium">🟨</span>
                                      <div className="flex-1">
                                        {match.cards
                                          .filter((c) => c.card_type === "yellow")
                                          .map((card, idx) => (
                                            <span key={idx} className="inline-block mr-2">
                                              {card.players.name}
                                            </span>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                  {match.cards && match.cards.filter((c) => c.card_type === "red").length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-medium">🟥</span>
                                      <div className="flex-1">
                                        {match.cards
                                          .filter((c) => c.card_type === "red")
                                          .map((card, idx) => (
                                            <span key={idx} className="inline-block mr-2">
                                              {card.players.name}
                                            </span>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingMatches.length > 0 && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-6 h-6" />
              Próximos Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(upcomingMatches.map((m) => m.round)))
                .sort((a, b) => a - b)
                .map((round) => (
                  <div key={round} className="space-y-2">
                    <h3 className="font-semibold text-primary">Fecha {round}</h3>
                    <div className="grid gap-3">
                      {upcomingMatches
                        .filter((m) => m.round === round)
                        .map((match) => (
                          <Card key={match.id} className="border-primary/30 bg-primary/5">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-2 md:gap-4">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                  {match.home_team.logo_url && (
                                    <img
                                      src={match.home_team.logo_url || "/placeholder.svg"}
                                      alt={match.home_team.name}
                                      className="w-8 h-8 md:w-12 md:h-12 object-contain flex-shrink-0"
                                    />
                                  )}
                                  <span className="font-semibold text-xs md:text-base truncate">
                                    {match.home_team.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-primary font-bold text-base md:text-lg">VS</span>
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end min-w-0">
                                  <span className="font-semibold text-xs md:text-base text-right truncate">
                                    {match.away_team.name}
                                  </span>
                                  {match.away_team.logo_url && (
                                    <img
                                      src={match.away_team.logo_url || "/placeholder.svg"}
                                      alt={match.away_team.name}
                                      className="w-8 h-8 md:w-12 md:h-12 object-contain flex-shrink-0"
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {match.copa_groups.name}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>
                                    {new Date(match.match_date).toLocaleDateString("es-ES", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                    })}
                                  </span>
                                </div>
                                {match.match_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{match.match_time.slice(0, 5)}</span>
                                  </div>
                                )}
                                {match.field && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{match.field}</span>
                                  </div>
                                )}
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
      )}
    </div>
  )
}
