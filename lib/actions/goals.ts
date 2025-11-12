"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addGoal(formData: FormData) {
  const supabase = await createClient()

  const match_id = Number.parseInt(formData.get("match_id") as string)
  const team_id = Number.parseInt(formData.get("team_id") as string)
  const player_id = Number.parseInt(formData.get("player_id") as string)
  const minute = Number.parseInt(formData.get("minute") as string) || 0

  console.log("[v0] Adding goal:", { match_id, team_id, player_id, minute })

  const { data, error } = await supabase
    .from("goals")
    .insert({
      match_id,
      team_id,
      player_id,
      minute,
    })
    .select()

  if (error) {
    console.error("[v0] Error adding goal:", error)
    throw new Error(error.message || "Failed to add goal")
  }

  console.log("[v0] Goal added successfully:", data)

  // Update player goals count
  const { data: player } = await supabase.from("players").select("goals").eq("id", player_id).single()

  if (player) {
    await supabase
      .from("players")
      .update({ goals: (player.goals || 0) + 1 })
      .eq("id", player_id)
  }

  revalidatePath("/admin/libertadores")
  revalidatePath("/admin/femenina")
  revalidatePath("/libertadores")
  revalidatePath("/femenina")
  revalidatePath("/")

  return data
}

export async function deleteGoal(goalId: number) {
  const supabase = await createClient()

  // Get goal info before deleting
  const { data: goal } = await supabase.from("goals").select("player_id").eq("id", goalId).single()

  const { error } = await supabase.from("goals").delete().eq("id", goalId)

  if (error) {
    console.error("Error deleting goal:", error)
    throw new Error("Failed to delete goal")
  }

  // Update player goals count
  if (goal) {
    const { data: player } = await supabase.from("players").select("goals").eq("id", goal.player_id).single()

    if (player && player.goals > 0) {
      await supabase
        .from("players")
        .update({ goals: player.goals - 1 })
        .eq("id", goal.player_id)
    }
  }

  revalidatePath("/admin/libertadores")
  revalidatePath("/admin/femenina")
  revalidatePath("/libertadores")
  revalidatePath("/femenina")
  revalidatePath("/")
}

export async function getMatchGoals(matchId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("goals")
    .select(`
      id,
      minute,
      team_id,
      player_id,
      players(name)
    `)
    .eq("match_id", matchId)
    .order("minute", { ascending: true })

  if (error) {
    console.error("Error fetching goals:", error)
    return []
  }

  return data || []
}
