"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const Farms = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      const response = await axios.get("/api/farms")
      setFarms(response.data)
    } catch (error) {
      console.error("Error fetching farms:", error)
      toast.error("Failed to fetch farms")
    } finally {
      setLoading(false)
    }
  }

  const deleteFarm = async (farmId) => {
    if (window.confirm("Are you sure you want to delete this farm?")) {
      try {
        await axios.delete(`/api/farms/${farmId}`)
        setFarms(farms.filter((farm) => farm._id !== farmId))
        toast.success("Farm deleted successfully")
      } catch (error) {
        console.error("Error deleting farm:", error)
        toast.error("Failed to delete farm")
      }
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading farms...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="card-title">My Farms</h1>
          <Link to="/farms/create" className="btn btn-primary">
            Add New Farm
          </Link>
        </div>

        {farms.length > 0 ? (
          <div className="grid grid-2">
            {farms.map((farm) => (
              <div key={farm._id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#4CAF50" }}>{farm.name}</h3>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => deleteFarm(farm._id)}
                      className="btn btn-danger"
                      style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <strong>📍 Location:</strong> {farm.location}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>📏 Area:</strong> {farm.area} acres
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>🌱 Soil Type:</strong> {farm.soilType}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>💧 Irrigation:</strong> {farm.irrigationType}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: "14px" }}>{farm.crops?.length || 0} crop schedules</span>
                  <Link
                    to={`/schedules?farm=${farm._id}`}
                    className="btn btn-outline"
                    style={{ padding: "5px 15px", fontSize: "14px" }}
                  >
                    View Schedules
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", marginBottom: "20px" }}>You haven't created any farms yet.</p>
            <Link to="/farms/create" className="btn btn-primary">
              Create Your First Farm
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Farms
