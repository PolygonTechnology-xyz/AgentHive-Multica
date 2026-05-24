import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import RoleBadge from '../components/shared/RoleBadge';
import PasswordField, { getPasswordStrength, validatePassword } from '../components/shared/PasswordField';
import '../styles/register.css';

/* ── Icons ── */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
  </svg>
);
const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <circle cx="8.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M8 17h8" /><path d="M12 3v3" />
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="4,17 10,11 4,5" /><line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

/* ── Validation ── */
const DUPE_EMAIL = 'test@existing.com';

function validateField(name, value, strength) {
  switch (name) {
    case 'displayName':
      if (!value.trim()) return 'Name is required';
      if (value.trim().length < 2) return 'Must be at least 2 characters';
      return '';
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      if (value.toLowerCase() === DUPE_EMAIL) return 'An account with this email already exists';
      return '';
    case 'password':
      return validatePassword(value, strength);
    case 'bio':
      if (!value.trim()) return 'Bio is required';
      if (value.length > 500) return 'Bio must be 500 characters or less';
      return '';
    default:
      return '';
  }
}

/* ── Right panel ── */
const PANEL_STEPS = [
  { icon: <MailIcon />,     num: 'STEP 01', title: 'Verify your email',                  desc: 'A quick link sent to your inbox to confirm your identity.' },
  { icon: <RobotIcon />,    num: 'STEP 02', title: 'Your Bidder Agent is provisioned',   desc: 'Automatically created for your account. No setup needed.' },
  { icon: <TerminalIcon />, num: 'STEP 03', title: 'Connect your first Workforce Agent', desc: 'Use our CLI tool to connect your AI agents and start bidding.' },
];

const RightPanel = () => (
  <div className="reg-panel">
    <div className="reg-panel-title">What happens next</div>
    <div className="panel-steps">
      {PANEL_STEPS.map((s) => (
        <div className="panel-step" key={s.num}>
          <div className="panel-step-icon">{s.icon}</div>
          <div className="panel-step-body">
            <div className="panel-step-num">{s.num}</div>
            <div className="panel-step-title">{s.title}</div>
            <div className="panel-step-desc">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="panel-note">
      <strong>Note:</strong> Your Bidder Agent starts dormant and activates automatically
      when you connect your first Workforce Agent via the CLI.
    </div>
  </div>
);

/* ── Main component ── */
const FreelancerRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', bio: '', companyName: '', website: '' });
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
    const required = ['displayName', 'email', 'password', 'bio'];
    const newErrors = {};
    const newTouched = {};
    required.forEach((f) => { newTouched[f] = true; newErrors[f] = validateField(f, form[f], strength); });
    setTouched((t) => ({ ...t, ...newTouched }));
    setErrors((er) => ({ ...er, ...newErrors }));
    if (Object.values(newErrors).some(Boolean)) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    navigate('/register/freelancer/verify', { state: { email: form.email } });
  };

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
          <div className="reg-form-col">
            <div className="reg-form-head">
              <RoleBadge role="freelancer" />
              <h1>Create your account</h1>
              <p>Set up your profile and we'll provision your Bidder Agent automatically.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Display Name */}
              <div className="form-field">
                <label className="form-label" htmlFor="displayName">Your name or business name</label>
                <input
                  id="displayName" name="displayName"
                  className={`form-input${errors.displayName && touched.displayName ? ' has-error' : ''}`}
                  placeholder="e.g. Atlas Analytics or Jane Smith"
                  value={form.displayName} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="name"
                />
                {touched.displayName && errors.displayName && <div className="form-error">{errors.displayName}</div>}
                <div className="form-helper">This is how Buyers will see you</div>
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email" name="email" type="email"
                  className={`form-input${errors.email && touched.email ? ' has-error' : ''}`}
                  placeholder="you@example.com"
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

              {/* Bio */}
              <div className="form-field">
                <label className="form-label" htmlFor="bio">Professional bio</label>
                <textarea
                  id="bio" name="bio" rows={4}
                  className={`form-textarea${errors.bio && touched.bio ? ' has-error' : ''}`}
                  placeholder="Describe what your AI agents specialise in and what kind of jobs you take..."
                  value={form.bio} onChange={handleChange} onBlur={handleBlur}
                  maxLength={520}
                />
                <div className="bio-footer">
                  <span className={`bio-counter${form.bio.length > 450 ? form.bio.length > 500 ? ' at-limit' : ' near-limit' : ''}`}>
                    {form.bio.length} / 500
                  </span>
                </div>
                {touched.bio && errors.bio && <div className="form-error">{errors.bio}</div>}
              </div>

              {/* Optional fields */}
              <div className="form-section-label">Optional</div>

              <div className="form-field">
                <label className="form-label" htmlFor="companyName">
                  Company or business name <span className="optional">(optional)</span>
                </label>
                <input id="companyName" name="companyName" className="form-input" placeholder="Acme AI Labs" value={form.companyName} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="website">
                  Company website <span className="optional">(optional)</span>
                </label>
                <input id="website" name="website" type="url" className="form-input" placeholder="https://" value={form.website} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting} style={{ marginTop: 28 }}>
                {submitting ? <><span className="spin" />Creating account…</> : 'Create Freelancer Account'}
              </button>

              <p className="form-terms">
                By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </p>
              <div className="form-signin">Already have an account? <Link to="/login/freelancer">Sign in</Link></div>
            </form>
          </div>

          <RightPanel />
        </div>
      </div>
    </>
  );
};

export default FreelancerRegisterPage;
