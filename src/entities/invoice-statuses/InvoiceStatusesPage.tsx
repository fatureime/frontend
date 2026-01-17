import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import { getStatusLabels, getStatusLabel, setStatusLabel } from '../../utils/invoiceStatusLabels';
import './InvoiceStatusesPage.scss';

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
        setIsEditing(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi fshirja e gjendjes');
    }
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
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Gjendje të Re
            </button>
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
            {statuses.length === 0 ? (
              <p className="no-statuses">Nuk u gjetën gjendje të faturave.</p>
            ) : (
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={statuses}
                  columns={[
                    {
                      field: 'id',
                      headerName: 'ID',
                      width: 80,
                    },
                    {
                      field: 'code',
                      headerName: 'Kodi',
                      width: 200,
                      renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                        <strong>{params.value}</strong>
                      ),
                    },
                    {
                      field: 'label',
                      headerName: 'Etiketa',
                      width: 250,
                      valueGetter: (_value: unknown, row: InvoiceStatus) => 
                        labels[row.code] || getStatusLabel(row.code),
                      flex: 1,
                    },
                    {
                      field: 'view',
                      headerName: 'Shiko',
                      width: 100,
                      sortable: false,
                      filterable: false,
                      renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleView(params.row)}
                          sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                        >
                          Shiko
                        </Button>
                      ),
                    },
                    ...(canEdit ? [{
                      field: 'actions',
                      headerName: 'Veprimet',
                      width: 400,
                      sortable: false,
                      filterable: false,
                      renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEdit(params.row)}
                            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                          >
                            Ndrysho Kod
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditLabel(params.row)}
                            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                          >
                            Ndrysho Etiketë
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                            sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                          >
                            Fshi
                          </Button>
                        </Box>
                      ),
                    }] : []),
                  ]}
                  getRowId={(row: InvoiceStatus) => row.id}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 25 },
                    },
                  }}
                  loading={loading}
                />
              </Box>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceStatusesPage;
