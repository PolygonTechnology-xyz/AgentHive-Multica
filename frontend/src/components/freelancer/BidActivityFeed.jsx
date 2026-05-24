import { useEffect, useRef, useState } from 'react';

const INITIAL_ENTRIES = [
  { id: 1,  type: 'submitted', time: '2 min ago',  label: 'Bid placed — $285',                    job: 'Market analysis: EV charging station operators',       match: 94, statusLabel: 'Pending',            statusType: 'pending' },
  { id: 2,  type: 'suppressed',time: '8 min ago',  label: 'Suppressed — score below threshold',   job: 'Create 3D product renders for furniture catalog',       match: 42, reason: 'Low match' },
  { id: 3,  type: 'submitted', time: '15 min ago', label: 'Bid placed — $410',                    job: 'Extract structured data from 200 legal contracts',      match: 89, statusLabel: 'Pending',            statusType: 'pending' },
  { id: 4,  type: 'won',       time: '31 min ago', label: 'Bid won — $680',                       job: 'Extract financial tables from 320-page S-1 filing',     match: 96, statusLabel: 'In Progress',        statusType: 'won' },
  { id: 5,  type: 'suppressed',time: '47 min ago', label: 'Suppressed — category excluded',       job: 'Design logo and brand identity for startup',            match: 31, reason: 'Excluded category' },
  { id: 6,  type: 'submitted', time: '1 hr ago',   label: 'Bid placed — $320',                    job: 'Competitive intelligence report on 8 fintech startups', match: 87, statusLabel: 'Lost',               statusType: 'lost' },
  { id: 7,  type: 'submitted', time: '2 hrs ago',  label: 'Bid placed — $850',                    job: 'Build TypeScript SDK from OpenAPI specification',        match: 91, statusLabel: 'Won → In Progress',  statusType: 'won' },
];

const SIM_POOL = [
  { label: 'Bid placed — $340', job: 'Analyze 500 customer support tickets by issue type',      match: 88, type: 'submitted' },
  { label: 'Suppressed — low match', job: 'Create animated explainer video for fintech app',    match: 28, type: 'suppressed', reason: 'Low match' },
  { label: 'Bid placed — $590', job: 'Extract and structure product specs from 600 PDFs',       match: 92, type: 'submitted' },
  { label: 'Suppressed — category excluded', job: 'Design brand identity and social media kit', match: 22, type: 'suppressed', reason: 'Excluded category' },
  { label: 'Bid placed — $480', job: 'Build REST API client for Stripe with TypeScript',        match: 85, type: 'submitted' },
  { label: 'Bid placed — $260', job: 'Competitive pricing analysis across 10 SaaS vendors',     match: 90, type: 'submitted' },
];

let simIdx = 0;
let nextId = 100;

const dotClass = (type) => type === 'won' ? 'won' : type === 'suppressed' ? 'suppressed' : 'submitted';

const matchColorClass = (score) => score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';

const BidActivityFeed = ({ live = true }) => {
  const [entries, setEntries]   = useState(INITIAL_ENTRIES);
  const [newId, setNewId]       = useState(null);
  const timerRef                = useRef(null);

  useEffect(() => {
    if (!live) return;
    timerRef.current = setInterval(() => {
      const sim = SIM_POOL[simIdx % SIM_POOL.length];
      simIdx++;
      const entry = { id: ++nextId, ...sim, time: 'just now', isNew: true };
      setEntries(prev => [entry, ...prev.slice(0, 14)]);
      setNewId(entry.id);
      setTimeout(() => setNewId(null), 1000);
    }, 8000);
    return () => clearInterval(timerRef.current);
  }, [live]);

  return (
    <div className="fl-bid-feed">
      {entries.map((e) => (
        <div
          key={e.id}
          className={`fl-bid-entry${e.id === newId ? ' new-entry' : ''}`}
        >
          <div className={`fl-bid-entry-dot ${dotClass(e.type)}`} />
          <div className="fl-bid-entry-body">
            <div className={`fl-bid-entry-title${e.type === 'suppressed' ? ' suppressed' : ''}`}>
              {e.label}
              {e.type === 'won'       && <span className="fl-won-badge">WON</span>}
              {e.statusType === 'lost' && <span className="fl-lost-badge">Lost</span>}
            </div>
            <div className="fl-bid-entry-job">{e.job}</div>
            <div className="fl-bid-entry-meta">
              <span className={`fl-match-score ${matchColorClass(e.match)}`}>
                Match {e.match}
              </span>
              {e.reason      && <span>· {e.reason}</span>}
              {e.statusLabel && !e.reason && (
                <span style={{ color: e.statusType === 'won' ? 'var(--accent)' : undefined }}>
                  · {e.statusLabel}
                </span>
              )}
              <span className="fl-bid-time" style={{ marginLeft: 'auto' }}>{e.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BidActivityFeed;
