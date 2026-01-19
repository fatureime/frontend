import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import BusinessesList from './BusinessesList';
import BusinessesGrid from './BusinessesGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './BusinessesPage.scss';

type ViewMode = 'list' | 'grid';

const BusinessesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('businesses-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleCreate = () => {
    navigate('/businesses/create');
  };

  const handleView = (business: Business) => {
    navigate(`/businesses/${business.id}`);
  };

  const handleEdit = (business: Business) => {
    navigate(`/businesses/${business.id}/edit`);
  };

  const handleDelete = async (businessId: number) => {
    // Check if this is the issuer business
    if (user?.tenant?.issuer_business_id === businessId) {
      setError('Nuk mund të fshihet subjekti emetues. Ky subjekt përdoret për krijimin e faturave.');
      return;
    }

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë subjekt? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await businessesApi.deleteBusiness(businessId);
      await loadBusinesses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e biznesit');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('businesses-view-mode', mode);
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="businesses-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar subjektet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="businesses-page">
      <div className="container">
        <div className="businesses-header">
          <div className="header-actions">
          <button onClick={handleCreate} className="btn btn-primary">
            Krijo Subjekt
          </button>
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

        <div className="businesses-content">
          {viewMode === 'list' ? (
            <BusinessesList
              businesses={businesses}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              issuerBusinessId={user?.tenant?.issuer_business_id}
            />
          ) : (
            <BusinessesGrid
              businesses={businesses}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              issuerBusinessId={user?.tenant?.issuer_business_id}
            />
            )}
        </div>
      </div>
    </div>
  );
};

export default BusinessesPage;
