import { useState } from 'react';

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="4" y="4" width="9" height="11" rx="1.5"/>
    <path d="M3 3h-.5A1.5 1.5 0 0 0 1 4.5v9A1.5 1.5 0 0 0 2.5 15H11"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3,8 6.5,11.5 13,4"/>
  </svg>
);

/**
 * Raw text renderer — interprets simple markup:
 *   Lines starting with `$ ` → .cli-prompt coloring
 *   Lines starting with `✓ ` → .cli-success coloring
 *   Lines starting with `# ` → .cli-comment
 *   Otherwise → plain output
 */
const renderLine = (line, i) => {
  if (line.startsWith('$ ')) {
    return (
      <span key={i}>
        <span className="cli-prompt">$ </span>
        {line.slice(2)}
        {'\n'}
      </span>
    );
  }
  if (line.startsWith('✓ ') || line.startsWith('✓ ')) {
    return <span key={i} className="cli-success">{line}{'\n'}</span>;
  }
  if (line.startsWith('# ')) {
    return <span key={i} className="cli-comment">{line}{'\n'}</span>;
  }
  return <span key={i} className="cli-output">{line}{'\n'}</span>;
};

const CLICodeBlock = ({ code = '', language = 'bash', showCopy = true, renderRaw = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="cli-code-block">
      {(showCopy || language) && (
        <div className="cli-code-header">
          <span className="cli-lang-tag">{language}</span>
          {showCopy && (
            <button className={`cli-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className="cli-code-pre">
        {renderRaw
          ? lines.map((line, i) => renderLine(line, i))
          : code
        }
      </pre>
    </div>
  );
};

export default CLICodeBlock;
