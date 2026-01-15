import { useState, useEffect, useCallback } from 'react';
import { bankAccountsApi, businessesApi, BankAccount, Business } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import BankAccountForm from './BankAccountForm';
import './BankAccountsPage.scss';

interface BankAccountWithBusiness extends BankAccount {
  business?: Business;
}

const BankAccountsPage = () => {
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const [bankAccounts, setBankAccounts] = useState<BankAccountWithBusiness[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccountWithBusiness | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Load bank accounts for all businesses
      const allBankAccounts: BankAccountWithBusiness[] = [];
      
      for (const business of businessesList) {
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
  }, [loadBusinesses]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const handleCreate = () => {
    setSelectedBankAccount(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (bankAccount: BankAccountWithBusiness) => {
    setSelectedBankAccount(bankAccount);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    await loadBankAccounts();
    setIsEditing(false);
    setIsCreating(false);
    setSelectedBankAccount(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedBankAccount(null);
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
      if (selectedBankAccount?.id === bankAccount.id) {
        setSelectedBankAccount(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e llogarisë bankare');
    }
  };

  if (loading) {
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
          <h1>Menaxhimi i Llogarive Bankare</h1>
          {businesses.length > 0 && (
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Llogari Bankare
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {(isEditing || isCreating) ? (
          <BankAccountForm
            bankAccount={selectedBankAccount || null}
            businesses={businesses}
            isAdminTenant={isAdminTenant}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="bank-accounts-content">
            <div className="bank-accounts-list">
              <h2>Llogaritë Bankare</h2>
              {bankAccounts.length === 0 ? (
                <p className="no-bank-accounts">
                  {businesses.length === 0 
                    ? 'Nuk u gjetën subjekte. Ju lutem krijoni një subjekt fillimisht.'
                    : 'Nuk u gjetën llogari bankare. Klikoni "Krijo Llogari Bankare" për të shtuar një të re.'}
                </p>
              ) : (
                <div className="bank-account-cards">
                  {bankAccounts.map((bankAccount) => (
                    <div key={`${bankAccount.business_id}-${bankAccount.id}`} className="bank-account-card">
                      <div className="bank-account-card-header">
                        <h3>
                          {bankAccount.business?.business_name || `Subjekti #${bankAccount.business_id}`}
                        </h3>
                        {isAdminTenant && bankAccount.business && (
                          <span className="badge business-badge">
                            {bankAccount.business.business_name}
                          </span>
                        )}
                      </div>
                      <div className="bank-account-card-body">
                        {bankAccount.bank_name && (
                          <p><strong>Emri i bankës:</strong> {bankAccount.bank_name}</p>
                        )}
                        {bankAccount.swift && (
                          <p><strong>SWIFT:</strong> {bankAccount.swift}</p>
                        )}
                        {bankAccount.iban && (
                          <p><strong>IBAN:</strong> {bankAccount.iban}</p>
                        )}
                        {bankAccount.bank_account_number && (
                          <p><strong>Numri i llogarisë:</strong> {bankAccount.bank_account_number}</p>
                        )}
                        {bankAccount.created_at && (
                          <p><strong>Krijuar:</strong> {new Date(bankAccount.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="bank-account-card-actions">
                        <button 
                          onClick={() => handleEdit(bankAccount)} 
                          className="btn btn-primary"
                        >
                          Ndrysho
                        </button>
                        <button
                          onClick={() => handleDelete(bankAccount)}
                          className="btn btn-danger"
                        >
                          Fshi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccountsPage;
