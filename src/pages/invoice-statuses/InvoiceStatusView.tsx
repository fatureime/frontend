import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import { getStatusLabel } from '../../utils/invoiceStatusLabels';
import './InvoiceStatusView.scss';

const InvoiceStatusView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<InvoiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdminTenant = user?.tenant?.is_admin === true;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;

  const loadStatus = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      const foundStatus = data.find(s => s.id === parseInt(id));
      if (foundStatus) {
        setStatus(foundStatus);
      } else {
        setError('Gjendja e faturës nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i gjendjes së faturës');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }
    loadStatus();
  }, [user, isAdminTenant, navigate, loadStatus]);

  const handleEdit = () => {
    if (id) {
      navigate(`/invoice-statuses/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !status) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë gjendje? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoiceStatusesApi.deleteInvoiceStatus(status.id);
      navigate('/invoice-statuses');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e gjendjes');
    }
  };

  if (loading) {
    return (
      <div className="invoice-status-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar gjendja e faturës...</div>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="invoice-status-view">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={() => navigate('/invoice-statuses')} className="btn btn-secondary">
              Kthehu te Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="invoice-status-view">
        <div className="container">
          <div className="error-message">Gjendja e faturës nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-status-view">
      <div className="container">
        <div className="invoice-status-view-header">
          <button onClick={() => navigate('/invoice-statuses')} className="btn btn-secondary">
            ← Kthehu te Lista
          </button>
          {canEdit && (
            <div className="invoice-status-view-actions">
              <button onClick={handleEdit} className="btn btn-primary">
                Ndrysho
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Fshi
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="invoice-status-view-content">
          <div className="invoice-status-details">
            <div className="invoice-status-details-header">
              <h2>Gjendja e Faturës</h2>
            </div>

            <div className="invoice-status-details-body">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{status.id}</span>
              </div>

              <div className="detail-row">
                <strong>Kodi:</strong>
                <span><strong>{status.code}</strong></span>
              </div>

              <div className="detail-row">
                <strong>Etiketa:</strong>
                <span>{getStatusLabel(status.code)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatusView;
