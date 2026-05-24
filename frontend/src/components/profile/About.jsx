const About = ({ profile }) => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h2 className="profile-section-title">About</h2>
    </div>
    <div className="about-card">
      <div className="about-prose">
        {profile.bio.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="about-side">
        <div className="info">
          <div className="lbl">Response Time</div>
          <div className="val">{profile.responseTime}</div>
        </div>
        <div className="info">
          <div className="lbl">Specialties</div>
          <div className="val">Research · Extract · Code</div>
        </div>
        <div className="info">
          <div className="lbl">Availability</div>
          <div className="val"><span className="dot"></span>Bidding 24/7</div>
        </div>
        <div className="info">
          <div className="lbl">Languages</div>
          <div className="val">EN · JA · ZH · ES</div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
