"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createGroup(name: string) {
  try {
    const supabase = await createClient()

    const { data: existing } = await supabase.from("copa_groups").select("id").eq("name", name).single()

    if (existing) {
      return {
        success: false,
        error: `El grupo "${name}" ya existe`,
      }
    }

    const { data, error } = await supabase.from("copa_groups").insert([{ name }]).select().single()

    if (error) {
      console.error("[v0] Error creating group:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/")
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[v0] Unexpected error creating group:", error)
    return {
      success: false,
      error: "Error inesperado al crear el grupo",
    }
  }
}

export async function getGroups() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("copa_groups").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching groups:", error)
    return []
  }

  return data || []
}

export async function getGroupsByTournament(tournamentId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("copa_groups").select("*").eq("tournament_id", tournamentId).order("name")

  if (error) {
    console.error("[v0] Error fetching groups by tournament:", error)
    return []
  }

  return data || []
}

export async function isTeamInGroup(teamId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_groups")
    .select("*, copa_groups(name)")
    .eq("team_id", teamId)
    .single()

  if (error) {
    // Team is not in any group
    return null
  }

  return data
}

export async function assignTeamToGroup(teamId: number, groupId: number) {
  const supabase = await createClient()

  const existingAssignment = await isTeamInGroup(teamId)
  if (existingAssignment) {
    throw new Error(`El equipo ya está asignado a ${existingAssignment.copa_groups?.name}`)
  }

  const { error } = await supabase.from("team_groups").insert([
    {
      team_id: teamId,
      group_id: groupId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    },
  ])

  if (error) {
    console.error("[v0] Error assigning team to group:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function removeTeamFromGroup(teamId: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("team_groups").delete().eq("team_id", teamId)

  if (error) {
    console.error("[v0] Error removing team from group:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function getGroupStandings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_groups")
    .select(`
      *,
      teams(id, name),
      copa_groups(id, name)
    `)
    .order("points", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching group standings:", error)
    return []
  }

  return data || []
}

export async function getStandingsByTournament(tournamentId: number) {
  console.log("[v0] 🔍 Getting standings for tournament:", tournamentId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_groups")
    .select(`
      *,
      teams!inner(id, name, tournament_id),
      copa_groups(id, name)
    `)
    .eq("teams.tournament_id", tournamentId)
    .order("points", { ascending: false })

  if (error) {
    console.error("[v0] ❌ Error fetching standings for tournament:", error)
    return []
  }

  console.log("[v0] ✅ Fetched standings for tournament:", data?.length || 0, "records")
  return data || []
}

export async function getTeamsByGroup(groupId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_groups")
    .select(`
      *,
      teams(id, name, logo_url),
      copa_groups(id, name)
    `)
    .eq("group_id", groupId)
    .order("points", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching teams by group:", error)
    return []
  }

  return data || []
}

export async function deleteGroup(groupId: number) {
  const supabase = await createClient()

  // First, remove all teams from this group
  const { error: removeTeamsError } = await supabase.from("team_groups").delete().eq("group_id", groupId)

  if (removeTeamsError) {
    console.error("[v0] Error removing teams from group:", removeTeamsError)
    throw new Error("Error al eliminar equipos del grupo")
  }

  // Then delete the group
  const { error } = await supabase.from("copa_groups").delete().eq("id", groupId)

  if (error) {
    console.error("[v0] Error deleting group:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}
