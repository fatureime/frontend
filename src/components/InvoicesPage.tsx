import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesApi, Invoice, businessesApi, Business } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import './InvoicesPage.scss';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type SortField = 'invoice_date' | 'due_date' | 'invoice_number' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

const InvoicesPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('invoice_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  // Stabilize isAdminTenant to prevent unnecessary callback recreations
  const isAdminTenant = useMemo(() => user?.tenant?.is_admin === true, [user?.tenant?.is_admin]);

  // Refs to prevent concurrent API calls
  const loadingBusinessesRef = useRef(false);
  const loadingBusinessRef = useRef(false);
  const loadingInvoicesRef = useRef(false);

  const loadBusinesses = useCallback(async () => {
    if (loadingBusinessesRef.current) return; // Prevent concurrent calls
    loadingBusinessesRef.current = true;
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
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
      setBusiness(data);
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
    if (isAdminTenant) {
      loadBusinesses();
    } else if (businessId) {
      loadBusiness();
    }
    // loadBusinesses and loadBusiness are stable (empty deps or only businessId), safe to include
  }, [isAdminTenant, businessId, loadBusinesses, loadBusiness]);

  useEffect(() => {
    loadInvoices();
    // loadInvoices dependencies are stable: isAdminTenant (memoized), selectedBusinessId, businessId
  }, [loadInvoices]);

  // Filter and sort invoices
  useEffect(() => {
    let filtered = [...invoices];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'invoice_date':
          aValue = new Date(a.invoice_date).getTime();
          bValue = new Date(b.invoice_date).getTime();
          break;
        case 'due_date':
          aValue = new Date(a.due_date).getTime();
          bValue = new Date(b.due_date).getTime();
          break;
        case 'invoice_number':
          aValue = a.invoice_number;
          bValue = b.invoice_number;
          break;
        case 'total':
          aValue = parseFloat(a.total);
          bValue = parseFloat(b.total);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, sortField, sortDirection]);

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

  const handleStatusChange = async (invoiceId: number, newStatus: InvoiceStatus) => {
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const getStatusBadgeClass = (status: InvoiceStatus): string => {
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

  const currentBusiness = business || businesses.find(b => b.id === selectedBusinessId);

  return (
    <div className="invoices-page">
      <div className="container">
        <div className="invoices-header">
          <div>
            <h1>Menaxhimi i Faturave</h1>
            {currentBusiness && (
              <p className="business-name">{currentBusiness.business_name}</p>
            )}
          </div>
          <button onClick={handleCreate} className="btn btn-primary">
            Krijo Faturë
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="invoices-filters">
          {isAdminTenant && (
            <div className="filter-group">
              <label htmlFor="business-select">Subjekti:</label>
              <select
                id="business-select"
                value={selectedBusinessId || businessId || ''}
                onChange={(e) => {
                  const newBusinessId = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedBusinessId(newBusinessId);
                  if (newBusinessId) {
                    navigate(`/businesses/${newBusinessId}/invoices`);
                  } else {
                    // Show all invoices - clear selection and reload
                    setSelectedBusinessId(null);
                    // If we're on a business-specific route, navigate to a general route
                    // For now, just reload with null businessId
                  }
                }}
              >
                <option value="">Të gjitha faturat</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.business_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label htmlFor="status-filter">Statusi:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            >
              <option value="all">Të gjitha</option>
              <option value="draft">Draft</option>
              <option value="sent">Dërguar</option>
              <option value="paid">Paguar</option>
              <option value="overdue">Vonuar</option>
              <option value="cancelled">Anuluar</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-field">Rendit sipas:</label>
            <select
              id="sort-field"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="invoice_date">Data e faturës</option>
              <option value="due_date">Data e maturimit</option>
              <option value="invoice_number">Numri i faturës</option>
              <option value="total">Shuma</option>
              <option value="status">Statusi</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="sort-direction-btn"
              title={sortDirection === 'asc' ? 'Rritje' : 'Zbritje'}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="invoices-content">
          {filteredInvoices.length === 0 ? (
            <p className="no-invoices">Nuk u gjetën fatura.</p>
          ) : (
            <div className="invoices-table-container">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('invoice_number')} className="sortable">
                      Numri i Faturës {sortField === 'invoice_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('invoice_date')} className="sortable">
                      Data {sortField === 'invoice_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('due_date')} className="sortable">
                      Data e Maturimit {sortField === 'due_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Fatura Nga</th>
                    <th>Fatura Prej</th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Statusi {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('total')} className="sortable">
                      Totali {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Veprimet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td data-label="Numri i Faturës">{invoice.invoice_number}</td>
                      <td data-label="Data">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td data-label="Data e Maturimit">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td data-label="Fatura Nga">{invoice.issuer?.business_name || 'N/A'}</td>
                      <td data-label="Fatura Prej">{invoice.receiver?.business_name || 'N/A'}</td>
                      <td data-label="Statusi">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                          className={`status-select ${getStatusBadgeClass(invoice.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Dërguar</option>
                          <option value="paid">Paguar</option>
                          <option value="overdue">Vonuar</option>
                          <option value="cancelled">Anuluar</option>
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
