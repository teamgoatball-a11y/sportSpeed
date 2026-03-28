import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/Home'
import MatchPage from './pages/MatchPage'
import LinkPage from './pages/LinkPage'
import WatchPage from './pages/WatchPage'
import AdGateway from './pages/AdGateway'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

// Admin / Auth Imports
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/admin/AdminLogin'
import DashboardLayout from './pages/admin/DashboardLayout'
import MatchManager from './pages/admin/MatchManager'
import MatchForm from './pages/admin/MatchForm'
import ScrollToTop from './components/ScrollToTop'
import SocialBarAd from './components/SocialBarAd'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <SocialBarAd />
        <ScrollToTop />
        <Toaster position="top-right" />
        {/* Root wrapper handles dark class and global bg/text colors */}
        <div className={`min-h-screen font-sans flex flex-col flex-1 transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-gray-50 text-gray-900'}`}>
          <Routes>
            {/* Admin Routes (No public Navbar/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Redirect /admin to dashboard */}
              <Route index element={<MatchManager />} />
              <Route path="dashboard" element={<MatchManager />} />
              <Route path="matches" element={<MatchManager />} />
              <Route path="matches/new" element={<MatchForm />} />
              <Route path="matches/edit/:id" element={<MatchForm />} />
            </Route>

            {/* Public App Layout */}
            <Route path="/*" element={
              <>
                <Navbar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 w-full flex flex-col">
                  <Routes>
                    <Route path="/" element={<Home searchQuery={searchQuery} />} />
                    <Route path="/match/:id" element={<MatchPage />} />
                    <Route path="/link/:id" element={<LinkPage />} />
                    <Route path="/go/:matchId/:serverIndex" element={<AdGateway />} />
                    <Route path="/watch/:id/:serverIndex" element={<WatchPage />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
