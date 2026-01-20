import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bankAccountsApi, businessesApi, BankAccount, Business } from '../../services/api';
import Button from '../../components/Button';
import './BankAccountView.scss';

const BankAccountView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBankAccount = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load all businesses and their bank accounts to find the one with matching ID
      const businessesList = await businessesApi.getBusinesses();
      
      let foundAccount: BankAccount | null = null;
      let foundBusiness: Business | null = null;

      for (const businessItem of businessesList) {
        try {
          const accounts = await bankAccountsApi.getBankAccounts(businessItem.id);
          const account = accounts.find(a => a.id === parseInt(id));
          if (account) {
            foundAccount = account;
            foundBusiness = businessItem;
            break;
          }
        } catch (err) {
          // Continue searching other businesses
          continue;
        }
      }

      if (foundAccount && foundBusiness) {
        setBankAccount(foundAccount);
        setBusiness(foundBusiness);
      } else {
        setError('Llogaria bankare nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i llogarisë bankare');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBankAccount();
  }, [loadBankAccount]);

  const handleEdit = () => {
    if (id) {
      navigate(`/bank-accounts/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!bankAccount || !business) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë llogari bankare? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await bankAccountsApi.deleteBankAccount(business.id, bankAccount.id);
      navigate('/bank-accounts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e llogarisë bankare');
    }
  };

  if (loading) {
    return (
      <div className="bank-account-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar llogaria bankare...</div>
        </div>
      </div>
    );
  }

  if (error && !bankAccount) {
    return (
      <div className="bank-account-view">
        <div className="container">
          <div className="error-message">
            {error}
            <Button onClick={() => navigate('/bank-accounts')} variant="secondary">
              Kthehu te Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!bankAccount) {
    return (
      <div className="bank-account-view">
        <div className="container">
          <div className="error-message">Llogaria bankare nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-account-view">
      <div className="container">
        <div className="bank-account-view-header">
          <Button onClick={() => navigate('/bank-accounts')} variant="secondary">
            ← Kthehu te Lista
          </Button>
          <div className="bank-account-view-actions">
            <Button onClick={handleEdit} variant="primary">
              Ndrysho
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Fshi
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="bank-account-view-content">
          <div className="bank-account-details">
            <div className="bank-account-details-header">
              <h2>Llogaria Bankare</h2>
              {business && (
                <div className="bank-account-business">
                  <strong>Subjekti:</strong> {business.business_name}
                </div>
              )}
            </div>

            <div className="bank-account-details-body">
              {bankAccount.bank_name && (
                <div className="detail-row">
                  <strong>Emri i bankës:</strong>
                  <span>{bankAccount.bank_name}</span>
                </div>
              )}

              {bankAccount.swift && (
                <div className="detail-row">
                  <strong>SWIFT:</strong>
                  <span>{bankAccount.swift}</span>
                </div>
              )}

              {bankAccount.iban && (
                <div className="detail-row">
                  <strong>IBAN:</strong>
                  <span>{bankAccount.iban}</span>
                </div>
              )}

              {bankAccount.bank_account_number && (
                <div className="detail-row">
                  <strong>Numri i llogarisë:</strong>
                  <span>{bankAccount.bank_account_number}</span>
                </div>
              )}

              {bankAccount.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(bankAccount.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountView;
