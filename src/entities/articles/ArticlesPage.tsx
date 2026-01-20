import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesApi, Article, businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import ArticlesList from './ArticlesList';
import ArticlesGrid from './ArticlesGrid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import './ArticlesPage.scss';

type ViewMode = 'list' | 'grid';

const ArticlesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const currentBusinessId = user?.tenant?.issuer_business_id || null;
  const [articles, setArticles] = useState<Article[]>([]);
  const [, setBusiness] = useState<Business | null>(null);
  const [, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(currentBusinessId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('articles-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      
      // Set current business based on issuer_business_id from user context or selected business
      const targetBusinessId = selectedBusinessId || currentBusinessId;
      if (targetBusinessId) {
        const foundBusiness = data.find(b => b.id === targetBusinessId);
        if (foundBusiness) {
          setBusiness(foundBusiness);
        }
      } else if (data.length > 0 && isAdminTenant) {
        // If no issuer_business_id and admin tenant, use first available business
        setBusiness(data[0]);
        setSelectedBusinessId(data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    }
  }, [selectedBusinessId, currentBusinessId, isAdminTenant]);

  const loadBusiness = useCallback(async () => {
    const targetBusinessId = selectedBusinessId || currentBusinessId;
    if (!targetBusinessId) return;
    try {
      const data = await businessesApi.getBusiness(targetBusinessId);
      setBusiness(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i biznesit');
    }
  }, [selectedBusinessId, currentBusinessId]);

  const loadArticles = useCallback(async () => {
    const targetBusinessId = selectedBusinessId || currentBusinessId;
    if (!targetBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.getArticles(targetBusinessId);
      setArticles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i artikujve');
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, currentBusinessId]);

  useEffect(() => {
    if (!currentBusinessId && !isAdminTenant) {
      setError('Nuk u gjet subjekt. Ju lutem kontaktoni administratorin.');
      setLoading(false);
      return;
    }
    loadBusinesses();
  }, [currentBusinessId, isAdminTenant, loadBusinesses]);

  useEffect(() => {
    const targetBusinessId = selectedBusinessId || currentBusinessId;
    if (targetBusinessId) {
      loadBusiness();
      loadArticles();
    }
  }, [selectedBusinessId, currentBusinessId, loadBusiness, loadArticles]);

  // Removed unused handleBusinessChange function

  const handleCreate = () => {
    navigate('/articles/create');
  };

  const handleView = (article: Article) => {
    navigate(`/articles/${article.id}`);
  };

  const handleEdit = (article: Article) => {
    navigate(`/articles/${article.id}/edit`);
  };

  const handleDelete = async (articleId: number) => {
    if (!currentBusinessId) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë artikull? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await articlesApi.deleteArticle(currentBusinessId, articleId);
      await loadArticles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e artikullit');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('articles-view-mode', mode);
  };

  const handleToggleView = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    handleViewModeChange(newMode);
  };

  if (!currentBusinessId) {
    return (
      <div className="articles-page">
        <div className="container">
          <div className="error-message">ID e biznesit nuk u gjet.</div>
        </div>
      </div>
    );
  }

  if (loading && articles.length === 0) {
    return (
      <div className="articles-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar artikujt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-page">
      <div className="container">
        <div className="articles-header">
          <div className="header-actions">
            <button onClick={handleCreate} className="btn btn-primary">
              Krijo Artikull
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

        <div className="articles-content">
          {viewMode === 'list' ? (
            <ArticlesList
              articles={articles}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ArticlesGrid
              articles={articles}
              loading={loading}
              error={null}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
