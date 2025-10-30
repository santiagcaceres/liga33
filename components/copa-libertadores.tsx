"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy } from "lucide-react"

interface TeamStanding {
  pos: number
  team: string
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dif: number
  pts: number
}

export default function CopaLibertadores() {
  const [activeGroup, setActiveGroup] = useState("A")

  const groups = {
    A: [
      { pos: 1, team: "Deportivo Central", pj: 3, pg: 3, pe: 0, pp: 0, gf: 8, gc: 2, dif: 6, pts: 9 },
      { pos: 2, team: "Racing FC", pj: 3, pg: 2, pe: 0, pp: 1, gf: 6, gc: 4, dif: 2, pts: 6 },
      { pos: 3, team: "Boca Local", pj: 3, pg: 1, pe: 0, pp: 2, gf: 4, gc: 6, dif: -2, pts: 3 },
      { pos: 4, team: "San Lorenzo", pj: 3, pg: 0, pe: 0, pp: 3, gf: 2, gc: 8, dif: -6, pts: 0 },
    ],
    B: [
      { pos: 1, team: "Club Atlético Unidos", pj: 3, pg: 2, pe: 1, pp: 0, gf: 7, gc: 3, dif: 4, pts: 7 },
      { pos: 2, team: "Independiente Sur", pj: 3, pg: 2, pe: 0, pp: 1, gf: 5, gc: 3, dif: 2, pts: 6 },
      { pos: 3, team: "River Regional", pj: 3, pg: 1, pe: 1, pp: 1, gf: 4, gc: 4, dif: 0, pts: 4 },
      { pos: 4, team: "Estudiantes", pj: 3, pg: 0, pe: 0, pp: 3, gf: 1, gc: 7, dif: -6, pts: 0 },
    ],
    C: [
      { pos: 1, team: "Peñarol FC", pj: 3, pg: 2, pe: 1, pp: 0, gf: 6, gc: 2, dif: 4, pts: 7 },
      { pos: 2, team: "Nacional", pj: 3, pg: 2, pe: 0, pp: 1, gf: 5, gc: 3, dif: 2, pts: 6 },
      { pos: 3, team: "Defensor", pj: 3, pg: 1, pe: 0, pp: 2, gf: 3, gc: 5, dif: -2, pts: 3 },
      { pos: 4, team: "Cerro", pj: 3, pg: 0, pe: 1, pp: 2, gf: 2, gc: 6, dif: -4, pts: 1 },
    ],
  }

  const getPositionColor = (pos: number) => {
    if (pos <= 2) return "bg-gradient-to-r from-green-600 to-emerald-600"
    return "bg-gray-400"
  }

  const getPositionBadge = (pos: number) => {
    if (pos <= 2) return "Clasificado"
    return ""
  }

  const renderGroupTable = (teams: TeamStanding[]) => (
    <div className="space-y-2">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-purple-200">
              <th className="text-left p-2 text-sm font-semibold">Pos</th>
              <th className="text-left p-2 text-sm font-semibold">Equipo</th>
              <th className="text-center p-2 text-sm font-semibold">PJ</th>
              <th className="text-center p-2 text-sm font-semibold">PG</th>
              <th className="text-center p-2 text-sm font-semibold">PE</th>
              <th className="text-center p-2 text-sm font-semibold">PP</th>
              <th className="text-center p-2 text-sm font-semibold">GF</th>
              <th className="text-center p-2 text-sm font-semibold">GC</th>
              <th className="text-center p-2 text-sm font-semibold">DIF</th>
              <th className="text-center p-2 text-sm font-semibold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.pos}
                className={`border-b border-purple-100 hover:bg-purple-50 transition-colors ${
                  team.pos <= 2 ? "bg-green-50" : ""
                }`}
              >
                <td className="p-2">
                  <Badge
                    className={`${getPositionColor(team.pos)} w-8 h-8 rounded-full flex items-center justify-center`}
                  >
                    {team.pos}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{team.team}</span>
                    {team.pos <= 2 && <Badge className="bg-green-600 text-xs">{getPositionBadge(team.pos)}</Badge>}
                  </div>
                </td>
                <td className="text-center p-2">{team.pj}</td>
                <td className="text-center p-2">{team.pg}</td>
                <td className="text-center p-2">{team.pe}</td>
                <td className="text-center p-2">{team.pp}</td>
                <td className="text-center p-2">{team.gf}</td>
                <td className="text-center p-2">{team.gc}</td>
                <td className="text-center p-2">
                  <span
                    className={
                      team.dif > 0 ? "text-green-600 font-semibold" : team.dif < 0 ? "text-red-600 font-semibold" : ""
                    }
                  >
                    {team.dif > 0 ? `+${team.dif}` : team.dif}
                  </span>
                </td>
                <td className="text-center p-2">
                  <span className="font-bold text-purple-600">{team.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {teams.map((team) => (
          <Card key={team.pos} className={`border-purple-200 ${team.pos <= 2 ? "bg-green-50 border-green-300" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${getPositionColor(team.pos)} w-8 h-8 rounded-full flex items-center justify-center`}
                  >
                    {team.pos}
                  </Badge>
                  <div>
                    <div className="font-semibold">{team.team}</div>
                    {team.pos <= 2 && <Badge className="bg-green-600 text-xs mt-1">{getPositionBadge(team.pos)}</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{team.pts}</div>
                  <div className="text-xs text-gray-500">puntos</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-gray-500 text-xs">PJ</div>
                  <div className="font-semibold">{team.pj}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">PG</div>
                  <div className="font-semibold text-green-600">{team.pg}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">GF-GC</div>
                  <div className="font-semibold">
                    {team.gf}-{team.gc}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">DIF</div>
                  <div
                    className={`font-semibold ${team.dif > 0 ? "text-green-600" : team.dif < 0 ? "text-red-600" : ""}`}
                  >
                    {team.dif > 0 ? `+${team.dif}` : team.dif}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-8 h-8 text-purple-600" />
            Copa Libertadores - Liga 33
          </CardTitle>
          <p className="text-gray-600 mt-2">Clasifican los 2 primeros de cada grupo + los 2 mejores terceros</p>
        </CardHeader>
      </Card>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="A">Grupo A</TabsTrigger>
          <TabsTrigger value="B">Grupo B</TabsTrigger>
          <TabsTrigger value="C">Grupo C</TabsTrigger>
        </TabsList>

        <TabsContent value="A" className="mt-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl">Grupo A</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.A)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="B" className="mt-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl">Grupo B</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.B)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="C" className="mt-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl">Grupo C</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.C)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leyenda */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">Clasificado directo (1° y 2°)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm">Pendiente (3° y 4°)</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Los 2 mejores terceros también clasificarán a la siguiente fase</p>
        </CardContent>
      </Card>
    </div>
  )
}
