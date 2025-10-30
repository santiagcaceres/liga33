"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, AlertCircle } from "lucide-react"

interface Player {
  number: number
  name: string
  cedula: string
  age: number
  goals: number
  yellowCards: number
  redCards: number
  suspended: boolean
}

export default function TeamsRoster() {
  const [selectedTeam, setSelectedTeam] = useState("deportivo-central")

  const teams = {
    "deportivo-central": {
      name: "Deportivo Central",
      players: [
        {
          number: 1,
          name: "Juan Martínez",
          cedula: "12345678",
          age: 28,
          goals: 0,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 2,
          name: "Pedro Sánchez",
          cedula: "23456789",
          age: 25,
          goals: 2,
          yellowCards: 3,
          redCards: 0,
          suspended: true,
        },
        {
          number: 3,
          name: "Luis García",
          cedula: "34567890",
          age: 27,
          goals: 1,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 4,
          name: "Carlos Rodríguez",
          cedula: "45678901",
          age: 29,
          goals: 0,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 5,
          name: "Miguel Torres",
          cedula: "56789012",
          age: 24,
          goals: 3,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 6,
          name: "Diego López",
          cedula: "67890123",
          age: 26,
          goals: 5,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 7,
          name: "Roberto Fernández",
          cedula: "78901234",
          age: 23,
          goals: 4,
          yellowCards: 0,
          redCards: 1,
          suspended: true,
        },
        {
          number: 8,
          name: "Andrés Gómez",
          cedula: "89012345",
          age: 25,
          goals: 2,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 9,
          name: "Fernando Silva",
          cedula: "90123456",
          age: 27,
          goals: 12,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 10,
          name: "Sebastián Ruiz",
          cedula: "01234567",
          age: 24,
          goals: 8,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 11,
          name: "Martín Díaz",
          cedula: "11223344",
          age: 22,
          goals: 6,
          yellowCards: 0,
          redCards: 0,
          suspended: false,
        },
      ],
    },
    "racing-fc": {
      name: "Racing FC",
      players: [
        {
          number: 1,
          name: "Jorge Ramírez",
          cedula: "22334455",
          age: 30,
          goals: 0,
          yellowCards: 0,
          redCards: 0,
          suspended: false,
        },
        {
          number: 2,
          name: "Pablo Castro",
          cedula: "33445566",
          age: 26,
          goals: 1,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 3,
          name: "Javier Morales",
          cedula: "44556677",
          age: 28,
          goals: 0,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 4,
          name: "Ricardo Vega",
          cedula: "55667788",
          age: 27,
          goals: 2,
          yellowCards: 0,
          redCards: 0,
          suspended: true,
        },
        {
          number: 5,
          name: "Alejandro Núñez",
          cedula: "66778899",
          age: 25,
          goals: 4,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 6,
          name: "Gustavo Herrera",
          cedula: "77889900",
          age: 24,
          goals: 3,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 7,
          name: "Raúl Mendoza",
          cedula: "88990011",
          age: 26,
          goals: 5,
          yellowCards: 0,
          redCards: 0,
          suspended: false,
        },
        {
          number: 8,
          name: "Eduardo Paredes",
          cedula: "99001122",
          age: 23,
          goals: 2,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 9,
          name: "Miguel Santos",
          cedula: "10112233",
          age: 28,
          goals: 10,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
        {
          number: 10,
          name: "Daniel Ortiz",
          cedula: "21223344",
          age: 25,
          goals: 7,
          yellowCards: 1,
          redCards: 0,
          suspended: false,
        },
        {
          number: 11,
          name: "Cristian Rojas",
          cedula: "32334455",
          age: 24,
          goals: 5,
          yellowCards: 2,
          redCards: 0,
          suspended: false,
        },
      ],
    },
  }

  const currentTeam = teams[selectedTeam as keyof typeof teams]

  const hasThreeYellowCards = (player: Player) => {
    return player.yellowCards === 3
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-8 h-8 text-purple-600" />
            Planteles de Equipos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Seleccionar Equipo</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Elegir equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deportivo-central">Deportivo Central</SelectItem>
                <SelectItem value="racing-fc">Racing FC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-purple-600">{currentTeam.name}</h3>
            <p className="text-sm text-gray-600">Plantel completo con estadísticas</p>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-purple-200">
                  <th className="text-left p-3 text-sm font-semibold">N°</th>
                  <th className="text-left p-3 text-sm font-semibold">Jugador</th>
                  <th className="text-left p-3 text-sm font-semibold">Cédula</th>
                  <th className="text-center p-3 text-sm font-semibold">Edad</th>
                  <th className="text-center p-3 text-sm font-semibold">Goles</th>
                  <th className="text-center p-3 text-sm font-semibold">Amarillas</th>
                  <th className="text-center p-3 text-sm font-semibold">Rojas</th>
                  <th className="text-center p-3 text-sm font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {currentTeam.players.map((player) => (
                  <tr
                    key={player.number}
                    className={`border-b border-purple-100 hover:bg-purple-50 transition-colors ${
                      player.suspended ? "bg-red-50 opacity-60" : ""
                    }`}
                  >
                    <td className="p-3">
                      <Badge className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center">
                        {player.number}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${player.suspended ? "line-through text-gray-500" : ""}`}>
                        {player.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">{player.cedula}</span>
                    </td>
                    <td className="text-center p-3">{player.age}</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        {player.goals}
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Badge
                          variant="outline"
                          className={`${
                            hasThreeYellowCards(player)
                              ? "border-red-600 text-red-600 bg-red-50"
                              : "border-yellow-500 text-yellow-600"
                          }`}
                        >
                          {player.yellowCards}
                        </Badge>
                        {hasThreeYellowCards(player) && (
                          <AlertCircle className="w-4 h-4 text-red-600" title="3 amarillas - Suspendido" />
                        )}
                        {player.yellowCards === 2 && !player.suspended && (
                          <AlertCircle className="w-4 h-4 text-orange-600" title="Próximo a suspensión" />
                        )}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="border-red-600 text-red-600">
                        {player.redCards}
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      {player.suspended ? (
                        <Badge className="bg-red-600">Suspendido</Badge>
                      ) : (
                        <Badge className="bg-green-600">Disponible</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-3">
            {currentTeam.players.map((player) => (
              <Card
                key={player.number}
                className={`border-purple-200 ${player.suspended ? "bg-red-50 opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-lg">
                        {player.number}
                      </Badge>
                      <div>
                        <div className={`font-semibold ${player.suspended ? "line-through text-gray-500" : ""}`}>
                          {player.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">CI: {player.cedula}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {player.suspended ? (
                        <Badge className="bg-red-600">Suspendido</Badge>
                      ) : (
                        <Badge className="bg-green-600">Disponible</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">Edad</div>
                      <div className="font-semibold">{player.age}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Goles</div>
                      <div className="font-semibold text-green-600">{player.goals}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Amarillas</div>
                      <div
                        className={`font-semibold flex items-center justify-center gap-1 ${
                          hasThreeYellowCards(player) ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {player.yellowCards}
                        {hasThreeYellowCards(player) && <AlertCircle className="w-3 h-3 text-red-600" />}
                        {player.yellowCards === 2 && !player.suspended && (
                          <AlertCircle className="w-3 h-3 text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Rojas</div>
                      <div className="font-semibold text-red-600">{player.redCards}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                Sistema de Tarjetas - Copa Libertadores
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>
                  • <strong>3 tarjetas amarillas</strong> = Suspensión automática de 1 partido (se mantienen visibles
                  las 3 amarillas)
                </li>
                <li>
                  • <strong>Después de cumplir la suspensión</strong>, las amarillas se resetean a 0 y el jugador queda
                  habilitado
                </li>
                <li>
                  • <strong>1 tarjeta roja</strong> = Suspensión automática de 1 partido
                </li>
                <li>• Los jugadores suspendidos aparecen tachados con fondo rojo</li>
                <li>• ⚠️ Jugadores con 2 amarillas están próximos a suspensión</li>
                <li>• 🔴 Jugadores con 3 amarillas están suspendidos</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
