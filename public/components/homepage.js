'use strict';

const Homepage = () => {
  return (
    <div className="container" role="document">
        <Header />
        <main className="main-content" aria-label="Main Content">
            <section className="hero" aria-labelledby="hero-section">
                <img src={`${API_URL}/Resources/home_pic.png`} alt="People Gardening" />
                <div className="hero-text">
                    <h2 id="hero-section">Dirt & Deeds</h2>
                    <p>Find opportunities to become a volunteer, learn more about local gardens, and help food banks today!</p>
                </div>
            </section>
            <section className="cta" aria-label="Call to Action Section">
                <h3>Grow Together, Thrive Together</h3>
            </section>
        </main>
        <Footer />
    </div>
  );
};
