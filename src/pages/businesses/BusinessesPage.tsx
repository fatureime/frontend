import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessesApi, Business } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';
import './BusinessesPage.scss';

const BusinessesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessesApi.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi ngarkimi i bizneseve');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleCreate = () => {
    navigate('/businesses/create');
  };

  const handleView = (business: Business) => {
    navigate(`/businesses/${business.id}`);
  };

  const handleEdit = (business: Business) => {
    navigate(`/businesses/${business.id}/edit`);
  };

  const handleDelete = async (businessId: number) => {
    // Check if this is the issuer business
    if (user?.tenant?.issuer_business_id === businessId) {
      setError('Nuk mund të fshihet subjekti emetues. Ky subjekt përdoret për krijimin e faturave.');
      return;
    }

    if (!window.confirm('Jeni të sigurt që dëshironi të fshini këtë subjekt? Ky veprim nuk mund të zhbëhet.')) {
      return;
    }

    try {
      await businessesApi.deleteBusiness(businessId);
      await loadBusinesses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Dështoi fshirja e biznesit');
    }
  };

  if (loading) {
    return (
      <div className="businesses-page">
        <div className="container">
          <div className="loading">Duke u ngarkuar subjektet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="businesses-page">
      <div className="container">
        <div className="businesses-header">
          <button onClick={handleCreate} className="btn btn-primary">
            Krijo Subjekt
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="businesses-content">
          <div className="businesses-list">
            {businesses.length === 0 ? (
              <p className="no-businesses">Nuk u gjetën subjekte.</p>
            ) : (
              <div className="business-cards">
                {businesses.map((business) => {
                  const isIssuer = user?.tenant?.issuer_business_id === business.id;
                  return (
                    <div key={business.id} className="business-card">
                      <div className="business-card-header">
                        {business.logo && (
                          <img 
                            src={business.logo} 
                            alt={`${business.business_name} logo`}
                            className="business-logo"
                            style={{ maxWidth: '100px', maxHeight: '60px', marginBottom: '10px', objectFit: 'contain' }}
                          />
                        )}
                        <h3>{business.business_name}</h3>
                        {isIssuer && (
                          <span className="badge issuer">Biznesi Lëshues</span>
                        )}
                      </div>
                      <div className="business-card-body">
                        {business.trade_name && (
                          <p><strong>Emri tregtar:</strong> {business.trade_name}</p>
                        )}
                        {business.business_type && (
                          <p><strong>Lloji i subjektit:</strong> {business.business_type}</p>
                        )}
                        {business.fiscal_number && (
                          <p><strong>Numri Fiskal:</strong> {business.fiscal_number}</p>
                        )}
                        {business.vat_number && (
                          <p><strong>Numri i TVSH-së:</strong> {business.vat_number}</p>
                        )}
                        {business.business_number && (
                          <p><strong>Numri i biznesit:</strong> {business.business_number}</p>
                        )}
                        {business.unique_identifier_number && (
                          <p><strong>Numri unik identifikues:</strong> {business.unique_identifier_number}</p>
                        )}
                        {business.number_of_employees !== undefined && business.number_of_employees !== null && (
                          <p><strong>Numri punëtorëve:</strong> {business.number_of_employees}</p>
                        )}
                        {business.municipality && (
                          <p><strong>Komuna:</strong> {business.municipality}</p>
                        )}
                        {business.email && (
                          <p><strong>E-mail:</strong> {business.email}</p>
                        )}
                        {business.phone && (
                          <p><strong>Telefoni:</strong> {business.phone}</p>
                        )}
                        {business.created_by && (
                          <p><strong>Krijuar nga:</strong> {business.created_by.email}</p>
                        )}
                        {business.created_at && (
                          <p><strong>Krijuar:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="business-card-actions">
                        <button onClick={() => handleView(business)} className="btn btn-secondary">
                          Shiko
                        </button>
                        <button onClick={() => handleEdit(business)} className="btn btn-primary">
                          Ndrysho
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
                          className="btn btn-danger"
                          disabled={isIssuer}
                          title={isIssuer ? 'Nuk mund të fshihet subjekti lëshues' : ''}
                        >
                          Fshi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessesPage;
