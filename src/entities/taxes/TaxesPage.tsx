import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taxesApi, Tax } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import TaxesList from './TaxesList';
import TaxesGrid from './TaxesGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './TaxesPage.scss';

type ViewMode = 'list' | 'grid';

const TaxesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('taxes-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;
  // Check if user is admin (for edit/create/delete)
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;

  const loadTaxes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxesApi.getTaxes();
      setTaxes(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i taksave');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set page title
    document.title = 'Taksat - Fatureime';
    
    loadTaxes();

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'Fatureime';
    };
  }, [loadTaxes]);

  const handleView = (tax: Tax) => {
    navigate(`/taxes/${tax.id}`);
  };

  const handleEdit = (tax: Tax) => {
    navigate(`/taxes/${tax.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/taxes/create');
  };

  const handleDelete = async (taxId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë takse? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await taxesApi.deleteTax(taxId);
      await loadTaxes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi fshirja e taksës');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('taxes-view-mode', mode);
  };

  return (
    <div className="taxes-page">
      <div className="container">
        <div className="taxes-header">
          <div className="header-actions">
            {canEdit && (
              <button onClick={handleCreate} className="btn btn-primary">
                Krijo Takse të Re
              </button>
            )}
          </div>
          <div className="view-toggle">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Lista"
            >
              <ViewListIcon />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Tabelë"
            >
              <GridViewIcon />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="taxes-content">
          {viewMode === 'list' ? (
            <TaxesList
              taxes={taxes}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
            />
          ) : (
            <TaxesGrid
              taxes={taxes}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxesPage;
