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
    console.log("[v0] Processing logo file upload...")
    console.log("[v0] File details:", {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
      lastModified: logoFile.lastModified,
    })

    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("[v0] ❌ Error listing buckets:", bucketsError)
      } else {
        console.log(
          "[v0] Available buckets:",
          buckets?.map((b) => b.name),
        )
        const bucketExists = buckets?.some((b) => b.name === "team-logos")

        if (!bucketExists) {
          console.log("[v0] ⚠️ Bucket 'team-logos' does not exist. Creating it...")
          const { data: newBucket, error: createError } = await supabase.storage.createBucket("team-logos", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          })

          if (createError) {
            console.error("[v0] ❌ Error creating bucket:", createError)
          } else {
            console.log("[v0] ✅ Bucket 'team-logos' created successfully")
          }
        } else {
          console.log("[v0] ✅ Bucket 'team-logos' already exists")
        }
      }

      const fileExt = logoFile.name.split(".").pop()
      const fileName = `team-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      console.log("[v0] Uploading to path:", filePath)
      console.log("[v0] File extension:", fileExt)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, logoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: logoFile.type,
        })

      if (uploadError) {
        console.error("[v0] ❌ Error uploading logo:", uploadError)
        console.error("[v0] Upload error details:", {
          message: uploadError.message,
          name: uploadError.name,
          cause: uploadError.cause,
        })
      } else {
        console.log("[v0] ✅ Logo uploaded successfully:", uploadData)

        const { data: urlData } = supabase.storage.from("team-logos").getPublicUrl(filePath)

        logo_url = urlData.publicUrl
        console.log("[v0] ✅ Public URL generated:", logo_url)
      }
    } catch (uploadError) {
      console.error("[v0] ❌ Exception during logo upload:", uploadError)
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
    logo_url,
    tournament_id,
    logoFile: logoFile ? `File: ${logoFile.name}, Size: ${logoFile.size}, Type: ${logoFile.type}` : "null",
  })

  if (logoFile && logoFile.size > 0) {
    console.log("[v0] Processing logo file upload for update...")
    console.log("[v0] File details:", {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
      lastModified: logoFile.lastModified,
    })

    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("[v0] ❌ Error listing buckets:", bucketsError)
      } else {
        console.log(
          "[v0] Available buckets:",
          buckets?.map((b) => b.name),
        )
        const bucketExists = buckets?.some((b) => b.name === "team-logos")

        if (!bucketExists) {
          console.log("[v0] ⚠️ Bucket 'team-logos' does not exist. Creating it...")
          const { data: newBucket, error: createError } = await supabase.storage.createBucket("team-logos", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          })

          if (createError) {
            console.error("[v0] ❌ Error creating bucket:", createError)
          } else {
            console.log("[v0] ✅ Bucket 'team-logos' created successfully")
          }
        } else {
          console.log("[v0] ✅ Bucket 'team-logos' already exists")
        }
      }

      const fileExt = logoFile.name.split(".").pop()
      const fileName = `team-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      console.log("[v0] Uploading to path:", filePath)
      console.log("[v0] File extension:", fileExt)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, logoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: logoFile.type,
        })

      if (uploadError) {
        console.error("[v0] ❌ Error uploading logo:", uploadError)
      } else {
        console.log("[v0] ✅ Logo uploaded successfully:", uploadData)

        const { data: urlData } = supabase.storage.from("team-logos").getPublicUrl(filePath)

        logo_url = urlData.publicUrl
        console.log("[v0] ✅ Public URL generated:", logo_url)
      }
    } catch (uploadError) {
      console.error("[v0] ❌ Exception during logo upload:", uploadError)
    }
  } else {
    console.log("[v0] ⚠️ No new logo file provided, keeping existing logo_url:", logo_url)
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

  console.log("[v0] Updating with data:", updateData)

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
