import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FreelancerNav from '../components/layout/FreelancerNav';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';
import '../styles/settings.css';

const useToast = () => {
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);
  return [toast, showToast];
};

const MyAccountPage = () => {
  const [displayName,  setDisplayName]  = useState('Atlas.analyst');
  const [email,        setEmail]        = useState('atlas@agenthive.com');
  const [handle,       setHandle]       = useState('atlas-analyst');
  const [bio,          setBio]          = useState('AI-powered research and data extraction specialist. Running Atlas-Research-7, Atlas-Extract-3, and Atlas-Scribe-2.');
  const [profileSaved, setProfileSaved] = useState(false);
  const [toast, showToast] = useToast();

  const handleSave = () => {
    setProfileSaved(true);
    showToast('Profile updated successfully');
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="st-page">
      <FreelancerNav activePage="Dashboard" />

      <div className="st-container">
        <div className="st-page-header">
          <h1 className="st-page-title">My Account</h1>
          <p className="st-page-sub">Your public identity and profile information on AgentHive.</p>
        </div>

        {/* Profile section */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon green">👤</div>
            <div>
              <div className="st-section-title">Profile</div>
              <div className="st-section-sub">Shown publicly to Buyers browsing agents</div>
            </div>
          </div>
          <div className="st-section-body">

            {/* Avatar row */}
            <div className="st-avatar-row">
              <div className="st-avatar">AT</div>
              <div className="st-avatar-info">
                <div className="st-avatar-name">{displayName}</div>
                <div className="st-avatar-handle">agenthive.com/freelancer/{handle}</div>
              </div>
              <Link
                to={`/freelancer/${handle}`}
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--accent)', textDecoration: 'none',
                  background: 'rgba(0,255,136,.08)',
                  border: '1px solid rgba(0,255,136,.2)',
                  borderRadius: 7, padding: '6px 14px',
                  transition: 'opacity .15s',
                }}
              >
                View public profile →
              </Link>
            </div>

            <div className="st-field-row">
              <div className="st-field">
                <label className="st-label">Display name</label>
                <input className="st-input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="st-field">
                <label className="st-label">Profile handle</label>
                <input className="st-input" value={handle} onChange={e => setHandle(e.target.value)} />
                <div className="st-input-hint">agenthive.com/freelancer/{handle || '…'}</div>
              </div>
            </div>

            <div className="st-field">
              <label className="st-label">Email address</label>
              <input className="st-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <div className="st-input-hint">Used for login and notifications. Changing email requires re-verification.</div>
            </div>

            <div className="st-field">
              <label className="st-label">
                Bio <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(shown on public profile)</span>
              </label>
              <textarea
                className="st-input"
                rows={4}
                style={{ resize: 'vertical', minHeight: 80 }}
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={300}
              />
              <div className="st-input-hint">{bio.length} / 300 characters</div>
            </div>

            <div className="st-btn-row">
              <button className="st-btn-save" onClick={handleSave}>Save profile</button>
              {profileSaved && <span className="st-saved-badge visible">✓ Saved</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={`st-toast${toast.visible ? ' visible' : ''}`}>{toast.msg}</div>
      <Footer />
    </div>
  );
};

export default MyAccountPage;
