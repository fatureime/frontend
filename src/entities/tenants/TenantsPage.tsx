import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsApi, Tenant } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import TenantsList from './TenantsList';
import TenantsGrid from './TenantsGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './TenantsPage.scss';

type ViewMode = 'list' | 'grid';

const TenantsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('tenants-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantsApi.getTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i hapësirëmarrësve');
    } finally {
      setLoading(false);
    }
  }, []);

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


  const handleCreate = () => {
    navigate('/tenants/create');
  };

  const handleView = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const handleEdit = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}/edit`);
  };

  const handleDelete = async (tenantId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë hapësirëmarrës? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await tenantsApi.deleteTenant(tenantId);
      await loadTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e hapësirëmarrësit');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('tenants-view-mode', mode);
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

  if (loading && tenants.length === 0) {
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
          <div className="header-actions">
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Hapësirëmarrës
            </button>
          </div>
          <div className="view-toggle">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Lista"
            >
              <GridViewIcon />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Tabelë"
            >
              <ViewListIcon />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="tenants-content">
          {viewMode === 'list' ? (
            <TenantsList
              tenants={tenants}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canDelete={user?.tenant?.is_admin === true}
            />
          ) : (
            <TenantsGrid
              tenants={tenants}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canDelete={user?.tenant?.is_admin === true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantsPage;
