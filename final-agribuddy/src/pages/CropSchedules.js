"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const CropSchedules = () => {
  const [schedules, setSchedules] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const selectedFarmId = searchParams.get("farm")

  useEffect(() => {
    fetchData()
  }, [selectedFarmId])

  const fetchData = async () => {
    try {
      const [schedulesRes, farmsRes] = await Promise.all([
        selectedFarmId ? axios.get(`/api/schedules/farm/${selectedFarmId}`) : axios.get("/api/schedules"),
        axios.get("/api/farms"),
      ])

      setSchedules(schedulesRes.data)
      setFarms(farmsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch schedules")
    } finally {
      setLoading(false)
    }
  }

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await axios.put(`/api/schedules/${scheduleId}`, { status: newStatus })
      setSchedules(
        schedules.map((schedule) => (schedule._id === scheduleId ? { ...schedule, status: newStatus } : schedule)),
      )
      toast.success("Schedule status updated")
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast.error("Failed to update schedule")
    }
  }

  const deleteSchedule = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await axios.delete(`/api/schedules/${scheduleId}`)
        setSchedules(schedules.filter((schedule) => schedule._id !== scheduleId))
        toast.success("Schedule deleted successfully")
      } catch (error) {
        console.error("Error deleting schedule:", error)
        toast.error("Failed to delete schedule")
      }
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading schedules...</p>
      </div>
    )
  }

  const selectedFarm = farms.find((farm) => farm._id === selectedFarmId)

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="card-title">
            Crop Schedules
            {selectedFarm && ` - ${selectedFarm.name}`}
          </h1>
          <Link to="/schedules/create" className="btn btn-primary">
            Create New Schedule
          </Link>
        </div>

        {schedules.length > 0 ? (
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Variety</th>
                  <th>Farm</th>
                  <th>Planting Date</th>
                  <th>Expected Harvest</th>
                  <th>Area (acres)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td>
                      <strong>{schedule.cropName}</strong>
                    </td>
                    <td>{schedule.variety}</td>
                    <td>{schedule.farm?.name}</td>
                    <td>{new Date(schedule.plantingDate).toLocaleDateString()}</td>
                    <td>{new Date(schedule.expectedHarvestDate).toLocaleDateString()}</td>
                    <td>{schedule.area}</td>
                    <td>
                      <select
                        value={schedule.status}
                        onChange={(e) => updateScheduleStatus(schedule._id, e.target.value)}
                        className={`status-badge status-${schedule.status.toLowerCase()}`}
                        style={{ border: "none", background: "transparent", cursor: "pointer" }}
                      >
                        <option value="Planned">Planned</option>
                        <option value="Planted">Planted</option>
                        <option value="Growing">Growing</option>
                        <option value="Harvested">Harvested</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => deleteSchedule(schedule._id)}
                          className="btn btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              {selectedFarm
                ? `No crop schedules found for ${selectedFarm.name}.`
                : "You haven't created any crop schedules yet."}
            </p>
            <Link to="/schedules/create" className="btn btn-primary">
              Create Your First Schedule
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CropSchedules
