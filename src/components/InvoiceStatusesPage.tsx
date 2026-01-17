import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceStatusesApi, InvoiceStatus } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { getStatusLabels, getStatusLabel, setStatusLabel } from '../utils/invoiceStatusLabels';
import './InvoiceStatusesPage.scss';

const InvoiceStatusesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState<Record<string, string>>({});

  // Check if user is part of an admin tenant
  const isAdminTenant = user?.tenant?.is_admin === true;
  // Check if user is admin (for edit/create/delete)
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const canEdit = isAdminTenant && isAdmin;

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceStatusesApi.getInvoiceStatuses();
      setStatuses(data);
      // Load labels from localStorage
      const statusLabels = getStatusLabels();
      setLabels(statusLabels);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ngarkimi i gjendjeve të faturave');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set page title
    document.title = 'Gjendjet e Faturave - Fatureime';
    
    // Redirect if user is not part of an admin tenant
    if (user && !isAdminTenant) {
      navigate('/businesses');
      return;
    }
    
    if (isAdminTenant) {
      loadStatuses();
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'Fatureime';
    };
  }, [user, isAdminTenant, navigate, loadStatuses]);

  const handleCreate = () => {
    setSelectedStatus(null);
    setCode('');
    setLabel('');
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (status: InvoiceStatus) => {
    setSelectedStatus(status);
    setCode(status.code);
    setLabel(getStatusLabel(status.code));
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleEditLabel = (status: InvoiceStatus) => {
    setSelectedStatus(status);
    setCode(status.code);
    setLabel(getStatusLabel(status.code));
    setIsEditingLabel(true);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!code.trim()) {
      setError('Kodi i gjendjes është i detyrueshëm');
      return;
    }

    try {
      setError(null);
      if (isCreating) {
        await invoiceStatusesApi.createInvoiceStatus({ code: code.trim() });
        // Save label if provided
        if (label.trim()) {
          setStatusLabel(code.trim(), label.trim());
        }
      } else if (selectedStatus) {
        await invoiceStatusesApi.updateInvoiceStatus(selectedStatus.id, { code: code.trim() });
        // Save label if provided
        if (label.trim()) {
          setStatusLabel(code.trim(), label.trim());
        }
      }
      await loadStatuses();
      setIsEditing(false);
      setIsCreating(false);
      setIsEditingLabel(false);
      setSelectedStatus(null);
      setCode('');
      setLabel('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ruajtja e gjendjes');
    }
  };

  const handleSaveLabel = () => {
    if (!selectedStatus || !label.trim()) {
      setError('Etiketa është e detyrueshme');
      return;
    }

    try {
      setError(null);
      setStatusLabel(selectedStatus.code, label.trim());
      loadStatuses();
      setIsEditingLabel(false);
      setSelectedStatus(null);
      setLabel('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi ruajtja e etiketës');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setIsEditingLabel(false);
    setSelectedStatus(null);
    setCode('');
    setLabel('');
    setError(null);
  };

  const handleDelete = async (statusId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë gjendje? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await invoiceStatusesApi.deleteInvoiceStatus(statusId);
      await loadStatuses();
      if (selectedStatus?.id === statusId) {
        setSelectedStatus(null);
        setIsEditing(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dështoi fshirja e gjendjes');
    }
  };

  // Show access denied if user is not part of an admin tenant
  if (user && !isAdminTenant) {
    return (
      <div className="invoice-statuses-page">
        <div className="container">
          <div className="access-denied">
            <h2>Qasja e Refuzuar</h2>
            <p>Ju nuk keni leje për të qasur menaxhimin e gjendjeve të faturave. Vetëm përdoruesit nga hapësirëmarrësit menagjues mund ta shohin këtë faqe.</p>
            <button onClick={() => navigate('/businesses')} className="btn btn-primary">
              Shko te Subjektet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="invoice-statuses-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar gjendje të faturave...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-statuses-page">
      <div className="container">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {(isEditing || isCreating) ? (
          <div className="invoice-status-form">
            <h3>{isCreating ? 'Krijo Gjendje të Re' : 'Ndrysho Gjendje'}</h3>
            <div className="form-group">
              <label htmlFor="code">Kodi i Gjendjes:</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="p.sh. draft, sent, paid"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="label">Etiketa (Shfaqja):</label>
              <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="p.sh. Draft, Dërguar, Paguar"
                className="form-input"
              />
              <small className="form-help">Etiketa përdoret vetëm për shfaqje në frontend</small>
            </div>
            <div className="form-actions">
              <button onClick={handleSave} className="btn btn-primary">
                Ruaj
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Anulo
              </button>
            </div>
          </div>
        ) : isEditingLabel && selectedStatus ? (
          <div className="invoice-status-form">
            <h3>Ndrysho Etiketën për "{selectedStatus.code}"</h3>
            <div className="form-group">
              <label htmlFor="label-edit">Etiketa:</label>
              <input
                id="label-edit"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="p.sh. Draft, Dërguar, Paguar"
                className="form-input"
              />
              <small className="form-help">Etiketa përdoret vetëm për shfaqje në frontend</small>
            </div>
            <div className="form-actions">
              <button onClick={handleSaveLabel} className="btn btn-primary">
                Ruaj Etiketën
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Anulo
              </button>
            </div>
          </div>
        ) : (
          <div className="invoice-statuses-content">
            {statuses.length === 0 ? (
              <p className="no-statuses">Nuk u gjetën gjendje të faturave.</p>
            ) : (
              <div className="statuses-table-container">
                <table className="statuses-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Kodi</th>
                      <th>Etiketa</th>
                      {canEdit && <th>Veprimet</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {statuses.map((status) => (
                      <tr key={status.id}>
                        <td>{status.id}</td>
                        <td><strong>{status.code}</strong></td>
                        <td>{labels[status.code] || getStatusLabel(status.code)}</td>
                        {canEdit && (
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEdit(status)}
                                className="btn btn-sm btn-primary"
                              >
                                Ndrysho Kod
                              </button>
                              <button
                                onClick={() => handleEditLabel(status)}
                                className="btn btn-sm btn-secondary"
                              >
                                Ndrysho Etiketë
                              </button>
                              <button
                                onClick={() => handleDelete(status.id)}
                                className="btn btn-sm btn-danger"
                              >
                                Fshi
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceStatusesPage;
