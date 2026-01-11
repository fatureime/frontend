import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import EmailVerification from './components/EmailVerification'
import AcceptInvitation from './components/AcceptInvitation'
import ProtectedRoute from './components/ProtectedRoute'
import InvoicePage from './components/InvoicePage'
import TenantsPage from './components/TenantsPage'
import UsersPage from './components/UsersPage'
import BusinessesPage from './components/BusinessesPage'
import ArticlesPage from './components/ArticlesPage'
import './styles/main.scss'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants"
              element={
                <ProtectedRoute>
                  <TenantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses"
              element={
                <ProtectedRoute>
                  <BusinessesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:businessId/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
