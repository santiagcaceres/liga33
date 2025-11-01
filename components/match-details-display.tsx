"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MatchDetailsDisplayProps {
  matchId: number
}

interface Goal {
  id: number
  minute: number
  players: {
    name: string
    ci: string
  }
}

interface Card {
  id: number
  minute: number
  card_type: string
  players: {
    name: string
    ci: string
  }
}

export default function MatchDetailsDisplay({ matchId }: MatchDetailsDisplayProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDetails = async () => {
      const supabase = await createClient()

      const { data: goalsData } = await supabase
        .from("goals")
        .select("id, minute, players(name, ci)")
        .eq("match_id", matchId)

      const { data: cardsData } = await supabase
        .from("cards")
        .select("id, minute, card_type, players(name, ci)")
        .eq("match_id", matchId)
        .eq("card_type", "yellow")

      setGoals(goalsData || [])
      setCards(cardsData || [])
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
            {goals.map((g) => `${g.players.name} (${g.minute}')`).join(", ")}
          </span>
        </div>
      )}
      {cards.length > 0 && (
        <div className="flex items-start gap-1">
          <span className="text-yellow-500">🟨</span>
          <span className="text-muted-foreground">
            {cards.map((c) => `${c.players.name} (${c.minute}')`).join(", ")}
          </span>
        </div>
      )}
    </div>
  )
}
