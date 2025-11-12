"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTeam(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  let logo_url = formData.get("logo_url") as string
  const tournament_id = formData.get("tournament_id") as string
  const logoFile = formData.get("logo") as File | null

  console.log("[v0] ============ CREATE TEAM START ============")
  console.log("[v0] FormData received:", {
    name,
    logo_url,
    tournament_id,
    logoFile: logoFile ? `File: ${logoFile.name}, Size: ${logoFile.size}, Type: ${logoFile.type}` : "null",
  })
  console.log("[v0] tournament_id type:", typeof tournament_id)
  console.log("[v0] tournament_id parsed:", Number.parseInt(tournament_id))

  if (logoFile && logoFile.size > 0) {
    console.log("[v0] Processing logo file as Base64...")
    console.log("[v0] File details:", {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
      lastModified: logoFile.lastModified,
    })

    try {
      // Convertir archivo a Base64
      const arrayBuffer = await logoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")
      const mimeType = logoFile.type || "image/png"

      logo_url = `data:${mimeType};base64,${base64}`

      console.log("[v0] ✅ Logo converted to Base64")
      console.log("[v0] Base64 string length:", logo_url.length)
      console.log("[v0] MIME type:", mimeType)
      console.log("[v0] Base64 preview (first 100 chars):", logo_url.substring(0, 100))
    } catch (error) {
      console.error("[v0] ❌ Error converting logo to Base64:", error)
      throw new Error("Error al procesar la imagen del logo")
    }
  } else {
    console.log("[v0] ⚠️ No logo file provided or file is empty")
  }

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

  console.log("[v0] Inserting team with data:", {
    name: insertData.name,
    logo_url: insertData.logo_url
      ? `${insertData.logo_url.substring(0, 50)}... (${insertData.logo_url.length} chars)`
      : null,
    tournament_id: insertData.tournament_id,
  })

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

  console.log("[v0] ✅ Team created successfully:", {
    id: data.id,
    name: data.name,
    tournament_id: data.tournament_id,
    logo_url_length: data.logo_url?.length || 0,
  })
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

export async function getTeamsByTournament(tournament_id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("teams").select("*").eq("tournament_id", tournament_id).order("name")

  if (error) {
    console.error("[v0] Error fetching teams by tournament:", error)
    return []
  }

  return data || []
}

export async function updateTeam(id: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  let logo_url = formData.get("logo_url") as string
  const tournament_id = formData.get("tournament_id") as string
  const logoFile = formData.get("logo") as File | null

  console.log("[v0] ============ UPDATE TEAM START ============")
  console.log("[v0] Updating team ID:", id)
  console.log("[v0] FormData received:", {
    name,
    logo_url: logo_url ? `${logo_url.substring(0, 50)}... (${logo_url.length} chars)` : null,
    tournament_id,
    logoFile: logoFile ? `File: ${logoFile.name}, Size: ${logoFile.size}, Type: ${logoFile.type}` : "null",
  })

  if (logoFile && logoFile.size > 0) {
    console.log("[v0] Processing logo file as Base64 for update...")
    console.log("[v0] File details:", {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
      lastModified: logoFile.lastModified,
    })

    try {
      // Convertir archivo a Base64
      const arrayBuffer = await logoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")
      const mimeType = logoFile.type || "image/png"

      logo_url = `data:${mimeType};base64,${base64}`

      console.log("[v0] ✅ Logo converted to Base64")
      console.log("[v0] Base64 string length:", logo_url.length)
      console.log("[v0] MIME type:", mimeType)
      console.log("[v0] Base64 preview (first 100 chars):", logo_url.substring(0, 100))
    } catch (error) {
      console.error("[v0] ❌ Error converting logo to Base64:", error)
      throw new Error("Error al procesar la imagen del logo")
    }
  } else {
    console.log("[v0] ⚠️ No new logo file provided, keeping existing logo_url")
  }

  const updateData: any = {
    name,
  }

  if (logo_url) {
    updateData.logo_url = logo_url
  }

  if (tournament_id) {
    updateData.tournament_id = Number.parseInt(tournament_id)
  }

  console.log("[v0] Updating with data:", {
    name: updateData.name,
    logo_url: updateData.logo_url
      ? `${updateData.logo_url.substring(0, 50)}... (${updateData.logo_url.length} chars)`
      : null,
    tournament_id: updateData.tournament_id,
  })

  const { error } = await supabase.from("teams").update(updateData).eq("id", id)

  if (error) {
    console.error("[v0] ❌ Error updating team:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message)
  }

  console.log("[v0] ✅ Team updated successfully")
  console.log("[v0] ============ UPDATE TEAM END ============")

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
