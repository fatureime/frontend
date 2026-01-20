import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import Button from '../../components/Button';
import './BusinessView.scss';

const BusinessView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await businessesApi.getBusiness(parseInt(id));
      setBusiness(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i subjektit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const handleEdit = () => {
    if (id) {
      navigate(`/businesses/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !business) return;

    const isIssuer = user?.tenant?.issuer_business_id === business.id;
    if (isIssuer) {
      setError('Nuk mund të fshihet subjekti emetues. Ky subjekt përdoret për krijimin e faturave.');
      return;
    }

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë subjekt? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await businessesApi.deleteBusiness(business.id);
      navigate('/businesses');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e biznesit');
    }
  };

  if (loading) {
    return (
      <div className="business-view">
        <div className="container">
          <div className="loading">Duke u ngarkuar subjekti...</div>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="business-view">
        <div className="container">
          <div className="error-message">
            {error}
            <Button onClick={() => navigate('/businesses')} variant="secondary">
              Kthehu te Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-view">
        <div className="container">
          <div className="error-message">Subjekti nuk u gjet</div>
        </div>
      </div>
    );
  }

  const isIssuer = user?.tenant?.issuer_business_id === business.id;

  return (
    <div className="business-view">
      <div className="container">
        <div className="business-view-header">
          <Button onClick={() => navigate('/businesses')} variant="secondary">
            ← Kthehu te Lista
          </Button>
          <div className="business-view-actions">
            <Button onClick={handleEdit} variant="primary">
              Ndrysho
            </Button>
            {!isIssuer && (
              <Button onClick={handleDelete} variant="danger">
                Fshi
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="business-view-content">
          <div className="business-details">
            <div className="business-details-header">
              {business.logo && (
                <img 
                  src={business.logo} 
                  alt={`${business.business_name} logo`}
                  className="business-logo"
                />
              )}
              <div className="business-title-section">
                <h2>{business.business_name}</h2>
                {isIssuer && (
                  <span className="badge issuer">Biznesi Lëshues</span>
                )}
              </div>
            </div>

            <div className="business-details-body">
              {business.trade_name && (
                <div className="detail-row">
                  <strong>Emri tregtar:</strong>
                  <span>{business.trade_name}</span>
                </div>
              )}

              {business.business_type && (
                <div className="detail-row">
                  <strong>Lloji i subjektit:</strong>
                  <span>{business.business_type}</span>
                </div>
              )}

              {business.fiscal_number && (
                <div className="detail-row">
                  <strong>Numri Fiskal:</strong>
                  <span>{business.fiscal_number}</span>
                </div>
              )}

              {business.vat_number && (
                <div className="detail-row">
                  <strong>Numri i TVSH-së:</strong>
                  <span>{business.vat_number}</span>
                </div>
              )}

              {business.business_number && (
                <div className="detail-row">
                  <strong>Numri i biznesit:</strong>
                  <span>{business.business_number}</span>
                </div>
              )}

              {business.unique_identifier_number && (
                <div className="detail-row">
                  <strong>Numri unik identifikues:</strong>
                  <span>{business.unique_identifier_number}</span>
                </div>
              )}

              {business.number_of_employees !== undefined && business.number_of_employees !== null && (
                <div className="detail-row">
                  <strong>Numri punëtorëve:</strong>
                  <span>{business.number_of_employees}</span>
                </div>
              )}

              {business.municipality && (
                <div className="detail-row">
                  <strong>Komuna:</strong>
                  <span>{business.municipality}</span>
                </div>
              )}

              {business.address && (
                <div className="detail-row">
                  <strong>Adresa:</strong>
                  <span>{business.address}</span>
                </div>
              )}

              {business.email && (
                <div className="detail-row">
                  <strong>E-mail:</strong>
                  <span>{business.email}</span>
                </div>
              )}

              {business.phone && (
                <div className="detail-row">
                  <strong>Telefoni:</strong>
                  <span>{business.phone}</span>
                </div>
              )}

              {business.capital && (
                <div className="detail-row">
                  <strong>Kapitali:</strong>
                  <span>{business.capital} €</span>
                </div>
              )}

              {business.arbk_status && (
                <div className="detail-row">
                  <strong>Statusi në ARBK:</strong>
                  <span>{business.arbk_status}</span>
                </div>
              )}

              {business.registration_date && (
                <div className="detail-row">
                  <strong>Data e regjistrimit:</strong>
                  <span>{new Date(business.registration_date).toLocaleDateString()}</span>
                </div>
              )}

              {business.created_by && (
                <div className="detail-row">
                  <strong>Krijuar nga:</strong>
                  <span>{business.created_by.email}</span>
                </div>
              )}

              {business.created_at && (
                <div className="detail-row">
                  <strong>Krijuar:</strong>
                  <span>{new Date(business.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessView;
