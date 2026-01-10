import { Link } from 'react-router-dom';
import './LandingPage.scss';

const LandingPage = () => {
  const features = [
    {
      title: 'Krijim i Shpejtë i Faturave',
      description: 'Krijo fatura profesionale në pak minuta me ndërfaqen tonë të thjeshtë dhe intuitive.',
    },
    {
      title: 'Shabllone Profesionale',
      description: 'Zgjidh nga shabllonet tona profesionale që i përshtaten biznesit tënd.',
    },
    {
      title: 'Menaxhim i Lehtë',
      description: 'Organizo dhe menaxho të gjitha faturat e tua në një vend të vetëm.',
    },
    {
      title: 'Sigurt dhe i Besueshëm',
      description: 'Të dhënat e tua janë të sigurta dhe të mbrojtura me teknologji moderne.',
    },
  ];

  return (
    <main className="landing">
      {/* Hero Section */}
      <section className="landing__hero">
        <div className="container">
          <div className="landing__hero-content">
            <h1 className="landing__hero-title">
              Krijo Fatura Profesionale me Lehtësi
            </h1>
            <p className="landing__hero-subtitle">
              Platforma më e thjeshtë për krijimin dhe menaxhimin e faturave. 
              Krijo fatura profesionale në pak minuta dhe fokusohu në biznesin tënd.
            </p>
            <div className="landing__hero-cta">
              <Link to="/login" className="btn btn--primary">
                Fillo Tani
              </Link>
              <a href="#features" className="btn btn--secondary">
                Mëso Më Shumë
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing__features">
        <div className="container">
          <div className="landing__features-header">
            <h2 className="landing__features-title">Pse të Zgjedhësh "Faturëime"?</h2>
            <p className="landing__features-subtitle">
              Platforma jonë ofron gjithçka që ju nevojitet për të menaxhuar faturat tuaja me efikasitet.
            </p>
          </div>
          <div className="landing__features-grid grid grid-2 grid-4">
            {features.map((feature, index) => (
              <div key={index} className="landing__feature-card">
                <div className="landing__feature-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="landing__feature-title">{feature.title}</h3>
                <p className="landing__feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing__cta">
        <div className="container">
          <div className="landing__cta-content">
            <h2 className="landing__cta-title">Gati për të Filluar?</h2>
            <p className="landing__cta-subtitle">
              Krijo faturën tënde të parë sot dhe përjetoni lehtësinë e menaxhimit të faturave.
            </p>
            <Link to="/login" className="btn btn--primary btn--large">
              Krijo Faturë Tani
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
