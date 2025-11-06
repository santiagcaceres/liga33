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
  goals?: Array<{ player_id: number; players: { name: string }; team_id: number }>
  cards?: Array<{ player_id: number; players: { name: string }; card_type: string; team_id: number }>
}

export default function LeagueFixtures() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      const supabase = createClient()

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
          home_team:teams!matches_home_team_id_fkey(name, logo_url, tournament_id),
          away_team:teams!matches_away_team_id_fkey(name, logo_url, tournament_id),
          goals(player_id, team_id, players(name)),
          cards(player_id, team_id, card_type, players(name))
        `,
        )
        .eq("tournament_id", 2)
        .order("match_date", { ascending: false })
        .order("round", { ascending: false })

      if (error) {
        console.error("[v0] Error loading matches:", error)
      }

      setMatches(data || [])
      setLoading(false)
    }

    loadMatches()
  }, [])

  const groupGoalsByPlayer = (goals: Match["goals"], teamId: number) => {
    if (!goals) return []
    const teamGoals = goals.filter((g) => g.team_id === teamId)
    const grouped = teamGoals.reduce(
      (acc, goal) => {
        const playerName = goal.players.name
        acc[playerName] = (acc[playerName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped).map(([name, count]) => ({ name, count }))
  }

  if (loading) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">Cargando fixtures...</div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-500">
            <Calendar className="w-6 h-6" />
            Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">Los fixtures estarán disponibles próximamente</div>
        </CardContent>
      </Card>
    )
  }

  const groupedByRound = matches.reduce(
    (acc, match) => {
      if (!acc[match.round]) acc[match.round] = []
      acc[match.round].push(match)
      return acc
    },
    {} as Record<number, Match[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedByRound)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([round, roundMatches]) => (
          <Card key={round} className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-500">
                <Calendar className="w-6 h-6" />
                Fecha {round}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roundMatches.map((match) => {
                  const homeGoals = groupGoalsByPlayer(match.goals, match.home_team.id)
                  const awayGoals = groupGoalsByPlayer(match.goals, match.away_team.id)
                  const homeCards = match.cards?.filter((c) => c.team_id === match.home_team.id) || []
                  const awayCards = match.cards?.filter((c) => c.team_id === match.away_team.id) || []

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 flex-1">
                              <img
                                src={match.home_team.logo_url || "/placeholder.svg"}
                                alt={match.home_team.name}
                                className="w-10 h-10 object-contain"
                              />
                              <span className="font-semibold text-white">{match.home_team.name}</span>
                            </div>
                            {match.played ? (
                              <span className="text-2xl font-bold text-white mx-4">{match.home_score}</span>
                            ) : (
                              <span className="text-gray-500 mx-4">-</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <img
                                src={match.away_team.logo_url || "/placeholder.svg"}
                                alt={match.away_team.name}
                                className="w-10 h-10 object-contain"
                              />
                              <span className="font-semibold text-white">{match.away_team.name}</span>
                            </div>
                            {match.played ? (
                              <span className="text-2xl font-bold text-white mx-4">{match.away_score}</span>
                            ) : (
                              <span className="text-gray-500 mx-4">-</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-gray-400 md:text-right">
                          <div className="flex items-center gap-2 md:justify-end">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.match_date).toLocaleDateString("es-UY")}
                          </div>
                          {match.match_time && (
                            <div className="flex items-center gap-2 md:justify-end">
                              <Clock className="w-4 h-4" />
                              {match.match_time}
                            </div>
                          )}
                          {match.field && (
                            <div className="flex items-center gap-2 md:justify-end">
                              <MapPin className="w-4 h-4" />
                              {match.field}
                            </div>
                          )}
                          <Badge
                            variant={match.played ? "default" : "secondary"}
                            className={match.played ? "bg-pink-500" : ""}
                          >
                            {match.played ? "Finalizado" : "Próximo"}
                          </Badge>
                        </div>
                      </div>

                      {match.played &&
                        (homeGoals.length > 0 ||
                          awayGoals.length > 0 ||
                          homeCards.length > 0 ||
                          awayCards.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-pink-500/20 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                {homeGoals.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-gray-400 mb-1">⚽ Goles:</div>
                                    <div className="text-gray-300 space-y-1">
                                      {homeGoals.map((goal, idx) => (
                                        <div key={idx}>
                                          {goal.name} {goal.count > 1 && `x${goal.count}`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {homeCards.length > 0 && (
                                  <div>
                                    <div className="text-gray-400 mb-1">🟨 Tarjetas:</div>
                                    <div className="text-gray-300 space-y-1">
                                      {homeCards.map((card, idx) => (
                                        <div key={idx}>
                                          {card.card_type === "yellow" ? "🟨" : "🟥"} {card.players.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                {awayGoals.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-gray-400 mb-1">⚽ Goles:</div>
                                    <div className="text-gray-300 space-y-1">
                                      {awayGoals.map((goal, idx) => (
                                        <div key={idx}>
                                          {goal.name} {goal.count > 1 && `x${goal.count}`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {awayCards.length > 0 && (
                                  <div>
                                    <div className="text-gray-400 mb-1">🟨 Tarjetas:</div>
                                    <div className="text-gray-300 space-y-1">
                                      {awayCards.map((card, idx) => (
                                        <div key={idx}>
                                          {card.card_type === "yellow" ? "🟨" : "🟥"} {card.players.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
