import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi, Invoice, invoiceStatusesApi, InvoiceStatus } from '../../services/api';
import InvoicesList from './InvoicesList';
import InvoicesGrid from './InvoicesGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './InvoicePage.scss';

type ViewMode = 'list' | 'grid';

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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('invoices-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });


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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('invoices-view-mode', mode);
  };

  const handleMenuOpen = (invoiceId: number, anchor: HTMLElement) => {
    setMenuAnchor({ ...menuAnchor, [invoiceId]: anchor });
  };

  const handleMenuClose = (invoiceId: number) => {
    setMenuAnchor({ ...menuAnchor, [invoiceId]: null });
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedInvoiceIds(selectedIds);
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

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="invoice-content">
          {viewMode === 'list' ? (
            <InvoicesList
              invoices={invoices}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onDownloadPdf={handleDownloadPdf}
              invoiceStatuses={invoiceStatuses}
              statusLabels={statusLabels}
              downloadingIds={downloadingIds}
            />
          ) : (
            <InvoicesGrid
              invoices={invoices}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onDownloadPdf={handleDownloadPdf}
              invoiceStatuses={invoiceStatuses}
              statusLabels={statusLabels}
              downloadingIds={downloadingIds}
              selectedInvoiceIds={selectedInvoiceIds}
              onSelectionChange={handleSelectionChange}
              menuAnchor={menuAnchor}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
