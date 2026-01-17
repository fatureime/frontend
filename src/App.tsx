import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/auth/LandingPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import EmailVerification from './pages/auth/EmailVerification'
import AcceptInvitation from './pages/auth/AcceptInvitation'
import ProtectedRoute from './components/ProtectedRoute'
import InvoicePage from './pages/invoices/InvoicePage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage'
import TenantsPage from './pages/tenants/TenantsPage'
import UsersPage from './pages/users/UsersPage'
import BusinessesPage from './pages/businesses/BusinessesPage'
import ArticlesPage from './pages/articles/ArticlesPage'
import BankAccountsPage from './pages/bank-accounts/BankAccountsPage'
import InvoiceStatusesPage from './pages/invoice-statuses/InvoiceStatusesPage'
import './styles/main.scss'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <Navbar />
            <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
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
            <Route
              path="/businesses/:businessId/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:businessId/invoices/create"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:businessId/invoices/new"
              element={
                <Navigate to="../create" replace />
              }
            />
            <Route
              path="/businesses/:businessId/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:businessId/invoices/:id/edit"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts"
              element={
                <ProtectedRoute>
                  <BankAccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice-statuses"
              element={
                <ProtectedRoute>
                  <InvoiceStatusesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
