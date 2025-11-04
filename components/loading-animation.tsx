"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

export default function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/libertadores-WVv740p2nm7LGAoIfoCoQtBYqFv0wg.png"
            alt="Copa Libertadores"
            className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8"
            animate={{
              filter: [
                "drop-shadow(0 0 20px rgba(184, 134, 11, 0.8))",
                "drop-shadow(0 0 40px rgba(218, 165, 32, 0.9))",
                "drop-shadow(0 0 20px rgba(184, 134, 11, 0.8))",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-white text-2xl md:text-3xl font-semibold"
          >
            Liga 33
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
