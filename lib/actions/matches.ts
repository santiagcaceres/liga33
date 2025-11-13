"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMatch(formData: FormData) {
  try {
    const supabase = await createClient()

    console.log("[v0] ============ CREATE MATCH START ============")
    console.log("[v0] FormData received:", {
      home_team_id: formData.get("home_team_id"),
      away_team_id: formData.get("away_team_id"),
      group_id: formData.get("group_id"),
      tournament_id: formData.get("tournament_id"),
      round: formData.get("round"),
      match_date: formData.get("match_date"),
      match_time: formData.get("match_time"),
      field: formData.get("field"),
    })

    const home_team_id = Number.parseInt(formData.get("home_team_id") as string)
    const away_team_id = Number.parseInt(formData.get("away_team_id") as string)
    const group_id = Number.parseInt(formData.get("group_id") as string)
    const tournament_id = Number.parseInt(formData.get("tournament_id") as string)
    const round = Number.parseInt(formData.get("round") as string)
    const match_date = formData.get("match_date") as string
    const match_time = formData.get("match_time") as string | null
    const field = formData.get("field") as string | null

    let finalGroupId: number | null = group_id

    if (tournament_id === 2) {
      console.log("[v0] Women's tournament - using NULL for group_id")
      finalGroupId = null
    }

    console.log("[v0] Parsed values:", {
      home_team_id,
      away_team_id,
      group_id: finalGroupId,
      tournament_id,
      round,
      match_date,
      match_time,
      field,
    })

    if (home_team_id === away_team_id) {
      console.error("[v0] ❌ Same team selected for both sides")
      return { success: false, error: "Un equipo no puede jugar contra sí mismo" }
    }

    if (tournament_id === 1 && finalGroupId) {
      const { data: homeTeamGroup } = await supabase
        .from("team_groups")
        .select("group_id")
        .eq("team_id", home_team_id)
        .eq("group_id", finalGroupId)
        .single()

      const { data: awayTeamGroup } = await supabase
        .from("team_groups")
        .select("group_id")
        .eq("team_id", away_team_id)
        .eq("group_id", finalGroupId)
        .single()

      console.log("[v0] Team groups validation:", {
        homeTeamGroup,
        awayTeamGroup,
        tournament_id,
      })

      if (!homeTeamGroup || !awayTeamGroup) {
        console.error("[v0] ❌ Teams do not belong to the same group (Libertadores)")
        return { success: false, error: "Ambos equipos deben pertenecer al mismo grupo" }
      }
    }

    const matchData: any = {
      home_team_id,
      away_team_id,
      group_id: finalGroupId,
      tournament_id,
      round,
      match_date,
      home_score: 0,
      away_score: 0,
      played: false,
    }

    if (match_time) matchData.match_time = match_time
    if (field) matchData.field = field

    console.log("[v0] Inserting match with data:", matchData)

    const { data, error } = await supabase.from("matches").insert([matchData]).select().single()

    if (error) {
      console.error("[v0] ❌ Database error creating match:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: error.message }
    }

    console.log("[v0] ✅ Match created successfully:", data)
    console.log("[v0] ============ CREATE MATCH END ============")
    revalidatePath("/")
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] ❌ Error in createMatch:", error)
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

export async function getMatchesByTournament(tournamentId: number) {
  console.log("[v0] ============ GET MATCHES BY TOURNAMENT START ============")
  console.log("[v0] Tournament ID:", tournamentId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
      away_team:teams!matches_away_team_id_fkey(id, name, logo_url),
      copa_groups(id, name)
    `)
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: false })
    .order("round", { ascending: false })

  if (error) {
    console.error("[v0] ❌ Error fetching matches by tournament:", error)
    return []
  }

  console.log("[v0] ✅ Matches fetched for tournament", tournamentId, ":", data?.length || 0, "matches")
  console.log("[v0] ============ GET MATCHES BY TOURNAMENT END ============")

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

    const { data: match, error: matchFetchError } = await supabase
      .from("matches")
      .select(`
        home_team_id, 
        away_team_id, 
        home_score, 
        away_score, 
        group_id, 
        tournament_id,
        played,
        goals(id, player_id),
        cards(id, player_id, card_type)
      `)
      .eq("id", matchId)
      .single()

    if (matchFetchError || !match) {
      console.error("[v0] Error fetching match:", matchFetchError)
      return { success: false, error: "Match not found" }
    }

    console.log("[v0] Match data:", match)
    console.log("[v0] Existing goals:", match.goals?.length || 0)
    console.log("[v0] Existing cards:", match.cards?.length || 0)

    if (match.played) {
      console.log("[v0] Match was already played - reverting old statistics")

      // Revert old goal counts
      if (match.goals && match.goals.length > 0) {
        for (const oldGoal of match.goals) {
          const { data: player } = await supabase
            .from("players")
            .select("id, goals")
            .eq("id", oldGoal.player_id)
            .single()

          if (player && player.goals > 0) {
            await supabase
              .from("players")
              .update({ goals: Math.max(0, player.goals - 1) })
              .eq("id", player.id)
            console.log("[v0] Reverted 1 goal from player", player.id)
          }
        }
      }

      // Revert old card counts
      if (match.cards && match.cards.length > 0) {
        for (const oldCard of match.cards) {
          const { data: player } = await supabase
            .from("players")
            .select("id, yellow_cards, red_cards, suspended")
            .eq("id", oldCard.player_id)
            .single()

          if (player) {
            const updates: any = {}
            if (oldCard.card_type === "yellow" && player.yellow_cards > 0) {
              updates.yellow_cards = Math.max(0, player.yellow_cards - 1)
              // If player was suspended due to 2 yellows, remove suspension if going below 2
              if (updates.yellow_cards < 2 && player.suspended) {
                updates.suspended = false
              }
            } else if (oldCard.card_type === "red" && player.red_cards > 0) {
              updates.red_cards = Math.max(0, player.red_cards - 1)
              // If player only had red cards causing suspension, remove it
              if (updates.red_cards === 0 && player.yellow_cards < 2) {
                updates.suspended = false
              }
            }

            if (Object.keys(updates).length > 0) {
              await supabase.from("players").update(updates).eq("id", player.id)
              console.log("[v0] Reverted card from player", player.id, updates)
            }
          }
        }
      }

      // Revert old standings
      if (match.tournament_id === 2) {
        console.log("[v0] Reverting league_standings for women's tournament")
        await revertLeagueStandingsForMatch(
          match.home_team_id,
          match.away_team_id,
          match.home_score,
          match.away_score,
          match.tournament_id,
        )
      } else if (match.group_id) {
        console.log("[v0] Reverting team_groups for Libertadores")
        await revertTeamStandings(
          match.home_team_id,
          match.away_team_id,
          match.home_score,
          match.away_score,
          match.group_id,
        )
      }

      // Delete old goals and cards
      await supabase.from("goals").delete().eq("match_id", matchId)
      await supabase.from("cards").delete().eq("match_id", matchId)
      console.log("[v0] Deleted old goals and cards")
    }

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

    const results = {
      goalsInserted: 0,
      goalsFailed: 0,
      cardsInserted: 0,
      cardsFailed: 0,
      playersUpdated: 0,
      playersFailed: 0,
      errors: [] as string[], // Track specific errors
    }

    if (goals.length > 0) {
      console.log("[v0] Processing", goals.length, "goals")
      for (const goal of goals) {
        console.log("[v0] Processing goal for player_id:", goal.player_id)

        const { data: player, error: playerError } = await supabase
          .from("players")
          .select("id, goals")
          .eq("id", goal.player_id)
          .single()

        if (playerError || !player) {
          const errorMsg = `Player ID ${goal.player_id} not found: ${playerError?.message || "No player data"}`
          console.error("[v0]", errorMsg)
          results.goalsFailed++
          results.errors.push(errorMsg)
          continue
        }

        console.log("[v0] Found player:", { playerId: player.id, currentGoals: player.goals })

        const { data: goalData, error: goalError } = await supabase
          .from("goals")
          .insert({
            match_id: matchId,
            player_id: player.id,
            team_id: goal.team_id,
            minute: goal.minute,
          })
          .select()

        if (goalError) {
          const errorMsg = `Failed to insert goal for player ${player.id}: ${goalError.message}`
          console.error("[v0]", errorMsg)
          results.goalsFailed++
          results.errors.push(errorMsg)
          continue
        }

        console.log("[v0] Goal inserted successfully:", goalData)
        results.goalsInserted++

        const newGoals = (player.goals || 0) + 1
        console.log("[v0] Updating player goals from", player.goals, "to", newGoals)

        const { error: updateError } = await supabase.from("players").update({ goals: newGoals }).eq("id", player.id)

        if (updateError) {
          const errorMsg = `Failed to update goals for player ${player.id}: ${updateError.message}`
          console.error("[v0]", errorMsg)
          results.playersFailed++
          results.errors.push(errorMsg)
        } else {
          console.log("[v0] Player goals updated successfully")
          results.playersUpdated++
        }
      }
    }

    if (cards.length > 0) {
      console.log("[v0] Processing", cards.length, "cards")
      for (const card of cards) {
        console.log("[v0] Processing card for player_id:", card.player_id)

        const { data: player, error: playerError } = await supabase
          .from("players")
          .select("id, yellow_cards, red_cards")
          .eq("id", card.player_id)
          .single()

        if (playerError || !player) {
          const errorMsg = `Player ID ${card.player_id} not found: ${playerError?.message || "No player data"}`
          console.error("[v0]", errorMsg)
          results.cardsFailed++
          results.errors.push(errorMsg)
          continue
        }

        console.log("[v0] Found player:", {
          playerId: player.id,
          currentYellowCards: player.yellow_cards,
          currentRedCards: player.red_cards,
        })

        const { data: cardData, error: cardError } = await supabase
          .from("cards")
          .insert({
            match_id: matchId,
            player_id: player.id,
            team_id: card.team_id,
            card_type: card.card_type,
            minute: card.minute,
          })
          .select()

        if (cardError) {
          const errorMsg = `Failed to insert card for player ${player.id}: ${cardError.message}`
          console.error("[v0]", errorMsg)
          results.cardsFailed++
          results.errors.push(errorMsg)
          continue
        }

        console.log("[v0] Card inserted successfully:", cardData)
        results.cardsInserted++

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

        console.log("[v0] Updating player cards:", { playerId: player.id, updates })

        const { error: updateError } = await supabase.from("players").update(updates).eq("id", player.id)

        if (updateError) {
          const errorMsg = `Failed to update cards for player ${player.id}: ${updateError.message}`
          console.error("[v0]", errorMsg)
          results.playersFailed++
          results.errors.push(errorMsg)
        } else {
          console.log("[v0] Player cards updated successfully")
          results.playersUpdated++
        }
      }
    }

    if (match.tournament_id === 2) {
      // Women's tournament uses league_standings
      console.log("[v0] Updating league_standings for women's tournament")
      await updateLeagueStandingsForMatch(
        match.home_team_id,
        match.away_team_id,
        homeScore,
        awayScore,
        match.tournament_id,
      )
    } else if (match.group_id) {
      // Libertadores uses team_groups
      console.log("[v0] Updating team_groups for Libertadores")
      await updateTeamStandings(match.home_team_id, match.away_team_id, homeScore, awayScore, match.group_id)
    }

    revalidatePath("/")
    console.log("[v0] Match result updated successfully. Results:", results)
    return { success: true, results }
  } catch (error: any) {
    console.error("[v0] Error in updateMatchResult:", error)
    return { success: false, error: error.message || "Error al actualizar el resultado del partido" }
  }
}

async function revertTeamStandings(
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
  groupId: number,
) {
  const supabase = await createClient()

  console.log("[v0] Starting revertTeamStandings:", { homeTeamId, awayTeamId, homeScore, awayScore, groupId })

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

  if (!homeStanding || !awayStanding) {
    console.error("[v0] Missing team standings - cannot revert")
    return
  }

  const homeUpdates: any = {
    played: Math.max(0, homeStanding.played - 1),
    goals_for: Math.max(0, homeStanding.goals_for - homeScore),
    goals_against: Math.max(0, homeStanding.goals_against - awayScore),
  }

  const awayUpdates: any = {
    played: Math.max(0, awayStanding.played - 1),
    goals_for: Math.max(0, awayStanding.goals_for - awayScore),
    goals_against: Math.max(0, awayStanding.goals_against - homeScore),
  }

  if (homeScore > awayScore) {
    homeUpdates.won = Math.max(0, homeStanding.won - 1)
    homeUpdates.points = Math.max(0, homeStanding.points - 3)
    awayUpdates.lost = Math.max(0, awayStanding.lost - 1)
  } else if (homeScore < awayScore) {
    awayUpdates.won = Math.max(0, awayStanding.won - 1)
    awayUpdates.points = Math.max(0, awayStanding.points - 3)
    homeUpdates.lost = Math.max(0, homeStanding.lost - 1)
  } else {
    homeUpdates.drawn = Math.max(0, homeStanding.drawn - 1)
    homeUpdates.points = Math.max(0, homeStanding.points - 1)
    awayUpdates.drawn = Math.max(0, awayStanding.drawn - 1)
    awayUpdates.points = Math.max(0, awayStanding.points - 1)
  }

  homeUpdates.goal_difference = homeUpdates.goals_for - homeUpdates.goals_against
  awayUpdates.goal_difference = awayUpdates.goals_for - awayUpdates.goals_against

  await supabase.from("team_groups").update(homeUpdates).eq("team_id", homeTeamId).eq("group_id", groupId)

  await supabase.from("team_groups").update(awayUpdates).eq("team_id", awayTeamId).eq("group_id", groupId)

  console.log("[v0] Team standings reverted successfully")
}

async function revertLeagueStandingsForMatch(
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
  tournamentId: number,
) {
  const supabase = await createClient()

  console.log("[v0] Starting revertLeagueStandingsForMatch:", {
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    tournamentId,
  })

  const { data: homeStanding } = await supabase
    .from("league_standings")
    .select("*")
    .eq("team_id", homeTeamId)
    .eq("tournament_id", tournamentId)
    .single()

  const { data: awayStanding } = await supabase
    .from("league_standings")
    .select("*")
    .eq("team_id", awayTeamId)
    .eq("tournament_id", tournamentId)
    .single()

  if (!homeStanding || !awayStanding) {
    console.error("[v0] Missing team standings - cannot revert")
    return
  }

  const homeUpdates: any = {
    played: Math.max(0, homeStanding.played - 1),
    goals_for: Math.max(0, homeStanding.goals_for - homeScore),
    goals_against: Math.max(0, homeStanding.goals_against - awayScore),
  }

  const awayUpdates: any = {
    played: Math.max(0, awayStanding.played - 1),
    goals_for: Math.max(0, awayStanding.goals_for - awayScore),
    goals_against: Math.max(0, awayStanding.goals_against - homeScore),
  }

  if (homeScore > awayScore) {
    homeUpdates.won = Math.max(0, homeStanding.won - 1)
    homeUpdates.points = Math.max(0, homeStanding.points - 3)
    awayUpdates.lost = Math.max(0, awayStanding.lost - 1)
  } else if (homeScore < awayScore) {
    awayUpdates.won = Math.max(0, awayStanding.won - 1)
    awayUpdates.points = Math.max(0, awayStanding.points - 3)
    homeUpdates.lost = Math.max(0, homeStanding.lost - 1)
  } else {
    homeUpdates.drawn = Math.max(0, homeStanding.drawn - 1)
    homeUpdates.points = Math.max(0, homeStanding.points - 1)
    awayUpdates.drawn = Math.max(0, awayStanding.drawn - 1)
    awayUpdates.points = Math.max(0, awayStanding.points - 1)
  }

  homeUpdates.goal_difference = homeUpdates.goals_for - homeUpdates.goals_against
  awayUpdates.goal_difference = awayUpdates.goals_for - awayUpdates.goals_against

  await supabase
    .from("league_standings")
    .update(homeUpdates)
    .eq("team_id", homeTeamId)
    .eq("tournament_id", tournamentId)

  await supabase
    .from("league_standings")
    .update(awayUpdates)
    .eq("team_id", awayTeamId)
    .eq("tournament_id", tournamentId)

  console.log("[v0] League standings reverted successfully")
}

async function updateTeamStandings(
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
  groupId: number,
) {
  const supabase = await createClient()

  console.log("[v0] Starting updateTeamStandings:", { homeTeamId, awayTeamId, homeScore, awayScore, groupId })

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

  if (!homeStanding || !awayStanding) {
    console.error("[v0] Missing team standings - cannot update")
    return
  }

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
    console.log("[v0] Home team wins")
  } else if (homeScore < awayScore) {
    awayUpdates.won = awayStanding.won + 1
    awayUpdates.points = awayStanding.points + 3
    homeUpdates.lost = homeStanding.lost + 1
    console.log("[v0] Away team wins")
  } else {
    homeUpdates.drawn = homeStanding.drawn + 1
    homeUpdates.points = homeStanding.points + 1
    awayUpdates.drawn = awayStanding.drawn + 1
    awayUpdates.points = awayStanding.points + 1
    console.log("[v0] Draw")
  }

  homeUpdates.goal_difference = homeUpdates.goals_for - homeUpdates.goals_against
  awayUpdates.goal_difference = awayUpdates.goals_for - awayUpdates.goals_against

  await supabase.from("team_groups").update(homeUpdates).eq("team_id", homeTeamId).eq("group_id", groupId)

  await supabase.from("team_groups").update(awayUpdates).eq("team_id", awayTeamId).eq("group_id", groupId)

  console.log("[v0] Team standings updated successfully")
}

async function updateLeagueStandingsForMatch(
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
  tournamentId: number,
) {
  const supabase = await createClient()

  console.log("[v0] Starting updateLeagueStandingsForMatch:", {
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    tournamentId,
  })

  // Get current standings for both teams
  const { data: homeStanding } = await supabase
    .from("league_standings")
    .select("*")
    .eq("team_id", homeTeamId)
    .eq("tournament_id", tournamentId)
    .single()

  const { data: awayStanding } = await supabase
    .from("league_standings")
    .select("*")
    .eq("team_id", awayTeamId)
    .eq("tournament_id", tournamentId)
    .single()

  if (!homeStanding || !awayStanding) {
    console.error("[v0] Missing team standings - cannot update")
    return
  }

  // Calculate updates for home team
  const homeUpdates: any = {
    played: homeStanding.played + 1,
    goals_for: homeStanding.goals_for + homeScore,
    goals_against: homeStanding.goals_against + awayScore,
  }

  // Calculate updates for away team
  const awayUpdates: any = {
    played: awayStanding.played + 1,
    goals_for: awayStanding.goals_for + awayScore,
    goals_against: awayStanding.goals_against + homeScore,
  }

  // Determine match result and update points
  if (homeScore > awayScore) {
    homeUpdates.won = homeStanding.won + 1
    homeUpdates.points = homeStanding.points + 3
    awayUpdates.lost = awayStanding.lost + 1
    console.log("[v0] Home team wins")
  } else if (homeScore < awayScore) {
    awayUpdates.won = awayStanding.won + 1
    awayUpdates.points = awayStanding.points + 3
    homeUpdates.lost = homeStanding.lost + 1
    console.log("[v0] Away team wins")
  } else {
    homeUpdates.drawn = homeStanding.drawn + 1
    homeUpdates.points = homeStanding.points + 1
    awayUpdates.drawn = awayStanding.drawn + 1
    awayUpdates.points = awayStanding.points + 1
    console.log("[v0] Draw")
  }

  // Calculate goal difference
  homeUpdates.goal_difference = homeUpdates.goals_for - homeUpdates.goals_against
  awayUpdates.goal_difference = awayUpdates.goals_for - awayUpdates.goals_against

  await supabase
    .from("league_standings")
    .update(homeUpdates)
    .eq("team_id", homeTeamId)
    .eq("tournament_id", tournamentId)

  await supabase
    .from("league_standings")
    .update(awayUpdates)
    .eq("team_id", awayTeamId)
    .eq("tournament_id", tournamentId)

  console.log("[v0] League standings updated successfully")
}

export async function deleteMatch(matchId: number) {
  try {
    const supabase = await createClient()

    await supabase.from("goals").delete().eq("match_id", matchId)
    await supabase.from("cards").delete().eq("match_id", matchId)

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
