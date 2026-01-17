import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taxesApi, Tax } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './TaxesPage.scss';

const TaxView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tax, setTax] = useState<Tax | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;
  // Check if user is admin (for edit/delete)
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;

  const loadTax = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await taxesApi.getTax(parseInt(id));
      setTax(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i taksës');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTax();
  }, [loadTax]);

  const handleEdit = () => {
    if (id) {
      navigate(`/taxes/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!tax || !id) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë takse? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await taxesApi.deleteTax(tax.id);
      navigate('/taxes');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi fshirja e taksës');
    }
  };

  const formatRate = (rate: string | null): string => {
    if (rate === null) return 'E përjashtuar';
    return `${rate}%`;
  };

  if (loading) {
    return (
      <div className="tax-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar takse...</div>
        </div>
      </div>
    );
  }

  if (error && !tax) {
    return (
      <div className="tax-view">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={() => navigate('/taxes')} className="btn btn-secondary">
              Kthehu te Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tax) {
    return (
      <div className="tax-view">
        <div className="container">
          <div className="error-message">Taksa nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tax-view">
      <div className="container">
        <div className="tax-view-header">
          <button onClick={() => navigate('/taxes')} className="btn btn-secondary">
            ← Kthehu te Lista
          </button>
          {canEdit && (
            <div className="tax-view-actions">
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

        <div className="tax-view-content">
          <div className="tax-details">
            <div className="tax-details-header">
              <h2>Taksa</h2>
            </div>

            <div className="tax-details-body">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{tax.id}</span>
              </div>

              <div className="detail-row">
                <strong>Norma:</strong>
                <span>{formatRate(tax.rate)}</span>
              </div>

              {tax.name && (
                <div className="detail-row">
                  <strong>Emri:</strong>
                  <span>{tax.name}</span>
                </div>
              )}

              {tax.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(tax.created_at).toLocaleDateString()}</span>
                </div>
              )}

              {tax.updated_at && (
                <div className="detail-row">
                  <strong>Përditësuar:</strong>
                  <span>{new Date(tax.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxView;
