"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MatchDetailsDisplayProps {
  matchId: number
}

interface Goal {
  id: number
  minute: number
  player_name: string
}

interface Card {
  id: number
  minute: number
  card_type: string
  player_name: string
}

export default function MatchDetailsDisplay({ matchId }: MatchDetailsDisplayProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDetails = async () => {
      const supabase = await createClient()

      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select(`
          id,
          minute,
          players!player_id (
            name
          )
        `)
        .eq("match_id", matchId)

      console.log("[v0] Goals query result:", { goalsData, goalsError })

      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select(`
          id,
          minute,
          card_type,
          players!player_id (
            name
          )
        `)
        .eq("match_id", matchId)
        .eq("card_type", "yellow")

      console.log("[v0] Cards query result:", { cardsData, cardsError })

      const transformedGoals = (goalsData || []).map((g: any) => ({
        id: g.id,
        minute: g.minute,
        player_name: g.players?.name || "Desconocido",
      }))

      const transformedCards = (cardsData || []).map((c: any) => ({
        id: c.id,
        minute: c.minute,
        card_type: c.card_type,
        player_name: c.players?.name || "Desconocido",
      }))

      setGoals(transformedGoals)
      setCards(transformedCards)
      setLoading(false)
    }

    loadDetails()
  }, [matchId])

  if (loading) return null

  if (goals.length === 0 && cards.length === 0) return null

  return (
    <div className="mt-2 pt-2 border-t border-primary/20 text-xs space-y-1">
      {goals.length > 0 && (
        <div className="flex items-start gap-1">
          <span className="text-primary">⚽</span>
          <span className="text-muted-foreground">
            {goals.map((g) => `${g.player_name} (${g.minute}')`).join(", ")}
          </span>
        </div>
      )}
      {cards.length > 0 && (
        <div className="flex items-start gap-1">
          <span className="text-yellow-500">🟨</span>
          <span className="text-muted-foreground">
            {cards.map((c) => `${c.player_name} (${c.minute}')`).join(", ")}
          </span>
        </div>
      )}
    </div>
  )
}
