import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, User } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import UsersList from './UsersList';
import UsersGrid from './UsersGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './UsersPage.scss';

type ViewMode = 'list' | 'grid';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('users-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('users-view-mode', mode);
  };

  const handleToggleView = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    handleViewModeChange(newMode);
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
          <div className="view-toggle">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Lista"
            >
              <ViewListIcon />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Tabelë"
            >
              <GridViewIcon />
            </button>
            <button
              onClick={handleToggleView}
              className="toggle-btn toggle-btn-mobile"
              title={viewMode === 'list' ? 'Shfaq tabelë' : 'Shfaq listë'}
            >
              {viewMode === 'list' ? <GridViewIcon /> : <ViewListIcon />}
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
          {viewMode === 'list' ? (
            <UsersList
              users={users}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ) : (
            <UsersGrid
              users={users}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
