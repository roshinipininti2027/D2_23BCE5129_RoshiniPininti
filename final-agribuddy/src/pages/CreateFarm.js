"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const CreateFarm = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    area: "",
    soilType: "",
    irrigationType: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const soilTypes = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky"]
  const irrigationTypes = ["Drip", "Sprinkler", "Flood", "Manual"]

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
      await axios.post("/api/farms", formData)
      toast.success("Farm created successfully!")
      navigate("/farms")
    } catch (error) {
      console.error("Error creating farm:", error)
      toast.error(error.response?.data?.message || "Failed to create farm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: "600px", paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create New Farm</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Farm Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter farm name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter farm location"
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
            <label className="form-label">Soil Type *</label>
            <select name="soilType" className="form-select" value={formData.soilType} onChange={handleChange} required>
              <option value="">Select soil type</option>
              {soilTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Irrigation Type *</label>
            <select
              name="irrigationType"
              className="form-select"
              value={formData.irrigationType}
              onChange={handleChange}
              required
            >
              <option value="">Select irrigation type</option>
              {irrigationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => navigate("/farms")} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Farm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFarm
