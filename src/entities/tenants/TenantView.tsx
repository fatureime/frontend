import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantsApi, Tenant } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './TenantView.scss';

const TenantView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdminTenant = user?.tenant?.is_admin === true;

  const loadTenant = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await tenantsApi.getTenants();
      const foundTenant = data.find(t => t.id === parseInt(id));
      if (foundTenant) {
        setTenant(foundTenant);
      } else {
        setError('Hapësirëmarrësi nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i hapësirëmarrësit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }
    loadTenant();
  }, [user, isAdminTenant, navigate, loadTenant]);

  const handleEdit = () => {
    if (id) {
      navigate(`/tenants/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !tenant) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë hapësirëmarrës? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await tenantsApi.deleteTenant(tenant.id);
      navigate('/tenants');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e hapësirëmarrësit');
    }
  };

  if (loading) {
    return (
      <div className="tenant-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar hapësirëmarrësi...</div>
        </div>
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="tenant-view">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={() => navigate('/tenants')} className="btn btn-secondary">
              Kthehu te Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="tenant-view">
        <div className="container">
          <div className="error-message">Hapësirëmarrësi nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-view">
      <div className="container">
        <div className="tenant-view-header">
          <button onClick={() => navigate('/tenants')} className="btn btn-secondary">
            ← Kthehu te Lista
          </button>
          <div className="tenant-view-actions">
            <button onClick={handleEdit} className="btn btn-primary">
              Ndrysho
            </button>
            {user?.tenant?.is_admin && (
              <button onClick={handleDelete} className="btn btn-danger">
                Fshi
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="tenant-view-content">
          <div className="tenant-details">
            <div className="tenant-details-header">
              <h2>{tenant.name}</h2>
              <div className="tenant-badges">
                {tenant.is_admin && <span className="badge admin">Menagjues</span>}
                {tenant.has_paid && <span className="badge paid">I Paguar</span>}
              </div>
            </div>

            <div className="tenant-details-body">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{tenant.id}</span>
              </div>

              {tenant.issuer_business && (
                <div className="detail-row">
                  <strong>Subjekti Lëshues:</strong>
                  <span>{tenant.issuer_business.business_name}</span>
                </div>
              )}

              {tenant.users && (
                <div className="detail-row">
                  <strong>Përdoruesit:</strong>
                  <span>{tenant.users.length}</span>
                </div>
              )}

              {tenant.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(tenant.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantView;
