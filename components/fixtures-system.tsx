"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface Match {
  id: number
  home: string
  away: string
  date: string
  time: string
  venue: string
  round: number
  status: "upcoming" | "live" | "finished"
  homeScore?: number
  awayScore?: number
  homeGoals?: string[]
  awayGoals?: string[]
}

const matchesData: Match[] = []

export default function FixturesSystem() {
  const [selectedRound, setSelectedRound] = useState(1)

  const upcomingMatches = matchesData.filter((match) => match.status === "upcoming")
  const finishedMatches = matchesData.filter((match) => match.status === "finished")
  const roundMatches = matchesData.filter((match) => match.round === selectedRound)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "live":
        return "bg-red-500 animate-pulse"
      case "finished":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Próximo"
      case "live":
        return "En Vivo"
      case "finished":
        return "Finalizado"
      default:
        return "Programado"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="w-6 h-6" />
            Fixtures y Resultados - Copa Libertadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay partidos programados</p>
            <p className="text-sm">El administrador debe cargar los partidos desde el panel de administración</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
