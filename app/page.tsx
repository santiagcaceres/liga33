"use client"
import { Trophy, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-12 md:mb-16">
          <img
            src="/logo-liga33.png"
            alt="Liga 33"
            className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">Liga 33</h1>
          <p className="text-xl md:text-2xl text-gray-300 font-semibold">
            MUCHO MAS QUE FUTBOL, MAS FUTBOL Y DEL BUENO
          </p>
        </div>

        {/* Tournament Selection */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Copa Libertadores Card */}
          <button
            onClick={() => router.push("/libertadores")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
          >
            <div className="p-8 md:p-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Trophy className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Copa Libertadores</h2>
              <p className="text-gray-300 text-sm md:text-base mb-6">Torneo de grupos con fase eliminatoria</p>
              <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Ingresar</span>
                <span className="text-xl">→</span>
              </div>
            </div>
          </button>

          {/* Liga Femenina Card */}
          <button
            onClick={() => router.push("/femenina")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/5 border-2 border-pink-500/30 hover:border-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
          >
            <div className="p-8 md:p-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-pink-500" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">SuperLiga Femenina</h2>
              <p className="text-gray-300 text-sm md:text-base mb-6">Liga de todos contra todos</p>
              <div className="inline-flex items-center gap-2 text-pink-500 font-semibold group-hover:gap-3 transition-all">
                <span>Ingresar</span>
                <span className="text-xl">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 md:mt-16 text-center text-gray-400 text-sm md:text-base">
          <div className="space-y-2">
            <div>📍 Complejo Deportivo HF</div>
            <div>📞 +598 94 107 059</div>
            <div className="pt-4 border-t border-gray-800 mt-4">
              <p>
                &copy; 2025 Liga 33. Desarrollado por{" "}
                <a
                  href="https://www.launchbyteuy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors underline"
                >
                  LaunchByte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
