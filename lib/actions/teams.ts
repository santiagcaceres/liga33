"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTeam(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const logo_url = formData.get("logo_url") as string
  const tournament_id = formData.get("tournament_id") as string

  console.log("[v0] ============ CREATE TEAM START ============")
  console.log("[v0] FormData received:", { name, logo_url, tournament_id })
  console.log("[v0] tournament_id type:", typeof tournament_id)
  console.log("[v0] tournament_id parsed:", Number.parseInt(tournament_id))

  if (!name || !name.trim()) {
    console.error("[v0] ❌ Name is empty")
    throw new Error("El nombre del equipo es requerido")
  }

  if (!tournament_id) {
    console.error("[v0] ❌ tournament_id is missing")
    throw new Error("El ID del torneo es requerido")
  }

  const parsedTournamentId = Number.parseInt(tournament_id)
  if (isNaN(parsedTournamentId)) {
    console.error("[v0] ❌ tournament_id is not a valid number:", tournament_id)
    throw new Error("El ID del torneo no es válido")
  }

  const insertData = {
    name: name.trim(),
    logo_url: logo_url || null,
    tournament_id: parsedTournamentId,
  }

  console.log("[v0] Inserting team with data:", insertData)

  const { data, error } = await supabase.from("teams").insert([insertData]).select().single()

  if (error) {
    console.error("[v0] ❌ Database error creating team:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message)
  }

  console.log("[v0] ✅ Team created successfully:", data)
  console.log("[v0] ============ CREATE TEAM END ============")

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
  const logo_url = formData.get("logo_url") as string
  const tournament_id = formData.get("tournament_id") as string

  const updateData: { name: string; logo_url: string; tournament_id?: number } = {
    name,
    logo_url,
  }

  if (tournament_id) {
    updateData.tournament_id = Number.parseInt(tournament_id)
  }

  const { error } = await supabase.from("teams").update(updateData).eq("id", id)

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
