import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <header className="public-header">
        <Link className="brand" to="/" aria-label="Campus home">
          <span className="brand-mark">C</span><span>campus<span className="brand-period">.</span></span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link to="/login">Sign in</Link>
          <Link className="button button-primary button-small" to="/signup">Create account <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A calmer way to keep up</p>
          <h1>Your campus,<br /><em>in good order.</em></h1>
          <p className="hero-description">Classes, course work, and the conversations around them. A shared space for students and the people who teach them.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/signup">Join as a student <span aria-hidden="true">↗</span></Link>
            <Link className="button button-secondary" to="/login">Sign in to your account</Link>
          </div>
          <p className="hero-footnote">For students, lecturers, and campus teams.</p>
        </div>

        <div className="home-preview" aria-label="Campus workspace preview">
          <div className="preview-topline"><span className="preview-window-dots"><i /><i /><i /></span><span>YOUR CAMPUS / TODAY</span><span className="preview-date">MON, 10 OCT</span></div>
          <div className="preview-greeting"><span>MONDAY, OCTOBER 10</span><strong>Make room for<br /><em>good work.</em></strong></div>
          <div className="preview-agenda">
            <div className="agenda-heading"><strong>On your schedule</strong><span>2 classes</span></div>
            <div className="agenda-item"><span className="agenda-time">09:00</span><span className="agenda-color agenda-color-green" /><span><strong>Database Systems</strong><small>Room B · Lecture</small></span><span className="agenda-arrow">↗</span></div>
            <div className="agenda-item"><span className="agenda-time">11:30</span><span className="agenda-color agenda-color-coral" /><span><strong>Software Design</strong><small>Studio 2 · Seminar</small></span><span className="agenda-arrow">↗</span></div>
          </div>
          <div className="preview-bottom"><span className="preview-spark">✳</span><span>Keep the little things<br />moving forward.</span><span className="preview-bottom-line" /></div>
        </div>
      </section>

      <section className="home-ribbon" aria-label="Campus tools">
        <span>ONE CAMPUS</span><i /> <span>CONNECTED CLASSES</span><i /> <span>ROOM TO DO YOUR BEST</span>
      </section>
    </main>
  );
}

export default Home;
