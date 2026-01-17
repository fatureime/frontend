import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { articlesApi, Article, businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import ArticleForm from './ArticleForm';
import './ArticlesPage.scss';

const ArticlesPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<number | null>(businessId ? parseInt(businessId) : null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      
      // Set current business based on businessId from URL or default
      if (businessId) {
        const foundBusiness = data.find(b => b.id === parseInt(businessId));
        if (foundBusiness) {
          setBusiness(foundBusiness);
          setCurrentBusinessId(parseInt(businessId));
        } else if (data.length > 0) {
          // If businessId not found, use first available business
          setBusiness(data[0]);
          setCurrentBusinessId(data[0].id);
        }
      } else if (data.length > 0) {
        // If no businessId in URL, use first available business
        setBusiness(data[0]);
        setCurrentBusinessId(data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    }
  }, [businessId]);

  const loadBusiness = useCallback(async () => {
    if (!currentBusinessId) return;
    try {
      const data = await businessesApi.getBusiness(currentBusinessId);
      setBusiness(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i biznesit');
    }
  }, [currentBusinessId]);

  const loadArticles = useCallback(async () => {
    if (!currentBusinessId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.getArticles(currentBusinessId);
      setArticles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i artikujve');
    } finally {
      setLoading(false);
    }
  }, [currentBusinessId]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (currentBusinessId) {
      loadBusiness();
      loadArticles();
    }
  }, [currentBusinessId, loadBusiness, loadArticles]);

  const handleBusinessChange = (newBusinessId: number) => {
    setCurrentBusinessId(newBusinessId);
    const foundBusiness = businesses.find(b => b.id === newBusinessId);
    if (foundBusiness) {
      setBusiness(foundBusiness);
    }
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    await loadArticles();
    setIsEditing(false);
    setIsCreating(false);
    setSelectedArticle(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedArticle(null);
  };

  const handleDelete = async (articleId: number) => {
    if (!currentBusinessId) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë artikull? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await articlesApi.deleteArticle(currentBusinessId, articleId);
      await loadArticles();
      if (selectedArticle?.id === articleId) {
        setSelectedArticle(null);
        setIsEditing(false);
      }
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

        {(isEditing || isCreating) ? (
          <ArticleForm
            businessId={currentBusinessId}
            article={selectedArticle || null}
            businesses={businesses}
            currentBusiness={business}
            isAdminTenant={isAdminTenant}
            onBusinessChange={handleBusinessChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
