"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Mail, Lock, Eye, EyeOff, Sprout } from "lucide-react"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
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

    const result = await login(formData.email, formData.password)

    if (result.success) {
      toast.success(t("loginSuccessful"))
      navigate("/dashboard")
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ maxWidth: "450px", marginTop: "50px" }}>
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
                background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                padding: "15px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sprout size={32} color="white" />
            </div>
          </div>
          <h2 className="card-title" style={{ marginBottom: "10px" }}>
            {t("login")} to AgriBuddy
          </h2>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: 0 }}>
            {t("welcome")} back! Please sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              {t("email")}
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

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              {t("password")}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
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
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "15px", fontSize: "16px", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? t("loading") : t("login")}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            padding: "20px 0",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ color: "#6b7280", margin: 0 }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#4CAF50",
                textDecoration: "none",
                fontWeight: "600",
                borderBottom: "2px solid transparent",
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.borderBottomColor = "#4CAF50")}
              onMouseLeave={(e) => (e.target.style.borderBottomColor = "transparent")}
            >
              {t("register")} here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
