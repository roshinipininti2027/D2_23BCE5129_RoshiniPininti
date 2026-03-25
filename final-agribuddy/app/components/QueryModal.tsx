"use client"

import type React from "react"

import { useState } from "react"
import { X, Send, Upload } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

interface QueryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (queryData: any) => void
}

export default function QueryModal({ isOpen, onClose, onSubmit }: QueryModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "medium",
    farmId: "",
    images: [] as File[],
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    "crop-management",
    "pest-control",
    "disease-management",
    "soil-health",
    "irrigation",
    "fertilization",
    "weather-related",
    "market-information",
    "equipment",
    "general",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const queryData = new FormData()
      queryData.append("title", formData.title)
      queryData.append("description", formData.description)
      queryData.append("category", formData.category)
      queryData.append("urgency", formData.urgency)
      if (formData.farmId) queryData.append("farmId", formData.farmId)

      formData.images.forEach((image, index) => {
        queryData.append(`images`, image)
      })

      await axios.post("/api/consultations", queryData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Query submitted successfully!")
      onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        category: "",
        urgency: "medium",
        farmId: "",
        images: [],
      })
      onClose()
    } catch (error: any) {
      console.error("Error submitting query:", error)
      toast.error(error.response?.data?.message || "Failed to submit query")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.images.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }
    setFormData({ ...formData, images: [...formData.images, ...files] })
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ask Agricultural Expert</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Query Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Brief title for your query"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe your problem in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload images to help explain your problem</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
              >
                Choose Images
              </label>
              <p className="text-xs text-gray-500 mt-2">Max 5 images, 10MB each</p>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
              {loading ? "Submitting..." : "Submit Query"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
