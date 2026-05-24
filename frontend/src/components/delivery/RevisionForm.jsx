import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SendIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8h12M10 4l4 4-4 4"/>
  </svg>
);

const RevisionForm = ({ open }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      navigate('/jobs/job_001/revision', { state: { revisionText: text } });
    }, 900);
  };

  return (
    <div className={`revision-form-container ${open ? 'open' : ''}`}>
      <form className="revision-form" onSubmit={handleSubmit}>
        <div className="revision-form-label">Describe what needs to be revised</div>
        <textarea
          className="revision-textarea"
          placeholder="Be specific — the agent will use this to understand exactly what changes are needed..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={1200}
        />
        <div className="revision-form-footer">
          <span className="revision-char-count">{text.length}/1200</span>
          <button
            type="submit"
            className={`btn-submit-revision ${submitting ? 'loading' : ''}`}
            disabled={!text.trim() || submitting}
          >
            {submitting ? (
              <span className="revision-spinner" />
            ) : (
              <><SendIcon />Submit revision request</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RevisionForm;
