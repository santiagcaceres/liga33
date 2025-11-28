"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2 } from "lucide-react"
import { getPlayoffsByTournament } from "@/lib/actions/playoffs"

interface PlayoffsBracketProps {
  tournament_id: number
}

export default function PlayoffsBracket({ tournament_id }: PlayoffsBracketProps) {
  const [playoffs, setPlayoffs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPlayoffs()
  }, [tournament_id])

  async function loadPlayoffs() {
    setIsLoading(true)
    const result = await getPlayoffsByTournament(tournament_id)
    if (result.success) {
      setPlayoffs(result.data)
    }
    setIsLoading(false)
  }

  const getMatchesByPhase = (phase: string) => {
    return playoffs.filter((p) => p.phase === phase).sort((a, b) => a.match_number - b.match_number)
  }

  const octavos = getMatchesByPhase("octavos")
  const cuartos = getMatchesByPhase("cuartos")
  const semifinales = getMatchesByPhase("semifinal")
  const final = getMatchesByPhase("final")

  const renderMatch = (match: any) => (
    <div key={match.id} className="bg-gray-800 rounded-lg p-3 border border-yellow-500/30 min-w-[200px]">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {match.home_team?.logo_url && (
              <img src={match.home_team.logo_url || "/placeholder.svg"} alt="" className="w-6 h-6 object-contain" />
            )}
            <span className="text-white text-sm truncate">{match.home_team?.name || "Por definir"}</span>
          </div>
          {match.played && <span className="text-yellow-500 font-bold ml-2">{match.home_score}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {match.away_team?.logo_url && (
              <img src={match.away_team.logo_url || "/placeholder.svg"} alt="" className="w-6 h-6 object-contain" />
            )}
            <span className="text-white text-sm truncate">{match.away_team?.name || "Por definir"}</span>
          </div>
          {match.played && <span className="text-yellow-500 font-bold ml-2">{match.away_score}</span>}
        </div>
        {!match.played && match.match_date && (
          <div className="text-xs text-gray-400 text-center pt-1 border-t border-gray-700">{match.match_date}</div>
        )}
      </div>
    </div>
  )

  const renderEmptyMatch = () => (
    <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500/30 min-w-[200px]">
      <div className="space-y-2">
        <div className="text-gray-500 text-sm text-center">No configurado</div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-3" />
        <p>Cargando eliminatorias...</p>
      </div>
    )
  }

  if (playoffs.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg">Las eliminatorias aún no han sido configuradas</p>
        <p className="text-gray-500 text-sm mt-2">Los cruces se definirán al finalizar la fase de grupos</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">Fase de Eliminación</h2>
        <p className="text-gray-400">Camino hacia la gloria continental</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max justify-center">
          {/* Octavos de Final */}
          {octavos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-500 text-center mb-4">Octavos de Final</h3>
              <div className="space-y-4">{octavos.map((match) => renderMatch(match))}</div>
            </div>
          )}

          {/* Cuartos de Final */}
          {cuartos.length > 0 && (
            <div className="space-y-4 flex flex-col justify-around">
              <h3 className="text-xl font-bold text-yellow-500 text-center mb-4">Cuartos de Final</h3>
              <div className="space-y-8">{cuartos.map((match) => renderMatch(match))}</div>
            </div>
          )}

          {/* Semifinales */}
          {semifinales.length > 0 && (
            <div className="space-y-4 flex flex-col justify-around">
              <h3 className="text-xl font-bold text-yellow-500 text-center mb-4">Semifinales</h3>
              <div className="space-y-16">{semifinales.map((match) => renderMatch(match))}</div>
            </div>
          )}

          {/* Final */}
          {final.length > 0 && (
            <div className="space-y-4 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-yellow-500 text-center mb-4 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                FINAL
              </h3>
              <div>{final.map((match) => renderMatch(match))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
