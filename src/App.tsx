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
import TenantView from './pages/tenants/TenantView'
import TenantForm from './pages/tenants/TenantForm'
import UsersPage from './pages/users/UsersPage'
import UserView from './pages/users/UserView'
import UserForm from './pages/users/UserForm'
import InviteUserForm from './pages/users/InviteUserForm'
import BusinessesPage from './pages/businesses/BusinessesPage'
import BusinessView from './pages/businesses/BusinessView'
import BusinessForm from './pages/businesses/BusinessForm'
import ArticlesPage from './pages/articles/ArticlesPage'
import ArticleView from './pages/articles/ArticleView'
import ArticleForm from './pages/articles/ArticleForm'
import BankAccountsPage from './pages/bank-accounts/BankAccountsPage'
import BankAccountView from './pages/bank-accounts/BankAccountView'
import BankAccountForm from './pages/bank-accounts/BankAccountForm'
import InvoiceStatusesPage from './pages/invoice-statuses/InvoiceStatusesPage'
import InvoiceStatusView from './pages/invoice-statuses/InvoiceStatusView'
import './styles/main.scss'
import './App.scss'

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
            <div className="App__navbar">
              <Navbar />
            </div>
            <div className="App__content">
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
              path="/tenants/create"
              element={
                <ProtectedRoute>
                  <TenantForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants/:id"
              element={
                <ProtectedRoute>
                  <TenantView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants/:id/edit"
              element={
                <ProtectedRoute>
                  <TenantForm />
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
              path="/users/create"
              element={
                <ProtectedRoute>
                  <InviteUserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <UserView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute>
                  <UserForm />
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
              path="/businesses/create"
              element={
                <ProtectedRoute>
                  <BusinessForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:id"
              element={
                <ProtectedRoute>
                  <BusinessView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/:id/edit"
              element={
                <ProtectedRoute>
                  <BusinessForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/articles/create"
              element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/articles/:id"
              element={
                <ProtectedRoute>
                  <ArticleView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/articles/:id/edit"
              element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/invoices/create"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/invoices/new"
              element={
                <Navigate to="create" replace />
              }
            />
            <Route
              path="/businesses/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses/invoices/:id/edit"
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
              path="/bank-accounts/create"
              element={
                <ProtectedRoute>
                  <BankAccountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts/:id"
              element={
                <ProtectedRoute>
                  <BankAccountView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts/:id/edit"
              element={
                <ProtectedRoute>
                  <BankAccountForm />
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
            <Route
              path="/invoice-statuses/create"
              element={
                <ProtectedRoute>
                  <InvoiceStatusesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice-statuses/:id"
              element={
                <ProtectedRoute>
                  <InvoiceStatusView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice-statuses/:id/edit"
              element={
                <ProtectedRoute>
                  <InvoiceStatusesPage />
                </ProtectedRoute>
              }
            />
              </Routes>
            </div>
          </div>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
