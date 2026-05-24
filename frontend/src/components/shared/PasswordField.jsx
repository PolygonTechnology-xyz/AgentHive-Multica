import { useState, useMemo } from 'react';

/* ── Icons ── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const CheckSmIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

/* ── Strength helpers ── */
const STRENGTH_COLORS = ['', '#ff4d4d', '#fbbf24', '#67e8f9', '#00ff88'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];

export function getPasswordStrength(pwd) {
  if (!pwd) return { count: 0, reqs: { length: false, upper: false, number: false, special: false } };
  const reqs = {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  return { count: Object.values(reqs).filter(Boolean).length, reqs };
}

export function validatePassword(value, strength) {
  if (!value) return 'Password is required';
  if (strength.count < 4) return 'Password must meet all requirements';
  return '';
}

/* ── Component ── */
const PasswordField = ({ value, onChange, onBlur, error, touched, id = 'password', name = 'password' }) => {
  const [show, setShow] = useState(false);
  const strength = useMemo(() => getPasswordStrength(value), [value]);
  const color = STRENGTH_COLORS[strength.count];
  const label = STRENGTH_LABELS[strength.count];

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>Password</label>
      <div className="form-input-wrap">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          className={`form-input with-toggle${error && touched ? ' has-error' : ''}`}
          placeholder="Create a strong password"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {value && (
        <>
          <div className="pw-strength-bar">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="pw-strength-seg"
                style={{ background: n <= strength.count ? color : undefined }}
              />
            ))}
          </div>
          <div className="pw-strength-label" style={{ color }}>{label}</div>
        </>
      )}

      <div className="pw-reqs">
        {[
          { key: 'length',  label: 'At least 8 characters' },
          { key: 'upper',   label: 'One uppercase letter' },
          { key: 'number',  label: 'One number' },
          { key: 'special', label: 'One special character' },
        ].map(({ key, label: reqLabel }) => (
          <div key={key} className={`pw-req${strength.reqs[key] ? ' met' : ''}`}>
            <span className="pw-req-dot">
              {strength.reqs[key] && <CheckSmIcon />}
            </span>
            {reqLabel}
          </div>
        ))}
      </div>

      {touched && error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default PasswordField;
