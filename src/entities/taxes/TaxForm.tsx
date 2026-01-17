import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taxesApi, Tax } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './TaxesPage.scss';

const TaxForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;
  const isEditMode = !!id;

  const [tax, setTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState({
    rate: '' as string | null,
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const loadTax = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      setError(null);
      const data = await taxesApi.getTax(parseInt(id));
      setTax(data);
      setFormData({
        rate: data.rate === null ? 'null' : data.rate,
        name: data.name || '',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i taksës');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!canEdit) {
      navigate('/taxes');
      return;
    }

    if (isEditMode) {
      loadTax();
    }
  }, [isEditMode, canEdit, navigate, loadTax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate rate
    let rateValue: number | null = null;
    if (formData.rate === 'null' || formData.rate === '') {
      rateValue = null;
    } else {
      const parsedRate = parseFloat(formData.rate);
      if (isNaN(parsedRate)) {
        setError('Norma e taksës duhet të jetë një numër i vlefshëm');
        setLoading(false);
        return;
      }
      if (parsedRate < 0) {
        setError('Norma e taksës nuk mund të jetë negative');
        setLoading(false);
        return;
      }
      rateValue = parsedRate;
    }

    try {
      const submitData: { rate: number | null; name?: string } = {
        rate: rateValue,
      };

      if (formData.name.trim()) {
        submitData.name = formData.name.trim();
      }

      if (isEditMode && id) {
        await taxesApi.updateTax(parseInt(id), submitData);
        navigate(`/taxes/${id}`);
      } else {
        const created = await taxesApi.createTax(submitData);
        navigate(`/taxes/${created.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || (isEditMode ? 'Dështoi përditësimi i taksës' : 'Dështoi krijimi i taksës'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/taxes/${id}`);
    } else {
      navigate('/taxes');
    }
  };

  if (!canEdit) {
    return (
      <div className="tax-form">
        <div className="container">
          <div className="error-message">Ju nuk keni leje për të krijuar ose ndryshuar taksa.</div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="tax-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tax-form">
      <div className="container">
        <div className="tax-form-header">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Anulo
          </button>
        </div>
        <h2>{isEditMode ? 'Ndrysho Takse' : 'Krijo Takse të Re'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="rate">Norma e Taksës (%)</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate === 'null' ? '' : formData.rate}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  rate: value === '' ? 'null' : value
                }));
              }}
              disabled={loading}
              className="form-input"
              placeholder="P.sh. 0, 8, 19, 20.5"
              min="0"
              step="0.01"
            />
            <small className="form-hint">
              Shkruani normën e taksës si përqindje (p.sh. 0, 8, 19, 20.5). Lëreni bosh për taksë të përjashtuar.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Emri</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="P.sh. Taksa e Shtuar 19%, Taksa e Përjashtuar"
              className="form-input"
            />
            <small className="form-hint">
              Emri i taksës (opsionale). Nëse nuk specifikohet, do të krijohet automatikisht.
            </small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Takse')}
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

export default TaxForm;
