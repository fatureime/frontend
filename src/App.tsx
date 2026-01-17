import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './entities/auth/LandingPage'
import Login from './entities/auth/Login'
import Signup from './entities/auth/Signup'
import EmailVerification from './entities/auth/EmailVerification'
import AcceptInvitation from './entities/auth/AcceptInvitation'
import ProtectedRoute from './components/ProtectedRoute'
import InvoiceForm from './entities/invoices/InvoiceForm'
import InvoicePage from './entities/invoices/InvoicePage'
import InvoiceView from './entities/invoices/InvoiceView'
import TenantsPage from './entities/tenants/TenantsPage'
import TenantView from './entities/tenants/TenantView'
import TenantForm from './entities/tenants/TenantForm'
import UsersPage from './entities/users/UsersPage'
import UserView from './entities/users/UserView'
import UserForm from './entities/users/UserForm'
import InviteUserForm from './entities/users/InviteUserForm'
import BusinessesPage from './entities/businesses/BusinessesPage'
import BusinessView from './entities/businesses/BusinessView'
import BusinessForm from './entities/businesses/BusinessForm'
import ArticlesPage from './entities/articles/ArticlesPage'
import ArticleView from './entities/articles/ArticleView'
import ArticleForm from './entities/articles/ArticleForm'
import BankAccountsPage from './entities/bank-accounts/BankAccountsPage'
import BankAccountView from './entities/bank-accounts/BankAccountView'
import BankAccountForm from './entities/bank-accounts/BankAccountForm'
import InvoiceStatusesPage from './entities/invoice-statuses/InvoiceStatusesPage'
import InvoiceStatusView from './entities/invoice-statuses/InvoiceStatusView'
import InvoiceStatusForm from './entities/invoice-statuses/InvoiceStatusForm'
import TaxesPage from './entities/taxes/TaxesPage'
import TaxView from './entities/taxes/TaxView'
import TaxForm from './entities/taxes/TaxForm'
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
              path="/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/create"
              element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/:id"
              element={
                <ProtectedRoute>
                  <ArticleView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/:id/edit"
              element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/create"
              element={
                <ProtectedRoute>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <Navigate to="create" replace />
              }
            />
            <Route
              path="/invoices/:id/edit"
              element={
                <ProtectedRoute>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceView />
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
                  <InvoiceStatusForm />
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
                  <InvoiceStatusForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taxes"
              element={
                <ProtectedRoute>
                  <TaxesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taxes/create"
              element={
                <ProtectedRoute>
                  <TaxForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taxes/:id"
              element={
                <ProtectedRoute>
                  <TaxView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taxes/:id/edit"
              element={
                <ProtectedRoute>
                  <TaxForm />
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
