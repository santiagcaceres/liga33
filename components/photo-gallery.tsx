"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Image, Calendar, Users, Trophy, MapPin, X, Download, Share2, Heart, Eye } from "lucide-react"

interface Photo {
  id: number
  src: string
  title: string
  description: string
  category: "partidos" | "complejo" | "equipos" | "eventos"
  date: string
  photographer?: string
  likes: number
  views: number
  tags: string[]
}

const photosData: Photo[] = [
  {
    id: 1,
    src: "/placeholder.svg?height=400&width=600",
    title: "Gol de Carlos Rodríguez",
    description: "Momento exacto del gol que le dio la victoria a Deportivo Central",
    category: "partidos",
    date: "2025-01-11",
    photographer: "Juan Martínez",
    likes: 45,
    views: 234,
    tags: ["gol", "deportivo-central", "fecha-8"],
  },
  {
    id: 2,
    src: "/placeholder.svg?height=400&width=600",
    title: "Vista Aérea del Complejo",
    description: "Panorámica completa de nuestras instalaciones deportivas",
    category: "complejo",
    date: "2025-01-10",
    photographer: "Liga 33 Staff",
    likes: 67,
    views: 456,
    tags: ["complejo", "cancha", "instalaciones"],
  },
  {
    id: 3,
    src: "/placeholder.svg?height=400&width=600",
    title: "Celebración Racing FC",
    description: "Los jugadores de Racing celebran la victoria ante Unidos",
    category: "equipos",
    date: "2025-01-11",
    photographer: "María González",
    likes: 38,
    views: 189,
    tags: ["racing-fc", "celebracion", "victoria"],
  },
  {
    id: 4,
    src: "/placeholder.svg?height=400&width=600",
    title: "Cancha Principal de Noche",
    description: "Iluminación nocturna de la cancha principal durante un partido",
    category: "complejo",
    date: "2025-01-09",
    photographer: "Carlos Ruiz",
    likes: 52,
    views: 312,
    tags: ["cancha", "noche", "iluminacion"],
  },
  {
    id: 5,
    src: "/placeholder.svg?height=400&width=600",
    title: "Entrega de Trofeos Fecha 7",
    description: "Ceremonia de premiación al mejor jugador de la fecha",
    category: "eventos",
    date: "2025-01-07",
    photographer: "Ana López",
    likes: 73,
    views: 521,
    tags: ["trofeo", "premiacion", "mejor-jugador"],
  },
  {
    id: 6,
    src: "/placeholder.svg?height=400&width=600",
    title: "Atajada Espectacular",
    description: "El arquero de Independiente Sur realiza una atajada increíble",
    category: "partidos",
    date: "2025-01-12",
    photographer: "Diego Fernández",
    likes: 41,
    views: 278,
    tags: ["atajada", "arquero", "independiente-sur"],
  },
  {
    id: 7,
    src: "/placeholder.svg?height=400&width=600",
    title: "Vestuarios Renovados",
    description: "Nuevas instalaciones de vestuarios para los equipos",
    category: "complejo",
    date: "2025-01-05",
    photographer: "Liga 33 Staff",
    likes: 29,
    views: 167,
    tags: ["vestuarios", "instalaciones", "renovacion"],
  },
  {
    id: 8,
    src: "/placeholder.svg?height=400&width=600",
    title: "Plantel Boca Juniors Local",
    description: "Foto oficial del plantel de Boca Juniors Local temporada 2025",
    category: "equipos",
    date: "2025-01-03",
    photographer: "Estudio Fotográfico Liga 33",
    likes: 56,
    views: 389,
    tags: ["boca-local", "plantel", "foto-oficial"],
  },
  {
    id: 9,
    src: "/placeholder.svg?height=400&width=600",
    title: "Hinchada en las Tribunas",
    description: "Los fanáticos alientan a sus equipos desde las tribunas",
    category: "eventos",
    date: "2025-01-11",
    photographer: "Roberto Silva",
    likes: 64,
    views: 445,
    tags: ["hinchada", "tribunas", "ambiente"],
  },
]

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [likedPhotos, setLikedPhotos] = useState<number[]>([])

  const filteredPhotos = photosData.filter((photo) => {
    const matchesCategory = selectedCategory === "todos" || photo.category === selectedCategory
    const matchesSearch =
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const toggleLike = (photoId: number) => {
    setLikedPhotos((prev) => (prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]))
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "partidos":
        return "Partidos"
      case "complejo":
        return "Complejo"
      case "equipos":
        return "Equipos"
      case "eventos":
        return "Eventos"
      default:
        return "Todos"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "partidos":
        return "bg-blue-500"
      case "complejo":
        return "bg-green-500"
      case "equipos":
        return "bg-purple-500"
      case "eventos":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            Galería Fotográfica - Liga 33
          </CardTitle>
          <p className="text-gray-600">Revive los mejores momentos de la temporada 2025</p>
        </CardHeader>
        <CardContent>
          {/* Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar fotos por título, descripción o etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="partidos">Partidos</TabsTrigger>
                <TabsTrigger value="complejo">Complejo</TabsTrigger>
                <TabsTrigger value="equipos">Equipos</TabsTrigger>
                <TabsTrigger value="eventos">Eventos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Estadísticas de la Galería */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <Image className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">{photosData.length}</div>
                  <div className="text-xs text-gray-600">Fotos Totales</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-purple-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">
                    {photosData.filter((p) => p.category === "partidos").length}
                  </div>
                  <div className="text-xs text-gray-600">Partidos</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-600">
                    {photosData.filter((p) => p.category === "equipos").length}
                  </div>
                  <div className="text-xs text-gray-600">Equipos</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-pink-600">
                    {photosData.filter((p) => p.category === "complejo").length}
                  </div>
                  <div className="text-xs text-gray-600">Complejo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Fotos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative group">
                  <img
                    src={photo.src || "/placeholder.svg"}
                    alt={photo.title}
                    className="w-full h-48 object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getCategoryColor(photo.category)} text-white`}>
                      {getCategoryName(photo.category)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(photo.id)
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedPhotos.includes(photo.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                      />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-semibold text-sm mb-1">{photo.title}</h3>
                    <div className="flex items-center gap-4 text-white/80 text-xs">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {photo.likes + (likedPhotos.includes(photo.id) ? 1 : 0)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {photo.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(photo.date)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron fotos</h3>
              <p className="text-gray-500">Intenta cambiar los filtros o el término de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Foto Ampliada */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedPhoto.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedPhoto.src || "/placeholder.svg"}
                    alt={selectedPhoto.title}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getCategoryColor(selectedPhoto.category)} text-white`}>
                      {getCategoryName(selectedPhoto.category)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedPhoto.title}</h3>
                      <p className="text-gray-600">{selectedPhoto.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <div className="font-semibold">
                          {selectedPhoto.likes + (likedPhotos.includes(selectedPhoto.id) ? 1 : 0)}
                        </div>
                        <div className="text-xs text-gray-500">Me gusta</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <div className="font-semibold">{selectedPhoto.views}</div>
                        <div className="text-xs text-gray-500">Visualizaciones</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Fecha: {formatDate(selectedPhoto.date)}</span>
                      </div>
                      {selectedPhoto.photographer && (
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span>Fotógrafo: {selectedPhoto.photographer}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLike(selectedPhoto.id)}
                        className="flex-1"
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${likedPhotos.includes(selectedPhoto.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {likedPhotos.includes(selectedPhoto.id) ? "Te gusta" : "Me gusta"}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
