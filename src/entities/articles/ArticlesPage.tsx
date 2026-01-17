import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesApi, Article, businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './ArticlesPage.scss';

const ArticlesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const currentBusinessId = user?.tenant?.issuer_business_id || null;
  const [articles, setArticles] = useState<Article[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(currentBusinessId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBusinessChange = (newBusinessId: number) => {
    // For admin tenants, they can switch businesses
    setSelectedBusinessId(newBusinessId);
    const foundBusiness = businesses.find(b => b.id === newBusinessId);
    if (foundBusiness) {
      setBusiness(foundBusiness);
    }
  };

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

  if (!currentBusinessId) {
    return (
      <div className="articles-page">
        <div className="container">
          <div className="error-message">ID e biznesit nuk u gjet.</div>
        </div>
      </div>
    );
  }

  if (loading) {
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
          <button onClick={handleCreate} className="btn btn-primary">
            Krijo Artikull
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="articles-content">
          <div className="articles-list">
            {articles.length === 0 ? (
              <p className="no-articles">Nuk u gjetën artikuj.</p>
            ) : (
              <div className="article-cards">
                {articles.map((article) => (
                  <div key={article.id} className="article-card">
                    <div className="article-card-header">
                      <h3>{article.name}</h3>
                    </div>
                    <div className="article-card-body">
                      {article.description && (
                        <p><strong>Përshkrimi:</strong> {article.description}</p>
                      )}
                      <p><strong>Çmimi për njësi:</strong> {parseFloat(article.unit_price).toFixed(2)} €</p>
                      {article.unit && (
                        <p><strong>Njësia:</strong> {article.unit}</p>
                      )}
                      {article.created_at && (
                        <p><strong>Krijuar:</strong> {new Date(article.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="article-card-actions">
                      <button onClick={() => handleView(article)} className="btn btn-secondary">
                        Shiko
                      </button>
                      <button onClick={() => handleEdit(article)} className="btn btn-primary">
                        Ndrysho
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="btn btn-danger"
                      >
                        Fshi
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

export default ArticlesPage;
