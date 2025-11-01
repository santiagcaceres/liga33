"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMatch(formData: FormData) {
  try {
    const supabase = await createClient()

    const home_team_id = Number.parseInt(formData.get("home_team_id") as string)
    const away_team_id = Number.parseInt(formData.get("away_team_id") as string)
    const group_id = Number.parseInt(formData.get("group_id") as string)
    const round = Number.parseInt(formData.get("round") as string)
    const match_date = formData.get("match_date") as string

    if (home_team_id === away_team_id) {
      return { success: false, error: "Un equipo no puede jugar contra sí mismo" }
    }

    const { data: homeTeamGroup } = await supabase
      .from("team_groups")
      .select("group_id")
      .eq("team_id", home_team_id)
      .eq("group_id", group_id)
      .single()

    const { data: awayTeamGroup } = await supabase
      .from("team_groups")
      .select("group_id")
      .eq("team_id", away_team_id)
      .eq("group_id", group_id)
      .single()

    if (!homeTeamGroup || !awayTeamGroup) {
      return { success: false, error: "Ambos equipos deben pertenecer al mismo grupo" }
    }

    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          home_team_id,
          away_team_id,
          group_id,
          round,
          match_date,
          home_score: 0,
          away_score: 0,
          played: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating match:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error in createMatch:", error)
    return { success: false, error: error.message || "Error al crear el partido" }
  }
}

export async function getMatches(groupId?: number, round?: number) {
  const supabase = await createClient()

  let query = supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name),
      copa_groups(id, name)
    `)
    .order("match_date")
    .order("round")

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  if (round) {
    query = query.eq("round", round)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching matches:", error)
    return []
  }

  return data || []
}

export async function updateMatchResult(
  matchId: number,
  homeScore: number,
  awayScore: number,
  goals: Array<{ player_id: number; team_id: number; minute: number }>,
  cards: Array<{ player_id: number; team_id: number; card_type: string; minute: number }>,
) {
  try {
    const supabase = await createClient()

    console.log("[v0] Starting updateMatchResult:", { matchId, homeScore, awayScore, goals, cards })

    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        played: true,
      })
      .eq("id", matchId)

    if (matchError) {
      console.error("[v0] Error updating match:", matchError)
      return { success: false, error: matchError.message }
    }

    console.log("[v0] Match updated successfully")

    if (goals.length > 0) {
      const goalsToInsert = goals.map((goal) => ({
        ...goal,
        match_id: matchId,
      }))

      console.log("[v0] Inserting goals:", goalsToInsert)

      const { error: goalsError } = await supabase.from("goals").insert(goalsToInsert)

      if (goalsError) {
        console.error("[v0] Error inserting goals:", goalsError)
        return { success: false, error: goalsError.message }
      }

      console.log("[v0] Goals inserted successfully")

      // Update player goal counts
      for (const goal of goals) {
        const { data: player } = await supabase.from("players").select("goals").eq("id", goal.player_id).single()

        if (player) {
          const newGoals = (player.goals || 0) + 1
          console.log("[v0] Updating player goals:", { playerId: goal.player_id, newGoals })
          await supabase.from("players").update({ goals: newGoals }).eq("id", goal.player_id)
        }
      }
    }

    if (cards.length > 0) {
      const cardsToInsert = cards.map((card) => ({
        ...card,
        match_id: matchId,
      }))

      console.log("[v0] Inserting cards:", cardsToInsert)

      const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert)

      if (cardsError) {
        console.error("[v0] Error inserting cards:", cardsError)
        return { success: false, error: cardsError.message }
      }

      console.log("[v0] Cards inserted successfully")

      // Update player card counts and suspension status
      for (const card of cards) {
        const { data: player } = await supabase
          .from("players")
          .select("yellow_cards, red_cards")
          .eq("id", card.player_id)
          .single()

        if (player) {
          const updates: any = {}

          if (card.card_type === "yellow") {
            const newYellowCards = (player.yellow_cards || 0) + 1
            updates.yellow_cards = newYellowCards

            if (newYellowCards >= 2) {
              updates.suspended = true
            }
          } else if (card.card_type === "red") {
            updates.red_cards = (player.red_cards || 0) + 1
            updates.suspended = true
          }

          console.log("[v0] Updating player cards:", { playerId: card.player_id, updates })
          await supabase.from("players").update(updates).eq("id", card.player_id)
        }
      }
    }

    const { data: match } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id, home_score, away_score, group_id")
      .eq("id", matchId)
      .single()

    if (match) {
      console.log("[v0] Updating team standings for match:", match)
      await updateTeamStandings(
        match.home_team_id,
        match.away_team_id,
        match.home_score,
        match.away_score,
        match.group_id,
      )
    }

    revalidatePath("/")
    console.log("[v0] Match result updated successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error in updateMatchResult:", error)
    return { success: false, error: error.message || "Error al actualizar el resultado del partido" }
  }
}

async function updateTeamStandings(
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
  groupId: number,
) {
  const supabase = await createClient()

  // Get current standings
  const { data: homeStanding } = await supabase
    .from("team_groups")
    .select("*")
    .eq("team_id", homeTeamId)
    .eq("group_id", groupId)
    .single()

  const { data: awayStanding } = await supabase
    .from("team_groups")
    .select("*")
    .eq("team_id", awayTeamId)
    .eq("group_id", groupId)
    .single()

  if (!homeStanding || !awayStanding) return

  // Calculate updates
  const homeUpdates: any = {
    played: homeStanding.played + 1,
    goals_for: homeStanding.goals_for + homeScore,
    goals_against: homeStanding.goals_against + awayScore,
  }

  const awayUpdates: any = {
    played: awayStanding.played + 1,
    goals_for: awayStanding.goals_for + awayScore,
    goals_against: awayStanding.goals_against + homeScore,
  }

  if (homeScore > awayScore) {
    homeUpdates.won = homeStanding.won + 1
    homeUpdates.points = homeStanding.points + 3
    awayUpdates.lost = awayStanding.lost + 1
  } else if (homeScore < awayScore) {
    awayUpdates.won = awayStanding.won + 1
    awayUpdates.points = awayStanding.points + 3
    homeUpdates.lost = homeStanding.lost + 1
  } else {
    homeUpdates.drawn = homeStanding.drawn + 1
    homeUpdates.points = homeStanding.points + 1
    awayUpdates.drawn = awayStanding.drawn + 1
    awayUpdates.points = awayStanding.points + 1
  }

  homeUpdates.goal_difference = homeUpdates.goals_for - homeUpdates.goals_against
  awayUpdates.goal_difference = awayUpdates.goals_for - awayUpdates.goals_against

  // Update standings
  await supabase.from("team_groups").update(homeUpdates).eq("team_id", homeTeamId).eq("group_id", groupId)

  await supabase.from("team_groups").update(awayUpdates).eq("team_id", awayTeamId).eq("group_id", groupId)
}

export async function deleteMatch(matchId: number) {
  try {
    const supabase = await createClient()

    // Delete associated goals and cards first
    await supabase.from("goals").delete().eq("match_id", matchId)
    await supabase.from("cards").delete().eq("match_id", matchId)

    // Delete the match
    const { error } = await supabase.from("matches").delete().eq("id", matchId)

    if (error) {
      console.error("[v0] Error deleting match:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error in deleteMatch:", error)
    return { success: false, error: error.message || "Error al eliminar el partido" }
  }
}
