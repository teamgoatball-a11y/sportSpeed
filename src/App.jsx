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
import NewsPage from './pages/NewsPage'
import ArticlePage from './pages/ArticlePage'
import StaticPage from './pages/StaticPage'
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
import ArticleManager from './pages/admin/ArticleManager'
import ArticleForm from './pages/admin/ArticleForm'
import ScrollToTop from './components/ScrollToTop'
import SocialBarAd from './components/SocialBarAd'
import PopUnderAd from './components/PopUnderAd'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false) // Specer is Light-first

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" />
        {/* Specer pure white background base */}
        <div className={`min-h-screen font-sans flex flex-col flex-1 transition-colors duration-500 ${isDarkMode ? 'dark bg-[#111] text-slate-50' : 'bg-[#f8f9fa] text-gray-900'}`}>
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
              <Route path="articles" element={<ArticleManager />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="articles/edit/:id" element={<ArticleForm />} />
            </Route>

            {/* Public App Layout */}
            <Route path="/*" element={
              <>
                <SocialBarAd />
                {/* <PopUnderAd /> */}
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
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:slug" element={<ArticlePage />} />
                    <Route path="/p/:pageId" element={<StaticPage />} />
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
