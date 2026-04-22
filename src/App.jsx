import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'
import { Toaster } from 'react-hot-toast'

// Context & Auth
import { AuthProvider } from './context/AuthContext'
import { UIProvider, useUI } from './context/UIContext'
import ProtectedRoute from './components/ProtectedRoute'

// Shared Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScoreTicker from './components/ScoreTicker'
import ScrollToTop from './components/ScrollToTop'
import SocialBarAd from './components/SocialBarAd'
import ErrorBoundary from './components/ErrorBoundary'
import MatchCardSkeleton from './components/MatchCardSkeleton'

// Lazy Pages
const Home = lazy(() => import('./pages/Home'))
const MatchPage = lazy(() => import('./pages/MatchPage'))
const LinkPage = lazy(() => import('./pages/LinkPage'))
const WatchPage = lazy(() => import('./pages/WatchPage'))
const AdGateway = lazy(() => import('./pages/AdGateway'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))
const StaticPage = lazy(() => import('./pages/StaticPage'))
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'))
const HighlightPlayerPage = lazy(() => import('./pages/HighlightPlayerPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin Lazy Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const DashboardLayout = lazy(() => import('./pages/admin/DashboardLayout'))
const MatchManager = lazy(() => import('./pages/admin/MatchManager'))
const MatchForm = lazy(() => import('./pages/admin/MatchForm'))
const ArticleManager = lazy(() => import('./pages/admin/ArticleManager'))
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'))
const HighlightsManager = lazy(() => import('./pages/admin/HighlightsManager'))
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'))

/**
 * Loading Fallback: Using a grid of skeletons for home or a generic spinner
 */
const PageLoader = () => (
  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map(i => <MatchCardSkeleton key={i} />)}
  </div>
)

function AppContent() {
  const { isDarkMode } = useUI()

  return (
    <div className={`min-h-screen font-sans flex flex-col flex-1 transition-colors duration-500 ${isDarkMode ? 'dark bg-[#111] text-slate-50' : 'bg-[#f8f9fa] text-gray-900'}`}>
      <Routes>
        {/* Admin Routes (No public Navbar/Footer) */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={<MatchManager />} />
          <Route path="dashboard" element={<MatchManager />} />
          <Route path="matches" element={<MatchManager />} />
          <Route path="matches/new" element={<MatchForm />} />
          <Route path="matches/edit/:id" element={<MatchForm />} />
          <Route path="articles" element={<ArticleManager />} />
          <Route path="articles/new" element={<ArticleForm />} />
          <Route path="articles/edit/:id" element={<ArticleForm />} />
          <Route path="settings" element={<SettingsManager />} />
        </Route>

        {/* Public App Layout */}
        <Route path="/*" element={
          <>
            <ScoreTicker />
            <SocialBarAd />
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 w-full flex flex-col">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/match/:id" element={<MatchPage />} />
                    <Route path="/link/:id" element={<LinkPage />} />
                    <Route path="/go/:matchId/:serverIndex" element={<AdGateway />} />
                    <Route path="/watch/:id/:serverIndex" element={<WatchPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:slug" element={<ArticlePage />} />
                    <Route path="/highlights" element={<HighlightsPage />} />
                    <Route path="/highlights/:slug" element={<HighlightPlayerPage />} />
                    <Route path="/admin/highlights" element={<HighlightsManager />} />
                    <Route path="/p/:pageId" element={<StaticPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="top-right" />
          <AppContent />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  )
}

export default App
