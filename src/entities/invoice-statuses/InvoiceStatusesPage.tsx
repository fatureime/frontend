import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import { getStatusLabels, getStatusLabel, setStatusLabel } from '../../utils/invoiceStatusLabels';
import InvoiceStatusesList from './InvoiceStatusesList';
import InvoiceStatusesGrid from './InvoiceStatusesGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './InvoiceStatusesPage.scss';

type ViewMode = 'list' | 'grid';

const InvoiceStatusesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('invoice-statuses-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;
  // Check if user is admin (for edit/create/delete)
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      setStatuses(data);
      // Load labels from localStorage
      const statusLabels = getStatusLabels();
      setLabels(statusLabels);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i gjendjeve të faturave');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set page title
    document.title = 'Gjendjet e Faturave - Fatureime';
    
    // Redirect if user is not part of an admin tenant
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }
    
    if (isAdminTenant) {
      loadStatuses();
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'Fatureime';
    };
  }, [user, isAdminTenant, navigate, loadStatuses]);

  const handleEdit = (status: InvoiceStatus) => {
    navigate(`/invoice-statuses/${status.id}/edit`);
  };

  const handleEditLabel = (status: InvoiceStatus) => {
    setSelectedStatus(status);
    setLabel(getStatusLabel(status.code));
    setIsEditingLabel(true);
  };

  const handleSaveLabel = () => {
    if (!selectedStatus || !label.trim()) {
      setError('Etiketa është e detyrueshme');
      return;
    }

    try {
      setError(null);
      setStatusLabel(selectedStatus.code, label.trim());
      loadStatuses();
      setIsEditingLabel(false);
      setSelectedStatus(null);
      setLabel('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ruajtja e etiketës');
    }
  };

  const handleCancelLabel = () => {
    setIsEditingLabel(false);
    setSelectedStatus(null);
    setLabel('');
    setError(null);
  };

  const handleView = (status: InvoiceStatus) => {
    navigate(`/invoice-statuses/${status.id}`);
  };

  const handleCreate = () => {
    navigate('/invoice-statuses/create');
  };

  const handleDelete = async (statusId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë gjendje? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoiceStatusesApi.deleteInvoiceStatus(statusId);
      await loadStatuses();
      if (selectedStatus?.id === statusId) {
        setSelectedStatus(null);
        setIsEditingLabel(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi fshirja e gjendjes');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('invoice-statuses-view-mode', mode);
  };

  // Show access denied if user is not part of an admin tenant
  if (user && !isAdminTenant) {
    return (
      <div className="invoice-statuses-page">
        <div className="container">
          <div className="access-denied">
            <h2>Qasja e Refuzuar</h2>
            <p>Ju nuk keni leje për të qasur menaxhimin e gjendjeve të faturave. Vetëm përdoruesit nga hapësirëmarrësit menagjues mund ta shohin këtë faqe.</p>
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
      <div className="invoice-statuses-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar gjendje të faturave...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-statuses-page">
      <div className="container">
        {!isEditingLabel && (
          <div className="invoice-statuses-header">
            <div className="header-actions">
              <button onClick={handleCreate} className="btn btn-primary">
                Krijo Gjendje të Re
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
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isEditingLabel && selectedStatus ? (
          <div className="invoice-status-form">
            <h3>Ndrysho Etiketën për "{selectedStatus.code}"</h3>
            <div className="form-group">
              <label htmlFor="label-edit">Etiketa:</label>
              <input
                id="label-edit"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="p.sh. Draft, Dërguar, Paguar"
                className="form-input"
              />
              <small className="form-help">Etiketa përdoret vetëm për shfaqje në frontend</small>
            </div>
            <div className="form-actions">
              <button onClick={handleSaveLabel} className="btn btn-primary">
                Ruaj Etiketën
              </button>
              <button onClick={handleCancelLabel} className="btn btn-secondary">
                Anulo
              </button>
            </div>
          </div>
        ) : (
          <div className="invoice-statuses-content">
            {viewMode === 'list' ? (
              <InvoiceStatusesList
                statuses={statuses}
                loading={loading}
                error={null}
                onView={handleView}
                onEdit={handleEdit}
                onEditLabel={handleEditLabel}
                onDelete={handleDelete}
                canEdit={canEdit}
                labels={labels}
              />
            ) : (
              <InvoiceStatusesGrid
                statuses={statuses}
                loading={loading}
                error={null}
                onView={handleView}
                onEdit={handleEdit}
                onEditLabel={handleEditLabel}
                onDelete={handleDelete}
                canEdit={canEdit}
                labels={labels}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceStatusesPage;
