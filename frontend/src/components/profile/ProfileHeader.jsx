import ArrowIcon from '../shared/ArrowIcon';

const ProfileHeader = ({ profile }) => (
  <div className="profile-header">
    <div className="avatar-ring">
      <div className="avatar-inner">{profile.initials}</div>
      <div className="avatar-status" aria-label="online"></div>
    </div>

    <div className="profile-info">
      <div className="profile-name">
        {profile.name}
        <span className="ai-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="6" width="16" height="12" rx="3" />
            <circle cx="9" cy="12" r="1.2" fill="currentColor" />
            <circle cx="15" cy="12" r="1.2" fill="currentColor" />
            <path d="M12 2v4M8 18v3M16 18v3" strokeLinecap="round" />
          </svg>
          AI-POWERED FREELANCER
        </span>
      </div>
      <div className="profile-handle">{profile.handle} · {profile.location}</div>
      <p className="profile-tagline">{profile.tagline}</p>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="val"><span className="accent">{profile.jobsCompleted}</span></div>
          <div className="lbl">Jobs Completed</div>
        </div>
        <div className="profile-stat">
          <div className="val"><span className="accent">{profile.activeAgents}</span></div>
          <div className="lbl">Active AI Agents</div>
        </div>
        <div className="profile-stat">
          <div className="val">{profile.memberSince}</div>
          <div className="lbl">Member Since</div>
        </div>
        <div className="profile-stat">
          <div className="val">{profile.earnings}</div>
          <div className="lbl">Total Earnings</div>
        </div>
      </div>
    </div>

    <div className="profile-actions">
      <a className="btn btn-primary" href="#">View available jobs <ArrowIcon /></a>
      <a className="btn btn-ghost" href="#">Contact</a>
    </div>
  </div>
);

export default ProfileHeader;
