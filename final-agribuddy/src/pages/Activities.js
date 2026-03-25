"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Activities = () => {
  const [activities, setActivities] = useState([])
  const [farms, setFarms] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    farm: "",
    cropSchedule: "",
    activityType: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    cost: "",
    notes: "",
  })

  const activityTypes = ["Planting", "Watering", "Fertilizing", "Pesticide", "Weeding", "Harvesting", "Other"]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [activitiesRes, farmsRes, schedulesRes] = await Promise.all([
        axios.get("/api/activities"),
        axios.get("/api/farms"),
        axios.get("/api/schedules"),
      ])

      setActivities(activitiesRes.data)
      setFarms(farmsRes.data)
      setSchedules(schedulesRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch activities")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post("/api/activities", formData)
      setActivities([response.data, ...activities])
      setShowForm(false)
      setFormData({
        farm: "",
        cropSchedule: "",
        activityType: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        cost: "",
        notes: "",
      })
      toast.success("Activity logged successfully!")
    } catch (error) {
      console.error("Error creating activity:", error)
      toast.error(error.response?.data?.message || "Failed to log activity")
    }
  }

  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "planting":
        return "🌱"
      case "watering":
        return "💧"
      case "fertilizing":
        return "🌿"
      case "pesticide":
        return "🚿"
      case "weeding":
        return "🌾"
      case "harvesting":
        return "🌽"
      default:
        return "📝"
    }
  }

  const filteredSchedules = schedules.filter((schedule) => schedule.farm._id === formData.farm)

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading activities...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="card-title">Farm Activities</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? "Cancel" : "Log New Activity"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: "20px", backgroundColor: "#f8f9fa" }}>
            <h3 style={{ marginBottom: "20px" }}>Log New Activity</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Select Farm *</label>
                  <select name="farm" className="form-select" value={formData.farm} onChange={handleChange} required>
                    <option value="">Select a farm</option>
                    {farms.map((farm) => (
                      <option key={farm._id} value={farm._id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Crop Schedule (Optional)</label>
                  <select
                    name="cropSchedule"
                    className="form-select"
                    value={formData.cropSchedule}
                    onChange={handleChange}
                  >
                    <option value="">Select crop schedule</option>
                    {filteredSchedules.map((schedule) => (
                      <option key={schedule._id} value={schedule._id}>
                        {schedule.cropName} - {schedule.variety}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Activity Type *</label>
                  <select
                    name="activityType"
                    className="form-select"
                    value={formData.activityType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select activity type</option>
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe the activity performed"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost (Optional)</label>
                <input
                  type="number"
                  name="cost"
                  className="form-control"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter cost if applicable"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes..."
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        )}

        {activities.length > 0 ? (
          <div className="grid">
            {activities.map((activity) => (
              <div key={activity._id} className="card" style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{getActivityIcon(activity.activityType)}</span>
                    <div>
                      <h3 style={{ margin: 0, color: "#333" }}>{activity.activityType}</h3>
                      <small style={{ color: "#666" }}>
                        {activity.farm?.name} | {new Date(activity.date).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  {activity.cost > 0 && (
                    <span
                      style={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      ${activity.cost}
                    </span>
                  )}
                </div>

                <p style={{ color: "#555", marginBottom: "10px" }}>{activity.description}</p>

                {activity.cropSchedule && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>🌱 Crop:</strong> {activity.cropSchedule.cropName} - {activity.cropSchedule.variety}
                  </div>
                )}

                {activity.notes && (
                  <div style={{ marginBottom: "10px", fontStyle: "italic", color: "#666" }}>
                    <strong>Notes:</strong> {activity.notes}
                  </div>
                )}

                <div style={{ fontSize: "14px", color: "#666" }}>
                  Logged on: {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", marginBottom: "20px" }}>No activities logged yet.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Log Your First Activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Activities
