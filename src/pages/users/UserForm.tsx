import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, tenantsApi, User, Tenant } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './UserForm.scss';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isEditMode = !!id;

  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    roles: ['ROLE_USER'],
    is_active: true,
    tenant_id: null as number | null,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const isAdminTenant = currentUser?.tenant?.is_admin === true;

  const loadTenants = useCallback(async () => {
    if (!isAdminTenant) return;
    try {
      const data = await tenantsApi.getTenants();
      setTenants(data);
    } catch (err: any) {
      console.error('Failed to load tenants:', err);
    }
  }, [isAdminTenant]);

  const loadUser = useCallback(async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      setError(null);
      const data = await usersApi.getUsers();
      const foundUser = data.find(u => u.id === parseInt(id));
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          email: foundUser.email,
          roles: foundUser.roles || ['ROLE_USER'],
          is_active: foundUser.is_active,
          tenant_id: foundUser.tenant?.id || null,
          password: '',
        });
      } else {
        setError('Përdoruesi nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i përdoruesit');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      loadUser();
    }
    if (isAdminTenant) {
      loadTenants();
    }
  }, [isEditMode, loadUser, isAdminTenant, loadTenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && id) {
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

        await usersApi.updateUser(parseInt(id), updateData);
        navigate(`/users/${id}`);
      } else {
        navigate('/users');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi përditësimi i përdoruesit');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/users/${id}`);
    } else {
      navigate('/users');
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

  if (initialLoading) {
    return (
      <div className="user-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-form">
      <div className="container">
        <div className="user-form-header">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Anulo
          </button>
        </div>
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
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
