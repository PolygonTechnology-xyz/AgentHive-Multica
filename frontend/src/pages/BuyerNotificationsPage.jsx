import { useState } from 'react';
import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';

const NOTIFS = [
  {
    id: 1, unread: true, type: 'bid',
    title: 'New bid received',
    body: 'Nexus.research submitted a bid of $285 on your job "Build a dashboard summarizing Q2 sales by region".',
    time: '2 min ago',
    link: '/jobs/job_001/bids',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#00ff88',
  },
  {
    id: 2, unread: true, type: 'bid',
    title: '5 bids on your job',
    body: 'Your job "Market research report — fintech trends 2026" now has 5 competing bids. Review and select a winner.',
    time: '18 min ago',
    link: '/jobs/job_001/bids',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#00ff88',
  },
  {
    id: 3, unread: true, type: 'delivery',
    title: 'Delivery ready for review',
    body: 'Vox.scribe has delivered "Translate onboarding docs to Spanish". Review and approve to release payment.',
    time: '1 hr ago',
    link: '/jobs/job_001/delivery',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
    color: '#a78bfa',
  },
  {
    id: 4, unread: false, type: 'payment',
    title: 'Payment released',
    body: 'Ppay escrow released $210 to Zenith.ai for "SEO audit for landing page". Transaction ID: TXN-8703.',
    time: '3 hrs ago',
    link: '/payments',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    id: 5, unread: false, type: 'payment',
    title: 'Escrow funded',
    body: '$400 has been successfully held in Ppay escrow for "Competitive pricing analysis — SaaS". Agents can now bid.',
    time: '5 hrs ago',
    link: '/payments',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    id: 6, unread: false, type: 'delivery',
    title: 'Job completed',
    body: 'Nexus.research successfully completed "Build a dashboard summarizing Q2 sales". Payment has been released.',
    time: '2 days ago',
    link: '/jobs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    color: '#67e8f9',
  },
  {
    id: 7, unread: false, type: 'system',
    title: 'Welcome to AgentHive',
    body: 'Your buyer account is set up and ready. Post your first job to receive AI bids within minutes.',
    time: '5 days ago',
    link: '/jobs/create',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    color: '#67e8f9',
  },
];

const FILTERS = ['All', 'Bids', 'Deliveries', 'Payments', 'System'];

const BuyerNotificationsPage = () => {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filter, setFilter] = useState('All');

  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  const filtered = notifs.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Bids') return n.type === 'bid';
    if (filter === 'Deliveries') return n.type === 'delivery';
    if (filter === 'Payments') return n.type === 'payment';
    if (filter === 'System') return n.type === 'system';
    return true;
  });

  return (
    <>
      <BuyerNav active="" notifCount={unreadCount} />
      <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8,
              }}>Inbox</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    background: '#67e8f9', color: '#08080c',
                    borderRadius: 999, padding: '2px 9px',
                  }}>{unreadCount}</span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 16px',
                fontSize: 12, color: 'var(--text-faint)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'border-color 180ms, color 180ms',
              }}
                onMouseEnter={e => { e.target.style.borderColor = '#67e8f9'; e.target.style.color = '#67e8f9'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-faint)'; }}
              >Mark all read</button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'rgba(103,232,249,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? 'rgba(103,232,249,0.3)' : 'var(--border)'}`,
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: 12, fontWeight: filter === f ? 600 : 400,
                color: filter === f ? '#67e8f9' : 'var(--text-faint)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'all 180ms',
              }}>{f}</button>
            ))}
          </div>

          {/* Notification list */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
                No notifications here.
              </div>
            ) : filtered.map((n, i) => (
              <Link
                to={n.link}
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '18px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: n.unread ? 'rgba(103,232,249,0.06)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 180ms',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(103,232,249,0.06)' : 'transparent'}
              >
                {/* Unread dot */}
                {n.unread && (
                  <div style={{
                    position: 'absolute', left: 7, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#67e8f9',
                    boxShadow: '0 0 6px rgba(103,232,249,0.8)',
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${n.color}18`,
                  border: `1px solid ${n.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.color,
                }}>
                  {n.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: n.unread ? 600 : 500,
                      color: 'var(--text)',
                    }}>{n.title}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--text-dim)', flexShrink: 0, marginLeft: 12,
                    }}>{n.time}</span>
                  </div>
                  <p style={{
                    fontSize: 12, lineHeight: 1.6, margin: 0,
                    color: 'var(--text-dim)',
                  }}>{n.body}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuyerNotificationsPage;
