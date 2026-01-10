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
      setError(err.response?.data?.error || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect if user is not part of an admin tenant
    if (user && !isAdminTenant) {
      navigate('/dashboard');
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
    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
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
      setError(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  // Show access denied if user is not part of an admin tenant
  if (user && !isAdminTenant) {
    return (
      <div className="tenants-page">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to access tenant management. Only users from admin tenants can view this page.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
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
          <div className="loading">Loading tenants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenants-page">
      <div className="container">
        <div className="tenants-header">
          <h1>Tenant Management</h1>
          {user?.tenant && (
            <div className="current-tenant-info">
              <span>Current Tenant: <strong>{user.tenant.name}</strong></span>
              {user.tenant.is_admin && <span className="badge admin">Admin</span>}
              {user.tenant.has_paid && <span className="badge paid">Paid</span>}
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
              <h2>Tenants</h2>
              {tenants.length === 0 ? (
                <p className="no-tenants">No tenants found.</p>
              ) : (
                <div className="tenant-cards">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="tenant-card">
                      <div className="tenant-card-header">
                        <h3>{tenant.name}</h3>
                        <div className="tenant-badges">
                          {tenant.is_admin && <span className="badge admin">Admin</span>}
                          {tenant.has_paid && <span className="badge paid">Paid</span>}
                        </div>
                      </div>
                      <div className="tenant-card-body">
                        <p><strong>ID:</strong> {tenant.id}</p>
                        {tenant.users && (
                          <p><strong>Users:</strong> {tenant.users.length}</p>
                        )}
                        {tenant.created_at && (
                          <p><strong>Created:</strong> {new Date(tenant.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="tenant-card-actions">
                        <button onClick={() => handleEdit(tenant)} className="btn btn-primary">
                          Edit
                        </button>
                        {user?.tenant?.is_admin && (
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="btn btn-danger"
                          >
                            Delete
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
