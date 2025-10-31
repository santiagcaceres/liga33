"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPlayer(formData: FormData) {
  try {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const cedula = formData.get("cedula") as string
    const numberStr = formData.get("number") as string
    const teamIdStr = formData.get("team_id") as string

    console.log("[v0] Raw form data:", { name, cedula, numberStr, teamIdStr })

    const number = Number.parseInt(numberStr, 10)
    const team_id = Number.parseInt(teamIdStr, 10)

    console.log("[v0] Converted data:", { name, cedula, number, team_id })

    if (!name || !name.trim()) {
      console.error("[v0] Invalid name")
      return { success: false, error: "Nombre inválido" }
    }

    if (!cedula || !cedula.trim()) {
      console.error("[v0] Invalid cedula")
      return { success: false, error: "Cédula inválida" }
    }

    if (isNaN(number) || number <= 0) {
      console.error("[v0] Invalid number:", numberStr)
      return { success: false, error: "Número de camiseta inválido" }
    }

    if (isNaN(team_id) || team_id <= 0) {
      console.error("[v0] Invalid team_id:", teamIdStr)
      return { success: false, error: "ID de equipo inválido" }
    }

    console.log("[v0] Checking if team exists:", team_id)
    const { data: teamExists, error: teamError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", team_id)
      .single()

    if (teamError || !teamExists) {
      console.error("[v0] Team not found:", team_id, teamError)
      return { success: false, error: `El equipo con ID ${team_id} no existe` }
    }

    console.log("[v0] Team found:", teamExists)

    const playerData = {
      name: name.trim(),
      cedula: cedula.trim(),
      number: number,
      team_id: team_id,
      goals: 0,
      yellow_cards: 0,
      red_cards: 0,
      suspended: false,
    }

    console.log("[v0] Inserting player with data:", playerData)

    const { data, error } = await supabase.from("players").insert(playerData).select().single()

    if (error) {
      console.error("[v0] Database error creating player:", error)
      return { success: false, error: `Error de base de datos: ${error.message}` }
    }

    console.log("[v0] Player created successfully:", data)
    revalidatePath("/")

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Unexpected error in createPlayer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al crear jugador",
    }
  }
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
  const numberStr = formData.get("number") as string
  const teamIdStr = formData.get("team_id") as string

  const number = Number.parseInt(numberStr, 10)
  const team_id = Number.parseInt(teamIdStr, 10)

  const { error } = await supabase.from("players").update({ name, cedula, number, team_id }).eq("id", id)

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
