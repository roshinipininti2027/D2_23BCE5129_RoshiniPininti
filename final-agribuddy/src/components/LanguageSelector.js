"use client"

import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { ChevronDown, Globe } from "lucide-react"
import "./LanguageSelector.css"

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, availableLanguages, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = availableLanguages.find((lang) => lang.code === currentLanguage)

  return (
    <div className="language-selector">
      <button className="language-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Globe size={16} />
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-name">{currentLang?.name}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-header">
            <Globe size={16} />
            <span>{t("selectLanguage")}</span>
          </div>
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? "active" : ""}`}
              onClick={() => {
                changeLanguage(language.code)
                setIsOpen(false)
              }}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
              {currentLanguage === language.code && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && <div className="language-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

export default LanguageSelector
