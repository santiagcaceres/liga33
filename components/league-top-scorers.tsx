"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Scorer {
  id: number
  name: string
  team_name: string
  team_logo: string
  goals: number
}

export default function LeagueTopScorers() {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadScorers = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("players")
        .select(
          `
          id,
          name,
          goals,
          teams!inner(name, logo_url, tournament_id)
        `,
        )
        .eq("teams.tournament_id", 2)
        .gt("goals", 0)
        .order("goals", { ascending: false })
        .order("name", { ascending: true })
        .limit(20)

      if (error) {
        console.error("[v0] Error loading scorers:", error)
      } else {
        const formattedData = data?.map((player: any) => ({
          id: player.id,
          name: player.name,
          team_name: player.teams.name,
          team_logo: player.teams.logo_url,
          goals: player.goals,
        }))
        setScorers(formattedData || [])
      }

      setLoading(false)
    }

    loadScorers()
  }, [])

  if (loading) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">Cargando goleadoras...</div>
        </CardContent>
      </Card>
    )
  }

  if (scorers.length === 0) {
    return (
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-500">
            <Target className="w-6 h-6" />
            Tabla de Goleadoras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            La tabla de goleadoras estará disponible cuando se marquen los primeros goles
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxGoals = scorers[0]?.goals || 0

  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Target className="w-6 h-6" />
          Tabla de Goleadoras
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-500/30">
                <th className="text-left p-3 text-pink-500 font-semibold">Pos</th>
                <th className="text-left p-3 text-pink-500 font-semibold">Jugadora</th>
                <th className="text-left p-3 text-pink-500 font-semibold">Equipo</th>
                <th className="text-center p-3 text-pink-500 font-semibold">Goles</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((scorer, index) => (
                <tr
                  key={scorer.id}
                  className={`border-b border-pink-500/10 hover:bg-pink-500/5 transition-colors ${
                    scorer.goals === maxGoals ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                  }`}
                >
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        scorer.goals === maxGoals
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-lg"
                          : "bg-pink-500/20 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${scorer.goals === maxGoals ? "text-xl text-white" : "text-white"}`}
                    >
                      {scorer.name}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={scorer.team_logo || "/placeholder.svg"}
                        alt={scorer.team_name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-gray-300">{scorer.team_name}</span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-full font-bold ${
                        scorer.goals === maxGoals
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white w-12 h-12 text-2xl"
                          : "bg-pink-500 text-white w-10 h-10 text-lg"
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

        {/* Mobile view */}
        <div className="md:hidden space-y-2">
          {scorers.map((scorer, index) => (
            <div
              key={scorer.id}
              className={`p-3 rounded-lg border border-pink-500/20 ${
                scorer.goals === maxGoals ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-pink-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${
                      scorer.goals === maxGoals
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white w-8 h-8"
                        : "bg-pink-500/20 text-white w-7 h-7 text-sm"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold truncate ${scorer.goals === maxGoals ? "text-white" : "text-white text-sm"}`}
                    >
                      {scorer.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <img
                        src={scorer.team_logo || "/placeholder.svg"}
                        alt={scorer.team_name}
                        className="w-4 h-4 object-contain"
                      />
                      <span className="truncate">{scorer.team_name}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ml-2 ${
                    scorer.goals === maxGoals
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white w-10 h-10 text-lg"
                      : "bg-pink-500 text-white w-9 h-9"
                  }`}
                >
                  {scorer.goals}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
