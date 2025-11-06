"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, AlertCircle } from "lucide-react"
import { getTeams } from "@/lib/actions/teams"
import { getPlayers } from "@/lib/actions/players"

interface Player {
  id: number
  number: number
  name: string
  cedula: string
  age: number
  goals: number
  yellow_cards: number
  red_cards: number
  suspended: boolean
  team_id: number
}

interface Team {
  id: number
  name: string
  coach: string
  logo_url?: string
}

export default function TeamsRoster() {
  const [selectedTeam, setSelectedTeam] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [teamsData, playersData] = await Promise.all([getTeams(), getPlayers()])
      setTeams(teamsData)
      setPlayers(playersData)
    } catch (error) {
      console.error("[v0] Error loading teams and players:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentTeamPlayers = selectedTeam ? players.filter((p) => p.team_id === Number.parseInt(selectedTeam)) : []

  const hasTwoYellowCards = (player: Player) => {
    return player.yellow_cards >= 2
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/30 bg-card">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary animate-pulse" />
              <p className="text-lg">Cargando equipos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Users className="w-8 h-8" />
            Planteles de Equipos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
              <p className="text-lg">No hay equipos registrados</p>
              <p className="text-sm">
                El administrador debe agregar equipos y jugadores desde el panel de administración
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-full max-w-md border-primary/30">
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeam && (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-4">
                      {teams.find((t) => t.id === Number.parseInt(selectedTeam))?.logo_url && (
                        <img
                          src={teams.find((t) => t.id === Number.parseInt(selectedTeam))?.logo_url || ""}
                          alt={teams.find((t) => t.id === Number.parseInt(selectedTeam))?.name}
                          className="w-16 h-16 object-contain bg-white rounded-lg border border-primary/30"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {teams.find((t) => t.id === Number.parseInt(selectedTeam))?.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {currentTeamPlayers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50 text-primary" />
                      <p>Este equipo no tiene jugadores registrados</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-primary/30">
                              <th className="text-left p-3">#</th>
                              <th className="text-left p-3">Jugador</th>
                              <th className="text-left p-3">CI</th>
                              <th className="text-center p-3">⚽</th>
                              <th className="text-center p-3">🟨</th>
                              <th className="text-center p-3">🟥</th>
                              <th className="text-center p-3">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentTeamPlayers.map((player) => (
                              <tr
                                key={player.id}
                                className={`border-b border-primary/20 ${
                                  player.suspended ? "bg-red-500/20 line-through" : ""
                                }`}
                              >
                                <td className="p-3 font-semibold">{player.number}</td>
                                <td className="p-3">{player.name}</td>
                                <td className="p-3 text-sm text-muted-foreground">{player.cedula}</td>
                                <td className="p-3 text-center font-semibold">{player.goals}</td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`font-semibold ${
                                      hasTwoYellowCards(player)
                                        ? "text-red-600"
                                        : player.yellow_cards === 1
                                          ? "text-orange-600"
                                          : ""
                                    }`}
                                  >
                                    {player.yellow_cards}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-semibold">{player.red_cards}</td>
                                <td className="p-3 text-center">
                                  {player.suspended ? (
                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">SUSPENDIDO</span>
                                  ) : hasTwoYellowCards(player) ? (
                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                      🔴 2 AMARILLAS
                                    </span>
                                  ) : player.yellow_cards === 1 ? (
                                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">⚠️ RIESGO</span>
                                  ) : (
                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                      HABILITADO
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-3">
                        {currentTeamPlayers.map((player) => (
                          <Card
                            key={player.id}
                            className={`border-primary/30 ${player.suspended ? "bg-red-500/20" : "bg-primary/5"}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold text-primary">{player.number}</span>
                                  <div>
                                    <div className={`font-semibold text-sm ${player.suspended ? "line-through" : ""}`}>
                                      {player.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{player.cedula}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {player.suspended ? (
                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">SUSPENDIDO</span>
                                  ) : hasTwoYellowCards(player) ? (
                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                      🔴 2 AMARILLAS
                                    </span>
                                  ) : player.yellow_cards === 1 ? (
                                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">⚠️ RIESGO</span>
                                  ) : (
                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                      HABILITADO
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="text-muted-foreground">Goles</div>
                                  <div className="font-semibold">⚽ {player.goals}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Amarillas</div>
                                  <div
                                    className={`font-semibold ${
                                      hasTwoYellowCards(player)
                                        ? "text-red-600"
                                        : player.yellow_cards === 1
                                          ? "text-orange-600"
                                          : ""
                                    }`}
                                  >
                                    🟨 {player.yellow_cards}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Rojas</div>
                                  <div className="font-semibold">🟥 {player.red_cards}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Sistema de Tarjetas - Copa Libertadores
              </h4>
              <ul className="text-sm space-y-1 text-foreground">
                <li>
                  • <strong>2 tarjetas amarillas</strong> = Suspensión automática de 1 partido (se mantienen visibles
                  las 2 amarillas)
                </li>
                <li>
                  • <strong>Después de cumplir la suspensión</strong>, las amarillas se resetean a 0 y el jugador queda
                  habilitado
                </li>
                <li>
                  • <strong>1 tarjeta roja</strong> = Suspensión automática de 1 partido
                </li>
                <li>• Los jugadores suspendidos aparecen tachados con fondo rojo</li>
                <li>• ⚠️ Jugadores con 1 amarilla están próximos a suspensión</li>
                <li>• 🔴 Jugadores con 2 amarillas están suspendidos</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
