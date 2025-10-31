"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTeam(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const coach = formData.get("coach") as string

  const { data, error } = await supabase.from("teams").insert([{ name, coach }]).select().single()

  if (error) {
    console.error("[v0] Error creating team:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
  return data
}

export async function getTeams() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("teams").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching teams:", error)
    return []
  }

  return data || []
}

export async function updateTeam(id: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const coach = formData.get("coach") as string

  const { error } = await supabase.from("teams").update({ name, coach }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating team:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function deleteTeam(id: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("teams").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting team:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}
