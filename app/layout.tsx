import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Copa Libertadores - Liga 33",
  description:
    "Sigue toda la acción de la Copa Libertadores Liga 33 - Tablas de posiciones, fixtures, goleadores y más",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Copa Libertadores - Liga 33",
    description:
      "Sigue toda la acción de la Copa Libertadores Liga 33 - Tablas de posiciones, fixtures, goleadores y más",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 1200,
        alt: "Copa Libertadores Liga 33",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Copa Libertadores - Liga 33",
    description:
      "Sigue toda la acción de la Copa Libertadores Liga 33 - Tablas de posiciones, fixtures, goleadores y más",
    images: ["/favicon.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
