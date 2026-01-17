import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, User } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './UsersPage.scss';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') === true;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Redirect if user is not admin
    if (user && !isAdmin) {
      navigate('/businesses');
      return;
    }
    
    if (isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin, navigate, loadUsers]);

  const handleView = (userToView: User) => {
    navigate(`/users/${userToView.id}`);
  };

  const handleEdit = (userToEdit: User) => {
    navigate(`/users/${userToEdit.id}/edit`);
  };

  const handleInvite = () => {
    navigate('/users/create');
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë përdorues? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e përdoruesit');
    }
  };

  // Show access denied if user is not admin
  if (user && !isAdmin) {
    return (
      <div className="users-page">
        <div className="container">
          <div className="access-denied">
            <h2>Qasja e Refuzuar</h2>
            <p>Ju nuk keni leje për të aksesuar menaxhimin e përdoruesve. Vetëm përdoruesit menagjerial mund ta shohin këtë faqe.</p>
            <button onClick={() => navigate('/businesses')} className="btn btn-primary">
              Shko te Subjektet
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
          <div className="loading">Duke u ngarkuar përdoruesit...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="container">
        <div className="users-header">
          <div className="users-header-actions">
            <button onClick={handleInvite} className="btn btn-primary">
              Fto Përdorues
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="users-content">
          <div className="users-list">
            {users.length === 0 ? (
              <p className="no-users">Nuk u gjetën përdorues.</p>
            ) : (
              <div className="user-cards">
                {users.map((userItem) => (
                  <div key={userItem.id} className="user-card">
                    <div className="user-card-header">
                      <h3>{userItem.email}</h3>
                      <div className="user-badges">
                        {userItem.roles?.includes('ROLE_ADMIN') && (
                          <span className="badge admin">Menagjues</span>
                        )}
                        {userItem.is_active ? (
                          <span className="badge active">Aktiv</span>
                        ) : (
                          <span className="badge inactive">Jo Aktiv</span>
                        )}
                        {!userItem.email_verified && (
                          <span className="badge unverified">I Paverifikuar</span>
                        )}
                      </div>
                    </div>
                    <div className="user-card-body">
                      <p><strong>ID:</strong> {userItem.id}</p>
                      <p><strong>Rolet:</strong> {userItem.roles?.join(', ') || 'ROLE_USER'}</p>
                      {userItem.tenant && (
                        <p><strong>Hapësirëmarrësi:</strong> {userItem.tenant.name}</p>
                      )}
                      {userItem.created_at && (
                        <p><strong>Krijuar:</strong> {new Date(userItem.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="user-card-actions">
                      <button onClick={() => handleView(userItem)} className="btn btn-secondary">
                        Shiko
                      </button>
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
      </div>
    </div>
  );
};

export default UsersPage;
