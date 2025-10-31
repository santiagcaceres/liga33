"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPlayer(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const cedula = formData.get("cedula") as string
  const number = Number.parseInt(formData.get("number") as string)
  const age = Number.parseInt(formData.get("age") as string)
  const team_id = Number.parseInt(formData.get("team_id") as string)

  console.log("[v0] Creating player with data:", {
    name,
    cedula,
    number,
    age,
    team_id,
    team_id_type: typeof team_id,
    team_id_isNaN: Number.isNaN(team_id),
  })

  if (Number.isNaN(team_id) || team_id <= 0) {
    console.error("[v0] Invalid team_id:", team_id)
    throw new Error("ID de equipo inválido. Por favor selecciona un equipo válido.")
  }

  const { data: teamExists, error: teamError } = await supabase.from("teams").select("id").eq("id", team_id).single()

  if (teamError || !teamExists) {
    console.error("[v0] Team not found:", team_id, teamError)
    throw new Error(`El equipo con ID ${team_id} no existe. Por favor recarga la página e intenta nuevamente.`)
  }

  console.log("[v0] Team exists, proceeding with player creation")

  const { data, error } = await supabase
    .from("players")
    .insert([
      {
        name,
        cedula,
        number,
        age,
        team_id,
        goals: 0,
        yellow_cards: 0,
        red_cards: 0,
        suspended: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating player:", error)
    throw new Error(error.message)
  }

  console.log("[v0] Player created successfully:", data)

  revalidatePath("/")
  return data
}

export async function getPlayers(teamId?: number) {
  const supabase = await createClient()

  let query = supabase.from("players").select("*, teams(name)").order("name")

  if (teamId) {
    query = query.eq("team_id", teamId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching players:", error)
    return []
  }

  return data || []
}

export async function updatePlayer(id: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const cedula = formData.get("cedula") as string
  const number = Number.parseInt(formData.get("number") as string)
  const age = Number.parseInt(formData.get("age") as string)
  const team_id = Number.parseInt(formData.get("team_id") as string)

  const { error } = await supabase.from("players").update({ name, cedula, number, age, team_id }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating player:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function deletePlayer(id: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("players").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting player:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function clearYellowCards(playerId: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("players").update({ yellow_cards: 0, suspended: false }).eq("id", playerId)

  if (error) {
    console.error("[v0] Error clearing yellow cards:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}
