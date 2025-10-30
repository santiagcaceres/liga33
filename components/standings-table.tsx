"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Team {
  pos: number
  team: string
  pts: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dif: number
  form: string[]
  trend: "up" | "down" | "same"
}

const teamsData: Team[] = [
  {
    pos: 1,
    team: "Deportivo Central",
    pts: 21,
    pj: 8,
    pg: 7,
    pe: 0,
    pp: 1,
    gf: 18,
    gc: 5,
    dif: 13,
    form: ["W", "W", "W", "L", "W"],
    trend: "up",
  },
  {
    pos: 2,
    team: "Club Atlético Unidos",
    pts: 18,
    pj: 8,
    pg: 6,
    pe: 0,
    pp: 2,
    gf: 16,
    gc: 8,
    dif: 8,
    form: ["W", "W", "L", "W", "W"],
    trend: "same",
  },
  {
    pos: 3,
    team: "Racing FC",
    pts: 16,
    pj: 8,
    pg: 5,
    pe: 1,
    pp: 2,
    gf: 14,
    gc: 9,
    dif: 5,
    form: ["D", "W", "W", "L", "W"],
    trend: "up",
  },
  {
    pos: 4,
    team: "Independiente Sur",
    pts: 14,
    pj: 8,
    pg: 4,
    pe: 2,
    pp: 2,
    gf: 12,
    gc: 10,
    dif: 2,
    form: ["W", "D", "W", "D", "L"],
    trend: "down",
  },
  {
    pos: 5,
    team: "Boca Juniors Local",
    pts: 12,
    pj: 8,
    pg: 4,
    pe: 0,
    pp: 4,
    gf: 11,
    gc: 12,
    dif: -1,
    form: ["L", "W", "L", "W", "W"],
    trend: "up",
  },
  {
    pos: 6,
    team: "River Plate Regional",
    pts: 11,
    pj: 8,
    pg: 3,
    pe: 2,
    pp: 3,
    gf: 10,
    gc: 11,
    dif: -1,
    form: ["D", "L", "W", "D", "L"],
    trend: "down",
  },
  {
    pos: 7,
    team: "San Lorenzo FC",
    pts: 10,
    pj: 8,
    pg: 3,
    pe: 1,
    pp: 4,
    gf: 9,
    gc: 13,
    dif: -4,
    form: ["L", "W", "L", "L", "D"],
    trend: "same",
  },
  {
    pos: 8,
    team: "Estudiantes Unidos",
    pts: 9,
    pj: 8,
    pg: 2,
    pe: 3,
    pp: 3,
    gf: 8,
    gc: 12,
    dif: -4,
    form: ["D", "D", "L", "W", "L"],
    trend: "down",
  },
  {
    pos: 9,
    team: "Vélez Local",
    pts: 8,
    pj: 8,
    pg: 2,
    pe: 2,
    pp: 4,
    gf: 7,
    gc: 14,
    dif: -7,
    form: ["L", "D", "L", "W", "L"],
    trend: "down",
  },
  {
    pos: 10,
    team: "Huracán Regional",
    pts: 7,
    pj: 8,
    pg: 2,
    pe: 1,
    pp: 5,
    gf: 6,
    gc: 15,
    dif: -9,
    form: ["L", "L", "W", "L", "D"],
    trend: "same",
  },
  {
    pos: 11,
    team: "Gimnasia FC",
    pts: 6,
    pj: 8,
    pg: 1,
    pe: 3,
    pp: 4,
    gf: 5,
    gc: 16,
    dif: -11,
    form: ["D", "L", "L", "D", "L"],
    trend: "down",
  },
  {
    pos: 12,
    team: "Tigre Deportivo",
    pts: 4,
    pj: 8,
    pg: 1,
    pe: 1,
    pp: 6,
    gf: 4,
    gc: 18,
    dif: -14,
    form: ["L", "L", "L", "D", "L"],
    trend: "down",
  },
]

export default function StandingsTable() {
  const getPositionColor = (pos: number) => {
    if (pos <= 3) return "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
    if (pos <= 6) return "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
    if (pos >= 10) return "bg-gradient-to-r from-red-500 to-orange-500 text-white"
    return "bg-gray-500 text-white"
  }

  const getFormColor = (result: string) => {
    switch (result) {
      case "W":
        return "bg-green-500 text-white"
      case "D":
        return "bg-yellow-500 text-white"
      case "L":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
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
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PJ</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PG</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PE</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">PP</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">GF</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">GC</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">DIF</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Pts</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Forma</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Tend.</th>
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
                  <td className="py-3 px-2 font-medium">{team.team}</td>
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
                  <td className="py-3 px-2">
                    <div className="flex gap-1 justify-center">
                      {team.form.map((result, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">{getTrendIcon(team.trend)}</td>
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
                  <div>
                    <div className="font-medium">{team.team}</div>
                    <div className="text-sm text-gray-500">PJ: {team.pj}</div>
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

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {team.form.map((result, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>GF: {team.gf}</span>
                  <span>GC: {team.gc}</span>
                  <span className={team.dif >= 0 ? "text-green-600" : "text-red-600"}>
                    DIF: {team.dif >= 0 ? "+" : ""}
                    {team.dif}
                  </span>
                  {getTrendIcon(team.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">Goles Totales</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.95</div>
                <div className="text-sm text-gray-600">Promedio por Partido</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">48</div>
                <div className="text-sm text-gray-600">Partidos Jugados</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
