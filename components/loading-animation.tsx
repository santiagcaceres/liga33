"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

export default function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-4"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            Copa
          </motion.h1>
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.2,
            }}
          >
            Libertadores
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-white/60 mt-8 text-lg"
        >
          Liga 33
        </motion.p>
      </div>
    </div>
  )
}
