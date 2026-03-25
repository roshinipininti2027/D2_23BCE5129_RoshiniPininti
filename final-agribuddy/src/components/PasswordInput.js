"use client"

import { useState, useEffect } from "react"
import { Lock, Eye, EyeOff, Check, X } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

const PasswordInput = ({ value, onChange, name = "password", required = false }) => {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" })
  const [requirements, setRequirements] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  })

  useEffect(() => {
    if (value) {
      checkPasswordStrength(value)
      checkRequirements(value)
    } else {
      setStrength({ score: 0, label: "", color: "" })
      setRequirements({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
      })
    }
  }, [value, t])

  const checkRequirements = (password) => {
    setRequirements({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

  const checkPasswordStrength = (password) => {
    let score = 0
    let label = ""
    let color = ""

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (score <= 2) {
      label = t("weak")
      color = "#dc3545"
    } else if (score <= 4) {
      label = t("medium")
      color = "#ff9800"
    } else {
      label = t("strong")
      color = "#4caf50"
    }

    setStrength({ score, label, color })
  }

  const RequirementItem = ({ met, text }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        color: met ? "#4caf50" : "#666",
        transition: "color 0.3s ease",
      }}
    >
      {met ? <Check size={14} color="#4caf50" /> : <X size={14} color="#dc3545" />}
      <span>{text}</span>
    </div>
  )

  return (
    <div className="form-group">
      <label className="form-label">
        <Lock size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        {t("password")} {required && "*"}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          className="form-control"
          value={value}
          onChange={onChange}
          required={required}
          placeholder="Create a strong password"
          style={{ paddingRight: "50px" }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {value && (
        <>
          {/* Password Strength Indicator */}
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{t("passwordStrength")}</span>
              <span style={{ fontSize: "12px", fontWeight: "600", color: strength.color }}>{strength.label}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(strength.score / 5) * 100}%`,
                  height: "100%",
                  backgroundColor: strength.color,
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
              {t("passwordRequirements")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <RequirementItem met={requirements.minLength} text={t("minLength")} />
              <RequirementItem met={requirements.uppercase} text={t("uppercase")} />
              <RequirementItem met={requirements.lowercase} text={t("lowercase")} />
              <RequirementItem met={requirements.number} text={t("number")} />
              <RequirementItem met={requirements.specialChar} text={t("specialChar")} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PasswordInput
