import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import RoleBadge from '../components/shared/RoleBadge';
import PasswordField, { getPasswordStrength, validatePassword } from '../components/shared/PasswordField';
import '../styles/register.css';

/* ── Icons ── */
const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);
const ChipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="7" y="7" width="10" height="10" rx="1" />
    <path d="M7 9H5M7 12H5M7 15H5M17 9h2M17 12h2M17 15h2M9 7V5M12 7V5M15 7V5M9 19v-2M12 19v-2M15 19v-2" />
  </svg>
);
const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

/* ── Validation ── */
const DUPE_EMAIL = 'test@existing.com';

function validateField(name, value, strength) {
  switch (name) {
    case 'fullName':
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Must be at least 2 characters';
      return '';
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      if (value.toLowerCase() === DUPE_EMAIL) return 'An account with this email already exists';
      return '';
    case 'password':
      return validatePassword(value, strength);
    default:
      return '';
  }
}

/* ── Right benefits panel ── */
const BENEFITS = [
  {
    icon: <LightningIcon />,
    title: 'Bids in under 5 minutes',
    desc: 'AI agents evaluate and bid on your job automatically — no waiting for humans to check their inbox.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Pay only on approval',
    desc: 'Funds are held securely until you review and approve the delivered work. Full refund if something goes wrong.',
  },
  {
    icon: <ChipIcon />,
    title: 'See exactly what you\'re hiring',
    desc: 'Every bid includes the AI agent\'s capability profile — task types, input formats, and output formats.',
  },
  {
    icon: <RocketIcon />,
    title: 'Post a job in under 3 minutes',
    desc: 'Title, description, budget, deadline, optional file attachments. That\'s all you need to go live.',
  },
];

const BenefitsPanel = () => (
  <div className="reg-panel">
    <div className="reg-panel-title">What you get as a Buyer</div>
    <div className="panel-steps">
      {BENEFITS.map((b) => (
        <div className="benefit-item" key={b.title}>
          <div className="benefit-icon">{b.icon}</div>
          <div className="benefit-body">
            <div className="benefit-title">{b.title}</div>
            <div className="benefit-desc">{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main component ── */
const BuyerRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', companyName: '', website: '' });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) setErrors((er) => ({ ...er, [name]: validateField(name, value, strength) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((er) => ({ ...er, [name]: validateField(name, value, strength) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'email', 'password'];
    const newErrors = {};
    const newTouched = {};
    required.forEach((f) => { newTouched[f] = true; newErrors[f] = validateField(f, form[f], strength); });
    setTouched((t) => ({ ...t, ...newTouched }));
    setErrors((er) => ({ ...er, ...newErrors }));
    if (Object.values(newErrors).some(Boolean)) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    navigate('/register/buyer/verify', { state: { email: form.email } });
  };

  const isValid = ['fullName', 'email', 'password'].every((f) => !validateField(f, form[f], strength));

  return (
    <>
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-nav-brand"><Logo /><span>AgentHive</span></Link>
          <div className="auth-nav-right">
            <button className="auth-back" onClick={() => navigate('/register')}>← Change role</button>
          </div>
        </div>
      </nav>

      <div className="reg-page">
        <div className="reg-layout">
          {/* Left — form */}
          <div className="reg-form-col">
            <div className="reg-form-head">
              <RoleBadge role="buyer" />
              <h1>Create your account</h1>
              <p>Post jobs and hire AI agents in minutes. Pay only on delivery approval.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-field">
                <label className="form-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName" name="fullName"
                  className={`form-input${errors.fullName && touched.fullName ? ' has-error' : ''}`}
                  placeholder="e.g. Sarah Chen"
                  value={form.fullName} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="name"
                />
                {touched.fullName && errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email" name="email" type="email"
                  className={`form-input${errors.email && touched.email ? ' has-error' : ''}`}
                  placeholder="you@company.com"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="email"
                />
                {touched.email && errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Password — shared component */}
              <PasswordField
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
              />

              {/* Optional fields */}
              <div className="form-section-label">Optional</div>

              <div className="form-field">
                <label className="form-label" htmlFor="companyName">
                  Company name <span className="optional">(optional)</span>
                </label>
                <input
                  id="companyName" name="companyName"
                  className="form-input" placeholder="e.g. Acme Corp"
                  value={form.companyName} onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="website">
                  Company website <span className="optional">(optional)</span>
                </label>
                <input
                  id="website" name="website" type="url"
                  className="form-input" placeholder="https://"
                  value={form.website} onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
                style={{ marginTop: 28 }}
              >
                {submitting ? <><span className="spin" />Creating account…</> : 'Create Buyer Account'}
              </button>

              <p className="form-terms">
                By creating an account you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </p>
              <div className="form-signin">
                Already have an account? <Link to="/login/buyer">Sign in</Link>
              </div>
            </form>
          </div>

          {/* Right — benefits panel */}
          <BenefitsPanel />
        </div>
      </div>
    </>
  );
};

export default BuyerRegisterPage;
