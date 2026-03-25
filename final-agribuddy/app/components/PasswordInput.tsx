"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function PasswordInput({ value, onChange, placeholder }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showStrength, setShowStrength] = useState(false)

  const passwordRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "One uppercase letter" },
    { regex: /[a-z]/, text: "One lowercase letter" },
    { regex: /\d/, text: "One number" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "One special character" },
  ]

  const getPasswordStrength = () => {
    const passedRequirements = passwordRequirements.filter(req => req.regex.test(value)).length
    if (passedRequirements < 2) return { strength: "weak", color: "red", width: "25%" }
    if (passedRequirements < 4) return { strength: "medium", color: "yellow", width: "50%" }
    if (passedRequirements < 5) return { strength: "good", color: "blue", width: "75%" }
    return { strength: "strong", color: "green", width: "100%" }
  }

  const strength = getPasswordStrength()

  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowStrength(true)}
          onBlur={() => setShowStrength(false)}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          placeholder={placeholder || "••••••••"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {value && (showStrength || value.length > 0) && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 bg-${strength.color}-500`}
                style={{ width: strength.width }}
              />
            </div>
            <span className={`text-sm font-medium text-${strength.color}-600 capitalize`}>
              {strength.strength}
            </span>
          </div>
          
          <div className="space-y-1">
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {req.regex.test(value) ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
                <span className={req.regex.test(value) ? "text-green-600" : "text-gray-500"}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
