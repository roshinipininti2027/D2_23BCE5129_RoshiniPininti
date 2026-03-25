"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { toast } from "react-toastify"

const LocationInput = ({ value, onChange, required = false }) => {
  const { t } = useLanguage()
  const [detecting, setDetecting] = useState(false)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.")
      return
    }

    setDetecting(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`,
          )

          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted
              onChange({ target: { name: "location", value: address } })
              toast.success(t("locationDetected"))
            } else {
              // Fallback to coordinates if no address found
              const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              onChange({ target: { name: "location", value: locationString } })
              toast.success(t("locationDetected"))
            }
          } else {
            // Fallback to coordinates
            const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            onChange({ target: { name: "location", value: locationString } })
            toast.success(t("locationDetected"))
          }
        } catch (error) {
          console.error("Error getting address:", error)
          // Fallback to coordinates
          const locationString = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          onChange({ target: { name: "location", value: locationString } })
          toast.success(t("locationDetected"))
        } finally {
          setDetecting(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error(t("locationError"))
        setDetecting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="form-group">
      <label className="form-label">
        <MapPin size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        {t("location")} {required && "*"}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          name="location"
          className="form-control"
          value={value}
          onChange={onChange}
          required={required}
          placeholder="Enter your location or use current location"
          style={{ paddingRight: "120px" }}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={detecting}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: detecting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            opacity: detecting ? 0.7 : 1,
            transition: "all 0.3s ease",
          }}
        >
          {detecting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {t("detectingLocation")}
            </>
          ) : (
            <>
              <Navigation size={14} />
              {t("useCurrentLocation")}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default LocationInput
