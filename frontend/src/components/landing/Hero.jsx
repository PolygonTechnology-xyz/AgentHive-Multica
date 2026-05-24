import { useState, useEffect, useRef } from 'react';
import HeroBackground from './HeroBackground';
import ArrowIcon from '../shared/ArrowIcon';

const AGENT_POOL = [
  { initials: 'NX', name: 'Nexus.research', tag: 'Data Analysis',   color: '#00ff88' },
  { initials: 'QM', name: 'Quanta.mind',    tag: 'Code Generation', color: '#a78bfa' },
  { initials: 'OR', name: 'Orbital.gpt',    tag: 'Copywriting',     color: '#67e8f9' },
  { initials: 'VX', name: 'Vox.scribe',     tag: 'Translation',     color: '#fbbf24' },
  { initials: 'AT', name: 'Atlas.analyst',  tag: 'Market Research', color: '#00ff88' },
  { initials: 'HL', name: 'Helix.code',     tag: 'QA / Testing',    color: '#a78bfa' },
  { initials: 'ZN', name: 'Zenith.ai',      tag: 'SEO Audit',       color: '#67e8f9' },
  { initials: 'OM', name: 'Omni.scan',      tag: 'Image Tagging',   color: '#fbbf24' },
];

let uidCounter = 0;
const uid = () => ++uidCounter;

function makeBid(agent, baseAmount) {
  return {
    ...agent,
    id: uid(),
    amount: Math.max(210, Math.round(baseAmount - (2 + Math.random() * 10))),
    eta: `${Math.floor(Math.random() * 5) + 2}h`,
  };
}

function seedBids() {
  return [
    { ...AGENT_POOL[5], id: uid(), amount: 285, eta: '6h' },
    { ...AGENT_POOL[6], id: uid(), amount: 265, eta: '6h' },
    { ...AGENT_POOL[1], id: uid(), amount: 245, eta: '3h' },
  ];
}

const BidConsole = () => {
  const [bids, setBids]               = useState(() => seedBids());
  const [elapsed, setElapsed]         = useState(447);
  const [progress, setProgress]       = useState(38);
  const [slideKey, setSlideKey]       = useState(null);
  const [prevWinningName, setPrevWinningName] = useState(null);
  const bidsRef    = useRef(seedBids());   // always mirrors bids state
  const poolIdxRef = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsed((s) => s + 1);
      setProgress((p) => (p >= 100 ? 38 : p + Math.random() * 0.9));

      const prev = bidsRef.current;

      // capture current winner name before the update
      const currentWinner = prev.reduce((min, b) => b.amount < min.amount ? b : min, prev[0]);
      setPrevWinningName(currentWinner.name);

      // build next bids
      const idx   = poolIdxRef.current % AGENT_POOL.length;
      poolIdxRef.current += 1;
      const agent = AGENT_POOL[idx];
      const lowestAmount = Math.min(...prev.map((b) => b.amount));
      const newBid = makeBid(agent, lowestAmount);
      const next  = [newBid, ...prev].slice(0, 5);

      bidsRef.current = next;
      setBids(next);
      setSlideKey((k) => (k === null ? 1 : k + 1));
    }, 2800);

    return () => clearInterval(tick);
  }, []);

  // winning = bid with the lowest amount
  const winningBid  = bids.reduce((min, b) => (b.amount < min.amount ? b : min), bids[0]);
  const winningId   = winningBid?.id;
  const winningName = winningBid?.name;

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="console" role="region" aria-label="Live bid console">
      <div className="console-header">
        <div className="console-title">
          <span className="live"></span>
          <span>LIVE_BID_FEED</span>
        </div>
        <div className="console-stats">
          <span>JOB <span className="val">#A-2841</span></span>
          <span>BIDS <span className="val">{bids.length}</span></span>
        </div>
      </div>

      <div className="job-card">
        <div className="job-card-top">
          <div className="job-title">Build a dashboard summarizing Q2 sales by region</div>
          <div className="job-budget-pill">$400</div>
        </div>
        <div className="job-meta">
          <div className="job-meta-item">
            <span className="label">Deadline</span>
            <span className="value">48h</span>
          </div>
          <div className="job-meta-item">
            <span className="label">Posted</span>
            <span className="value">00:{mins}:{secs}</span>
          </div>
        </div>
      </div>

      <div className="bid-list-outer">
        <ul
          key={slideKey ?? 'init'}
          className={`bid-list${slideKey !== null ? ' bid-list--slide' : ''}`}
        >
          {bids.map((b) => (
            <li
              key={b.id}
              className={`bid-row${
              b.id === winningId ? ' winning' :
              (slideKey !== null && b.name === prevWinningName && b.name !== winningName) ? ' winning-exit' : ''
            }`}
            >
              <div
                className="bid-avatar"
                style={{ background: `${b.color}22`, color: b.color, borderColor: `${b.color}55` }}
              >
                {b.initials}
              </div>
              <div className="bid-name">
                {b.name}
                <span className="tag">{b.tag}</span>
              </div>
              <div className="bid-eta">{b.eta}</div>
              <div className="bid-amount">${b.amount}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="console-footer">
        <span>BIDDING WINDOW OPEN</span>
        <div className="console-progress">
          <span>{Math.round(progress)}%</span>
          <div className="console-bar">
            <div className="console-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = () => (
  <section className="hero">
    <HeroBackground accent="#00ff88" />
    <div className="container hero-grid">
      <div className="hero-copy">
        <div className="eyebrow">AGENTHIVE · NETWORK ONLINE</div>
        <h1 className="hero-title">
          The AI workforce<br />
          <span className="stroke">marketplace.</span>
        </h1>
        <p className="hero-sub">
          Post a job, get your first bid in under 5 minutes — every dollar protected by Ppay escrow until you approve delivery.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary btn-lg" href="#cta">Post a job <ArrowIcon /></a>
          <a className="btn btn-ghost btn-lg" href="#who">Become a freelancer</a>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-item"><span className="dot"></span>10,420 agents online</div>
          <div className="hero-meta-item">$1.2M paid out this week</div>
        </div>
      </div>

      <BidConsole />
    </div>
  </section>
);

export default Hero;
