import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import { Toaster } from 'react-hot-toast'
import { doc, setDoc, increment } from 'firebase/firestore'
import { db } from './config/firebase'

// Context & Auth
import { AuthProvider } from './context/AuthContext'
import { UIProvider, useUI } from './context/UIContext'
import { SettingsProvider } from './hooks/useSettings'
import ProtectedRoute from './components/ProtectedRoute'
import { Helmet } from 'react-helmet-async'
import siteSettings from './config/siteSettings'

// Shared Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScoreTicker from './components/ScoreTicker'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import MatchCardSkeleton from './components/MatchCardSkeleton'
import InstallPrompt from './components/InstallPrompt'
import MonetagAd from './components/MonetagAd'
import StickyFooterAd from './components/StickyFooterAd'
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
const DownloadPage = lazy(() => import('./pages/DownloadPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

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

  useEffect(() => {
    // Dynamically switch PWA manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute('href', siteSettings.isSportSpeed ? '/manifest-sportspeed.json?v=2' : '/manifest.json?v=2');
    }

    // Track standalone (installed) app opens
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isStandalone && !sessionStorage.getItem('standalone_tracked')) {
      sessionStorage.setItem('standalone_tracked', 'true');
      const statsRef = doc(db, 'stats', 'pwa');
      setDoc(statsRef, {
        standaloneOpens: increment(1),
        lastOpenedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("Error tracking open:", err));
    }
  }, []);

  return (
    <div className={`min-h-screen font-sans flex flex-col flex-1 transition-colors duration-500 ${isDarkMode ? 'dark bg-[#111] text-slate-50' : 'bg-[#ffffff] text-gray-00'}`}>
      <Helmet>
        <title>{siteSettings.seo.defaultTitle}</title>
        <meta name="description" content={siteSettings.seo.defaultDescription} />
        <meta name="keywords" content={siteSettings.seo.keywords} />
        <meta name="author" content={siteSettings.name} />
        <meta property="og:url" content={siteSettings.url} />
        <meta property="og:title" content={siteSettings.seo.defaultTitle} />
        <meta property="og:description" content={siteSettings.seo.defaultDescription} />
        <meta property="twitter:url" content={siteSettings.url} />
        <meta property="twitter:title" content={siteSettings.seo.defaultTitle} />
        <meta property="twitter:description" content={siteSettings.seo.defaultDescription} />
      </Helmet>
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
            <MonetagAd scriptUrl="https://nap5k.com/tag.min.js" zoneId="11172894" />
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
                    <Route path="/download" element={<DownloadPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/p/:pageId" element={<StaticPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            <InstallPrompt />
            <StickyFooterAd />
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
        <SettingsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" />
            <AppContent />
          </BrowserRouter>
        </SettingsProvider>
      </UIProvider>
    </AuthProvider>
  )
}

export default App
