"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2 } from 'lucide-react'

interface LocationInputProps {
  value: string
  onChange: (location: string) => void
  placeholder?: string
}

export default function LocationInput({ value, onChange, placeholder }: LocationInputProps) {
  const [loading, setLoading] = useState(false)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
          )
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            const location = data.results[0].formatted
            onChange(location)
          } else {
            onChange(`${latitude}, ${longitude}`)
          }
        } catch (error) {
          console.error("Error getting location:", error)
          onChange(`${position.coords.latitude}, ${position.coords.longitude}`)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setLoading(false)
        alert("Unable to retrieve your location. Please enter manually.")
      }
    )
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        placeholder={placeholder || "Enter your location"}
      />
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700 disabled:opacity-50"
        title="Get current location"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
