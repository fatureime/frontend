import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bankAccountsApi, businessesApi, BankAccount, CreateBankAccountData, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './BankAccountForm.scss';

const BankAccountForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const isEditMode = !!id;

  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [formData, setFormData] = useState<CreateBankAccountData>({
    swift: '',
    iban: '',
    bank_account_number: '',
    bank_name: '',
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      if (data.length > 0 && !isEditMode) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    }
  }, [isEditMode]);

  const loadBankAccount = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
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
          continue;
        }
      }

      if (foundAccount && foundBusiness) {
        setBankAccount(foundAccount);
        setFormData({
          swift: foundAccount.swift || '',
          iban: foundAccount.iban || '',
          bank_account_number: foundAccount.bank_account_number || '',
          bank_name: foundAccount.bank_name || '',
        });
        setSelectedBusinessId(foundBusiness.id);
      } else {
        setError('Llogaria bankare nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i llogarisë bankare');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBusinesses();
    if (isEditMode) {
      loadBankAccount();
    }
  }, [isEditMode, loadBusinesses, loadBankAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate that at least one identifier is provided
    const swift = formData.swift?.trim() || '';
    const iban = formData.iban?.trim() || '';
    const bankAccountNumber = formData.bank_account_number?.trim() || '';

    if (!swift && !iban && !bankAccountNumber) {
      setError('Ju lutem plotësoni të paktën një nga fushat: SWIFT, IBAN, ose Numri i llogarisë');
      setLoading(false);
      return;
    }

    try {
      // Clean up empty strings to undefined
      const cleanedData: CreateBankAccountData = {
        swift: swift || undefined,
        iban: iban || undefined,
        bank_account_number: bankAccountNumber || undefined,
        bank_name: formData.bank_name?.trim() || undefined,
      };

      if (!selectedBusinessId) {
        setError('Ju lutem zgjidhni një subjekt');
        setLoading(false);
        return;
      }

      if (isEditMode && id && bankAccount) {
        await bankAccountsApi.updateBankAccount(selectedBusinessId, parseInt(id), cleanedData);
        navigate(`/bank-accounts/${id}`);
      } else {
        const created = await bankAccountsApi.createBankAccount(selectedBusinessId, cleanedData);
        navigate(`/bank-accounts/${created.id}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(errorMessage || (isEditMode ? 'Dështoi përditësimi i llogarisë bankare' : 'Dështoi krijimi i llogarisë bankare'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const currentBusiness = businesses.find(b => b.id === selectedBusinessId);

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/bank-accounts/${id}`);
    } else {
      navigate('/bank-accounts');
    }
  };

  if (initialLoading) {
    return (
      <div className="bank-account-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-account-form">
      <div className="container">
        <div className="bank-account-form-header">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Anulo
          </button>
        </div>
        <h2>{isEditMode ? 'Ndrysho Llogarinë Bankare' : 'Krijo Llogari Bankare'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        {businesses.length > 0 && (
          <div className="form-group">
            <label htmlFor="business">Subjekti *</label>
            {isAdminTenant ? (
              <select
                id="business"
                name="business"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(parseInt(e.target.value))}
                disabled={loading || isEditMode}
                className="form-select"
                required
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.business_name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="business"
                name="business"
                value={currentBusiness?.business_name || ''}
                disabled
                className="form-input-disabled"
                style={{ backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            )}
            <small className="form-hint">
              {isAdminTenant 
                ? 'Zgjidhni subjektin për të cilin dëshironi të krijoni llogarinë bankare' 
                : 'Subjekti aktual i hapësirëmarrësit tuaj'}
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="bank_name">Emri i bankës</label>
          <input
            type="text"
            id="bank_name"
            name="bank_name"
            value={formData.bank_name || ''}
            onChange={handleChange}
            disabled={loading}
            placeholder="P.sh. Raiffeisen Bank, ProCredit Bank"
          />
          <small className="form-hint">Emri i bankës (opsionale)</small>
        </div>

        <div className="form-group">
          <label htmlFor="swift">SWIFT / BIC</label>
          <input
            type="text"
            id="swift"
            name="swift"
            value={formData.swift || ''}
            onChange={handleChange}
            disabled={loading}
            placeholder="P.sh. RAIBAAL2X"
            maxLength={11}
            style={{ textTransform: 'uppercase' }}
          />
          <small className="form-hint">Kodi SWIFT/BIC (8-11 karaktere, opsionale)</small>
        </div>

        <div className="form-group">
          <label htmlFor="iban">IBAN</label>
          <input
            type="text"
            id="iban"
            name="iban"
            value={formData.iban || ''}
            onChange={handleChange}
            disabled={loading}
            placeholder="P.sh. AL47212110090000000235698741"
            maxLength={34}
            style={{ textTransform: 'uppercase' }}
          />
          <small className="form-hint">Numri IBAN (deri në 34 karaktere, opsionale)</small>
        </div>

        <div className="form-group">
          <label htmlFor="bank_account_number">Numri i llogarisë bankare</label>
          <input
            type="text"
            id="bank_account_number"
            name="bank_account_number"
            value={formData.bank_account_number || ''}
            onChange={handleChange}
            disabled={loading}
            placeholder="Numri lokal i llogarisë"
          />
          <small className="form-hint">Numri lokal i llogarisë bankare (opsionale)</small>
        </div>

        <div className="form-hint form-note">
          <strong>Shënim:</strong> Ju lutem plotësoni të paktën një nga fushat: SWIFT, IBAN, ose Numri i llogarisë.
        </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Llogari Bankare')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountForm;
