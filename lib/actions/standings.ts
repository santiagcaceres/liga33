"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getLeagueStandings(tournamentId: number) {
  console.log("[v0] 🔍 Getting league standings for tournament:", tournamentId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("league_standings")
    .select(`
      *,
      teams!inner(id, name, logo_url, tournament_id)
    `)
    .eq("tournament_id", tournamentId)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false })

  if (error) {
    console.error("[v0] ❌ Error fetching league standings:", error)
    return []
  }

  console.log("[v0] ✅ Fetched league standings:", data?.length || 0, "records")
  return data || []
}

export async function initializeLeagueStandings(tournamentId: number) {
  console.log("[v0] 🔄 Initializing league standings for tournament:", tournamentId)
  const supabase = await createClient()

  // Get all teams for this tournament
  const { data: teams, error: teamsError } = await supabase.from("teams").select("id").eq("tournament_id", tournamentId)

  if (teamsError) {
    console.error("[v0] ❌ Error fetching teams:", teamsError)
    return { success: false, error: teamsError.message }
  }

  if (!teams || teams.length === 0) {
    return { success: false, error: "No teams found for this tournament" }
  }

  // Check if standings already exist
  const { data: existing } = await supabase.from("league_standings").select("id").eq("tournament_id", tournamentId)

  if (existing && existing.length > 0) {
    console.log("[v0] ⚠️ Standings already initialized")
    return { success: true, message: "Standings already initialized" }
  }

  // Create initial standings for each team
  const standingsData = teams.map((team) => ({
    team_id: team.id,
    tournament_id: tournamentId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  }))

  const { error: insertError } = await supabase.from("league_standings").insert(standingsData)

  if (insertError) {
    console.error("[v0] ❌ Error initializing standings:", insertError)
    return { success: false, error: insertError.message }
  }

  console.log("[v0] ✅ League standings initialized successfully")
  revalidatePath("/")
  return { success: true }
}

export async function updateLeagueStandings(matchId: number) {
  console.log("[v0] 🔄 Updating league standings for match:", matchId)
  const supabase = await createClient()

  // Get match details
  const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).single()

  if (matchError || !match) {
    console.error("[v0] ❌ Error fetching match:", matchError)
    return { success: false, error: "Match not found" }
  }

  if (!match.played || match.home_score === null || match.away_score === null) {
    return { success: false, error: "Match not completed" }
  }

  // Determine result
  const homeWin = match.home_score > match.away_score
  const awayWin = match.away_score > match.home_score
  const draw = match.home_score === match.away_score

  // Update home team standings
  const { error: homeError } = await supabase.rpc("update_league_standing", {
    p_team_id: match.home_team_id,
    p_tournament_id: match.tournament_id,
    p_won: homeWin ? 1 : 0,
    p_drawn: draw ? 1 : 0,
    p_lost: awayWin ? 1 : 0,
    p_goals_for: match.home_score,
    p_goals_against: match.away_score,
  })

  if (homeError) {
    console.error("[v0] ❌ Error updating home team standings:", homeError)
  }

  // Update away team standings
  const { error: awayError } = await supabase.rpc("update_league_standing", {
    p_team_id: match.away_team_id,
    p_tournament_id: match.tournament_id,
    p_won: awayWin ? 1 : 0,
    p_drawn: draw ? 1 : 0,
    p_lost: homeWin ? 1 : 0,
    p_goals_for: match.away_score,
    p_goals_against: match.home_score,
  })

  if (awayError) {
    console.error("[v0] ❌ Error updating away team standings:", awayError)
  }

  console.log("[v0] ✅ League standings updated successfully")
  revalidatePath("/")
  return { success: true }
}
