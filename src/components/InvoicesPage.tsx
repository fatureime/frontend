import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Select, MenuItem, Box, IconButton, Menu, Checkbox } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { invoicesApi, Invoice, businessesApi, invoiceStatusesApi, InvoiceStatus } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import './InvoicesPage.scss';

type InvoiceStatusCode = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const InvoicesPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceStatuses, setInvoiceStatuses] = useState<InvoiceStatus[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [exportingExcel, setExportingExcel] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  // Stabilize isAdminTenant to prevent unnecessary callback recreations
  const isAdminTenant = useMemo(() => user?.tenant?.is_admin === true, [user?.tenant?.is_admin]);

  // Refs to prevent concurrent API calls
  const loadingBusinessesRef = useRef(false);
  const loadingBusinessRef = useRef(false);
  const loadingInvoicesRef = useRef(false);

  // Status label mapping (Albanian)
  const statusLabels: Record<string, string> = {
    'draft': 'Draft',
    'sent': 'Dërguar',
    'paid': 'Paguar',
    'overdue': 'Vonuar',
    'cancelled': 'Anuluar',
  };

  const loadInvoiceStatuses = useCallback(async () => {
    try {
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      setInvoiceStatuses(data);
    } catch (err: any) {
      console.error('Failed to load invoice statuses:', err);
    }
  }, []);

  const loadBusinesses = useCallback(async () => {
    if (loadingBusinessesRef.current) return; // Prevent concurrent calls
    loadingBusinessesRef.current = true;
    try {
      const data = await businessesApi.getBusinesses();
      // Use functional update to avoid dependency on selectedBusinessId
      setSelectedBusinessId(prev => prev || (data.length > 0 ? data[0].id : null));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    } finally {
      loadingBusinessesRef.current = false;
    }
  }, []); // Remove selectedBusinessId from dependencies

  const loadBusiness = useCallback(async () => {
    if (!businessId) return;
    if (loadingBusinessRef.current) return; // Prevent concurrent calls
    loadingBusinessRef.current = true;
    try {
      const data = await businessesApi.getBusiness(parseInt(businessId));
      setSelectedBusinessId(data.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i biznesit');
    } finally {
      loadingBusinessRef.current = false;
    }
  }, [businessId]);

  const loadInvoices = useCallback(async () => {
    if (loadingInvoicesRef.current) return; // Prevent concurrent calls
    loadingInvoicesRef.current = true;
    try {
      setLoading(true);
      setError(null);
      
      // Admin tenants can see all invoices, or filter by selected business
      if (isAdminTenant) {
        // If selectedBusinessId is explicitly null (user selected "All"), ignore businessId from route
        const targetBusinessId = selectedBusinessId !== null ? (selectedBusinessId || businessId) : null;
        if (targetBusinessId) {
          // Filter by selected business
          const data = await invoicesApi.getInvoices(parseInt(targetBusinessId.toString()));
          setInvoices(data);
        } else {
          // Show all invoices
          const data = await invoicesApi.getAllInvoices();
          setInvoices(data);
        }
      } else {
        // Normal tenants see only invoices for their business
        const targetBusinessId = selectedBusinessId || businessId;
        if (!targetBusinessId) {
          loadingInvoicesRef.current = false;
          return;
        }
        const data = await invoicesApi.getInvoices(parseInt(targetBusinessId.toString()));
        setInvoices(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i faturave');
    } finally {
      setLoading(false);
      loadingInvoicesRef.current = false;
    }
  }, [isAdminTenant, selectedBusinessId, businessId]);

  useEffect(() => {
    loadInvoiceStatuses();
    if (isAdminTenant) {
      loadBusinesses();
    } else if (businessId) {
      loadBusiness();
    }
    // loadBusinesses and loadBusiness are stable (empty deps or only businessId), safe to include
  }, [isAdminTenant, businessId, loadBusinesses, loadBusiness, loadInvoiceStatuses]);

  useEffect(() => {
    loadInvoices();
    // loadInvoices dependencies are stable: isAdminTenant (memoized), selectedBusinessId, businessId
  }, [loadInvoices]);

  const handleCreate = () => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (targetBusinessId) {
      navigate(`/businesses/${targetBusinessId}/invoices/create`);
    }
  };

  const handleView = (invoiceId: number) => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (targetBusinessId) {
      navigate(`/businesses/${targetBusinessId}/invoices/${invoiceId}`);
    }
  };

  const handleEdit = (invoiceId: number) => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (targetBusinessId) {
      navigate(`/businesses/${targetBusinessId}/invoices/${invoiceId}/edit`);
    }
  };

  const handleDelete = async (invoiceId: number) => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (!targetBusinessId) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë faturë? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoicesApi.deleteInvoice(parseInt(targetBusinessId.toString()), invoiceId);
      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e faturës');
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: InvoiceStatusCode) => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (!targetBusinessId) return;

    try {
      await invoicesApi.updateInvoice(parseInt(targetBusinessId.toString()), invoiceId, {
        status: newStatus,
      });
      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ndryshimi i statusit');
    }
  };


  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    const targetBusinessId = selectedBusinessId || businessId;
    if (!targetBusinessId) return;

    try {
      setDownloadingIds(prev => new Set(prev).add(invoiceId));
      setError(null);
      const blob = await invoicesApi.downloadInvoicePdf(
        parseInt(targetBusinessId.toString()),
        invoiceId
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi shkarkimi i PDF-së');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const handleExportToExcel = async () => {
    try {
      setExportingExcel(true);
      setError(null);

      let blob: Blob;

      if (isAdminTenant) {
        // Admin tenants can export all invoices or filter by business
        const targetBusinessId = selectedBusinessId !== null ? selectedBusinessId : undefined;
        blob = await invoicesApi.downloadAllInvoicesExcel(targetBusinessId || undefined);
      } else {
        // Normal tenants export invoices for their business
        const targetBusinessId = selectedBusinessId || businessId;
        if (!targetBusinessId) {
          setError('ID e biznesit nuk u gjet.');
          return;
        }
        blob = await invoicesApi.downloadInvoicesExcel(parseInt(targetBusinessId.toString()));
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `faturat-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi eksportimi në Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  if (!businessId && !isAdminTenant) {
    return (
      <div className="invoices-page">
        <div className="container">
          <div className="error-message">ID e biznesit nuk u gjet.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="invoices-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar fatura...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="container">
        <div className="invoices-header">
          <div className="header-actions">
            {selectedInvoiceIds.length > 0 && (
              <button 
                onClick={async () => {
                  if (!window.confirm(`Jeni të sigurt që dëshironi të fshini ${selectedInvoiceIds.length} fatura? Ky veprim nuk mund të zhbëhet.`)) {
                    return;
                  }
                  const targetBusinessId = selectedBusinessId || businessId;
                  if (!targetBusinessId) return;
                  try {
                    for (const invoiceId of selectedInvoiceIds) {
                      await invoicesApi.deleteInvoice(parseInt(targetBusinessId.toString()), invoiceId);
                    }
                    setSelectedInvoiceIds([]);
                    await loadInvoices();
                  } catch (err: any) {
                    setError(err.response?.data?.error || 'Dështoi fshirja e faturave');
                  }
                }}
                className="btn btn-danger"
              >
                Fshi të Zgjedhurat ({selectedInvoiceIds.length})
              </button>
            )}
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Faturë
            </button>
            <button 
              onClick={handleExportToExcel} 
              className="btn btn-secondary"
              disabled={exportingExcel || invoices.length === 0}
              title="Eksporto në Excel"
            >
              {exportingExcel ? 'Duke u eksportuar...' : 'Eksporto në Excel'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="invoices-content">
          {invoices.length === 0 ? (
            <p className="no-invoices">Nuk u gjetën fatura.</p>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={invoices}
                columns={[
                  {
                    field: 'invoice_number',
                    headerName: 'Numri i Faturës',
                    width: 150,
                    flex: 1,
                    renderCell: (params: GridRenderCellParams<Invoice>) => {
                      const targetBusinessId = selectedBusinessId || businessId;
                      if (!targetBusinessId) return params.value;
                      return (
                        <Link
                          to={`/businesses/${targetBusinessId}/invoices/${params.row.id}`}
                          style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {params.value}
                        </Link>
                      );
                    },
                  },
                  {
                    field: 'invoice_date',
                    headerName: 'Data',
                    width: 120,
                    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
                  },
                  {
                    field: 'due_date',
                    headerName: 'Data e Maturimit',
                    width: 150,
                    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
                  },
                  {
                    field: 'issuer',
                    headerName: 'Fatura Nga',
                    width: 180,
                    valueGetter: (_value: unknown, row: Invoice) => row.issuer?.business_name || 'N/A',
                    flex: 1,
                  },
                  {
                    field: 'receiver',
                    headerName: 'Fatura Për',
                    width: 180,
                    valueGetter: (_value: unknown, row: Invoice) => row.receiver?.business_name || 'N/A',
                    flex: 1,
                  },
                  {
                    field: 'status',
                    headerName: 'Statusi',
                    width: 180,
                    renderCell: (params: GridRenderCellParams<Invoice>) => (
                      <Select
                        value={params.value}
                        onChange={(e) => handleStatusChange(params.row.id, e.target.value as InvoiceStatusCode)}
                        size="small"
                        sx={{ 
                          width: '100%',
                          '& .MuiSelect-select': {
                            padding: '4px 8px',
                          }
                        }}
                      >
                        {invoiceStatuses.map((status) => (
                          <MenuItem key={status.id} value={status.code}>
                            {statusLabels[status.code] || status.code}
                          </MenuItem>
                        ))}
                      </Select>
                    ),
                  },
                  {
                    field: 'total',
                    headerName: 'Totali',
                    width: 120,
                    valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                  },
                  {
                    field: 'actions',
                    headerName: 'Veprimet',
                    width: 120,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: GridRenderCellParams<Invoice>) => {
                      const open = Boolean(menuAnchor[params.row.id]);
                      return (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%'
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPdf(params.row.id, params.row.invoice_number)}
                            disabled={downloadingIds.has(params.row.id)}
                            title="Shkarko PDF"
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => setMenuAnchor({ ...menuAnchor, [params.row.id]: e.currentTarget })}
                            title="Më shumë veprime"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchor[params.row.id]}
                            open={open}
                            onClose={() => setMenuAnchor({ ...menuAnchor, [params.row.id]: null })}
                          >
                            <MenuItem onClick={() => {
                              handleView(params.row.id);
                              setMenuAnchor({ ...menuAnchor, [params.row.id]: null });
                            }}>
                              Shiko
                            </MenuItem>
                            <MenuItem onClick={() => {
                              handleEdit(params.row.id);
                              setMenuAnchor({ ...menuAnchor, [params.row.id]: null });
                            }}>
                              Ndrysho
                            </MenuItem>
                            <MenuItem onClick={() => {
                              handleDelete(params.row.id);
                              setMenuAnchor({ ...menuAnchor, [params.row.id]: null });
                            }} sx={{ color: 'error.main' }}>
                              Fshi
                            </MenuItem>
                          </Menu>
                        </Box>
                      );
                    },
                  },
                ]}
                getRowId={(row: Invoice) => row.id}
                checkboxSelection
                rowSelectionModel={selectedInvoiceIds}
                onRowSelectionModelChange={(newSelection) => {
                  setSelectedInvoiceIds(newSelection as number[]);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
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

export default InvoicesPage;
