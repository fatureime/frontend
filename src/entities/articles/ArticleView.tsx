import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi, Article, businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './ArticleView.scss';

const ArticleView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const businessId = user?.tenant?.issuer_business_id;
  const [article, setArticle] = useState<Article | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticle = useCallback(async () => {
    if (!businessId || !id) return;

    try {
      setLoading(true);
      setError(null);
      const articleData = await articlesApi.getArticle(businessId, parseInt(id));
      setArticle(articleData);
      
      // Load business info
      const businessData = await businessesApi.getBusiness(businessId);
      setBusiness(businessData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i artikullit');
    } finally {
      setLoading(false);
    }
  }, [businessId, id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleEdit = () => {
    if (id) {
      navigate(`/businesses/articles/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !id || !article) return;

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë artikull? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await articlesApi.deleteArticle(businessId, article.id);
      navigate('/businesses/articles');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e artikullit');
    }
  };

  if (loading) {
    return (
      <div className="article-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar artikulli...</div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="article-view">
        <div className="container">
          <div className="error-message">
            {error}
            <button onClick={() => navigate('/businesses/articles')} className="btn btn-secondary">
              Kthehu te Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-view">
        <div className="container">
          <div className="error-message">Artikulli nuk u gjet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-view">
      <div className="container">
        <div className="article-view-header">
          <button onClick={() => navigate('/businesses/articles')} className="btn btn-secondary">
            ← Kthehu te Lista
          </button>
          <div className="article-view-actions">
            <button onClick={handleEdit} className="btn btn-primary">
              Ndrysho
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Fshi
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="article-view-content">
          <div className="article-details">
            <div className="article-details-header">
              <h2>{article.name}</h2>
              {business && (
                <div className="article-business">
                  <strong>Subjekti:</strong> {business.business_name}
                </div>
              )}
            </div>

            <div className="article-details-body">
              {article.description && (
                <div className="detail-row">
                  <strong>Përshkrimi:</strong>
                  <span>{article.description}</span>
                </div>
              )}

              <div className="detail-row">
                <strong>Çmimi për njësi:</strong>
                <span>{parseFloat(article.unit_price).toFixed(2)} €</span>
              </div>

              {article.unit && (
                <div className="detail-row">
                  <strong>Njësia:</strong>
                  <span>{article.unit}</span>
                </div>
              )}

              {article.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
