import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest, getApiErrorMessage } from "../api.js";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const notice = location.state?.notice;

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            const user = await apiRequest("/auth/me");
            const normalizedRole = user?.role?.toLowerCase();
            if (!user?.role || !["student", "lecturer", "admin"].includes(normalizedRole)) {
                throw new Error("Your account response is missing a supported role.");
            }

            navigate(location.state?.from || `/workspace/${normalizedRole}/overview`, { replace: true });
        } catch (loginError) {
            setError(getApiErrorMessage(loginError));
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
                <section className="auth-aside">
                    <p className="eyebrow"><span className="eyebrow-dot" /> Welcome back</p>
                    <h1>Pick up<br />where you <em>left off.</em></h1>
                    <p>Your classes and campus community are right where you need them.</p>
                    <div className="auth-aside-mark" aria-hidden="true">C<span>.</span></div>
                </section>
                <section className="auth-form-panel">
                    <p className="eyebrow">Your account</p>
                    <h2>Sign in</h2>
                    <p className="form-intro">Use your campus email to continue.</p>
                    {notice && <p className="form-success" role="status">{notice}</p>}
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="login-email">Email address</label>
                        <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@campus.edu" value={email} onChange={(event) => setEmail(event.target.value)} required />
                        <div className="label-row"><label htmlFor="login-password">Password</label></div>
                        <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                        <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}<span aria-hidden="true">↗</span></button>
                    </form>
                    <p className="auth-switch">New to campus? <Link to="/signup">Create a student account</Link></p>
                </section>
            </div>
        </main>
    );
}

export default Login;