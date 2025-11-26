"use client"

import { useEffect, useState } from "react"
import { X, CloudRain } from "lucide-react"
import { motion } from "framer-motion"

interface RainAlertProps {
  message?: string
  onClose: () => void
}

export function RainAlert({ message = "Fecha suspendida por lluvia", onClose }: RainAlertProps) {
  const [drops, setDrops] = useState<{ id: number; left: number; delay: number; duration: number }[]>([])

  useEffect(() => {
    // Generar gotas de lluvia aleatorias
    const raindrops = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1,
    }))
    setDrops(raindrops)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Efecto de gotas de lluvia */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute w-0.5 bg-gradient-to-b from-blue-300/80 to-transparent"
            style={{
              left: `${drop.left}%`,
              height: "30px",
            }}
            animate={{
              y: ["0vh", "100vh"],
            }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Pop-up del mensaje */}
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="relative bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-2 border-blue-400 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudRain className="w-20 h-20 text-blue-300" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white">¡Suspendido!</h2>

          <p className="text-xl text-blue-100">{message}</p>

          <p className="text-sm text-blue-200/70">
            Los partidos de esta fecha han sido reprogramados debido a las condiciones climáticas.
          </p>

          <button
            onClick={onClose}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
