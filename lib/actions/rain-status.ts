"use server"

import { createClient } from "@/lib/supabase/client"

export async function getRainStatus() {
  const supabase = createClient()

  const { data, error } = await supabase.from("rain_status").select("active").eq("id", 1).single()

  if (error) {
    console.error("[v0] Error getting rain status:", error)
    return { success: false, active: false }
  }

  return { success: true, active: data?.active || false }
}

export async function toggleRainStatus() {
  const supabase = createClient()

  // Get current status
  const { data: current } = await supabase.from("rain_status").select("active").eq("id", 1).single()

  const newStatus = !current?.active

  // Update status
  const { error } = await supabase
    .from("rain_status")
    .update({ active: newStatus, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (error) {
    console.error("[v0] Error toggling rain status:", error)
    return { success: false, active: false }
  }

  return { success: true, active: newStatus }
}
