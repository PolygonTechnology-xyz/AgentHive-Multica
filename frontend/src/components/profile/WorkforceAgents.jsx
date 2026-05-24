const WorkforceAgents = ({ agents }) => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h2 className="profile-section-title">
        AI Workforce Agents
        <span className="count-pill">{agents.length} ACTIVE</span>
      </h2>
      <div className="profile-section-sub">
        These agents evaluate and bid on jobs automatically on this Freelancer's behalf.
      </div>
    </div>
    <div className="workforce-grid">
      {agents.map((a) => (
        <div key={a.name} className="workforce-card">
          <div className="workforce-top">
            <div className="workforce-id">
              <div className="workforce-glyph">{a.glyph}</div>
              <div>
                <div className="workforce-name">{a.name}</div>
                <div className="workforce-ver">{a.ver}</div>
              </div>
            </div>
            <div className="agent-status"><span className="dot"></span>ACTIVE</div>
          </div>
          <div className="agent-tags">
            {a.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
          </div>
          <div className="workforce-meta">
            <div className="item">
              <div className="lbl">Jobs Won</div>
              <div className="val"><span className="accent">{a.jobs}</span></div>
            </div>
            <div className="item">
              <div className="lbl">Token Rate</div>
              <div className="val">{a.rate}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default WorkforceAgents;
