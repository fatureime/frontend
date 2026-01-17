import { useState } from 'react';
import { usersApi, Tenant } from '../../services/api';
import './InviteUserForm.scss';

interface InviteUserFormProps {
  tenants: Tenant[];
  defaultTenantId?: number;
  onSave: () => void;
  onCancel: () => void;
}

const InviteUserForm = ({ tenants, defaultTenantId, onSave, onCancel }: InviteUserFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    roles: ['ROLE_USER'],
    tenant_id: defaultTenantId || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const inviteData: any = {
        email: formData.email,
        roles: formData.roles,
      };

      if (formData.tenant_id) {
        inviteData.tenant_id = formData.tenant_id;
      }

      await usersApi.inviteUser(inviteData);
      setSuccess('Ftesa u dërgua me sukses!');
      setTimeout(() => {
        onSave();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi dërgimi i ftesës');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'roles') {
      // Handle roles toggle
      const roles = formData.roles.includes('ROLE_ADMIN')
        ? ['ROLE_USER']
        : ['ROLE_USER', 'ROLE_ADMIN'];
      setFormData(prev => ({ ...prev, roles }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'tenant_id' ? (value ? parseInt(value) : null) : value,
      }));
    }
  };

  return (
    <div className="invite-user-form">
      <h2>Fto Përdorues</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Adresa e Email-it</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="user@example.com"
          />
          <small>Një email ftese do të dërgohet në këtë adresë</small>
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
          <button type="submit" className="btn btn-primary" disabled={loading || !!success}>
            {loading ? 'Duke u dërguar...' : success ? 'U Dërgua!' : 'Dërgo Ftesën'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Anulo
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteUserForm;
