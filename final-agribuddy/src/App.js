import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import PrivateRoute from "./components/PrivateRoute"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Farms from "./pages/Farms"
import CreateFarm from "./pages/CreateFarm"
import CropSchedules from "./pages/CropSchedules"
import CreateSchedule from "./pages/CreateSchedule"
import Advisory from "./pages/Advisory"
import Activities from "./pages/Activities"

import "./App.css"

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/farms"
                  element={
                    <PrivateRoute>
                      <Farms />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/farms/create"
                  element={
                    <PrivateRoute>
                      <CreateFarm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/schedules"
                  element={
                    <PrivateRoute>
                      <CropSchedules />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/schedules/create"
                  element={
                    <PrivateRoute>
                      <CreateSchedule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/advisory"
                  element={
                    <PrivateRoute>
                      <Advisory />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <PrivateRoute>
                      <Activities />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
