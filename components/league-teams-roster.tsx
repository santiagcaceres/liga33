"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Player {
  id: number
  name: string
  number: number
  goals: number
  yellow_cards: number
  red_cards: number
}

interface Team {
  id: number
  name: string
  logo_url: string
  coach: string
  players: Player[]
}

export default function LeagueTeamsRoster() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTeams = async () => {
      const supabase = createClient()

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name, logo_url, coach")
        .eq("tournament_id", 2)
        .order("name")

      if (teamsError) {
        console.error("[v0] Error loading teams:", teamsError)
        setLoading(false)
        return
      }

      const teamsWithPlayers = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { data: playersData } = await supabase
            .from("players")
            .select("id, name, number, goals, yellow_cards, red_cards")
            .eq("team_id", team.id)
            .order("number")

          return {
            ...team,
            players: playersData || [],
          }
        }),
      )

      setTeams(teamsWithPlayers)
      setLoading(false)
    }

    loadTeams()
  }, [])

  if (loading) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">Cargando equipos...</div>
        </CardContent>
      </Card>
    )
  }

  if (teams.length === 0) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-500">
            <Users className="w-6 h-6" />
            Equipos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">Los equipos estarán disponibles próximamente</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <Card key={team.id} className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <img src={team.logo_url || "/placeholder.svg"} alt={team.name} className="w-12 h-12 object-contain" />
              <div>
                <div className="text-pink-500">{team.name}</div>
                {team.coach && <div className="text-sm text-gray-400 font-normal">DT: {team.coach}</div>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {team.players.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No hay jugadoras registradas</div>
            ) : (
              <>
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-500/30">
                        <th className="text-left p-3 text-pink-500 font-semibold">N°</th>
                        <th className="text-left p-3 text-pink-500 font-semibold">Jugadora</th>
                        <th className="text-center p-3 text-pink-500 font-semibold">Goles</th>
                        <th className="text-center p-3 text-pink-500 font-semibold">🟨</th>
                        <th className="text-center p-3 text-pink-500 font-semibold">🟥</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.players.map((player) => (
                        <tr
                          key={player.id}
                          className="border-b border-pink-500/10 hover:bg-pink-500/5 transition-colors"
                        >
                          <td className="p-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-white font-bold">
                              {player.number}
                            </span>
                          </td>
                          <td className="p-3 text-white font-semibold">{player.name}</td>
                          <td className="text-center p-3 text-gray-300">{player.goals}</td>
                          <td className="text-center p-3 text-gray-300">{player.yellow_cards}</td>
                          <td className="text-center p-3 text-gray-300">{player.red_cards}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden space-y-2">
                  {team.players.map((player) => (
                    <div key={player.id} className="p-3 rounded-lg border border-pink-500/20 bg-pink-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-white font-bold text-sm">
                            {player.number}
                          </span>
                          <span className="text-white font-semibold text-sm">{player.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <div>
                          <span className="text-gray-500">Goles:</span>{" "}
                          <span className="text-white">{player.goals}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">🟨:</span>{" "}
                          <span className="text-white">{player.yellow_cards}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">🟥:</span>{" "}
                          <span className="text-white">{player.red_cards}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
