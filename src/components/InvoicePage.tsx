import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  invoicesApi, 
  Invoice, 
  businessesApi, 
  Business, 
  articlesApi, 
  Article, 
  taxesApi, 
  Tax,
  CreateInvoiceData,
  CreateInvoiceItemData
} from '../services/api';
import { useAuth } from '../contexts/useAuth';
import './InvoicePage.scss';

interface InvoiceItemForm {
  id: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  articleId: number | null;
  taxId: number | null;
  sortOrder: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

const InvoicePage = () => {
  const { businessId, id } = useParams<{ businessId: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // Only treat as edit mode if pathname contains "/edit" or id is a valid number
  const isEditMode = location.pathname.includes('/edit') || (id && !isNaN(parseInt(id)));
  const isAdminTenant = user?.tenant?.is_admin === true;

  // State
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('draft');
  const [issuerId, setIssuerId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { 
      id: '1', 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      articleId: null,
      taxId: null,
      sortOrder: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    }
  ]);

  // Data
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      
      // Set default issuer: for admin tenants, first business; for normal tenants, their tenant's business
      if (data.length > 0) {
        if (isAdminTenant) {
          setIssuerId(data[0].id);
        } else {
          const tenantBusiness = data.find(b => b.tenant_id === user?.tenant?.id);
          if (tenantBusiness) {
            setIssuerId(tenantBusiness.id);
          } else if (data.length > 0) {
            setIssuerId(data[0].id);
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    }
  }, [isAdminTenant, user?.tenant?.id]);

  const loadArticles = useCallback(async () => {
    if (!issuerId) return;
    try {
      const data = await articlesApi.getArticles(issuerId);
      setArticles(data);
    } catch (err: any) {
      console.error('Failed to load articles:', err);
    }
  }, [issuerId]);

  const loadTaxes = useCallback(async () => {
    try {
      const data = await taxesApi.getTaxes();
      setTaxes(data);
    } catch (err: any) {
      console.error('Failed to load taxes:', err);
    }
  }, []);

  const loadInvoice = useCallback(async () => {
    if (!businessId || !id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getInvoice(parseInt(businessId), parseInt(id));
      setInvoice(data);
      setInvoiceNumber(data.invoice_number);
      setInvoiceDate(data.invoice_date.split('T')[0]);
      setDueDate(data.due_date.split('T')[0]);
      setStatus(data.status);
      setIssuerId(data.issuer_id);
      setReceiverId(data.receiver_id);
      
      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item, index) => ({
          id: item.id.toString(),
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unit_price),
          articleId: item.article_id || null,
          taxId: item.tax_id || null,
          sortOrder: item.sort_order,
          subtotal: parseFloat(item.subtotal),
          taxAmount: parseFloat(item.tax_amount),
          total: parseFloat(item.total),
        })));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i faturës');
    } finally {
      setLoading(false);
    }
  }, [businessId, id]);

  useEffect(() => {
    loadBusinesses();
    loadTaxes();
  }, [loadBusinesses, loadTaxes]);

  useEffect(() => {
    if (issuerId) {
      loadArticles();
    }
  }, [issuerId, loadArticles]);

  useEffect(() => {
    if (isEditMode) {
      loadInvoice();
    } else {
      setLoading(false);
    }
  }, [isEditMode, loadInvoice]);

  // Calculate item totals
  const calculateItemTotals = (item: InvoiceItemForm): InvoiceItemForm => {
    const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
    const subtotal = qty * price;
    
    let taxAmount = 0;
    if (item.taxId) {
      const tax = taxes.find(t => t.id === item.taxId);
      if (tax && tax.rate !== null) {
        const rate = parseFloat(tax.rate);
        taxAmount = (subtotal * rate) / 100;
      }
    }
    
    const total = subtotal + taxAmount;
    
    return {
      ...item,
      subtotal,
      taxAmount,
      total,
    };
  };

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // If article is selected, populate description and unit price
        if (field === 'articleId' && value) {
          const article = articles.find(a => a.id === value);
          if (article) {
            updated.description = article.name;
            updated.unitPrice = parseFloat(article.unit_price);
          }
        }
        
        return calculateItemTotals(updated);
      }
      return item;
    }));
  };

  // Add item
  const addItem = () => {
    const newItem: InvoiceItemForm = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      articleId: null,
      taxId: null,
      sortOrder: items.length,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id).map((item, index) => ({
        ...item,
        sortOrder: index,
      })));
    }
  };

  // Calculate invoice totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTaxTotal = () => {
    return items.reduce((sum, item) => sum + item.taxAmount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxTotal();
  };

  // Handle save
  const handleSave = async (saveAsDraft: boolean = false) => {
    if (!issuerId || !receiverId) {
      setError('Ju lutem zgjidhni lëshuesin dhe marrësin');
      return;
    }

    if (items.length === 0 || items.some(item => !item.description.trim())) {
      setError('Ju lutem shtoni të paktën një artikull me përshkrim');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const invoiceItems: CreateInvoiceItemData[] = items.map((item, index) => ({
        description: item.description,
        quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity,
        unit_price: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice,
        article_id: item.articleId,
        tax_id: item.taxId,
        sort_order: index,
      }));

      const invoiceData: CreateInvoiceData = {
        receiver_id: receiverId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status: saveAsDraft ? 'draft' : status,
        items: invoiceItems,
      };

      let savedInvoice: Invoice;
      if (isEditMode && businessId && id) {
        // For edit mode, use businessId from route (which should be the issuer business)
        savedInvoice = await invoicesApi.updateInvoice(parseInt(businessId), parseInt(id), invoiceData);
      } else if (issuerId) {
        // For create mode, use issuerId from the form (not businessId from route)
        savedInvoice = await invoicesApi.createInvoice(issuerId, invoiceData);
      } else {
        throw new Error('Issuer business ID is required');
      }

      // Validate that we have the invoice ID and issuer ID before navigating
      if (!savedInvoice.id) {
        throw new Error('Invoice was created but no ID was returned');
      }

      // Use issuer_id from the response (or fallback to issuerId from form, or route businessId)
      const issuerBusinessId = savedInvoice.issuer_id || issuerId || businessId;
      if (!issuerBusinessId) {
        throw new Error('Could not determine issuer business ID for navigation');
      }

      navigate(`/businesses/${issuerBusinessId}/invoices/${savedInvoice.id}`);
    } catch (err: any) {
      console.error('Error saving invoice:', err);
      console.error('Error response:', err.response?.data);
      console.error('Saved invoice data:', err.savedInvoice);
      
      // Provide more detailed error messages
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Dështoi ruajtja e faturës. Ju lutem kontrolloni të dhënat dhe provoni përsëri.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (businessId) {
      navigate(`/businesses/${businessId}/invoices`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleClear = () => {
    if (window.confirm('Jeni të sigurt që dëshironi të pastroni të gjitha të dhënat?')) {
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setDueDate(date.toISOString().split('T')[0]);
      setStatus('draft');
      setReceiverId(null);
      setItems([{
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        articleId: null,
        taxId: null,
        sortOrder: 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      }]);
      setError(null);
    }
  };

  // Filter businesses for issuer selection
  const availableIssuerBusinesses = isAdminTenant 
    ? businesses 
    : businesses.filter(b => b.tenant_id === user?.tenant?.id);

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-container">
          <div className="invoice-content">
            <div style={{ textAlign: 'center', padding: '3rem' }}>Duke u ngarkuar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-header">
          <h1 className="invoice-title">
            {isEditMode ? 'Ndrysho Faturë' : 'Krijo Faturë'}
          </h1>
        </div>

        <div className="invoice-content">
          {error && (
            <div className="error-message" style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem' 
            }}>
              {error}
              <button onClick={() => setError(null)} style={{ 
                background: 'none', 
                border: 'none', 
                color: '#c62828', 
                float: 'right', 
                cursor: 'pointer',
                fontSize: '1.5rem'
              }}>×</button>
            </div>
          )}

          {/* Invoice Info Section */}
          <div className="invoice-section">
            <h2 className="section-title">Informacioni i Faturës</h2>
            <div className="invoice-info-grid">
              <div className="info-group">
                <label className="info-label">Numri i Faturës</label>
                <input
                  type="text"
                  className="info-input"
                  value={invoiceNumber || (isEditMode ? 'Duke u ngarkuar...' : 'Do të gjenerohet automatikisht')}
                  readOnly
                />
              </div>
              <div className="info-group">
                <label className="info-label">Data e Faturës</label>
                <input
                  type="date"
                  className="info-input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="info-group">
                <label className="info-label">Data e Skadimit</label>
                <input
                  type="date"
                  className="info-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="info-group">
                <label className="info-label">Statusi</label>
                <select
                  className="info-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Dërguar</option>
                  <option value="paid">Paguar</option>
                  <option value="overdue">Vonuar</option>
                  <option value="cancelled">Anuluar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Selection */}
          <div className="invoice-section">
            <h2 className="section-title">Bizneset</h2>
            <div className="invoice-info-grid">
              <div className="info-group">
                <label className="info-label">Lëshuesi *</label>
                <select
                  className="info-input"
                  value={issuerId || ''}
                  onChange={(e) => setIssuerId(parseInt(e.target.value))}
                  disabled={!isAdminTenant && !!user?.tenant?.id}
                  required
                >
                  <option value="">Zgjidhni lëshuesin</option>
                  {availableIssuerBusinesses.map(business => (
                    <option key={business.id} value={business.id}>
                      {business.business_name}
                    </option>
                  ))}
                </select>
                {!isAdminTenant && (
                  <small style={{ color: '#666', fontSize: '0.875rem' }}>
                    Lëshuesi është biznesi i tenantit tuaj
                  </small>
                )}
              </div>
              <div className="info-group">
                <label className="info-label">Marrësi *</label>
                <select
                  className="info-input"
                  value={receiverId || ''}
                  onChange={(e) => setReceiverId(parseInt(e.target.value))}
                  required
                >
                  <option value="">Zgjidhni marrësin</option>
                  {businesses.map(business => (
                    <option key={business.id} value={business.id}>
                      {business.business_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="invoice-section">
            <div className="section-header">
              <h2 className="section-title">Artikujt</h2>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={addItem}
              >
                + Shto Artikull
              </button>
            </div>

            <div className="invoice-table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th className="col-description">Përshkrimi</th>
                    <th className="col-quantity">Sasia</th>
                    <th className="col-price">Çmimi për Njësi</th>
                    <th style={{ width: '15%' }}>Artikulli</th>
                    <th style={{ width: '12%' }}>Tatimi</th>
                    <th className="col-total">Totali</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="col-description">
                        <input
                          type="text"
                          className="table-input"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Përshkrimi i artikullit"
                        />
                      </td>
                      <td className="col-quantity">
                        <input
                          type="number"
                          className="table-input"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="col-price">
                        <input
                          type="number"
                          className="table-input"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <select
                          className="table-input"
                          value={item.articleId || ''}
                          onChange={(e) => updateItem(item.id, 'articleId', e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Zgjidhni artikull</option>
                          {articles.map(article => (
                            <option key={article.id} value={article.id}>
                              {article.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="table-input"
                          value={item.taxId || ''}
                          onChange={(e) => updateItem(item.id, 'taxId', e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">E përjashtuar</option>
                          {taxes.map(tax => (
                            <option key={tax.id} value={tax.id}>
                              {tax.rate === null ? 'E përjashtuar' : `${tax.rate}%`}
                              {tax.name && ` - ${tax.name}`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="col-total">
                        <span className="table-total">
                          {item.total.toFixed(2)} €
                        </span>
                      </td>
                      <td className="col-actions">
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeItem(item.id)}
                            title="Hiq artikullin"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="invoice-totals">
              <div className="totals-row">
                <span className="totals-label">Nëntotali:</span>
                <span className="totals-value">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Tatimi Total:</span>
                <span className="totals-value">{calculateTaxTotal().toFixed(2)} €</span>
              </div>
              <div className="totals-row totals-row--total">
                <span className="totals-label">Totali:</span>
                <span className="totals-value">{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="invoice-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancel}
            >
              Anulo
            </button>
            <div className="actions-right">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                Ruaj si Draft
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? 'Duke u ruajtur...' : (isEditMode ? 'Përditëso' : 'Krijo')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
