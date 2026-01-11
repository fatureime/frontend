import { useState } from 'react';
import { articlesApi, Article, CreateArticleData } from '../services/api';
import './ArticleForm.scss';

interface ArticleFormProps {
  businessId: number;
  article?: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

const ArticleForm = ({ businessId, article, onSave, onCancel }: ArticleFormProps) => {
  const isEditMode = !!article;

  const [formData, setFormData] = useState<CreateArticleData>({
    name: article?.name || '',
    description: article?.description || '',
    unit_price: article?.unit_price ? parseFloat(article.unit_price) : 0,
    unit: article?.unit || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (isEditMode && article) {
        await articlesApi.updateArticle(businessId, article.id, cleanedData);
      } else {
        await articlesApi.createArticle(businessId, cleanedData);
      }
      onSave();
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

  return (
    <div className="article-form">
      <h2>{isEditMode ? 'Ndrysho Artikullin' : 'Krijo Artikull'}</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Duke u ruajtur...' : (isEditMode ? 'Ruaj Ndryshimet' : 'Krijo Artikull')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Anulo
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
