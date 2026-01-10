import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, tenantsApi, User, Tenant } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import UserForm from './UserForm';
import InviteUserForm from './InviteUserForm';
import './UsersPage.scss';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;
  const isAdminTenant = user?.tenant?.is_admin === true;

  const loadUsers = useCallback(async (tenantId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getUsers(tenantId);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTenants = useCallback(async () => {
    try {
      const data = await tenantsApi.getTenants();
      setTenants(data);
    } catch (err: any) {
      console.error('Failed to load tenants:', err);
    }
  }, []);

  useEffect(() => {
    // Redirect if user is not admin
    if (user && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    if (isAdmin) {
      if (isAdminTenant) {
        loadTenants();
      }
      loadUsers();
    }
  }, [user, isAdmin, isAdminTenant, navigate, loadUsers, loadTenants]);

  const handleTenantFilter = (tenantId: number | null) => {
    setSelectedTenantId(tenantId);
    loadUsers(tenantId || undefined);
  };

  const handleEdit = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setIsEditing(true);
    setIsInviting(false);
  };

  const handleInvite = () => {
    setSelectedUser(null);
    setIsInviting(true);
    setIsEditing(false);
  };

  const handleSave = async () => {
    await loadUsers(selectedTenantId || undefined);
    setIsEditing(false);
    setIsInviting(false);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsInviting(false);
    setSelectedUser(null);
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      await loadUsers(selectedTenantId || undefined);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  // Show access denied if user is not admin
  if (user && !isAdmin) {
    return (
      <div className="users-page">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to access user management. Only admin users can view this page.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="users-page">
        <div className="container">
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="container">
        <div className="users-header">
          <h1>User Management</h1>
          <div className="users-header-actions">
            {user?.tenant && (
              <div className="current-tenant-info">
                <span>Current Tenant: <strong>{user.tenant.name}</strong></span>
                {user.tenant.is_admin && <span className="badge admin">Admin</span>}
              </div>
            )}
            <button onClick={handleInvite} className="btn btn-primary">
              Invite User
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isInviting ? (
          <InviteUserForm
            tenants={isAdminTenant ? tenants : []}
            defaultTenantId={user?.tenant?.id || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : isEditing && selectedUser ? (
          <UserForm
            user={selectedUser}
            tenants={isAdminTenant ? tenants : []}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="users-content">
            {isAdminTenant && tenants.length > 0 && (
              <div className="tenant-filter">
                <label htmlFor="tenant-filter">Filter by Tenant:</label>
                <select
                  id="tenant-filter"
                  value={selectedTenantId || ''}
                  onChange={(e) => handleTenantFilter(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">All Tenants</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="users-list">
              <h2>Users</h2>
              {users.length === 0 ? (
                <p className="no-users">No users found.</p>
              ) : (
                <div className="user-cards">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="user-card">
                      <div className="user-card-header">
                        <h3>{userItem.email}</h3>
                        <div className="user-badges">
                          {userItem.roles?.includes('ROLE_ADMIN') && (
                            <span className="badge admin">Admin</span>
                          )}
                          {userItem.is_active ? (
                            <span className="badge active">Active</span>
                          ) : (
                            <span className="badge inactive">Inactive</span>
                          )}
                          {!userItem.email_verified && (
                            <span className="badge unverified">Unverified</span>
                          )}
                        </div>
                      </div>
                      <div className="user-card-body">
                        <p><strong>ID:</strong> {userItem.id}</p>
                        <p><strong>Roles:</strong> {userItem.roles?.join(', ') || 'ROLE_USER'}</p>
                        {userItem.tenant && (
                          <p><strong>Tenant:</strong> {userItem.tenant.name}</p>
                        )}
                        {userItem.created_at && (
                          <p><strong>Created:</strong> {new Date(userItem.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="user-card-actions">
                        <button onClick={() => handleEdit(userItem)} className="btn btn-primary">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(userItem.id)}
                          className="btn btn-danger"
                          disabled={userItem.id === user?.id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
