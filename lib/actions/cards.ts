"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addCard(formData: FormData) {
  const supabase = await createClient()

  const match_id = Number.parseInt(formData.get("match_id") as string)
  const team_id = Number.parseInt(formData.get("team_id") as string)
  const player_id = Number.parseInt(formData.get("player_id") as string)
  const card_type = formData.get("card_type") as string
  const minute = Number.parseInt(formData.get("minute") as string) || 0

  console.log("[v0] Adding card:", { match_id, team_id, player_id, card_type, minute })

  const { data, error } = await supabase
    .from("cards")
    .insert({
      match_id,
      team_id,
      player_id,
      card_type,
      minute,
    })
    .select()

  if (error) {
    console.error("[v0] Error adding card:", error)
    throw new Error(error.message || "Failed to add card")
  }

  console.log("[v0] Card added successfully:", data)

  // Update player cards count
  const { data: player } = await supabase.from("players").select("yellow_cards, red_cards").eq("id", player_id).single()

  if (player) {
    if (card_type === "yellow") {
      await supabase
        .from("players")
        .update({ yellow_cards: (player.yellow_cards || 0) + 1 })
        .eq("id", player_id)
    } else if (card_type === "red") {
      await supabase
        .from("players")
        .update({ red_cards: (player.red_cards || 0) + 1 })
        .eq("id", player_id)
    }
  }

  revalidatePath("/admin/libertadores")
  revalidatePath("/admin/femenina")
  revalidatePath("/libertadores")
  revalidatePath("/femenina")
  revalidatePath("/")

  return data
}

export async function deleteCard(cardId: number) {
  const supabase = await createClient()

  // Get card info before deleting
  const { data: card } = await supabase.from("cards").select("player_id, card_type").eq("id", cardId).single()

  const { error } = await supabase.from("cards").delete().eq("id", cardId)

  if (error) {
    console.error("Error deleting card:", error)
    throw new Error("Failed to delete card")
  }

  // Update player cards count
  if (card) {
    const { data: player } = await supabase
      .from("players")
      .select("yellow_cards, red_cards")
      .eq("id", card.player_id)
      .single()

    if (player) {
      if (card.card_type === "yellow" && player.yellow_cards > 0) {
        await supabase
          .from("players")
          .update({ yellow_cards: player.yellow_cards - 1 })
          .eq("id", card.player_id)
      } else if (card.card_type === "red" && player.red_cards > 0) {
        await supabase
          .from("players")
          .update({ red_cards: player.red_cards - 1 })
          .eq("id", card.player_id)
      }
    }
  }

  revalidatePath("/admin/libertadores")
  revalidatePath("/admin/femenina")
  revalidatePath("/libertadores")
  revalidatePath("/femenina")
  revalidatePath("/")
}

export async function getMatchCards(matchId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cards")
    .select(`
      id,
      minute,
      card_type,
      team_id,
      player_id,
      players(name)
    `)
    .eq("match_id", matchId)
    .order("minute", { ascending: true })

  if (error) {
    console.error("Error fetching cards:", error)
    return []
  }

  return data || []
}
