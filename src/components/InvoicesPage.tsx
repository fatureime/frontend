import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            <div className="invoices-table-container">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Numri i Faturës</th>
                    <th>Data</th>
                    <th>Data e Maturimit</th>
                    <th>Fatura Nga</th>
                    <th>Fatura Për</th>
                    <th>Statusi</th>
                    <th>Totali</th>
                    <th>Veprimet</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td data-label="Numri i Faturës">{invoice.invoice_number}</td>
                      <td data-label="Data">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td data-label="Data e Maturimit">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td data-label="Fatura Nga">{invoice.issuer?.business_name || 'N/A'}</td>
                      <td data-label="Fatura Për">{invoice.receiver?.business_name || 'N/A'}</td>
                      <td data-label="Statusi">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatusCode)}
                          className={`status-select ${getStatusBadgeClass(invoice.status as InvoiceStatusCode)}`}
                        >
                          {invoiceStatuses.map((status) => (
                            <option key={status.id} value={status.code}>
                              {statusLabels[status.code] || status.code}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Totali">{parseFloat(invoice.total).toFixed(2)} €</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleView(invoice.id)}
                            className="btn btn-sm btn-primary"
                            title="Shiko"
                          >
                            Shiko
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(invoice.id, invoice.invoice_number)}
                            className="btn btn-sm btn-secondary"
                            title="Shkarko"
                            disabled={downloadingIds.has(invoice.id)}
                          >
                            {downloadingIds.has(invoice.id) ? 'Duke u shkarkuar...' : 'Shkarko'}
                          </button>
                          <button
                            onClick={() => handleEdit(invoice.id)}
                            className="btn btn-sm btn-secondary"
                            title="Ndrysho"
                          >
                            Ndrysho
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="btn btn-sm btn-danger"
                            title="Fshi"
                          >
                            Fshi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
