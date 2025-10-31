"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Newspaper, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { getNews } from "@/lib/actions/news"

interface News {
  id: number
  title: string
  content: string
  image_url: string
  published_date: string
}

interface HomeSectionProps {
  onNavigate?: (section: string) => void
}

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  const [news, setNews] = useState<News[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    setIsLoadingNews(true)
    try {
      const data = await getNews(4) // Load maximum 4 news
      setNews(data)
    } catch (error) {
      console.error("[v0] Error loading news:", error)
    } finally {
      setIsLoadingNews(false)
    }
  }

  return (
    <div className="space-y-8">
      <button onClick={() => onNavigate?.("copa")} className="w-full group cursor-pointer">
        <Card className="border-primary/30 bg-gradient-to-r from-black via-primary/20 to-black text-white overflow-hidden relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 animate-gradient-x"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <CardContent className="p-8 md:p-12 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-primary group-hover:scale-105 transition-transform">
              Bienvenido a Liga 33
            </h1>
            <p className="text-xl md:text-2xl mb-2 font-semibold text-white">Copa Libertadores</p>
            <p className="text-base md:text-lg mb-6 text-gray-300">
              La liga de fútbol más competitiva de la región. Seguí toda la acción.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-primary/20 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-gray-300">Equipos</div>
              </div>
              <div className="bg-primary/20 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-gray-300">Grupos</div>
              </div>
              <div className="bg-primary/20 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                <div className="text-2xl font-bold text-primary">8</div>
                <div className="text-sm text-gray-300">Clasificados</div>
              </div>
            </div>
            <p className="text-sm text-primary mt-4 group-hover:underline">Click para ver la Copa Libertadores →</p>
          </CardContent>
        </Card>
      </button>

      {/* News Section */}
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Newspaper className="w-6 h-6" />
            Últimas Noticias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingNews ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary animate-pulse" />
              <p className="text-lg">Cargando noticias...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
              <p className="text-lg">No hay noticias disponibles</p>
              <p className="text-sm">El administrador puede agregar noticias desde el panel de administración</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item) => (
                <Card
                  key={item.id}
                  className="border-primary/30 bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all hover:border-primary/50"
                >
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-black to-primary/20">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {item.published_date}
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Sobre la Copa Libertadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">
            La Copa Libertadores de Liga 33 es una edición especial que reúne a los mejores equipos de la región en una
            competencia emocionante. Con 3 grupos de 4 equipos cada uno, los 2 primeros de cada grupo más los 2 mejores
            terceros clasificarán a la siguiente fase. Seguí todos los partidos, estadísticas y noticias en nuestra
            plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
