import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantsApi, Tenant } from '../../services/api';
import './TenantForm.scss';

const TenantForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [, setTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    has_paid: false,
    is_admin: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      setError(null);
      const data = await tenantsApi.getTenants();
      const foundTenant = data.find(t => t.id === parseInt(id));
      if (foundTenant) {
        setTenant(foundTenant);
        setFormData({
          name: foundTenant.name,
          has_paid: foundTenant.has_paid,
          is_admin: foundTenant.is_admin,
        });
      } else {
        setError('Hapësirëmarrësi nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i hapësirëmarrësit');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      loadTenant();
    }
  }, [isEditMode, loadTenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && id) {
        await tenantsApi.updateTenant(parseInt(id), formData);
        navigate(`/tenants/${id}`);
      } else {
        // Create mode - not implemented in API yet, but handle route
        navigate('/tenants');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi përditësimi i hapësirëmarrësit');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/tenants/${id}`);
    } else {
      navigate('/tenants');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (initialLoading) {
    return (
      <div className="tenant-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-form">
      <div className="container">
        <div className="tenant-form-header">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Anulo
          </button>
        </div>
        <h2>{isEditMode ? 'Ndrysho Hapësirëmarrësin' : 'Krijo Hapësirëmarrës'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        <div className="form-group">
          <label htmlFor="name">Emri i Hapësirëmarrësit</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="has_paid"
              checked={formData.has_paid}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Ka Paguar</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Hapësirëmarrës Menagjuesit (mund të aksesojë të gjitha hapësirëmarrësit)</span>
          </label>
        </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Hapësirëmarrës')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;
