"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTournaments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching tournaments:", error)
    return []
  }

  return data || []
}

export async function getActiveTournament(type?: string) {
  const supabase = await createClient()

  let query = supabase.from("tournaments").select("*").eq("active", true)

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await supabase.from("tournaments").select("*").eq("active", true).limit(1).single()

  if (error) {
    console.error("[v0] Error fetching active tournament:", error)
    return null
  }

  return data
}
