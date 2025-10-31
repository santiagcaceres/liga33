"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function TopScorers() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-6 h-6" />
            Tabla de Goleadores - Copa Libertadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-primary" />
            <p className="text-lg">No hay goleadores registrados</p>
            <p className="text-sm">
              Los goleadores se actualizarán automáticamente cuando el administrador cargue los resultados de los
              partidos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
