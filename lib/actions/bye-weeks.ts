"use server"

import { createClient } from "@/lib/supabase/server"

export async function createByeWeek(formData: FormData) {
  console.log("[v0] ============ CREATE BYE WEEK START ============")

  const tournamentId = formData.get("tournament_id")
  const teamId = formData.get("team_id")
  const round = formData.get("round")

  console.log("[v0] Raw FormData values:", {
    tournamentId,
    teamId,
    round,
  })

  if (!tournamentId || !teamId || !round) {
    console.log("[v0] ❌ Missing required fields")
    throw new Error("Faltan campos requeridos")
  }

  const byeWeek = {
    tournament_id: Number.parseInt(tournamentId as string),
    team_id: Number.parseInt(teamId as string),
    round: Number.parseInt(round as string),
  }

  console.log("[v0] Parsed bye week data:", byeWeek)

  const supabase = await createClient()
  const { data, error } = await supabase.from("bye_weeks").insert(byeWeek).select()

  if (error) {
    console.error("[v0] ❌ Database error creating bye week:", error.message)
    console.error("[v0] Error details:", error.details)
    throw new Error(error.message)
  }

  console.log("[v0] ✅ Bye week created successfully:", data)
  console.log("[v0] ============ CREATE BYE WEEK END ============")
  return data
}

export async function getByeWeeks(tournamentId: number) {
  console.log("[v0] ============ GET BYE WEEKS START ============")
  console.log("[v0] Tournament ID:", tournamentId)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bye_weeks")
    .select(`
      *,
      teams(id, name, logo_url)
    `)
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })

  if (error) {
    console.error("[v0] ❌ Error fetching bye weeks:", error)
    throw new Error(error.message)
  }

  console.log("[v0] ✅ Bye weeks fetched:", data?.length || 0, "records")
  console.log("[v0] ============ GET BYE WEEKS END ============")
  return data || []
}

export async function deleteByeWeek(id: number) {
  console.log("[v0] ============ DELETE BYE WEEK START ============")
  console.log("[v0] Bye week ID:", id)

  const supabase = await createClient()
  const { error } = await supabase.from("bye_weeks").delete().eq("id", id)

  if (error) {
    console.error("[v0] ❌ Error deleting bye week:", error)
    throw new Error(error.message)
  }

  console.log("[v0] ✅ Bye week deleted successfully")
  console.log("[v0] ============ DELETE BYE WEEK END ============")
}
