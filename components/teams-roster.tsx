"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Team {
  name: string
  players: Player[]
}

export default function TeamsRoster() {
  const [selectedTeam, setSelectedTeam] = useState("")

  const teams: Record<string, Team> = {}

  const currentTeam = selectedTeam ? teams[selectedTeam] : null

  const hasThreeYellowCards = (player: Player) => {
    return player.yellowCards === 3
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
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay equipos registrados</p>
            <p className="text-sm">
              El administrador debe agregar equipos y jugadores desde el panel de administración
            </p>
          </div>

          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Sistema de Tarjetas - Copa Libertadores
              </h4>
              <ul className="text-sm space-y-1 text-foreground">
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
