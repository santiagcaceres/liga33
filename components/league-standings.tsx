"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Trophy } from "lucide-react"

interface Standing {
  position: number
  team: {
    id: number
    name: string
    logo_url: string
  }
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

interface SuspendedPlayer {
  name: string
  team_name: string
  team_id: number
  red_cards: number
}

export default function LeagueStandings() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [suspendedPlayers, setSuspendedPlayers] = useState<SuspendedPlayer[]>([]) // Added state for suspended players
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStandings = async () => {
      const supabase = createClient()

      const [standingsResult, suspendedResult] = await Promise.all([
        supabase
          .from("league_standings")
          .select(
            `
          *,
          teams!inner(id, name, logo_url, tournament_id)
        `,
          )
          .eq("teams.tournament_id", 2)
          .order("points", { ascending: false })
          .order("goal_difference", { ascending: false })
          .order("goals_for", { ascending: false }),
        supabase
          .from("players")
          .select(`
            name,
            red_cards,
            suspended,
            teams!inner(
              id,
              name,
              tournament_id
            )
          `)
          .eq("teams.tournament_id", 2) // Only Femenina
          .gt("red_cards", 0)
          .order("red_cards", { ascending: false }),
      ])

      if (standingsResult.error) {
        console.error("[v0] Error loading standings:", standingsResult.error)
      } else {
        const formattedData = standingsResult.data?.map((item: any, index: number) => ({
          position: index + 1,
          team: {
            id: item.teams.id,
            name: item.teams.name,
            logo_url: item.teams.logo_url,
          },
          played: item.played,
          won: item.won,
          drawn: item.drawn,
          lost: item.lost,
          goals_for: item.goals_for,
          goals_against: item.goals_against,
          goal_difference: item.goal_difference,
          points: item.points,
        }))
        setStandings(formattedData || [])
      }

      if (suspendedResult.error) {
        console.error("[v0] Error loading suspended players:", suspendedResult.error)
      } else if (suspendedResult.data) {
        const suspended: SuspendedPlayer[] = suspendedResult.data.map((p: any) => ({
          name: p.name,
          team_name: p.teams.name,
          team_id: p.teams.id,
          red_cards: p.red_cards,
        }))
        setSuspendedPlayers(suspended)
      }

      setLoading(false)
    }

    loadStandings()
  }, [])

  if (loading) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">Cargando tabla de posiciones...</div>
        </CardContent>
      </Card>
    )
  }

  if (standings.length === 0) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-500">
            <Trophy className="w-6 h-6" />
            Tabla de Posiciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            La tabla de posiciones estará disponible cuando comiencen los partidos
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Trophy className="w-6 h-6" />
          Tabla de Posiciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suspendedPlayers.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">⚠️ Jugadoras Suspendidas</h4>
            <div className="space-y-2">
              {suspendedPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {player.red_cards}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-sm text-gray-400">{player.team_name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400 font-medium px-2 py-1 bg-red-900/30 rounded">
                    Se pierde el siguiente partido
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-500/30">
                <th className="text-left p-3 text-pink-500 font-semibold">Pos</th>
                <th className="text-left p-3 text-pink-500 font-semibold">Equipo</th>
                <th className="text-center p-3 text-pink-500 font-semibold">PJ</th>
                <th className="text-center p-3 text-pink-500 font-semibold">PG</th>
                <th className="text-center p-3 text-pink-500 font-semibold">PE</th>
                <th className="text-center p-3 text-pink-500 font-semibold">PP</th>
                <th className="text-center p-3 text-pink-500 font-semibold">GF</th>
                <th className="text-center p-3 text-pink-500 font-semibold">GC</th>
                <th className="text-center p-3 text-pink-500 font-semibold">DG</th>
                <th className="text-center p-3 text-pink-500 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.team.id}
                  className={`border-b border-pink-500/10 hover:bg-pink-500/5 transition-colors ${
                    standing.position === 1 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                  }`}
                >
                  <td className="p-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        standing.position === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-pink-500/20"
                      }`}
                    >
                      {standing.position === 1 ? (
                        <Trophy className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{standing.position}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={standing.team.logo_url || "/placeholder.svg"}
                        alt={standing.team.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-semibold text-white">{standing.team.name}</span>
                    </div>
                  </td>
                  <td className="text-center p-3 text-gray-300">{standing.played}</td>
                  <td className="text-center p-3 text-green-400 font-semibold">{standing.won}</td>
                  <td className="text-center p-3 text-yellow-400 font-semibold">{standing.drawn}</td>
                  <td className="text-center p-3 text-red-400 font-semibold">{standing.lost}</td>
                  <td className="text-center p-3 text-gray-300">{standing.goals_for}</td>
                  <td className="text-center p-3 text-gray-300">{standing.goals_against}</td>
                  <td className="text-center p-3 text-gray-300">{standing.goal_difference}</td>
                  <td className="text-center p-3">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full font-bold">{standing.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-3">
          {standings.map((standing) => (
            <div
              key={standing.team.id}
              className={`p-4 rounded-lg border border-pink-500/20 ${
                standing.position === 1 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-pink-500/5"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      standing.position === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-pink-500/20"
                    }`}
                  >
                    {standing.position === 1 ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">{standing.position}</span>
                    )}
                  </div>
                  <img
                    src={standing.team.logo_url || "/placeholder.svg"}
                    alt={standing.team.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-bold text-white">{standing.team.name}</span>
                </div>
                <span className="bg-pink-500 text-white px-4 py-1 rounded-full font-bold text-lg">
                  {standing.points}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-gray-400 text-xs">PJ</div>
                  <div className="text-white font-semibold">{standing.played}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">PG</div>
                  <div className="text-green-400 font-semibold">{standing.won}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">PE</div>
                  <div className="text-yellow-400 font-semibold">{standing.drawn}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">PP</div>
                  <div className="text-red-400 font-semibold">{standing.lost}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm mt-2 pt-2 border-t border-pink-500/20">
                <div>
                  <div className="text-gray-400 text-xs">GF</div>
                  <div className="text-white font-semibold">{standing.goals_for}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">GC</div>
                  <div className="text-white font-semibold">{standing.goals_against}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">DG</div>
                  <div className="text-white font-semibold">{standing.goal_difference}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
