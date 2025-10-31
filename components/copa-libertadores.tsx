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
    A: [] as TeamStanding[],
    B: [] as TeamStanding[],
    C: [] as TeamStanding[],
  }

  const getPositionColor = (pos: number) => {
    if (pos <= 2) return "bg-gradient-to-r from-green-600 to-emerald-600"
    return "bg-gray-400"
  }

  const getPositionBadge = (pos: number) => {
    if (pos <= 2) return "Clasificado"
    return ""
  }

  const renderGroupTable = (teams: TeamStanding[]) => {
    if (teams.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
          <p className="text-lg">No hay equipos en este grupo</p>
          <p className="text-sm">El administrador debe cargar los equipos y resultados</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary/30">
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
                  className={`border-b border-primary/20 hover:bg-primary/5 transition-colors ${
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
                    <span className="font-bold text-primary">{team.pts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-3">
          {teams.map((team) => (
            <Card key={team.pos} className={`border-primary/30 ${team.pos <= 2 ? "bg-green-50 border-green-300" : ""}`}>
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
                      {team.pos <= 2 && (
                        <Badge className="bg-green-600 text-xs mt-1">{getPositionBadge(team.pos)}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{team.pts}</div>
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
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-r from-black via-primary/10 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Trophy className="w-8 h-8" />
            Copa Libertadores - Liga 33
          </CardTitle>
          <p className="text-foreground mt-2">Clasifican los 2 primeros de cada grupo + los 2 mejores terceros</p>
        </CardHeader>
      </Card>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="A">Grupo A</TabsTrigger>
          <TabsTrigger value="B">Grupo B</TabsTrigger>
          <TabsTrigger value="C">Grupo C</TabsTrigger>
        </TabsList>

        <TabsContent value="A" className="mt-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl">Grupo A</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.A)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="B" className="mt-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl">Grupo B</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.B)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="C" className="mt-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl">Grupo C</CardTitle>
            </CardHeader>
            <CardContent>{renderGroupTable(groups.C)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leyenda */}
      <Card className="border-primary/30">
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
          <p className="text-sm text-muted-foreground mt-3">
            Los 2 mejores terceros también clasificarán a la siguiente fase
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
