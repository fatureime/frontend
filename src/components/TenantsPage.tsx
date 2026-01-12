import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsApi, Tenant } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import TenantForm from './TenantForm';
import './TenantsPage.scss';

const TenantsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantsApi.getTenants();
      setTenants(data);
      // If user has a tenant, select it by default
      if (user?.tenant && data.length > 0) {
        const userTenant = data.find(t => t.id === user.tenant?.id);
        if (userTenant) {
          setSelectedTenant(userTenant);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i hapësirëmarrësve');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect if user is not part of an admin tenant
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }
    
    if (isAdminTenant) {
      loadTenants();
    }
  }, [user, isAdminTenant, navigate, loadTenants]);


  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await loadTenants();
    setIsEditing(false);
    setSelectedTenant(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedTenant(null);
  };

  const handleDelete = async (tenantId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë hapësirëmarrës? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await tenantsApi.deleteTenant(tenantId);
      await loadTenants();
      if (selectedTenant?.id === tenantId) {
        setSelectedTenant(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e hapësirëmarrësit');
    }
  };

  // Show access denied if user is not part of an admin tenant
  if (user && !isAdminTenant) {
    return (
      <div className="tenants-page">
        <div className="container">
          <div className="access-denied">
            <h2>Qasja e Refuzuar</h2>
            <p>Ju nuk keni leje për të qasur menaxhimin e hapësirëmarrësve. Vetëm përdoruesit nga hapësirëmarrësit menagjues mund ta shohin këtë faqe.</p>
            <button onClick={() => navigate('/businesses')} className="btn btn-primary">
              Shko te Subjektet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tenants-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar hapësirëmarrësit...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenants-page">
      <div className="container">
        <div className="tenants-header">
          <h1>Menaxhimi i Hapësirëmarrësve</h1>
          {user?.tenant && (
            <div className="current-tenant-info">
              <span>Hapësirëmarrësi Aktual: <strong>{user.tenant.name}</strong></span>
              {user.tenant.is_admin && <span className="badge admin">Menagjues</span>}
              {user.tenant.has_paid && <span className="badge paid">Ka Paguar</span>}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isEditing && selectedTenant ? (
          <TenantForm
            tenant={selectedTenant}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="tenants-content">
            <div className="tenants-list">
              <h2>Hapësirëmarrësit</h2>
              {tenants.length === 0 ? (
                <p className="no-tenants">Nuk u gjetën hapësirëmarrës.</p>
              ) : (
                <div className="tenant-cards">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="tenant-card">
                      <div className="tenant-card-header">
                        <h3>{tenant.name}</h3>
                        <div className="tenant-badges">
                          {tenant.is_admin && <span className="badge admin">Menagjues</span>}
                          {tenant.has_paid && <span className="badge paid">I Paguar</span>}
                        </div>
                      </div>
                      <div className="tenant-card-body">
                        <p><strong>ID:</strong> {tenant.id}</p>
                        {tenant.issuer_business && (
                          <p><strong>Subjekti Lëshues:</strong> {tenant.issuer_business.business_name}</p>
                        )}
                        {tenant.users && (
                          <p><strong>Përdoruesit:</strong> {tenant.users.length}</p>
                        )}
                        {tenant.created_at && (
                          <p><strong>Krijuar:</strong> {new Date(tenant.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="tenant-card-actions">
                        <button onClick={() => handleEdit(tenant)} className="btn btn-primary">
                          Ndrysho
                        </button>
                        {user?.tenant?.is_admin && (
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="btn btn-danger"
                          >
                            Fshi
                          </button>
                        )}
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

export default TenantsPage;
