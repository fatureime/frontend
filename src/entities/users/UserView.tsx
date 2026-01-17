import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, User } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './UserView.scss';

const UserView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') === true;

  const loadUser = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getUsers();
      const foundUser = data.find(u => u.id === parseInt(id));
      if (foundUser) {
        setUser(foundUser);
      } else {
        setError('Përdoruesi nuk u gjet');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i përdoruesit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/businesses');
      return;
    }
    loadUser();
  }, [currentUser, isAdmin, navigate, loadUser]);

  const handleEdit = () => {
    if (id) {
      navigate(`/users/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !user) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë përdorues? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await usersApi.deleteUser(user.id);
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e përdoruesit');
    }
  };

  if (loading) {
    return (
      <div className="user-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar përdoruesi...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="user-view">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={() => navigate('/users')} className="btn btn-secondary">
              Kthehu te Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-view">
        <div className="container">
          <div className="error-message">Përdoruesi nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-view">
      <div className="container">
        <div className="user-view-header">
          <button onClick={() => navigate('/users')} className="btn btn-secondary">
            ← Kthehu te Lista
          </button>
          <div className="user-view-actions">
            <button onClick={handleEdit} className="btn btn-primary">
              Edit
            </button>
            {user.id !== currentUser?.id && (
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="user-view-content">
          <div className="user-details">
            <div className="user-details-header">
              <h2>{user.email}</h2>
              <div className="user-badges">
                {user.roles?.includes('ROLE_ADMIN') && (
                  <span className="badge admin">Menagjues</span>
                )}
                {user.is_active ? (
                  <span className="badge active">Aktiv</span>
                ) : (
                  <span className="badge inactive">Jo Aktiv</span>
                )}
                {!user.email_verified && (
                  <span className="badge unverified">I Paverifikuar</span>
                )}
              </div>
            </div>

            <div className="user-details-body">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{user.id}</span>
              </div>

              <div className="detail-row">
                <strong>Email:</strong>
                <span>{user.email}</span>
              </div>

              <div className="detail-row">
                <strong>Rolet:</strong>
                <span>{user.roles?.join(', ') || 'ROLE_USER'}</span>
              </div>

              {user.tenant && (
                <div className="detail-row">
                  <strong>Hapësirëmarrësi:</strong>
                  <span>{user.tenant.name}</span>
                </div>
              )}

              {user.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
