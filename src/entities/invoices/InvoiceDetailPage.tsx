import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { invoicesApi, Invoice, invoiceStatusesApi, InvoiceStatus, InvoiceItem } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './InvoiceDetailPage.scss';

type InvoiceStatusCode = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const businessId = user?.tenant?.issuer_business_id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceStatuses, setInvoiceStatuses] = useState<InvoiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{ issuer: boolean; receiver: boolean }>({
    issuer: false,
    receiver: false,
  });

  // Sort and prepare invoice items for DataGrid
  const sortedItems = useMemo(() => 
    invoice?.items ? [...invoice.items].sort((a, b) => a.sort_order - b.sort_order).map((item, index) => ({
      ...item,
      index: index + 1,
    })) : [],
    [invoice?.items]
  );

  const loadInvoice = useCallback(async () => {
    if (!businessId || !id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getInvoice(businessId, parseInt(id));
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i faturës');
    } finally {
      setLoading(false);
    }
  }, [businessId, id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleEdit = () => {
    if (id) {
      navigate(`/businesses/invoices/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !id) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë faturë? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoicesApi.deleteInvoice(businessId, parseInt(id));
      navigate('/businesses/invoices');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e faturës');
    }
  };

  const loadInvoiceStatuses = useCallback(async () => {
    try {
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      setInvoiceStatuses(data);
    } catch (err: any) {
      console.error('Failed to load invoice statuses:', err);
    }
  }, []);

  useEffect(() => {
    loadInvoiceStatuses();
  }, [loadInvoiceStatuses]);

  const handleStatusChange = async (newStatus: string) => {
    if (!businessId || !id || !invoice) return;

    try {
      const updated = await invoicesApi.updateInvoice(parseInt(businessId), parseInt(id), {
        status: newStatus as InvoiceStatusCode,
      });
      setInvoice(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ndryshimi i statusit');
    }
  };

  const handleBack = () => {
    navigate('/businesses/invoices');
  };

  const handleDownloadPdf = async () => {
    if (!businessId || !id || !invoice) return;

    try {
      setDownloading(true);
      setError(null);
      const blob = await invoicesApi.downloadInvoicePdf(
        parseInt(businessId),
        parseInt(id)
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi shkarkimi i PDF-së');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadgeClass = (status: InvoiceStatusCode): string => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'sent':
        return 'status-sent';
      case 'paid':
        return 'status-paid';
      case 'overdue':
        return 'status-overdue';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };


  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      sent: 'Dërguar',
      paid: 'Paguar',
      overdue: 'Vonuar',
      cancelled: 'Anuluar',
    };
    return labels[status] || status;
  };

  if (!businessId || !id) {
    return (
      <div className="invoice-detail-page">
        <div className="container">
          <div className="error-message">ID e faturës nuk u gjet.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="invoice-detail-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar fatura...</div>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="invoice-detail-page">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={handleBack} className="btn btn-primary" style={{ marginLeft: '1rem' }}>
              Kthehu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-page">
        <div className="container">
          <div className="error-message">Fatura nuk u gjet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-page">
      <div className="container">
        <div className="invoice-detail-header">
          <div>
            <button onClick={handleBack} className="btn btn-secondary">
              ← Kthehu
            </button>
          </div>
          <div className="header-actions">
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`status-select ${getStatusBadgeClass(invoice.status as InvoiceStatusCode)}`}
            >
              {invoiceStatuses.map((invoiceStatus) => (
                <option key={invoiceStatus.id} value={invoiceStatus.code}>
                  {getStatusLabel(invoiceStatus.code)}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownloadPdf}
              className="btn btn-primary"
              disabled={downloading}
            >
              {downloading ? 'Duke u shkarkuar...' : 'Shkarko'}
            </button>
            <button onClick={handleEdit} className="btn btn-primary">
              Ndrysho
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Fshi
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="invoice-detail-content">
          {/* Invoice Information */}
          <div className="invoice-info-section">
            <h2>Informacioni i Faturës</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Numri i Faturës:</label>
                <span>{invoice.invoice_number}</span>
              </div>
              <div className="info-item">
                <label>Data e Faturës:</label>
                <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Data e Maturimit:</label>
                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Statusi:</label>
                <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Issuer and Receiver */}
          <div className="businesses-section">
            <div className="business-card">
              <h3 
                className="business-card-header"
                onClick={() => setExpandedCards(prev => ({ ...prev, issuer: !prev.issuer }))}
              >
                <span>Fatura Nga: {invoice.issuer?.business_name || 'N/A'}</span>
                <span className={`expand-icon ${expandedCards.issuer ? 'expanded' : ''}`}>▼</span>
              </h3>
              {expandedCards.issuer && (
                <>
                  {invoice.issuer?.logo && (
                    <img 
                      src={invoice.issuer.logo} 
                      alt={`${invoice.issuer.business_name} logo`}
                      className="business-logo"
                    />
                  )}
                  <div className="business-details">
                    {invoice.issuer?.trade_name && (
                      <p><strong>Emri Tregtar:</strong> {invoice.issuer.trade_name}</p>
                    )}
                    {invoice.issuer?.business_type && (
                      <p><strong>Lloji i Biznesit:</strong> {invoice.issuer.business_type}</p>
                    )}
                    {invoice.issuer?.unique_identifier_number && (
                      <p><strong>Numri Unik:</strong> {invoice.issuer.unique_identifier_number}</p>
                    )}
                    {invoice.issuer?.vat_number && (
                      <p><strong>Numri i TVSH-së:</strong> {invoice.issuer.vat_number}</p>
                    )}
                    {invoice.issuer?.municipality && (
                      <p><strong>Komuna:</strong> {invoice.issuer.municipality}</p>
                    )}
                    {invoice.issuer?.address && (
                      <p><strong>Adresa:</strong> {invoice.issuer.address}</p>
                    )}
                    {invoice.issuer?.phone && (
                      <p><strong>Telefoni:</strong> {invoice.issuer.phone}</p>
                    )}
                    {invoice.issuer?.email && (
                      <p><strong>Email:</strong> {invoice.issuer.email}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="business-card">
              <h3 
                className="business-card-header"
                onClick={() => setExpandedCards(prev => ({ ...prev, receiver: !prev.receiver }))}
              >
                <span>Fatura Për: {invoice.receiver?.business_name || 'N/A'}</span>
                <span className={`expand-icon ${expandedCards.receiver ? 'expanded' : ''}`}>▼</span>
              </h3>
              {expandedCards.receiver && (
                <>
                  {invoice.receiver?.logo && (
                    <img 
                      src={invoice.receiver.logo} 
                      alt={`${invoice.receiver.business_name} logo`}
                      className="business-logo"
                    />
                  )}
                  <div className="business-details">
                    {invoice.receiver?.trade_name && (
                      <p><strong>Emri Tregtar:</strong> {invoice.receiver.trade_name}</p>
                    )}
                    {invoice.receiver?.business_type && (
                      <p><strong>Lloji i Biznesit:</strong> {invoice.receiver.business_type}</p>
                    )}
                    {invoice.receiver?.unique_identifier_number && (
                      <p><strong>Numri Unik:</strong> {invoice.receiver.unique_identifier_number}</p>
                    )}
                    {invoice.receiver?.vat_number && (
                      <p><strong>Numri i TVSH-së:</strong> {invoice.receiver.vat_number}</p>
                    )}
                    {invoice.receiver?.municipality && (
                      <p><strong>Komuna:</strong> {invoice.receiver.municipality}</p>
                    )}
                    {invoice.receiver?.address && (
                      <p><strong>Adresa:</strong> {invoice.receiver.address}</p>
                    )}
                    {invoice.receiver?.phone && (
                      <p><strong>Telefoni:</strong> {invoice.receiver.phone}</p>
                    )}
                    {invoice.receiver?.email && (
                      <p><strong>Email:</strong> {invoice.receiver.email}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="items-section">
            {invoice.items && invoice.items.length > 0 ? (
              <Box sx={{ width: '100%' }}>
                <DataGrid
                  rows={sortedItems}
                  autoHeight
                  columns={[
                    {
                      field: 'index',
                      headerName: '#',
                      width: 60,
                    },
                    {
                      field: 'description',
                      headerName: 'Përshkrimi',
                      width: 250,
                      flex: 1,
                      renderCell: (params: GridRenderCellParams<InvoiceItem & { index: number }>) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{params.value}</span>
                          {params.row.article && (
                            <span title="Nga artikulli">📦</span>
                          )}
                        </Box>
                      ),
                    },
                    {
                      field: 'quantity',
                      headerName: 'Sasia',
                      width: 100,
                      valueFormatter: (value: string) => parseFloat(value).toFixed(2),
                    },
                    {
                      field: 'unit_price',
                      headerName: 'Çmimi për Njësi',
                      width: 130,
                      valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                    },
                    {
                      field: 'tax_rate',
                      headerName: 'Vlera e TVSH',
                      width: 130,
                      valueGetter: (_value: unknown, row: InvoiceItem & { index: number }) => 
                        row.tax?.rate ?? null,
                      renderCell: (params: GridRenderCellParams<InvoiceItem & { index: number }>) => (
                        <span className={params.value === null ? 'tax-exempt' : ''}>
                          {params.value === null ? 'E përjashtuar' : `${params.value}%`}
                              </span>
                      ),
                    },
                    {
                      field: 'subtotal',
                      headerName: 'Vlera pa TVSH',
                      width: 130,
                      valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                    },
                    {
                      field: 'tax_amount',
                      headerName: 'Vlera e TVSH',
                      width: 130,
                      valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                    },
                    {
                      field: 'total',
                      headerName: 'Totali',
                      width: 120,
                      valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
                      renderCell: (params: GridRenderCellParams<InvoiceItem & { index: number }>) => (
                        <strong>{parseFloat(params.value as string).toFixed(2)} €</strong>
                      ),
                    },
                  ]}
                  getRowId={(row: InvoiceItem & { index: number }) => row.id}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  hideFooter
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    },
                    '& .MuiDataGrid-filler': {
                      display: 'none',
                    },
                  }}
                />
              </Box>
            ) : (
              <p className="no-items">Nuk ka artikuj në këtë faturë.</p>
            )}
          </div>

          {/* Totals */}
          <div className="invoice-totals">
            <div className="totals-row">
              <span className="totals-label">Vlera pa TVSH:</span>
              <span className="totals-value">{parseFloat(invoice.subtotal).toFixed(2)} €</span>
              </div>
            <div className="totals-row">
              <span className="totals-label">Vlera e TVSH:</span>
              <span className="totals-value">{(parseFloat(invoice.total) - parseFloat(invoice.subtotal)).toFixed(2)} €</span>
                </div>
            <div className="totals-row totals-row--total">
              <span className="totals-label">Totali:</span>
              <span className="totals-value">{parseFloat(invoice.total).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
