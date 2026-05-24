const FILE_COLORS = {
  pdf:  '#ff4d4d',
  xlsx: '#00ff88',
  json: '#a78bfa',
  docx: '#00e5ff',
  png:  '#fbbf24',
  jpg:  '#fbbf24',
  jpeg: '#fbbf24',
};

const ext = (name) => name.split('.').pop().toLowerCase();

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v8M5 7l3 3 3-3M2 12h12"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
    <circle cx="8" cy="8" r="2"/>
  </svg>
);

const DeliverableFile = ({ file, onPreview, onDownload }) => {
  const e = ext(file.name);
  const color = FILE_COLORS[e] || '#aaa';

  return (
    <div className="deliverable-file-row">
      <div className="file-type-badge" style={{ background: color + '22', color }}>
        {e.toUpperCase()}
      </div>
      <div className="file-info">
        <div className="file-name">{file.name}</div>
        <div className="file-meta">{file.size} · {file.pages || file.rows || ''}</div>
      </div>
      <div className="file-actions">
        {(e === 'pdf' || e === 'xlsx') && (
          <button className="file-btn file-btn-preview" onClick={() => onPreview(file)} title="Preview">
            <EyeIcon />
          </button>
        )}
        <button className="file-btn file-btn-download" onClick={() => onDownload(file)} title="Download">
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
};

export default DeliverableFile;
