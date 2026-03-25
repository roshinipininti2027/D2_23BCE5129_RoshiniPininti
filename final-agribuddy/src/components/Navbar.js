"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageSelector from "./LanguageSelector"
import { Sprout, Menu, X } from "lucide-react"
import { useState } from "react"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
    setIsMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link"
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Sprout size={28} />
          <span>AgriBuddy</span>
        </Link>

        {user ? (
          <>
            <div className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
              <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("dashboard")}
              </Link>
              <Link to="/farms" className={isActive("/farms")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("farms")}
              </Link>
              <Link to="/schedules" className={isActive("/schedules")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("schedules")}
              </Link>
              <Link to="/advisory" className={isActive("/advisory")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("advisory")}
              </Link>
              <Link to="/activities" className={isActive("/activities")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("activities")}
              </Link>
            </div>

            <div className="nav-user">
              <LanguageSelector />
              <div className="user-info">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">
                  {t("welcome")}, {user.name}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline nav-logout">
                {t("logout")}
              </button>
              <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth">
            <LanguageSelector />
            <Link to="/login" className="btn btn-outline">
              {t("login")}
            </Link>
            <Link to="/register" className="btn btn-primary">
              {t("register")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
