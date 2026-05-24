const Logo = ({ size = 28, color = '#00ff88' }) => (
  <span className="brand-mark" style={{ width: size, height: size }}>
    <svg viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="lg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9 L22 12.5 L22 19.5 L16 23 L10 19.5 L10 12.5 Z"
        fill="url(#lg1)"
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2" fill={color} />
    </svg>
  </span>
);

export default Logo;
