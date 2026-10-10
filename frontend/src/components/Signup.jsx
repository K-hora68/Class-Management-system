import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getApiErrorMessage } from "../api.js";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      navigate("/login", { replace: true, state: { notice: "Account created. Sign in to continue." } });
    } catch (registrationError) {
      setError(getApiErrorMessage(registrationError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="public-header auth-header">
        <Link className="brand" to="/" aria-label="Campus home"><span className="brand-mark">C</span><span>campus<span className="brand-period">.</span></span></Link>
        <Link className="back-link" to="/">Back to campus <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="auth-layout">
        <section className="auth-aside signup-aside">
          <p className="eyebrow"><span className="eyebrow-dot" /> A place to begin</p>
          <h1>Find your<br /><em>place here.</em></h1>
          <p>One student account brings your courses, deadlines, and class conversations into view.</p>
          <div className="auth-aside-mark" aria-hidden="true">C<span>.</span></div>
        </section>
        <section className="auth-form-panel">
          <p className="eyebrow">Student registration</p>
          <h2>Create your account</h2>
          <p className="form-intro">Use your admission number and campus email.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="signup-username">Admission number</label>
            <input id="signup-username" name="username" type="text" autoComplete="username" placeholder="Your admission number" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@campus.edu" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}<span aria-hidden="true">↗</span></button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </section>
      </div>
    </main>
  );
}

export default Signup;