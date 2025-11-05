"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy } from "lucide-react"
import { getGroups, getGroupStandings } from "@/lib/actions/groups"

interface TeamStanding {
  id: number
  team_id: number
  group_id: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  teams?: { id: number; name: string; logo_url?: string }
  copa_groups?: { id: number; name: string }
}

interface Group {
  id: number
  name: string
}

export default function CopaLibertadores() {
  const [activeGroup, setActiveGroup] = useState<string>("")
  const [groups, setGroups] = useState<Group[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [groupsData, standingsData] = await Promise.all([getGroups(), getGroupStandings()])
      setGroups(groupsData)
      setStandings(standingsData)

      if (groupsData.length > 0 && !activeGroup) {
        setActiveGroup(groupsData[0].id.toString())
      }
    } catch (error) {
      console.error("[v0] Error loading Copa Libertadores data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPositionColor = (pos: number) => {
    if (pos <= 2) return "bg-gradient-to-r from-green-600 to-emerald-600"
    return "bg-gray-400"
  }

  const getPositionBadge = (pos: number) => {
    if (pos <= 2) return "Clasificado"
    return ""
  }

  const renderGroupTable = (groupId: number) => {
    const groupStandings = standings
      .filter((s) => s.group_id === groupId)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
        return b.goals_for - a.goals_for
      })

    if (groupStandings.length === 0) {
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
              <tr className="border-b-2 border-primary">
                <th className="text-left p-2 text-sm font-semibold text-primary">Pos</th>
                <th className="text-left p-2 text-sm font-semibold text-primary">Equipo</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">PJ</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">PG</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">PE</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">PP</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">GF</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">GC</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">DIF</th>
                <th className="text-center p-2 text-sm font-semibold text-primary">PTS</th>
              </tr>
            </thead>
            <tbody>
              {groupStandings.map((team, index) => {
                const pos = index + 1
                return (
                  <tr
                    key={team.id}
                    className={`border-b border-primary/20 hover:bg-primary/10 transition-colors ${
                      pos <= 2 ? "bg-primary/5" : "bg-black/40"
                    }`}
                  >
                    <td className="p-2">
                      <Badge
                        className={`${getPositionColor(pos)} w-8 h-8 rounded-full flex items-center justify-center text-white`}
                      >
                        {pos}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {team.teams?.logo_url && (
                          <img
                            src={team.teams.logo_url || "/placeholder.svg"}
                            alt={team.teams?.name}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="font-medium text-white">{team.teams?.name}</span>
                        {pos <= 2 && <Badge className="bg-green-600 text-white text-xs">{getPositionBadge(pos)}</Badge>}
                      </div>
                    </td>
                    <td className="text-center p-2 text-white">{team.played}</td>
                    <td className="text-center p-2 text-white">{team.won}</td>
                    <td className="text-center p-2 text-white">{team.drawn}</td>
                    <td className="text-center p-2 text-white">{team.lost}</td>
                    <td className="text-center p-2 text-white">{team.goals_for}</td>
                    <td className="text-center p-2 text-white">{team.goals_against}</td>
                    <td className="text-center p-2">
                      <span
                        className={
                          team.goal_difference > 0
                            ? "text-green-400 font-semibold"
                            : team.goal_difference < 0
                              ? "text-red-400 font-semibold"
                              : "text-white"
                        }
                      >
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </span>
                    </td>
                    <td className="text-center p-2">
                      <span className="font-bold text-primary">{team.points}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-3">
          {groupStandings.map((team, index) => {
            const pos = index + 1
            return (
              <Card key={team.id} className={`border-primary/30 bg-black/60 ${pos <= 2 ? "border-primary" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${getPositionColor(pos)} w-8 h-8 rounded-full flex items-center justify-center text-white`}
                      >
                        {pos}
                      </Badge>
                      <div>
                        <div className="flex items-center gap-2">
                          {team.teams?.logo_url && (
                            <img
                              src={team.teams.logo_url || "/placeholder.svg"}
                              alt={team.teams?.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <div className="font-semibold text-white">{team.teams?.name}</div>
                        </div>
                        {pos <= 2 && (
                          <Badge className="bg-green-600 text-white text-xs mt-1">{getPositionBadge(pos)}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{team.points}</div>
                      <div className="text-xs text-gray-400">puntos</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">PJ</div>
                      <div className="font-semibold text-white">{team.played}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">PG</div>
                      <div className="font-semibold text-green-400">{team.won}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">GF-GC</div>
                      <div className="font-semibold text-white">
                        {team.goals_for}-{team.goals_against}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">DIF</div>
                      <div
                        className={`font-semibold ${team.goal_difference > 0 ? "text-green-400" : team.goal_difference < 0 ? "text-red-400" : "text-white"}`}
                      >
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary animate-pulse" />
        <p className="text-lg text-muted-foreground">Cargando Copa Libertadores...</p>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
        <p className="text-lg text-muted-foreground">No hay grupos creados</p>
        <p className="text-sm text-muted-foreground">El administrador debe crear los grupos de la Copa Libertadores</p>
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
        <TabsList className={`grid w-full grid-cols-${groups.length}`}>
          {groups.map((group) => (
            <TabsTrigger key={group.id} value={group.id.toString()}>
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => (
          <TabsContent key={group.id} value={group.id.toString()} className="mt-6">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>{renderGroupTable(group.id)}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
