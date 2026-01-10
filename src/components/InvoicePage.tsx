import { useState } from 'react';
import './InvoicePage.scss';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoicePage = () => {
  const [invoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  
  const [taxRate, setTaxRate] = useState(20); // 20% VAT

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleGeneratePDF = () => {
    alert('Funksionaliteti i gjenerimit të PDF do të implementohet më vonë.');
  };

  const handleSaveDraft = () => {
    alert('Fatura u ruajt si draft me sukses!');
  };

  const handleClear = () => {
    if (window.confirm('Jeni të sigurt që dëshironi të pastroni të gjitha të dhënat?')) {
      setCustomerName('');
      setCustomerAddress('');
      setCustomerEmail('');
      setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  };

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-header">
          <h1 className="invoice-title">Krijo Faturë</h1>
        </div>

        <div className="invoice-content">
          {/* Invoice Info Section */}
          <div className="invoice-section">
            <h2 className="section-title">Informacioni i Faturës</h2>
            <div className="invoice-info-grid">
              <div className="info-group">
                <label className="info-label">Numri i Faturës</label>
                <input
                  type="text"
                  className="info-input"
                  value={invoiceNumber}
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
            </div>
          </div>

          {/* Customer Info Section */}
          <div className="invoice-section">
            <h2 className="section-title">Informacioni i Klientit</h2>
            <div className="customer-info-grid">
              <div className="info-group">
                <label className="info-label">Emri i Klientit</label>
                <input
                  type="text"
                  className="info-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Emri i plotë i klientit"
                />
              </div>
              <div className="info-group">
                <label className="info-label">Email</label>
                <input
                  type="email"
                  className="info-input"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="info-group info-group--full">
                <label className="info-label">Adresa</label>
                <textarea
                  className="info-textarea"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Adresa e plotë e klientit"
                  rows={3}
                />
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
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="col-price">
                        <input
                          type="number"
                          className="table-input"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
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

            {/* Tax and Totals */}
            <div className="invoice-totals">
              <div className="totals-row">
                <span className="totals-label">Nëntotali:</span>
                <span className="totals-value">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="totals-row">
                <div className="tax-input-group">
                  <label className="tax-label">TVSH (%):</label>
                  <input
                    type="number"
                    className="tax-input"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <span className="totals-value">{calculateTax().toFixed(2)} €</span>
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
              onClick={handleClear}
            >
              Pastro
            </button>
            <div className="actions-right">
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleSaveDraft}
              >
                Ruaj si Draft
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleGeneratePDF}
              >
                Gjenero PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
