import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesApi, Invoice } from '../services/api';
import './InvoiceDetailPage.scss';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const InvoiceDetailPage = () => {
  const { businessId, id } = useParams<{ businessId: string; id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!businessId || !id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getInvoice(parseInt(businessId), parseInt(id));
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
    if (businessId && id) {
      navigate(`/businesses/${businessId}/invoices/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !id) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë faturë? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoicesApi.deleteInvoice(parseInt(businessId), parseInt(id));
      navigate(`/businesses/${businessId}/invoices`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e faturës');
    }
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!businessId || !id || !invoice) return;

    try {
      const updated = await invoicesApi.updateInvoice(parseInt(businessId), parseInt(id), {
        status: newStatus,
      });
      setInvoice(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ndryshimi i statusit');
    }
  };

  const handleBack = () => {
    if (businessId) {
      navigate(`/businesses/${businessId}/invoices`);
    }
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

  const getStatusLabel = (status: InvoiceStatus): string => {
    const labels: Record<InvoiceStatus, string> = {
      draft: 'Draft',
      sent: 'Dërguar',
      paid: 'Paguar',
      overdue: 'Vonuar',
      cancelled: 'Anuluar',
    };
    return labels[status];
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
            <h1>Fatura #{invoice.invoice_number}</h1>
          </div>
          <div className="header-actions">
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              className={`status-select ${getStatusBadgeClass(invoice.status)}`}
            >
              <option value="draft">Draft</option>
              <option value="sent">Dërguar</option>
              <option value="paid">Paguar</option>
              <option value="overdue">Vonuar</option>
              <option value="cancelled">Anuluar</option>
            </select>
            <button
              onClick={handleDownloadPdf}
              className="btn btn-primary"
              disabled={downloading}
            >
              {downloading ? 'Duke u shkarkuar...' : '📄 Shkarko PDF'}
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
              <h3>Lëshuesi</h3>
              <div className="business-details">
                <p><strong>Emri:</strong> {invoice.issuer?.business_name || 'N/A'}</p>
                {invoice.issuer?.fiscal_number && (
                  <p><strong>Numri Fiskal:</strong> {invoice.issuer.fiscal_number}</p>
                )}
                {invoice.issuer?.address && (
                  <p><strong>Adresa:</strong> {invoice.issuer.address}</p>
                )}
                {invoice.issuer?.email && (
                  <p><strong>Email:</strong> {invoice.issuer.email}</p>
                )}
                {invoice.issuer?.phone && (
                  <p><strong>Telefoni:</strong> {invoice.issuer.phone}</p>
                )}
              </div>
            </div>

            <div className="business-card">
              <h3>Marrësi</h3>
              <div className="business-details">
                <p><strong>Emri:</strong> {invoice.receiver?.business_name || 'N/A'}</p>
                {invoice.receiver?.fiscal_number && (
                  <p><strong>Numri Fiskal:</strong> {invoice.receiver.fiscal_number}</p>
                )}
                {invoice.receiver?.address && (
                  <p><strong>Adresa:</strong> {invoice.receiver.address}</p>
                )}
                {invoice.receiver?.email && (
                  <p><strong>Email:</strong> {invoice.receiver.email}</p>
                )}
                {invoice.receiver?.phone && (
                  <p><strong>Telefoni:</strong> {invoice.receiver.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="items-section">
            <h2>Artikujt</h2>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Përshkrimi</th>
                      <th>Sasia</th>
                      <th>Çmimi për Njësi</th>
                      <th>Tatimi</th>
                      <th>Nëntotali</th>
                      <th>Tatimi</th>
                      <th>Totali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td data-label="#">{index + 1}</td>
                          <td data-label="Përshkrimi">
                            {item.description}
                            {item.article && (
                              <span className="article-badge" title="Nga artikulli">
                                📦
                              </span>
                            )}
                          </td>
                          <td data-label="Sasia">{parseFloat(item.quantity).toFixed(2)}</td>
                          <td data-label="Çmimi për Njësi">{parseFloat(item.unit_price).toFixed(2)} €</td>
                          <td data-label="Tatimi">
                            {item.tax ? (
                              item.tax.rate === null ? (
                                <span className="tax-exempt">E përjashtuar</span>
                              ) : (
                                <span>{item.tax.rate}%</span>
                              )
                            ) : (
                              <span className="tax-exempt">E përjashtuar</span>
                            )}
                          </td>
                          <td data-label="Nëntotali">{parseFloat(item.subtotal).toFixed(2)} €</td>
                          <td data-label="Tatimi">{parseFloat(item.tax_amount).toFixed(2)} €</td>
                          <td data-label="Totali"><strong>{parseFloat(item.total).toFixed(2)} €</strong></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-items">Nuk ka artikuj në këtë faturë.</p>
            )}
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-card">
              <div className="total-row">
                <span className="total-label">Nëntotali:</span>
                <span className="total-value">{parseFloat(invoice.subtotal).toFixed(2)} €</span>
              </div>
              <div className="total-row total-final">
                <span className="total-label">Totali:</span>
                <span className="total-value">{parseFloat(invoice.total).toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
