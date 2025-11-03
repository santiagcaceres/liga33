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
          className="mb-6"
        >
          <motion.img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/libertadores-WVv740p2nm7LGAoIfoCoQtBYqFv0wg.png"
            alt="Copa Libertadores"
            className="w-64 h-64 md:w-80 md:h-80 mx-auto"
            animate={{
              filter: [
                "drop-shadow(0 0 30px rgba(184, 134, 11, 0.7))",
                "drop-shadow(0 0 50px rgba(218, 165, 32, 0.9))",
                "drop-shadow(0 0 30px rgba(184, 134, 11, 0.7))",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold mt-4 text-white"
        >
          Liga 33
        </motion.p>
      </div>
    </div>
  )
}
