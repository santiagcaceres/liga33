"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createGroup(name: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("copa_groups").insert([{ name }]).select().single()

  if (error) {
    console.error("[v0] Error creating group:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
  return data
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

export async function assignTeamToGroup(teamId: number, groupId: number) {
  const supabase = await createClient()

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
