"use client"

import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { ChevronDown, Globe } from 'lucide-react'

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  language === lang.code ? 'bg-green-50 text-green-600' : 'text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
