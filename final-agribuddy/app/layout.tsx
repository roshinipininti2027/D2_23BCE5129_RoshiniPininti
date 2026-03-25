import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "AgriBuddy - Smart Crop Scheduling & Advisory",
  description: "Smart farming solutions for modern agriculture with real-time weather data and crop recommendations",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
