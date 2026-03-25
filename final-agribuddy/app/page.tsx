"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./contexts/AuthContext"
import { useLanguage } from "./contexts/LanguageContext"
import Link from "next/link"
import { Sprout, TrendingUp, Users, Award, ArrowRight, CheckCircle, BarChart3, Cloud, Smartphone, Globe, Calendar, BookOpen, MapPin } from 'lucide-react'
import Navbar from "./components/Navbar"

export default function Home() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const features = [
    {
      icon: <Cloud className="w-8 h-8" />,
      title: t("realTimeWeather"),
      description: t("realTimeWeatherDesc"),
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: t("smartCropCalendar"),
      description: t("smartCropCalendarDesc"),
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: t("cropDiary"),
      description: t("cropDiaryDesc"),
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: t("localizedRecommendations"),
      description: t("localizedRecommendationsDesc"),
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: t("analyticsReports"),
      description: t("analyticsReportsDesc"),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("multiLanguageSupport"),
      description: t("multiLanguageSupportDesc"),
    },
  ]

  const stats = [
    { number: "15,000+", label: t("happyFarmers"), icon: <Users className="w-6 h-6" /> },
    { number: "75,000+", label: t("cropsManaged"), icon: <Sprout className="w-6 h-6" /> },
    { number: "98%", label: t("accuracyRate"), icon: <TrendingUp className="w-6 h-6" /> },
    { number: "24/7", label: t("weatherMonitoring"), icon: <Cloud className="w-6 h-6" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {t("heroTitle")}
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {" "}{t("heroTitleHighlight")}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t("heroDescription")}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {t("getStarted")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-all duration-200"
                >
                  {t("login")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{t("freeToStart")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{t("realTimeData")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{t("expertSupport")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("cropDashboard")}</h3>
                    <p className="text-sm text-gray-500">{t("realTimeMonitoring")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-sm text-gray-600">{t("activeCrops")}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-gray-600">{t("healthScore")}</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">{t("weatherAlert")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("whyChooseAgriBuddy")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("whyChooseDesc")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("readyToStart")}
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {t("readyToStartDesc")}
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t("startFarming")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold">AgriBuddy</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t("footerDescription")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("features")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("weatherIntegration")}</li>
                <li>{t("cropCalendar")}</li>
                <li>{t("soilAnalysis")}</li>
                <li>{t("analytics")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("support")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("helpCenter")}</li>
                <li>{t("documentation")}</li>
                <li>{t("community")}</li>
                <li>{t("contact")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AgriBuddy. {t("allRightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
