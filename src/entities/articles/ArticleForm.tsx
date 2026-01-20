import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi, Article, CreateArticleData, Business, businessesApi } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import Button from '../../components/Button';
import './ArticleForm.scss';

const ArticleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminTenant = user?.tenant?.is_admin === true;
  const businessId = user?.tenant?.issuer_business_id;
  const isEditMode = !!id;

  const [, setArticle] = useState<Article | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);

  const [formData, setFormData] = useState<CreateArticleData>({
    name: '',
    description: '',
    unit_price: 0,
    unit: '',
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState<number>(() => {
    return businessId || 0;
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
      
      if (businessId) {
        const foundBusiness = data.find(b => b.id === businessId);
        if (foundBusiness) {
          setCurrentBusiness(foundBusiness);
          setSelectedBusinessId(foundBusiness.id);
        }
      } else if (data.length > 0) {
        setCurrentBusiness(data[0]);
        setSelectedBusinessId(data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    }
  }, [businessId]);

  const loadArticle = useCallback(async () => {
    if (!businessId || !id) return;

    try {
      setInitialLoading(true);
      setError(null);
      const articleData = await articlesApi.getArticle(businessId, parseInt(id));
      setArticle(articleData);
      setFormData({
        name: articleData.name || '',
        description: articleData.description || '',
        unit_price: articleData.unit_price ? parseFloat(articleData.unit_price) : 0,
        unit: articleData.unit || '',
      });
      setSelectedBusinessId(articleData.business_id);
      
      const businessData = await businessesApi.getBusiness(articleData.business_id);
      setCurrentBusiness(businessData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i artikullit');
    } finally {
      setInitialLoading(false);
    }
  }, [businessId, id]);

  useEffect(() => {
    loadBusinesses();
    if (isEditMode) {
      loadArticle();
    }
  }, [isEditMode, loadBusinesses, loadArticle]);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBusinessId = parseInt(e.target.value);
    setSelectedBusinessId(newBusinessId);
    const foundBusiness = businesses.find(b => b.id === newBusinessId);
    if (foundBusiness) {
      setCurrentBusiness(foundBusiness);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanedData: CreateArticleData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        unit_price: formData.unit_price,
        unit: formData.unit?.trim() || undefined,
      };

      const targetBusinessId = isAdminTenant ? selectedBusinessId : (businessId || selectedBusinessId);
      if (!targetBusinessId) {
        setError('Ju lutem zgjidhni një subjekt');
        setLoading(false);
        return;
      }
      if (isEditMode && id) {
        await articlesApi.updateArticle(targetBusinessId, parseInt(id), cleanedData);
        navigate(`/articles/${id}`);
      } else {
        const created = await articlesApi.createArticle(targetBusinessId, cleanedData);
        navigate(`/articles/${created.id}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(errorMessage || (isEditMode ? 'Dështoi përditësimi i artikullit' : 'Dështoi krijimi i artikullit'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (type === 'number') {
        if (value === '') {
          return { ...prev, [name]: 0 };
        }
        const numValue = parseFloat(value);
        return { ...prev, [name]: isNaN(numValue) ? 0 : numValue };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/articles/${id}`);
    } else {
      navigate('/articles');
    }
  };

  // Scroll to top when error appears
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  if (initialLoading) {
    return (
      <div className="article-form">
        <div className="container">
          <div className="loading">Duke u ngarkuar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-form">
      <div className="container">
        <div className="article-form-header">
          <Button onClick={handleCancel} variant="secondary">
            ← Anulo
          </Button>
        </div>
        <h2>{isEditMode ? 'Ndrysho Artikullin' : 'Krijo Artikull'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        {businesses.length > 0 && (
          <div className="form-group">
            <label htmlFor="business">Subjekti</label>
            {isAdminTenant ? (
              <select
                id="business"
                name="business"
                value={selectedBusinessId}
                onChange={handleBusinessChange}
                disabled={loading}
                className="form-select"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.business_name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="business"
                name="business"
                value={currentBusiness?.business_name || ''}
                disabled
                className="form-input-disabled"
                style={{ backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            )}
            <small className="form-hint">
              {isAdminTenant ? 'Zgjidhni subjektin për të cilin dëshironi të krijoni artikullin' : 'Subjekti aktual i hapësirëmarrësit tuaj'}
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Emri i artikullit *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="P.sh. Konsultim, Produkt, Shërbim"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Përshkrimi</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            disabled={loading}
            placeholder="Përshkrimi i detajuar i artikullit (opsionale)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit_price">Çmimi për njësi *</label>
          <input
            type="number"
            id="unit_price"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={loading}
          />
          <small className="form-hint">Çmimi në euro (€)</small>
        </div>

        <div className="form-group">
          <label htmlFor="unit">Njësia matëse</label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={formData.unit || ''}
            onChange={handleChange}
            disabled={loading}
            placeholder="P.sh. orë, copë, kg, m²"
          />
          <small className="form-hint">Njësia e matjes (opsionale)</small>
        </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Artikull')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Anulo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleForm;
