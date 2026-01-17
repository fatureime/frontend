import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Select, MenuItem, Box, IconButton, Menu } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { invoicesApi, Invoice, invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import './InvoicePage.scss';

type InvoiceStatusCode = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceStatuses, setInvoiceStatuses] = useState<InvoiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [exportingExcel, setExportingExcel] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});


  // Refs to prevent concurrent API calls
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

  const loadInvoices = useCallback(async () => {
    if (loadingInvoicesRef.current) return; // Prevent concurrent calls
    loadingInvoicesRef.current = true;
    try {
      setLoading(true);
      setError(null);
      
      // Always show all invoices
      const data = await invoicesApi.getAllInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i faturave');
    } finally {
      setLoading(false);
      loadingInvoicesRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadInvoiceStatuses();
  }, [loadInvoiceStatuses]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleCreate = () => {
    navigate('/invoices/create');
  };

  const handleView = (invoiceId: number) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEdit = (invoiceId: number) => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  const handleDelete = async (invoiceId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë faturë? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      // Get business ID from the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice || !invoice.issuer?.id) {
        setError('Nuk mund të gjej biznesin e faturës');
        return;
      }
      await invoicesApi.deleteInvoice(invoice.issuer.id, invoiceId);
      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e faturës');
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: InvoiceStatusCode) => {
    try {
      // Get business ID from the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice || !invoice.issuer?.id) {
        setError('Nuk mund të gjej biznesin e faturës');
        return;
      }
      await invoicesApi.updateInvoice(invoice.issuer.id, invoiceId, {
        status: newStatus,
      });
      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ndryshimi i statusit');
    }
  };


  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      // Get business ID from the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice || !invoice.issuer?.id) {
        setError('Nuk mund të gjej biznesin e faturës');
        return;
      }
      
      setDownloadingIds(prev => new Set(prev).add(invoiceId));
      setError(null);
      const blob = await invoicesApi.downloadInvoicePdf(
        invoice.issuer.id,
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

      // Export all invoices
      const blob = await invoicesApi.downloadAllInvoicesExcel();

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


  if (loading) {
    return (
      <div className="invoice-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar fatura...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="container">
        <div className="invoice-header">
          <div className="header-actions">
            {selectedInvoiceIds.length > 0 && (
              <button
                onClick={async () => {
                  if (!window.confirm(`Jeni të sigurt që dëshironi të fshini ${selectedInvoiceIds.length} fatura? Ky veprim nuk mund të zhbëhet.`)) {
                    return;
                  }
                  try {
                    for (const invoiceId of selectedInvoiceIds) {
                      // Get business ID from the invoice
                      const invoice = invoices.find(inv => inv.id === invoiceId);
                      if (invoice && invoice.issuer?.id) {
                        await invoicesApi.deleteInvoice(invoice.issuer.id, invoiceId);
                      }
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

        <div className="invoice-content">
          {invoices.length === 0 ? (
            <p className="no-invoices">Nuk u gjetën fatura.</p>
          ) : (
            <Box sx={{ 
              height: 600, 
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              <DataGrid
                rows={invoices}
                columns={[
                  {
                    field: 'invoice_number',
                    headerName: 'Numri i Faturës',
                    flex: 1,
                    renderCell: (params: GridRenderCellParams<Invoice>) => {
                      return (
                        <Link
                          to={`/invoices/${params.row.id}`}
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
                    flex: 0.8,
                    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
                  },
                  {
                    field: 'due_date',
                    headerName: 'Data e Maturimit',
                    flex: 1,
                    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
                  },
                  {
                    field: 'issuer',
                    headerName: 'Fatura Nga',
                    flex: 1.2,
                    valueGetter: (_value: unknown, row: Invoice) => row.issuer?.business_name || 'N/A',
                  },
                  {
                    field: 'receiver',
                    headerName: 'Fatura Për',
                    flex: 1.2,
                    valueGetter: (_value: unknown, row: Invoice) => row.receiver?.business_name || 'N/A',
                  },
                  {
                    field: 'status',
                    headerName: 'Statusi',
                    flex: 1,
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
                    flex: 0.8,
                    valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                  },
                  {
                    field: 'actions',
                    headerName: 'Veprimet',
                    flex: 0.8,
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
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                }}
              />
            </Box>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
