import { useState } from 'react';
import { usersApi, User, Tenant } from '../../services/api';
import './UserForm.scss';

interface UserFormProps {
  user: User;
  tenants: Tenant[];
  onSave: () => void;
  onCancel: () => void;
}

const UserForm = ({ user, tenants, onSave, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState({
    email: user.email,
    roles: user.roles || ['ROLE_USER'],
    is_active: user.is_active,
    tenant_id: user.tenant?.id || null,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        email: formData.email,
        roles: formData.roles,
        is_active: formData.is_active,
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Only include tenant_id if tenants are available (admin tenant users)
      if (tenants.length > 0 && formData.tenant_id) {
        updateData.tenant_id = formData.tenant_id;
      }

      await usersApi.updateUser(user.id, updateData);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi përditësimi i përdoruesit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'roles') {
      // Handle roles as multi-select (for now, simple checkbox for ROLE_ADMIN)
      const roles = formData.roles.includes('ROLE_ADMIN')
        ? ['ROLE_USER']
        : ['ROLE_USER', 'ROLE_ADMIN'];
      setFormData(prev => ({ ...prev, roles }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || null : value),
      }));
    }
  };

  return (
    <div className="user-form">
      <h2>Ndrysho Përdoruesin</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Fjalëkalim i Ri (lëreni bosh për të mbajtur atë aktual)</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            minLength={8}
          />
          <small>Minimum 8 karaktere</small>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.roles.includes('ROLE_ADMIN')}
              onChange={(e) => {
                const roles = e.target.checked
                  ? ['ROLE_USER', 'ROLE_ADMIN']
                  : ['ROLE_USER'];
                setFormData(prev => ({ ...prev, roles }));
              }}
              disabled={loading}
            />
            <span>Përdorues Menagjues (mund të menaxhojë përdoruesit)</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Aktiv</span>
          </label>
        </div>

        {tenants.length > 0 && (
          <div className="form-group">
            <label htmlFor="tenant_id">Hapësirëmarrësi</label>
            <select
              id="tenant_id"
              name="tenant_id"
              value={formData.tenant_id || ''}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Zgjidh Hapësirëmarrësin</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Duke u ruajtur...' : 'Ruaj Ndryshimet'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Anulo
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
