import { useEffect } from 'react';

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
);

const MockPDF = () => (
  <div className="mock-pdf-page">
    <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>Q1 2025 Market Intelligence Report</div>
    <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 20 }}>Prepared by NexusIntel · April 2025</div>
    <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#333', marginBottom: 16 }}>
      This report provides a comprehensive analysis of market trends across key verticals for Q1 2025.
      Data sourced from proprietary intelligence feeds, public filings, and curated third-party datasets.
    </div>
    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10, color: '#111' }}>Executive Summary</div>
    <div style={{ fontSize: '0.82rem', lineHeight: 1.75, color: '#333', marginBottom: 20 }}>
      Market conditions in Q1 2025 showed moderate growth across technology sectors with notable expansion
      in AI infrastructure (+34% YoY), cloud services (+18% YoY), and fintech (+12% YoY). Consumer sentiment
      indices remained stable despite macroeconomic headwinds, with the HCI score holding at 62.4.
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: 20 }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          {['Sector', 'Q1 2024', 'Q1 2025', 'YoY Change'].map(h => (
            <th key={h} style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: 700 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          ['AI Infrastructure', '$4.2B', '$5.6B', '+33.3%'],
          ['Cloud Services',   '$11.8B', '$13.9B', '+17.8%'],
          ['Fintech',          '$6.4B',  '$7.2B',  '+12.5%'],
          ['Cybersecurity',    '$3.1B',  '$3.8B',  '+22.6%'],
          ['Edge Computing',   '$1.9B',  '$2.7B',  '+42.1%'],
        ].map(([s, q1, q2, chg]) => (
          <tr key={s} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '5px 10px' }}>{s}</td>
            <td style={{ padding: '5px 10px' }}>{q1}</td>
            <td style={{ padding: '5px 10px' }}>{q2}</td>
            <td style={{ padding: '5px 10px', color: '#1a7a4a', fontWeight: 600 }}>{chg}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ fontSize: '0.78rem', color: '#888', borderTop: '1px solid #ddd', paddingTop: 10 }}>
      Page 1 of 12 · Confidential — Not for external distribution
    </div>
  </div>
);

const MockXLSX = () => {
  const headers = ['Company', 'Sector', 'Revenue Q1', 'Growth', 'Risk Score', 'Recommendation'];
  const rows = [
    ['Anthropic Inc.',    'AI',          '$2.1B', '+41%', 'Low',    'Strong Buy'],
    ['OpenCore Systems',  'AI Infra',    '$890M', '+28%', 'Medium', 'Buy'],
    ['DataStream Co.',    'Analytics',   '$340M', '+15%', 'Low',    'Hold'],
    ['VaultPay Ltd.',     'Fintech',     '$1.2B', '+19%', 'Medium', 'Buy'],
    ['ClearEdge Networks','Edge/Cloud',  '$560M', '+38%', 'Low',    'Strong Buy'],
    ['SecureLayer AI',    'Cybersec',    '$210M', '+22%', 'High',   'Hold'],
    ['QuantumBridge',     'Compute',     '$780M', '+31%', 'Medium', 'Buy'],
  ];

  return (
    <div className="mock-xlsx-container">
      <div style={{ fontSize: '0.78rem', color: '#00ff88', marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>
        Sheet: Q1_Market_Data · 7 rows · 6 columns
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="mock-xlsx-table">
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    color: j === 3 ? '#00ff88' : j === 4 ? (cell === 'High' ? '#ef4444' : cell === 'Low' ? '#00ff88' : '#fbbf24') : undefined,
                    fontWeight: j === 5 && cell.includes('Strong') ? 700 : undefined,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FilePreviewModal = ({ file, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const e = file.name.split('.').pop().toLowerCase();

  return (
    <div className="file-preview-overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="file-preview-modal">
        <div className="file-preview-header">
          <div>
            <div className="file-preview-title">{file.name}</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginTop: 2 }}>{file.size} · Preview only</div>
          </div>
          <button className="file-preview-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="file-preview-body">
          {e === 'pdf'  && <MockPDF />}
          {e === 'xlsx' && <MockXLSX />}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
