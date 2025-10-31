"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNews(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const image_url = formData.get("image_url") as string
  const published_date = formData.get("published_date") as string

  const { data, error } = await supabase
    .from("news")
    .insert([{ title, content, image_url, published_date }])
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating news:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
  return data
}

export async function getNews(limit?: number) {
  const supabase = await createClient()

  let query = supabase.from("news").select("*").order("published_date", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching news:", error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    image_url: item.image_url,
    published_date: item.published_date,
  }))
}

export async function updateNews(id: number, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const image_url = formData.get("image_url") as string
  const published_date = formData.get("published_date") as string

  const { error } = await supabase.from("news").update({ title, content, image_url, published_date }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating news:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function deleteNews(id: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("news").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting news:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
}
