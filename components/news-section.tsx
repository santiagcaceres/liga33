"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Eye, Newspaper } from "lucide-react"

export default function NewsSection() {
  const news: any[] = []

  if (news.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Últimas Noticias</h2>
          <p className="text-muted-foreground">Mantente al día con las novedades de Liga 33</p>
        </div>

        <Card className="border-primary/30">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay noticias publicadas</p>
            <p className="text-sm">El administrador debe agregar noticias desde el panel de administración</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Últimas Noticias</h2>
        <p className="text-muted-foreground">Mantente al día con las novedades de Liga 33</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article) => (
          <Card key={article.id} className="border-primary/30 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 left-3 bg-primary">{article.category}</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>
              <Button
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
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
