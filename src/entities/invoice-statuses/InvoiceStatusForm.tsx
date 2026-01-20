import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import { getStatusLabel, setStatusLabel } from '../../utils/invoiceStatusLabels';
import Button from '../../components/Button';
import './InvoiceStatusForm.scss';

const InvoiceStatusForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;
  const isEditMode = !!id;

  const [status, setStatus] = useState<InvoiceStatus | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    label: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      setError(null);
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      const foundStatus = data.find(s => s.id === parseInt(id));
      if (foundStatus) {
        setStatus(foundStatus);
        setFormData({
          code: foundStatus.code,
          label: getStatusLabel(foundStatus.code),
        });
      } else {
        setError('Gjendja e faturës nuk u gjet');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i gjendjes së faturës');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }

    if (isEditMode) {
      loadStatus();
    }
  }, [user, isAdminTenant, isEditMode, navigate, loadStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.code.trim()) {
      setError('Kodi i gjendjes është i detyrueshëm');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && id && status) {
        await invoiceStatusesApi.updateInvoiceStatus(status.id, { code: formData.code.trim() });
        // Save label if provided
        if (formData.label.trim()) {
          setStatusLabel(formData.code.trim(), formData.label.trim());
        }
        navigate(`/invoice-statuses/${status.id}`);
      } else {
        const created = await invoiceStatusesApi.createInvoiceStatus({ code: formData.code.trim() });
        // Save label if provided
        if (formData.label.trim()) {
          setStatusLabel(formData.code.trim(), formData.label.trim());
        }
        navigate(`/invoice-statuses/${created.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || (isEditMode ? 'Dështoi përditësimi i gjendjes' : 'Dështoi krijimi i gjendjes'));
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

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/invoice-statuses/${id}`);
    } else {
      navigate('/invoice-statuses');
    }
  };

  // Scroll to top when error appears
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  if (!canEdit) {
    return (
      <div className="invoice-status-form">
        <div className="container">
          <div className="error-message">Ju nuk keni leje për të krijuar ose ndryshuar gjendje të faturave.</div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="invoice-status-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-status-form">
      <div className="container">
        <div className="invoice-status-form-header">
          <Button onClick={handleCancel} variant="secondary">
            ← Anulo
          </Button>
        </div>
        <h2>{isEditMode ? 'Ndrysho Gjendje' : 'Krijo Gjendje të Re'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="code">Kodi i Gjendjes *</label>
            <input
              id="code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              placeholder="p.sh. draft, sent, paid"
              className="form-input"
              required
            />
            <small className="form-hint">
              Kodi unik i gjendjes së faturës (p.sh. draft, sent, paid, overdue, cancelled)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="label">Etiketa (Shfaqja)</label>
            <input
              id="label"
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              disabled={loading}
              placeholder="p.sh. Draft, Dërguar, Paguar"
              className="form-input"
            />
            <small className="form-hint">
              Etiketa përdoret vetëm për shfaqje në frontend (opsionale)
            </small>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Gjendje')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Anulo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceStatusForm;
