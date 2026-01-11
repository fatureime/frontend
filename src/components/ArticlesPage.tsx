import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { articlesApi, Article, businessesApi, Business } from '../services/api';
import ArticleForm from './ArticleForm';
import './ArticlesPage.scss';

const ArticlesPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await businessesApi.getBusiness(parseInt(businessId));
      setBusiness(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i biznesit');
    }
  }, [businessId]);

  const loadArticles = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.getArticles(parseInt(businessId));
      setArticles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i artikujve');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
      loadArticles();
    }
  }, [businessId, loadBusiness, loadArticles]);

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
    if (!businessId) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë artikull? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await articlesApi.deleteArticle(parseInt(businessId), articleId);
      await loadArticles();
      if (selectedArticle?.id === articleId) {
        setSelectedArticle(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e artikullit');
    }
  };

  if (!businessId) {
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
          <div>
            <h1>Menaxhimi i Artikujve</h1>
            {business && (
              <p className="business-name">{business.business_name}</p>
            )}
          </div>
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
            businessId={parseInt(businessId)}
            article={selectedArticle || null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="articles-content">
            <div className="articles-list">
              <h2>Artikujt</h2>
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
