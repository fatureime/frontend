import { useState, useEffect } from 'react';
import { tenantsApi, Tenant } from '../services/api';
import './TenantForm.scss';

interface TenantFormProps {
  tenant: Tenant;
  onSave: () => void;
  onCancel: () => void;
}

const TenantForm = ({ tenant, onSave, onCancel }: TenantFormProps) => {
  const [formData, setFormData] = useState({
    name: tenant.name,
    has_paid: tenant.has_paid,
    is_admin: tenant.is_admin,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await tenantsApi.updateTenant(tenant.id, formData);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="tenant-form">
      <h2>Edit Tenant</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Tenant Name</label>
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
            <span>Has Paid</span>
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
            <span>Admin Tenant (can access all businesses)</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenantForm;
