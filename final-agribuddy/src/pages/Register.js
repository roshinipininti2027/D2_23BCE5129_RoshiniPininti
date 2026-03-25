"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { User, Mail, Phone, Calendar, Sprout } from "lucide-react"
import LocationInput from "../components/LocationInput"
import PasswordInput from "../components/PasswordInput"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    farmingExperience: 0,
  })
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await register(formData)

    if (result.success) {
      toast.success(t("registrationSuccessful"))
      navigate("/dashboard")
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ maxWidth: "600px", marginTop: "30px" }}>
      <div className="card fade-in-up">
        <div className="card-header" style={{ textAlign: "center", borderBottom: "none", paddingBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                padding: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Sprout size={36} color="white" />
            </div>
          </div>
          <h2 className="card-title" style={{ marginBottom: "10px" }}>
            {t("register")} for AgriBuddy
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Join thousands of farmers managing their crops efficiently with smart technology.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                {t("fullName")} *
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                {t("email")} *
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <PasswordInput value={formData.password} onChange={handleChange} name="password" required={true} />

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                {t("phone")} *
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                {t("farmingExperience")}
              </label>
              <input
                type="number"
                name="farmingExperience"
                className="form-control"
                value={formData.farmingExperience}
                onChange={handleChange}
                min="0"
                placeholder="Years of farming experience"
              />
            </div>
          </div>

          <LocationInput value={formData.location} onChange={handleChange} required={true} />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "16px", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? t("creating") : t("register")}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            padding: "24px 0",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <p style={{ color: "#64748b", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#4f46e5",
                textDecoration: "none",
                fontWeight: "600",
                borderBottom: "2px solid transparent",
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.borderBottomColor = "#4f46e5")}
              onMouseLeave={(e) => (e.target.style.borderBottomColor = "transparent")}
            >
              {t("login")} here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
