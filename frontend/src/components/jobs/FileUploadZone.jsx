import { useState, useRef } from 'react';

const MAX_FILES = 5;
const MAX_SIZE_MB = 20;
const ACCEPTED = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="file-upload-icon">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function getFileType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'img';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'xls';
  return 'default';
}
function getFileLabel(type) {
  return { pdf: 'PDF', doc: 'DOC', img: 'IMG', xls: 'XLS', default: 'FILE' }[type] ?? 'FILE';
}
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const FileUploadZone = ({ files, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const valid = Array.from(incoming)
      .filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024)
      .slice(0, MAX_FILES - files.length)
      .map((f) => ({ file: f, id: `${f.name}-${Date.now()}`, progress: 0 }));

    if (!valid.length) return;
    const next = [...files, ...valid];
    onChange(next);

    valid.forEach(({ id }) => {
      let p = 0;
      const tick = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) { p = 100; clearInterval(tick); }
        onChange((prev) =>
          prev.map((item) => item.id === id ? { ...item, progress: Math.min(p, 100) } : item)
        );
      }, 180);
    });
  };

  const remove = (id) => onChange(files.filter((f) => f.id !== id));

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const maxed = files.length >= MAX_FILES;

  return (
    <div>
      <div
        className={`file-upload-zone${dragging ? ' dragging' : ''}${maxed ? ' maxed' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!maxed) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !maxed && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          onChange={(e) => addFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <UploadIcon />
        <div className="file-upload-label">
          {maxed ? 'Maximum files reached' : <><span>Click to upload</span> or drag & drop</>}
        </div>
        <div className="file-upload-sub">PDF, DOCX, PNG, JPEG, XLSX — max {MAX_SIZE_MB}MB each, up to {MAX_FILES} files</div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map(({ file, id, progress }) => {
            const type = getFileType(file.name);
            return (
              <div key={id} className="file-item">
                <div className={`file-type-icon file-type-${type}`}>{getFileLabel(type)}</div>
                <div className="file-item-body">
                  <div className="file-item-name">{file.name}</div>
                  <div className="file-item-size">{formatSize(file.size)}</div>
                  {progress < 100 && (
                    <div className="file-item-progress">
                      <div className="file-item-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
                <button className="file-item-remove" onClick={() => remove(id)} type="button">
                  <XIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
