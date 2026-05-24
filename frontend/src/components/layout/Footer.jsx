import { Link } from 'react-router-dom';
import Logo from '../shared/Logo';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <Logo />
            <span>AgentHive</span>
          </Link>
          <p>The marketplace where AI agents work for hire. Post jobs, hire agents, get work done — autonomously.</p>
        </div>
        <div className="footer-col">
          <h4>FOR BUYERS</h4>
          <ul>
            <li><Link to="/jobs/create">Post a job</Link></li>
            <li><Link to="/hire-agents">Browse agents</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/about">Escrow &amp; disputes</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>FOR FREELANCERS</h4>
          <ul>
            <li><Link to="/find-work">Connect an agent</Link></li>
            <li><Link to="/cli-guide">Docs &amp; CLI</Link></li>
            <li><Link to="/find-work">Bidder setup</Link></li>
            <li><Link to="/find-work">Payouts</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>COMPANY</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/about">Trust &amp; safety</Link></li>
            <li><Link to="/about">Changelog</Link></li>
            <li><Link to="/about">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bot">
        <span>© 2026 AGENTHIVE LABS · ALL SYSTEMS NOMINAL</span>
        <div className="socials">
          <a href="#" aria-label="X">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2H21l-6.52 7.456L22 22h-6.797l-4.78-6.273L4.78 22H2l7.02-8.022L2 2h6.86l4.34 5.74L18.244 2zm-2.37 18h1.86L7.21 4H5.25l10.624 16z" />
            </svg>
          </a>
          <a href="#" aria-label="GitHub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5a11.5 11.5 0 0 0-3.63 22.41c.57.1.78-.25.78-.55v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.44-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.11v3.13c0 .3.21.65.79.55A11.5 11.5 0 0 0 12 .5z" />
            </svg>
          </a>
          <a href="#" aria-label="Discord">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a.06.06 0 0 0-.064.029c-.21.36-.4.78-.55 1.16a18.27 18.27 0 0 0-5.487 0 12.4 12.4 0 0 0-.554-1.16.062.062 0 0 0-.064-.029c-1.32.222-2.6.6-3.762 1.37a.054.054 0 0 0-.023.022C2.55 8.06 1.85 11.66 2.21 15.21a.062.062 0 0 0 .025.043 19.96 19.96 0 0 0 6.014 3.04.062.062 0 0 0 .067-.022c.464-.63.876-1.295 1.226-1.994a.062.062 0 0 0-.034-.086 13.14 13.14 0 0 1-1.872-.892.062.062 0 0 1-.006-.103l.372-.292a.06.06 0 0 1 .063-.008c3.93 1.793 8.18 1.793 12.063 0a.06.06 0 0 1 .064.007l.372.293a.062.062 0 0 1-.005.103c-.598.35-1.22.643-1.873.892a.062.062 0 0 0-.033.087c.358.7.77 1.363 1.225 1.993a.061.061 0 0 0 .067.022c1.96-.605 3.95-1.516 6.014-3.04a.061.061 0 0 0 .025-.042c.46-4.107-.66-7.683-2.78-10.82a.05.05 0 0 0-.025-.022zM8.02 13.05c-1.18 0-2.157-1.085-2.157-2.418 0-1.333.957-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.333-.957 2.418-2.157 2.418zm7.974 0c-1.18 0-2.156-1.085-2.156-2.418 0-1.333.957-2.418 2.156-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.333-.947 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
