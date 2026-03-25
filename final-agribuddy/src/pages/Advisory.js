"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Advisory = () => {
  const [advisories, setAdvisories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "",
    priority: "",
  })

  useEffect(() => {
    fetchAdvisories()
  }, [filters])

  const fetchAdvisories = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.priority) params.append("priority", filters.priority)

      const response = await axios.get(`/api/advisory?${params.toString()}`)
      setAdvisories(response.data)
    } catch (error) {
      console.error("Error fetching advisories:", error)
      toast.error("Failed to fetch advisories")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "#d32f2f"
      case "high":
        return "#f57c00"
      case "medium":
        return "#1976d2"
      case "low":
        return "#388e3c"
      default:
        return "#666"
    }
  }

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "weather":
        return "🌤️"
      case "pest":
        return "🐛"
      case "disease":
        return "🦠"
      case "fertilizer":
        return "🌱"
      default:
        return "📢"
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading advisories...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Agricultural Advisory</h1>
        </div>

        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label">Filter by Type</label>
            <select name="type" className="form-select" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Weather">Weather</option>
              <option value="Pest">Pest</option>
              <option value="Disease">Disease</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label">Filter by Priority</label>
            <select name="priority" className="form-select" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {advisories.length > 0 ? (
          <div className="grid">
            {advisories.map((advisory) => (
              <div key={advisory._id} className="card" style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{getTypeIcon(advisory.type)}</span>
                    <div>
                      <h3 style={{ margin: 0, color: "#333" }}>{advisory.title}</h3>
                      <small style={{ color: "#666" }}>
                        {advisory.type} | {new Date(advisory.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <span
                    className={`status-badge priority-${advisory.priority.toLowerCase()}`}
                    style={{
                      backgroundColor: getPriorityColor(advisory.priority) + "20",
                      color: getPriorityColor(advisory.priority),
                      border: `1px solid ${getPriorityColor(advisory.priority)}`,
                    }}
                  >
                    {advisory.priority}
                  </span>
                </div>

                <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "15px" }}>{advisory.content}</p>

                {advisory.targetCrops && advisory.targetCrops.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Target Crops:</strong> {advisory.targetCrops.join(", ")}
                  </div>
                )}

                {advisory.location && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>📍 Location:</strong> {advisory.location}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  <span>Valid until: {new Date(advisory.validUntil).toLocaleDateString()}</span>
                  <span>Posted: {new Date(advisory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", marginBottom: "20px" }}>No advisories found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Advisory
