import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { taxesApi, Tax } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './TaxesPage.scss';

const TaxesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatRate = (rate: string | null): string => {
    if (rate === null) return 'E përjashtuar';
    return `${rate}%`;
  };

  return (
    <div className="taxes-page">
      <div className="container">
        {canEdit && (
          <div className="taxes-header">
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Takse të Re
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="taxes-content">
          {taxes.length === 0 ? (
            <p className="no-taxes">Nuk u gjetën taksa.</p>
          ) : (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={taxes}
                columns={[
                  {
                    field: 'id',
                    headerName: 'ID',
                    width: 80,
                  },
                  {
                    field: 'rate',
                    headerName: 'Norma',
                    width: 150,
                    valueGetter: (_value: unknown, row: Tax) => formatRate(row.rate),
                  },
                  {
                    field: 'name',
                    headerName: 'Emri',
                    width: 200,
                    flex: 1,
                  },
                  {
                    field: 'created_at',
                    headerName: 'Krijuar',
                    width: 150,
                    valueGetter: (_value: unknown, row: Tax) => 
                      row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
                  },
                  {
                    field: 'view',
                    headerName: 'Shiko',
                    width: 100,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: GridRenderCellParams<Tax>) => (
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
                    width: 200,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: GridRenderCellParams<Tax>) => (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEdit(params.row)}
                          sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                        >
                          Ndrysho
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
                getRowId={(row: Tax) => row.id}
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
      </div>
    </div>
  );
};

export default TaxesPage;
