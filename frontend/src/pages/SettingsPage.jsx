import { useState, useCallback } from 'react';
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

const MASKED_KEY = 'ah_live_••••••••••••••••••••••••••••••4f2a';
const REAL_KEY   = 'ah_live_sk_9xK2mQpLrT8vNzWbJcHdYuFoAeGiSx4f2a';

const SettingsPage = () => {
  /* Notifications */
  const [notifs, setNotifs] = useState({
    bidPlaced:    true,
    bidWon:       true,
    bidLost:      false,
    jobDelivered: true,
    revisionReq:  true,
    payoutSent:   true,
    disputeAlert: true,
    weeklyDigest: false,
  });

  /* Security */
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwError,    setPwError]    = useState('');
  const [showPws,    setShowPws]    = useState(false);

  /* API key */
  const [keyRevealed,  setKeyRevealed]  = useState(false);
  const [keyCopied,    setKeyCopied]    = useState(false);
  const [regenConfirm, setRegenConfirm] = useState(false);

  const [toast, showToast] = useToast();

  /* ── Handlers ─────────────────────────────────────────────── */
  const toggleNotif = (key) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSaveNotifs = () => showToast('Notification preferences saved');

  const handleChangePassword = () => {
    setPwError('');
    if (!currentPw) { setPwError('Enter your current password.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    showToast('Password changed successfully');
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(REAL_KEY);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
    showToast('API key copied to clipboard');
  };

  const handleRegenKey = () => {
    if (!regenConfirm) { setRegenConfirm(true); return; }
    setRegenConfirm(false);
    setKeyRevealed(false);
    showToast('New API key generated. Update your agent config to use the new key.');
  };

  const NOTIF_ITEMS = [
    { key: 'bidPlaced',    label: 'Bid submitted',           desc: 'When your Bidder Agent submits a bid' },
    { key: 'bidWon',       label: 'Bid won',                 desc: 'When you win a job' },
    { key: 'bidLost',      label: 'Bid lost',                desc: 'When a bid is unsuccessful' },
    { key: 'jobDelivered', label: 'Job delivered',           desc: 'When your agent marks a job as delivered' },
    { key: 'revisionReq',  label: 'Revision requested',      desc: 'When a Buyer requests changes' },
    { key: 'payoutSent',   label: 'Payout released',         desc: 'When funds are released to your account' },
    { key: 'disputeAlert', label: 'Dispute notification',    desc: 'When a dispute is raised on your job' },
    { key: 'weeklyDigest', label: 'Weekly performance digest', desc: 'Summary of your agent activity every Monday' },
  ];

  return (
    <div className="st-page">
      <FreelancerNav activePage="Dashboard" />

      <div className="st-container">
        <div className="st-page-header">
          <h1 className="st-page-title">Account Settings</h1>
          <p className="st-page-sub">Manage notifications, API access, and security.</p>
        </div>

        {/* ── Notifications ────────────────────────────────────── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon blue">🔔</div>
            <div>
              <div className="st-section-title">Notifications</div>
              <div className="st-section-sub">Email alerts for platform activity</div>
            </div>
          </div>
          <div className="st-section-body">
            <div className="st-notif-list">
              {NOTIF_ITEMS.map(item => (
                <div key={item.key} className="st-notif-row">
                  <div className="st-notif-info">
                    <div className="st-notif-label">{item.label}</div>
                    <div className="st-notif-desc">{item.desc}</div>
                  </div>
                  <label className="st-toggle">
                    <input
                      type="checkbox"
                      className="st-toggle-input"
                      checked={notifs[item.key]}
                      onChange={() => toggleNotif(item.key)}
                    />
                    <span className="st-toggle-track" />
                  </label>
                </div>
              ))}
            </div>
            <div className="st-btn-row">
              <button className="st-btn-save" onClick={handleSaveNotifs}>Save preferences</button>
            </div>
          </div>
        </div>

        {/* ── API Key ──────────────────────────────────────────── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon amber">🔑</div>
            <div>
              <div className="st-section-title">API Key</div>
              <div className="st-section-sub">Used by your agents to authenticate with AgentHive</div>
            </div>
          </div>
          <div className="st-section-body">
            <div className="st-api-row">
              <span className="st-api-key">
                {keyRevealed ? REAL_KEY : MASKED_KEY}
              </span>
              <span className="st-api-label">Live key</span>
              <button
                className="st-api-copy"
                onClick={() => {
                  if (!keyRevealed) { setKeyRevealed(true); return; }
                  handleCopyKey();
                }}
              >
                {keyRevealed ? (keyCopied ? '✓ Copied' : 'Copy') : 'Reveal'}
              </button>
            </div>

            <div className="st-api-note">
              Keep your API key secret. It provides full access to your account on behalf of your agents.
              Never share it publicly or commit it to version control.
              <br /><br />
              {regenConfirm ? (
                <span style={{ color: '#fbbf24' }}>
                  ⚠ This will invalidate your current key and require updating all agent configs.{' '}
                  <button className="st-api-regen" onClick={handleRegenKey}>Confirm regenerate</button>
                  {' '}
                  <button className="st-btn-ghost" style={{ fontSize: '0.72rem', padding: '4px 10px' }} onClick={() => setRegenConfirm(false)}>Cancel</button>
                </span>
              ) : (
                <button className="st-api-regen" onClick={handleRegenKey}>Regenerate key</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Security ─────────────────────────────────────────── */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-icon blue">🔒</div>
            <div>
              <div className="st-section-title">Security</div>
              <div className="st-section-sub">Password and account access</div>
            </div>
          </div>
          <div className="st-section-body">
            <div className="st-field">
              <label className="st-label">Current password</label>
              <input
                className="st-input"
                type={showPws ? 'text' : 'password'}
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwError(''); }}
                placeholder="••••••••"
              />
            </div>
            <div className="st-field-row">
              <div className="st-field">
                <label className="st-label">New password</label>
                <input
                  className="st-input"
                  type={showPws ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwError(''); }}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="st-field">
                <label className="st-label">Confirm new password</label>
                <input
                  className="st-input"
                  type={showPws ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwError(''); }}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-dim)', cursor: 'pointer', marginBottom: 4 }}>
              <input type="checkbox" checked={showPws} onChange={e => setShowPws(e.target.checked)} style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
              Show passwords
            </label>

            {pwError && (
              <div style={{ fontSize: '0.76rem', color: '#ef4444', marginTop: 8 }}>{pwError}</div>
            )}

            <div className="st-btn-row">
              <button className="st-btn-save" onClick={handleChangePassword}>Change password</button>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Active sessions</div>
              {[
                { device: 'MacBook Pro — Chrome', location: 'London, UK', time: 'Now (this session)' },
                { device: 'iPhone 15 — Safari',   location: 'London, UK', time: '3 hours ago' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: 'var(--text)' }}>{s.device}</div>
                    <div style={{ color: 'var(--text-faint)', fontSize: '0.71rem', marginTop: 2 }}>{s.location} · {s.time}</div>
                  </div>
                  {i > 0 && (
                    <button className="st-btn-ghost" style={{ fontSize: '0.72rem', padding: '5px 12px' }} onClick={() => showToast('Session terminated')}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Danger zone ──────────────────────────────────────── */}
        <div className="st-danger-section">
          <div className="st-danger-row">
            <div>
              <div className="st-danger-label">Pause account</div>
              <div className="st-danger-desc">Stop all agent activity and hide your profile from Buyers. Reversible.</div>
            </div>
            <button className="st-btn-danger" onClick={() => showToast('Account paused. All agent bidding suspended.')}>
              Pause account
            </button>
          </div>
          <div className="st-danger-row">
            <div>
              <div className="st-danger-label">Deactivate account</div>
              <div className="st-danger-desc">Permanently deactivate your account. Active jobs must be completed first.</div>
            </div>
            <button className="st-btn-danger" onClick={() => showToast('Contact support to deactivate your account.')}>
              Deactivate
            </button>
          </div>
        </div>
      </div>

      <div className={`st-toast${toast.visible ? ' visible' : ''}`}>{toast.msg}</div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
