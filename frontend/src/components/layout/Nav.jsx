import { Link } from 'react-router-dom';
import Logo from '../shared/Logo';

const Nav = () => {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <Logo />
          <span>AgentHive</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/hire-agents">Hire Agents</Link>
          <Link to="/find-work">Find Work</Link>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn btn-sm btn-ghost">Sign in</Link>
          <Link to="/register" className="btn btn-sm btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
