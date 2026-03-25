"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { TrendingUp, Sprout, Calendar, Activity, Plus, ArrowRight, BarChart3, MapPin, Clock } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalSchedules: 0,
    activeSchedules: 0,
    recentActivities: 0,
  })
  const [recentSchedules, setRecentSchedules] = useState([])
  const [recentAdvisories, setRecentAdvisories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [farmsRes, schedulesRes, advisoriesRes, activitiesRes] = await Promise.all([
        axios.get("/api/farms"),
        axios.get("/api/schedules"),
        axios.get("/api/advisory?limit=5"),
        axios.get("/api/activities"),
      ])

      const farms = farmsRes.data
      const schedules = schedulesRes.data
      const advisories = advisoriesRes.data
      const activities = activitiesRes.data

      setStats({
        totalFarms: farms.length,
        totalSchedules: schedules.length,
        activeSchedules: schedules.filter((s) => s.status === "Growing" || s.status === "Planted").length,
        recentActivities: activities.length,
      })

      setRecentSchedules(schedules.slice(0, 5))
      setRecentAdvisories(advisories.slice(0, 3))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: "30px" }}>
      <div className="card fade-in-up">
        <div className="card-header" style={{ borderBottom: "none", paddingBottom: "10px" }}>
          <div>
            <h1 className="card-title" style={{ marginBottom: "10px" }}>
              {t("welcomeBack")}, {user?.name}! 🌱
            </h1>
            <p style={{ color: "#6b7280", fontSize: "16px", margin: 0 }}>
              Here's what's happening with your farms today.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/farms/create" className="btn btn-primary">
              <Plus size={16} />
              {t("createNewFarm")}
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card slide-in-right" style={{ animationDelay: "0.1s" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={24} color="white" />
              </div>
              <TrendingUp size={20} color="#4CAF50" />
            </div>
            <div className="stat-number">{stats.totalFarms}</div>
            <div className="stat-label">{t("totalFarms")}</div>
          </div>

          <div className="stat-card slide-in-right" style={{ animationDelay: "0.2s" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={24} color="white" />
              </div>
              <BarChart3 size={20} color="#2196F3" />
            </div>
            <div className="stat-number">{stats.totalSchedules}</div>
            <div className="stat-label">{t("cropSchedules")}</div>
          </div>

          <div className="stat-card slide-in-right" style={{ animationDelay: "0.3s" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sprout size={24} color="white" />
              </div>
              <TrendingUp size={20} color="#FF9800" />
            </div>
            <div className="stat-number">{stats.activeSchedules}</div>
            <div className="stat-label">{t("activeCrops")}</div>
          </div>

          <div className="stat-card slide-in-right" style={{ animationDelay: "0.4s" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={24} color="white" />
              </div>
              <BarChart3 size={20} color="#9C27B0" />
            </div>
            <div className="stat-number">{stats.recentActivities}</div>
            <div className="stat-label">{t("totalActivities")}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: "1.25rem" }}>
              <Calendar size={20} style={{ marginRight: "10px", verticalAlign: "middle" }} />
              {t("recentCropSchedules")}
            </h3>
            <Link to="/schedules" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "14px" }}>
              {t("viewAll")}
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentSchedules.length > 0 ? (
            <div>
              {recentSchedules.map((schedule, index) => (
                <div
                  key={schedule._id}
                  style={{
                    padding: "15px 0",
                    borderBottom: index < recentSchedules.length - 1 ? "1px solid rgba(0, 0, 0, 0.05)" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.05)"
                    e.currentTarget.style.borderRadius = "8px"
                    e.currentTarget.style.padding = "15px"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderRadius = "0"
                    e.currentTarget.style.padding = "15px 0"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                      <Sprout size={16} color="#4CAF50" />
                      <strong style={{ color: "#333", fontSize: "16px" }}>{schedule.cropName}</strong>
                      <span style={{ color: "#666", fontSize: "14px" }}>- {schedule.variety}</span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "15px", fontSize: "14px", color: "#666" }}
                    >
                      <span>
                        <MapPin size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {schedule.farm?.name}
                      </span>
                      <span>
                        <Clock size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {new Date(schedule.plantingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge status-${schedule.status.toLowerCase()}`}>
                    {t(schedule.status.toLowerCase())}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <Calendar size={48} color="#ddd" style={{ marginBottom: "15px" }} />
              <p style={{ marginBottom: "15px" }}>{t("noCropSchedules")}</p>
              <Link to="/schedules/create" className="btn btn-primary">
                <Plus size={16} />
                {t("createFirstSchedule")}
              </Link>
            </div>
          )}
        </div>

        <div className="card fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: "1.25rem" }}>
              <Activity size={20} style={{ marginRight: "10px", verticalAlign: "middle" }} />
              {t("recentAdvisories")}
            </h3>
            <Link to="/advisory" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "14px" }}>
              {t("viewAll")}
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentAdvisories.length > 0 ? (
            <div>
              {recentAdvisories.map((advisory, index) => (
                <div
                  key={advisory._id}
                  style={{
                    padding: "15px 0",
                    borderBottom: index < recentAdvisories.length - 1 ? "1px solid rgba(0, 0, 0, 0.05)" : "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.05)"
                    e.currentTarget.style.borderRadius = "8px"
                    e.currentTarget.style.padding = "15px"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderRadius = "0"
                    e.currentTarget.style.padding = "15px 0"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#333", fontSize: "16px" }}>{advisory.title}</strong>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        {advisory.type} | {new Date(advisory.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`status-badge priority-${advisory.priority.toLowerCase()}`}>
                      {t(advisory.priority.toLowerCase())}
                    </span>
                  </div>
                  <p style={{ margin: "0", fontSize: "14px", color: "#555", lineHeight: "1.5" }}>
                    {advisory.content.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <Activity size={48} color="#ddd" style={{ marginBottom: "15px" }} />
              <p>{t("noAdvisories")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card fade-in-up" style={{ animationDelay: "0.7s" }}>
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: "1.25rem" }}>
            <Plus size={20} style={{ marginRight: "10px", verticalAlign: "middle" }} />
            {t("quickActions")}
          </h3>
        </div>

        <div className="grid grid-3">
          <Link
            to="/farms/create"
            className="btn btn-primary"
            style={{
              padding: "25px",
              textAlign: "center",
              flexDirection: "column",
              gap: "10px",
              height: "120px",
              justifyContent: "center",
            }}
          >
            <MapPin size={32} />
            <span style={{ fontSize: "16px", fontWeight: "600" }}>{t("createNewFarm")}</span>
          </Link>
          <Link
            to="/schedules/create"
            className="btn btn-primary"
            style={{
              padding: "25px",
              textAlign: "center",
              flexDirection: "column",
              gap: "10px",
              height: "120px",
              justifyContent: "center",
            }}
          >
            <Calendar size={32} />
            <span style={{ fontSize: "16px", fontWeight: "600" }}>{t("scheduleCrop")}</span>
          </Link>
          <Link
            to="/activities"
            className="btn btn-primary"
            style={{
              padding: "25px",
              textAlign: "center",
              flexDirection: "column",
              gap: "10px",
              height: "120px",
              justifyContent: "center",
            }}
          >
            <Activity size={32} />
            <span style={{ fontSize: "16px", fontWeight: "600" }}>{t("logActivity")}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
