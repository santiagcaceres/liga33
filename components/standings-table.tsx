"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface Team {
  pos: number
  team: string
  logo_url: string | null
  pts: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dif: number
  group_name: string
}

export default function StandingsTable() {
  const [teamsData, setTeamsData] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStandings()
  }, [])

  const loadStandings = async () => {
    const supabase = createClient()

    const { data: teamGroups, error } = await supabase
      .from("team_groups")
      .select(`
        *,
        teams (
          name,
          logo_url
        ),
        copa_groups (
          name
        )
      `)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false })

    if (error) {
      console.error("[v0] Error loading standings:", error)
      setLoading(false)
      return
    }

    if (teamGroups) {
      const formattedTeams: Team[] = teamGroups.map((tg: any, index: number) => ({
        pos: index + 1,
        team: tg.teams?.name || "Equipo sin nombre",
        logo_url: tg.teams?.logo_url || null,
        pts: tg.points || 0,
        pj: tg.played || 0,
        pg: tg.won || 0,
        pe: tg.drawn || 0,
        pp: tg.lost || 0,
        gf: tg.goals_for || 0,
        gc: tg.goals_against || 0,
        dif: tg.goal_difference || 0,
        group_name: tg.copa_groups?.name || "Sin grupo",
      }))

      setTeamsData(formattedTeams)
    }

    setLoading(false)
  }

  const getPositionColor = (pos: number) => {
    if (pos <= 3) return "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
    if (pos <= 6) return "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
    if (pos >= 10) return "bg-gradient-to-r from-red-500 to-orange-500 text-white"
    return "bg-gray-500 text-white"
  }

  if (loading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="py-8 text-center text-muted-foreground">Cargando tabla de posiciones...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-600" />
          Tabla de Posiciones - Temporada 2025
        </CardTitle>
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
            <span>Clasificación Copa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            <span>Zona Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
            <span>Zona Descenso</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Pos</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Equipo</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Grupo</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PJ</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PG</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PE</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PP</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">GF</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">GC</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">DIF</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teamsData.map((team) => (
                <tr
                  key={team.pos}
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <Badge
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getPositionColor(team.pos)}`}
                    >
                      {team.pos}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-2">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url || "/placeholder.svg"}
                          alt={team.team}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {team.team.charAt(0)}
                        </div>
                      )}
                      <span>{team.team}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      {team.group_name}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center">{team.pj}</td>
                  <td className="py-3 px-2 text-center text-green-600 font-semibold">{team.pg}</td>
                  <td className="py-3 px-2 text-center text-yellow-600 font-semibold">{team.pe}</td>
                  <td className="py-3 px-2 text-center text-red-600 font-semibold">{team.pp}</td>
                  <td className="py-3 px-2 text-center">{team.gf}</td>
                  <td className="py-3 px-2 text-center">{team.gc}</td>
                  <td
                    className={`py-3 px-2 text-center font-semibold ${team.dif >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {team.dif >= 0 ? "+" : ""}
                    {team.dif}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-purple-600 text-lg">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {teamsData.map((team) => (
            <div
              key={team.pos}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getPositionColor(team.pos)}`}
                  >
                    {team.pos}
                  </Badge>
                  {team.logo_url ? (
                    <Image
                      src={team.logo_url || "/placeholder.svg"}
                      alt={team.team}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {team.team.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{team.team}</div>
                    <div className="text-sm text-gray-500">
                      {team.group_name} • PJ: {team.pj}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{team.pts}</div>
                  <div className="text-sm text-gray-500">pts</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div className="text-center">
                  <div className="text-green-600 font-semibold">{team.pg}</div>
                  <div className="text-gray-500">PG</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-semibold">{team.pe}</div>
                  <div className="text-gray-500">PE</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-semibold">{team.pp}</div>
                  <div className="text-gray-500">PP</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>GF: {team.gf}</span>
                <span>GC: {team.gc}</span>
                <span className={team.dif >= 0 ? "text-green-600" : "text-red-600"}>
                  DIF: {team.dif >= 0 ? "+" : ""}
                  {team.dif}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
