"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Sprout, Menu, X, User, LogOut, Bell } from "lucide-react"
import LanguageSelector from "./LanguageSelector"
import NotificationCenter from "./NotificationCenter"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              AgriBuddy
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                  </button>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                    <LanguageSelector />
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {user.role === "expert" ? "Dr. " : ""}
                        {user.name}
                      </span>
                      {user.role === "expert" && <span className="text-xs text-green-600">Expert</span>}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("logout")}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <LanguageSelector />
                  <Link href="/login" className="text-gray-700 hover:text-green-600 transition-colors">
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    {t("register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    {/* Profile Section */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.role === "expert" ? "Dr. " : ""}
                          {user.name}
                        </div>
                        {user.role === "expert" && <div className="text-sm text-green-600">Expert</div>}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("dashboard")}
                    </Link>

                    {user.role === "farmer" ? (
                      <>
                        <Link
                          href="/farms"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t("farms")}
                        </Link>
                        <Link
                          href="/crop-diary"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Crop Diary
                        </Link>
                        <Link
                          href="/weather"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t("weather")}
                        </Link>
                        <Link
                          href="/chatbot"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          AI Assistant
                        </Link>
                        <Link
                          href="/advisor"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Ask Expert
                        </Link>
                      </>
                    ) : user.role === "expert" ? (
                      <>
                        <Link
                          href="/advisor"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Farmer Queries
                        </Link>
                        <Link
                          href="/chatbot"
                          className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          AI Assistant
                        </Link>
                      </>
                    ) : null}

                    <Link
                      href="/analytics"
                      className="text-gray-700 hover:text-green-600 transition-colors py-2 px-4 rounded-lg hover:bg-green-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("analytics")}
                    </Link>

                    {/* Mobile Actions */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-gray-600">Language</span>
                        <LanguageSelector />
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <LanguageSelector />
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-green-600 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("register")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {user && <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
    </>
  )
}
