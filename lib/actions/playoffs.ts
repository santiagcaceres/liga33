"use server"

import { createClient } from "@/lib/supabase/client"

export async function getPlayoffsByTournament(tournament_id: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("playoffs")
    .select("*")
    .eq("tournament_id", tournament_id)
    .order("phase", { ascending: false })
    .order("match_number", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching playoffs:", error)
    return { success: false, error: error.message, data: [] }
  }

  const playoffsWithTeams = await Promise.all(
    (data || []).map(async (playoff) => {
      const teams = await Promise.all([
        playoff.home_team_id
          ? supabase.from("teams").select("id, name, logo_url").eq("id", playoff.home_team_id).single()
          : null,
        playoff.away_team_id
          ? supabase.from("teams").select("id, name, logo_url").eq("id", playoff.away_team_id).single()
          : null,
      ])

      return {
        ...playoff,
        home_team: teams[0]?.data || null,
        away_team: teams[1]?.data || null,
      }
    }),
  )

  return { success: true, data: playoffsWithTeams }
}

export async function createPlayoff(playoff: {
  tournament_id: number
  phase: string
  match_number: number
  home_team_id: number
  away_team_id: number
  match_date: string
  match_time?: string | null
  field?: string | null
}) {
  const supabase = createClient()

  console.log("[v0] Creating playoff match:", playoff)

  const { data, error } = await supabase.from("playoffs").insert([playoff]).select().single()

  if (error) {
    console.error("[v0] Error creating playoff match:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Playoff match created:", data)
  return { success: true, data }
}

export async function updatePlayoff(id: number, updates: any) {
  const supabase = createClient()

  console.log("[v0] Updating playoff match:", id, updates)

  const { data, error } = await supabase.from("playoffs").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating playoff match:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Playoff match updated:", data)
  return { success: true, data }
}

export async function deletePlayoff(id: number) {
  const supabase = createClient()

  console.log("[v0] Deleting playoff match:", id)

  const { error } = await supabase.from("playoffs").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting playoff match:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Playoff match deleted")
  return { success: true }
}

export async function advanceWinnerToNextPhase(playoffId: number, winnerId: number) {
  const supabase = createClient()

  const { data: currentMatch, error: fetchError } = await supabase
    .from("playoffs")
    .select("*")
    .eq("id", playoffId)
    .single()

  if (fetchError || !currentMatch) {
    return { success: false, error: "No se encontró el partido" }
  }

  const phaseOrder = ["octavos", "cuartos", "semifinal", "final"]
  const currentPhaseIndex = phaseOrder.indexOf(currentMatch.phase)

  if (currentPhaseIndex === 3) {
    return { success: false, error: "Este es el partido final, no hay siguiente fase" }
  }

  const nextPhase = phaseOrder[currentPhaseIndex + 1]
  const nextMatchNumber = Math.ceil(currentMatch.match_number / 2)

  const { data: existingMatch } = await supabase
    .from("playoffs")
    .select("*")
    .eq("tournament_id", currentMatch.tournament_id)
    .eq("phase", nextPhase)
    .eq("match_number", nextMatchNumber)
    .single()

  const isHomeInNext = currentMatch.match_number % 2 === 1

  if (existingMatch) {
    const updates = isHomeInNext ? { home_team_id: winnerId } : { away_team_id: winnerId }

    const { error: updateError } = await supabase.from("playoffs").update(updates).eq("id", existingMatch.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }
  } else {
    const newMatch = {
      tournament_id: currentMatch.tournament_id,
      phase: nextPhase,
      match_number: nextMatchNumber,
      home_team_id: isHomeInNext ? winnerId : null,
      away_team_id: isHomeInNext ? null : winnerId,
    }

    const { error: insertError } = await supabase.from("playoffs").insert([newMatch])

    if (insertError) {
      return { success: false, error: insertError.message }
    }
  }

  return { success: true }
}
