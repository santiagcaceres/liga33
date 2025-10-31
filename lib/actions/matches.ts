"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMatch(formData: FormData) {
  const supabase = await createClient()

  const home_team_id = Number.parseInt(formData.get("home_team_id") as string)
  const away_team_id = Number.parseInt(formData.get("away_team_id") as string)
  const group_id = Number.parseInt(formData.get("group_id") as string)
  const round = Number.parseInt(formData.get("round") as string)
  const match_date = formData.get("match_date") as string

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
    throw new Error(error.message)
  }

  revalidatePath("/")
  return data
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
  const supabase = await createClient()

  // Update match score
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
    throw new Error(matchError.message)
  }

  // Insert goals
  if (goals.length > 0) {
    const goalsToInsert = goals.map((goal) => ({
      ...goal,
      match_id: matchId,
    }))

    const { error: goalsError } = await supabase.from("goals").insert(goalsToInsert)

    if (goalsError) {
      console.error("[v0] Error inserting goals:", goalsError)
      throw new Error(goalsError.message)
    }

    // Update player goal counts
    for (const goal of goals) {
      const { data: player } = await supabase.from("players").select("goals").eq("id", goal.player_id).single()

      if (player) {
        await supabase
          .from("players")
          .update({ goals: (player.goals || 0) + 1 })
          .eq("id", goal.player_id)
      }
    }
  }

  // Insert cards
  if (cards.length > 0) {
    const cardsToInsert = cards.map((card) => ({
      ...card,
      match_id: matchId,
    }))

    const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert)

    if (cardsError) {
      console.error("[v0] Error inserting cards:", cardsError)
      throw new Error(cardsError.message)
    }

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

        await supabase.from("players").update(updates).eq("id", card.player_id)
      }
    }
  }

  // Update team standings
  const { data: match } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score, group_id")
    .eq("id", matchId)
    .single()

  if (match) {
    await updateTeamStandings(
      match.home_team_id,
      match.away_team_id,
      match.home_score,
      match.away_score,
      match.group_id,
    )
  }

  revalidatePath("/")
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
