"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const CreateSchedule = () => {
  const [formData, setFormData] = useState({
    farm: "",
    cropName: "",
    variety: "",
    plantingDate: "",
    expectedHarvestDate: "",
    area: "",
    notes: "",
  })
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
    setLoading(true)

    try {
      await axios.post("/api/schedules", formData)
      toast.success("Crop schedule created successfully!")
      navigate("/schedules")
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error(error.response?.data?.message || "Failed to create schedule")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: "600px", paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create Crop Schedule</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Farm *</label>
            <select name="farm" className="form-select" value={formData.farm} onChange={handleChange} required>
              <option value="">Select a farm</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Crop Name *</label>
            <input
              type="text"
              name="cropName"
              className="form-control"
              value={formData.cropName}
              onChange={handleChange}
              required
              placeholder="e.g., Tomato, Rice, Wheat"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Variety *</label>
            <input
              type="text"
              name="variety"
              className="form-control"
              value={formData.variety}
              onChange={handleChange}
              required
              placeholder="e.g., Cherry Tomato, Basmati Rice"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Planting Date *</label>
            <input
              type="date"
              name="plantingDate"
              className="form-control"
              value={formData.plantingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Harvest Date *</label>
            <input
              type="date"
              name="expectedHarvestDate"
              className="form-control"
              value={formData.expectedHarvestDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Area (acres) *</label>
            <input
              type="number"
              name="area"
              className="form-control"
              value={formData.area}
              onChange={handleChange}
              required
              min="0.1"
              step="0.1"
              placeholder="Enter area in acres"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this crop schedule..."
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => navigate("/schedules")} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSchedule
