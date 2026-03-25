"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Sprout, Mail, Lock, User, Phone, Award } from "lucide-react"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import LocationInput from "../components/LocationInput"
import PasswordInput from "../components/PasswordInput"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    role: "farmer",
    farmingExperience: "",
    expertise: "",
    certification: "",
  })
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLocationChange = (location: string) => {
    setFormData({
      ...formData,
      location,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"))
      setLoading(false)
      return
    }

    try {
      const result = await register(formData)
      if (result.success) {
        toast.success(t("registrationSuccessful"))
        router.push("/dashboard")
      } else {
        toast.error(result.message || t("registrationFailed"))
      }
    } catch (error) {
      toast.error(t("registrationFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AgriBuddy</h1>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("createAccount")}</h2>
              <p className="text-gray-600">{t("joinAgriBuddy")}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("name")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={t("enterYourName")}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="farmer@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("password")}
                  </label>
                  <PasswordInput
                    value={formData.password}
                    onChange={(value) => setFormData({ ...formData, password: value })}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("role")}
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    <option value="farmer">{t("farmer")}</option>
                    <option value="expert">{t("expert")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("location")}
                </label>
                <LocationInput
                  value={formData.location}
                  onChange={handleLocationChange}
                  placeholder={t("enterYourLocation")}
                />
              </div>

              {formData.role === "farmer" && (
                <div>
                  <label htmlFor="farmingExperience" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("farmingExperience")}
                  </label>
                  <input
                    type="number"
                    id="farmingExperience"
                    name="farmingExperience"
                    value={formData.farmingExperience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="5"
                  />
                </div>
              )}

              {formData.role === "expert" && (
                <>
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("expertise")}
                      <span className="text-xs font-normal text-gray-500 block mt-1">
                        e.g., "Crop Management, Soil Science, Pest Control, Water Management"
                      </span>
                    </label>
                    <textarea
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Describe your areas of expertise (comma-separated)"
                    />
                  </div>

                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("certification")}
                      <span className="text-xs font-normal text-gray-500 block mt-1">
                        e.g., "B.Sc Agriculture, M.Tech Soil Science, Ph.D Agronomy"
                      </span>
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="certification"
                        name="certification"
                        value={formData.certification}
                        onChange={handleChange}
                        required={formData.role === "expert"}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Your qualifications and certifications"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? t("loading") : t("signUp")}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  {t("signIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
