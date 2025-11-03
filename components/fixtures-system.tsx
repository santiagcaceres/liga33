"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import MatchDetailsDisplay from "@/components/match-details-display"

interface Match {
  id: number
  home_team: { name: string; logo_url: string }
  away_team: { name: string; logo_url: string }
  match_date: string
  match_time?: string
  field?: string
  round: number
  played: boolean
  home_score?: number
  away_score?: number
  copa_groups: { name: string }
}

export default function FixturesSystem() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [pastMatches, setPastMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      console.log("[v0] Loading all matches for fixtures...")
      const supabase = createClient()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const { data: upcomingData, error: upcomingError } = await supabase
        .from("matches")
        .select(
          `
          id,
          match_date,
          match_time,
          field,
          round,
          played,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url),
          copa_groups(name)
        `,
        )
        .eq("played", false)
        .gte("match_date", todayISO)
        .order("match_date", { ascending: true })
        .order("round", { ascending: true })

      const { data: pastData, error: pastError } = await supabase
        .from("matches")
        .select(
          `
          id,
          match_date,
          match_time,
          field,
          round,
          played,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url),
          copa_groups(name)
        `,
        )
        .eq("played", true)
        .order("match_date", { ascending: false })
        .order("round", { ascending: false })

      if (upcomingError) {
        console.error("[v0] Error loading upcoming matches:", upcomingError)
      }
      if (pastError) {
        console.error("[v0] Error loading past matches:", pastError)
      }

      console.log("[v0] Matches loaded:", {
        upcoming: upcomingData?.length || 0,
        past: pastData?.length || 0,
      })

      setUpcomingMatches(upcomingData || [])
      setPastMatches(pastData || [])
      setLoading(false)
    }

    loadMatches()
  }, [])

  const formatTime = (time: string | undefined) => {
    if (!time) return null
    return time.substring(0, 5)
  }

  const renderMatch = (match: Match, showDetails = false) => (
    <Card key={match.id} className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Equipos y VS/Resultado */}
          <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4 flex-1">
            {/* Equipo Local */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.home_team.logo_url && (
                <img
                  src={match.home_team.logo_url || "/placeholder.svg"}
                  alt={match.home_team.name}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                />
              )}
              <span className="font-semibold text-xs md:text-base truncate">{match.home_team.name}</span>
            </div>

            {/* VS o Resultado */}
            {showDetails && match.played ? (
              <div className="flex items-center gap-2 flex-shrink-0 px-2">
                <span className="text-2xl font-bold text-primary">{match.home_score ?? 0}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl font-bold text-primary">{match.away_score ?? 0}</span>
              </div>
            ) : (
              <span className="text-primary font-bold text-sm md:text-lg flex-shrink-0 px-2">VS</span>
            )}

            {/* Equipo Visitante */}
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <span className="font-semibold text-xs md:text-base text-right truncate">{match.away_team.name}</span>
              {match.away_team.logo_url && (
                <img
                  src={match.away_team.logo_url || "/placeholder.svg"}
                  alt={match.away_team.name}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            <span>
              {new Date(match.match_date).toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          {match.match_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{formatTime(match.match_time)}</span>
            </div>
          )}
          {match.field && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              <span>{match.field}</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            {match.copa_groups.name}
          </Badge>
        </div>

        {showDetails && match.played && <MatchDetailsDisplay matchId={match.id} />}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card className="border-primary/30 bg-card">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Cargando partidos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {pastMatches.length > 0 && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-6 h-6" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(pastMatches.map((m) => m.round)))
                .sort((a, b) => b - a)
                .map((round) => (
                  <div key={round} className="space-y-2">
                    <h3 className="font-semibold text-primary">Fecha {round}</h3>
                    <div className="grid gap-3">
                      {pastMatches.filter((m) => m.round === round).map((match) => renderMatch(match, true))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingMatches.length > 0 ? (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-6 h-6" />
              Próximos Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(upcomingMatches.map((m) => m.round)))
                .sort((a, b) => a - b)
                .map((round) => (
                  <div key={round} className="space-y-2">
                    <h3 className="font-semibold text-primary">Fecha {round}</h3>
                    <div className="grid gap-3">
                      {upcomingMatches.filter((m) => m.round === round).map((match) => renderMatch(match, false))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-6 h-6" />
              Próximos Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
              <p className="text-lg">No hay partidos próximos</p>
              <p className="text-sm">No hay partidos programados desde hoy en adelante</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
