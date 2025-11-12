"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Newspaper } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function NewsSection({ tournamentColor = "primary" }: { tournamentColor?: string }) {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false }).limit(4)

      if (error) {
        console.error("[v0] Error loading news:", error)
        setLoading(false)
        return
      }

      setNews(data || [])
    } catch (error) {
      console.error("[v0] Error in loadNews:", error)
    } finally {
      setLoading(false)
    }
  }

  const colorClass =
    tournamentColor === "pink" ? "text-pink-500" : tournamentColor === "yellow" ? "text-yellow-500" : "text-primary"
  const borderClass =
    tournamentColor === "pink"
      ? "border-pink-500/30"
      : tournamentColor === "yellow"
        ? "border-yellow-500/30"
        : "border-primary/30"
  const buttonClass =
    tournamentColor === "pink"
      ? "border-pink-500/30 text-pink-500 hover:bg-pink-500/10"
      : tournamentColor === "yellow"
        ? "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
        : "border-primary/30 text-primary hover:bg-primary/10"

  if (loading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${colorClass} mb-2`}>Últimas Noticias</h2>
          <p className="text-muted-foreground">Mantente al día con las novedades de Liga 33</p>
        </div>

        <Card className={borderClass}>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Newspaper className={`w-16 h-16 mx-auto mb-4 opacity-50 ${colorClass} animate-pulse`} />
            <p className="text-lg">Cargando noticias...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${colorClass} mb-2`}>Últimas Noticias</h2>
          <p className="text-muted-foreground">Mantente al día con las novedades de Liga 33</p>
        </div>

        <Card className={borderClass}>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Newspaper className={`w-16 h-16 mx-auto mb-4 opacity-50 ${colorClass}`} />
            <p className="text-lg">No hay noticias publicadas</p>
            <p className="text-sm">El administrador debe agregar noticias desde el panel de administración</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSingleNews = news.length === 1

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold ${colorClass} mb-2`}>Últimas Noticias</h2>
        <p className="text-muted-foreground">Mantente al día con las novedades de Liga 33</p>
      </div>

      <div className={`grid grid-cols-1 ${isSingleNews ? "" : "md:grid-cols-2"} gap-6`}>
        {news.map((article) => (
          <Card key={article.id} className={`${borderClass} overflow-hidden hover:shadow-lg transition-shadow`}>
            <div className={`${isSingleNews ? "aspect-[21/9]" : "aspect-video"} relative overflow-hidden`}>
              <img
                src={article.image_url || "/placeholder.svg?height=400&width=600"}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <Badge
                className={`absolute top-3 left-3 ${tournamentColor === "pink" ? "bg-pink-500" : tournamentColor === "yellow" ? "bg-yellow-500 text-black" : "bg-primary"}`}
              >
                Noticia
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className={`${isSingleNews ? "text-2xl" : "text-lg"} line-clamp-2`}>{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-muted-foreground mb-4 ${isSingleNews ? "line-clamp-4" : "line-clamp-3"}`}>
                {article.content}
              </p>
              <Button variant="outline" className={`w-full ${buttonClass} bg-transparent`}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Leer Más
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
