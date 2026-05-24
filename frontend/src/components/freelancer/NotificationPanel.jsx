import { useEffect } from 'react';

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
);

const NOTIFICATIONS = [
  {
    id: 1, unread: true, time: '4 min ago',
    icon: '⚡', iconColor: 'green',
    title: "Bid won on 'Extract financial tables from S-1 filing'",
    desc: '$680 · Job dispatched to Atlas-Extract-3',
    cta: 'Track job →', ctaHref: '/dashboard/freelancer',
  },
  {
    id: 2, unread: true, time: '31 min ago',
    icon: '↻', iconColor: 'amber',
    title: "Revision requested on 'Earnings call synthesis'",
    desc: 'Buyer has requested Revision #1. Check your CLI.',
    cta: 'View revision →', ctaHref: '/dashboard/freelancer',
  },
  {
    id: 3, unread: true, time: '2 hrs ago',
    icon: '💰', iconColor: 'green',
    title: 'Payout received — $1,840',
    desc: 'TypeScript SDK job completed. Net payout after 15% commission.',
    cta: 'View earnings →', ctaHref: '/earnings',
  },
  {
    id: 4, unread: false, time: '3 hrs ago',
    icon: '⚡', iconColor: 'muted',
    title: '8 bids placed in the last hour',
    desc: 'Your Bidder Agent has been active. 5 pending · 2 lost · 1 won.',
    cta: 'View bid log →', ctaHref: '/bid-log',
  },
  {
    id: 5, unread: false, time: '1 day ago',
    icon: '✓', iconColor: 'muted',
    title: "Job completed — '$1,250 released'",
    desc: 'Q1 pricing audit approved by Buyer. Payout sent.',
    cta: 'View earnings →', ctaHref: '/earnings',
  },
  {
    id: 6, unread: false, time: '2 days ago',
    icon: '🤖', iconColor: 'muted',
    title: 'Atlas-Extract-3 connected and indexed',
    desc: '3 capability categories indexed. Bidder Agent updated.',
    cta: 'View agents →', ctaHref: '/agents',
  },
];

const NotificationPanel = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <>
      <div
        className={`notif-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`notif-panel${isOpen ? ' open' : ''}`}>
        <div className="notif-panel-header">
          <div className="notif-panel-title">Notifications</div>
          <div className="notif-header-right">
            <span className="notif-unread-badge">{unreadCount} unread</span>
            <button className="notif-mark-read">Mark all read</button>
            <button className="notif-close" onClick={onClose}><CloseIcon /></button>
          </div>
        </div>

        <div className="notif-list">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
              <div className={`notif-icon ${n.iconColor}`}>{n.icon}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
                <div className="notif-meta">
                  <span className="notif-time">{n.time}</span>
                  <a href={n.ctaHref} className="notif-cta" onClick={onClose}>{n.cta}</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="notif-panel-footer">
          <a href="/notifications" className="notif-view-all">View all notifications →</a>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
