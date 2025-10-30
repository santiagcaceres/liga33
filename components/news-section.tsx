"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Eye } from "lucide-react"

export default function NewsSection() {
  const news = [
    {
      id: 1,
      title: "Entrevista Exclusiva: Estrella de Liga 33",
      description:
        "Conversamos con uno de los jugadores más destacados de la temporada sobre sus expectativas y objetivos.",
      image: "/entrevista1.jpg",
      date: "15 Enero 2025",
      category: "Entrevistas",
      views: 245,
    },
    {
      id: 2,
      title: "Nuevo Talento Brilla en Liga 33",
      description: "El joven jugador que está dando que hablar con sus actuaciones y su proyección para el futuro.",
      image: "/entrevista2.jpg",
      date: "12 Enero 2025",
      category: "Entrevistas",
      views: 189,
    },
  ]

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-purple-600 bg-clip-text text-transparent mb-2">
          Últimas Noticias
        </h2>
        <p className="text-gray-600">Mantente al día con las novedades de Liga 33</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article) => (
          <Card key={article.id} className="border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600">
                {article.category}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views} vistas
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
              <Button
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
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
