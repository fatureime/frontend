import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankAccountsApi, businessesApi, BankAccount, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import BankAccountsList from './BankAccountsList';
import BankAccountsGrid from './BankAccountsGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './BankAccountsPage.scss';

type ViewMode = 'list' | 'grid';

interface BankAccountWithBusiness extends BankAccount {
  business?: Business;
}

const BankAccountsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const [bankAccounts, setBankAccounts] = useState<BankAccountWithBusiness[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('bank-accounts-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
      return [];
    }
  }, []);

  const loadBankAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load businesses first
      const businessesList = await loadBusinesses();
      
      if (businessesList.length === 0) {
        setBankAccounts([]);
        setLoading(false);
        return;
      }

      // For normal tenants, only load bank accounts for their tenant's business
      let businessesToLoad = businessesList;
      if (!isAdminTenant && user?.tenant?.issuer_business_id) {
        const tenantBusiness = businessesList.find(b => b.id === user.tenant.issuer_business_id);
        if (tenantBusiness) {
          businessesToLoad = [tenantBusiness];
        } else {
          // If tenant business not found, show empty list
          setBankAccounts([]);
          setLoading(false);
          return;
        }
      }

      // Load bank accounts for selected businesses
      const allBankAccounts: BankAccountWithBusiness[] = [];
      
      for (const business of businessesToLoad) {
        try {
          const accounts = await bankAccountsApi.getBankAccounts(business.id);
          const accountsWithBusiness = accounts.map(account => ({
            ...account,
            business: business
          }));
          allBankAccounts.push(...accountsWithBusiness);
        } catch (err: any) {
          // Continue loading other businesses even if one fails
          console.error(`Failed to load bank accounts for business ${business.id}:`, err);
        }
      }

      // Sort by business name, then by created date
      allBankAccounts.sort((a, b) => {
        const businessCompare = (a.business?.business_name || '').localeCompare(b.business?.business_name || '');
        if (businessCompare !== 0) return businessCompare;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setBankAccounts(allBankAccounts);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i llogarive bankare');
    } finally {
      setLoading(false);
    }
  }, [loadBusinesses, isAdminTenant, user]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const handleCreate = () => {
    navigate('/bank-accounts/create');
  };

  const handleView = (bankAccount: BankAccountWithBusiness) => {
    navigate(`/bank-accounts/${bankAccount.id}`);
  };

  const handleEdit = (bankAccount: BankAccountWithBusiness) => {
    navigate(`/bank-accounts/${bankAccount.id}/edit`);
  };

  const handleDelete = async (bankAccount: BankAccountWithBusiness) => {
    if (!bankAccount.business_id) {
      setError('Llogaria bankare nuk ka subjekt të lidhur');
      return;
    }

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë llogari bankare? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await bankAccountsApi.deleteBankAccount(bankAccount.business_id, bankAccount.id);
      await loadBankAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e llogarisë bankare');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('bank-accounts-view-mode', mode);
  };

  const handleToggleView = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    handleViewModeChange(newMode);
  };

  if (loading && bankAccounts.length === 0) {
    return (
      <div className="bank-accounts-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar llogaritë bankare...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-accounts-page">
      <div className="container">
        <div className="bank-accounts-header">
          <div className="header-actions">
            {businesses.length > 0 && (
              <button onClick={handleCreate} className="btn btn-primary">
                Krijo Llogari Bankare
              </button>
            )}
          </div>
          <div className="view-toggle">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Lista"
            >
              <ViewListIcon />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Tabelë"
            >
              <GridViewIcon />
            </button>
            <button
              onClick={handleToggleView}
              className="toggle-btn toggle-btn-mobile"
              title={viewMode === 'list' ? 'Shfaq tabelë' : 'Shfaq listë'}
            >
              {viewMode === 'list' ? <GridViewIcon /> : <ViewListIcon />}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="bank-accounts-content">
          {viewMode === 'list' ? (
            <BankAccountsList
              bankAccounts={bankAccounts}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <BankAccountsGrid
              bankAccounts={bankAccounts}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdminTenant={isAdminTenant}
              businessesCount={businesses.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountsPage;
