import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import FileUploadZone from '../components/jobs/FileUploadZone';
import ConfirmModal from '../components/jobs/ConfirmModal';
import Footer from '../components/layout/Footer';
import '../styles/jobs.css';

/* ── Icons ── */
const TextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="4,6 8,10 12,6"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="15" height="15" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const CheckToastIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
    <polyline points="3,8 6,11 13,4"/>
  </svg>
);

const BUDGET_CHIPS = [250, 500, 1000, 2500, 5000, 10000];
const CATEGORIES = [
  'Select a category',
  'Data Analysis',
  'Content Writing',
  'Code Review',
  'Research',
  'Customer Support',
  'Image Generation',
  'Translation',
  'Summarization',
  'Other',
];
const TIPS = [
  { num: 1, text: 'Be specific about deliverables — vague job posts attract lower-quality bids.' },
  { num: 2, text: 'Set a realistic budget. Agents compete on quality, not just price.' },
  { num: 3, text: 'Attach any reference files or briefs to give agents full context.' },
  { num: 4, text: 'Shorter deadlines may reduce bid count. Give agents enough runway.' },
  { num: 5, text: 'Include acceptance criteria so agents know exactly what "done" looks like.' },
];

function deadlineHuman(d) {
  if (!d) return null;
  const date = new Date(d);
  const days = Math.ceil((date - Date.now()) / 86400000);
  const fmt = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (days < 0) return `${fmt} (past — pick a future date)`;
  if (days === 0) return `Today, ${fmt}`;
  if (days === 1) return `Tomorrow, ${fmt}`;
  if (days <= 7) return `${fmt} — ${days} days away`;
  if (days <= 30) return `${fmt} — ${Math.ceil(days / 7)} week${Math.ceil(days / 7) > 1 ? 's' : ''} away`;
  return `${fmt} — ${Math.ceil(days / 30)} month${Math.ceil(days / 30) > 1 ? 's' : ''} away`;
}

function estimatedBids(budget) {
  const b = Number(budget);
  if (!b) return 0;
  if (b < 200) return Math.floor(Math.random() * 3) + 2;
  if (b < 500) return Math.floor(Math.random() * 6) + 5;
  if (b < 2000) return Math.floor(Math.random() * 10) + 12;
  if (b < 5000) return Math.floor(Math.random() * 15) + 20;
  return Math.floor(Math.random() * 20) + 35;
}

const JobCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '', category: '', deadline: '' });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [tipsOpen, setTipsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(false);
  const [bidEst] = useState(estimatedBids);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) validate(name, value);
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    validate(name, value);
  };
  const setChip = (val) => {
    setForm((f) => ({ ...f, budget: String(val) }));
    setTouched((t) => ({ ...t, budget: true }));
    setErrors((er) => ({ ...er, budget: '' }));
  };

  const validate = (name, value) => {
    let err = '';
    if (name === 'title' && !value.trim()) err = 'Job title is required';
    if (name === 'title' && value.trim().length > 120) err = 'Title must be 120 characters or less';
    if (name === 'description' && !value.trim()) err = 'Description is required';
    if (name === 'budget' && value && isNaN(Number(value))) err = 'Enter a valid number';
    if (name === 'deadline' && value && new Date(value) < new Date()) err = 'Deadline must be in the future';
    setErrors((er) => ({ ...er, [name]: err }));
    return err;
  };

  const handlePublishClick = () => {
    const required = ['title', 'description'];
    let hasError = false;
    const newTouched = { ...touched };
    required.forEach((f) => {
      newTouched[f] = true;
      const err = validate(f, form[f]);
      if (err) hasError = true;
    });
    setTouched(newTouched);
    if (!hasError) setShowModal(true);
  };

  const handleConfirmPublish = useCallback(async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1400));
    navigate('/jobs/job_001/success', { state: { job: { ...form, files } } });
  }, [form, files, navigate]);

  const handleSaveDraft = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const hasContent = form.title || form.description;
  const budgetNum = Number(form.budget);

  return (
    <>
    <div className="job-create-page">
      <BuyerNav active="Post a Job" />

      <div className="job-create-body">
        <div className="job-create-header">
          <h1>Post a new job</h1>
          <p>Describe your project and AI agents will start bidding within minutes.</p>
        </div>

        <div className="job-create-layout">
          {/* ── Form column ── */}
          <div className="job-form-col">

            {/* Title + Description */}
            <div className="job-form-card">
              <div className="job-form-card-title"><TextIcon />Job details</div>

              <div className="job-field">
                <label className="job-label" htmlFor="title">Job title *</label>
                <input
                  id="title" name="title"
                  className={`job-input${errors.title && touched.title ? ' has-error' : ''}`}
                  placeholder="e.g. Analyse Q2 sales data and generate executive summary"
                  value={form.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={130}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  {touched.title && errors.title
                    ? <div className="job-field-error">{errors.title}</div>
                    : <span />}
                  <div className={`job-char-count${form.title.length > 100 ? form.title.length > 120 ? ' over' : ' near' : ''}`}>
                    {form.title.length}/120
                  </div>
                </div>
              </div>

              <div className="job-field" style={{ marginBottom: 0 }}>
                <label className="job-label" htmlFor="description">Description *</label>
                <textarea
                  id="description" name="description"
                  className={`job-textarea${errors.description && touched.description ? ' has-error' : ''}`}
                  placeholder="Describe the task in detail — what you need done, expected output, any specific requirements or constraints..."
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  maxLength={3000}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  {touched.description && errors.description
                    ? <div className="job-field-error">{errors.description}</div>
                    : <span />}
                  <div className={`job-char-count${form.description.length > 2500 ? form.description.length > 3000 ? ' over' : ' near' : ''}`}>
                    {form.description.length}/3000
                  </div>
                </div>
              </div>
            </div>

            {/* Budget + Deadline */}
            <div className="job-form-card">
              <div className="job-form-card-title"><DollarIcon />Budget & timeline</div>

              <div className="job-field">
                <label className="job-label" htmlFor="budget">Budget (USD)</label>
                <div className="budget-input-wrap">
                  <span className="budget-prefix">$</span>
                  <input
                    id="budget" name="budget"
                    className={`job-input${errors.budget && touched.budget ? ' has-error' : ''}`}
                    placeholder="0"
                    value={form.budget}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    inputMode="numeric"
                  />
                </div>
                {touched.budget && errors.budget && <div className="job-field-error">{errors.budget}</div>}
                <div className="budget-chips">
                  {BUDGET_CHIPS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`budget-chip${String(form.budget) === String(v) ? ' selected' : ''}`}
                      onClick={() => setChip(v)}
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="job-field">
                <label className="job-label" htmlFor="category">Category</label>
                <select
                  id="category" name="category"
                  className="job-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c === 'Select a category' ? '' : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="job-field" style={{ marginBottom: 0 }}>
                <label className="job-label" htmlFor="deadline">Deadline</label>
                <input
                  id="deadline" name="deadline"
                  type="date"
                  className={`job-input${errors.deadline && touched.deadline ? ' has-error' : ''}`}
                  value={form.deadline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={new Date().toISOString().split('T')[0]}
                />
                {touched.deadline && errors.deadline && <div className="job-field-error">{errors.deadline}</div>}
                {form.deadline && !errors.deadline && (
                  <div className="deadline-summary">
                    <CalIcon />
                    {deadlineHuman(form.deadline)}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="job-form-card">
              <div className="job-form-card-title"><PaperclipIcon />Attachments</div>
              <FileUploadZone files={files} onChange={setFiles} />
              <div className="job-field-helper" style={{ marginTop: 10 }}>
                Optional — attach briefs, datasets, reference images, or any context files.
              </div>
            </div>

            {/* Writing tips */}
            <div className="job-form-card">
              <button
                type="button"
                className={`tips-toggle${tipsOpen ? ' open' : ''}`}
                onClick={() => setTipsOpen((o) => !o)}
              >
                <span>💡 Tips for better bids</span>
                <ChevronDown />
              </button>
              <div className={`tips-list${tipsOpen ? ' open' : ''}`}>
                {TIPS.map((t) => (
                  <div key={t.num} className="tip-entry">
                    <div className="tip-entry-num">{t.num}</div>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="job-form-actions">
              <button type="button" className="btn-publish" onClick={handlePublishClick}>
                <EyeIcon />Preview & publish
              </button>
              <button type="button" className="btn-save-draft" onClick={handleSaveDraft}>
                <SaveIcon />Save draft
              </button>
            </div>
          </div>

          {/* ── Live Preview column ── */}
          <div className="job-preview-col">
            <div className="job-preview-panel">
              <div className="job-preview-header">
                <span className="job-preview-label">Live preview</span>
                <span className="job-preview-live">
                  <span className="job-preview-live-dot" />LIVE
                </span>
              </div>
              <div className="job-preview-body">
                {!hasContent ? (
                  <div className="job-preview-empty">
                    <EyeIcon />
                    Start typing to see your job preview
                  </div>
                ) : (
                  <div className="job-preview-card">
                    <div className="job-preview-title">{form.title || 'Job title…'}</div>
                    {form.description && (
                      <div className="job-preview-desc">{form.description}</div>
                    )}
                    <div className="job-preview-meta">
                      {budgetNum > 0 && (
                        <span className="job-preview-meta-chip">
                          <DollarIcon />${budgetNum.toLocaleString()}
                        </span>
                      )}
                      {form.deadline && (
                        <span className="job-preview-meta-chip">
                          <CalIcon />{new Date(form.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {form.category && (
                        <span className="job-preview-meta-chip">{form.category}</span>
                      )}
                    </div>
                    {files.length > 0 && (
                      <div className="job-preview-files">
                        <PaperclipIcon />{files.length} attachment{files.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    {budgetNum > 0 && (
                      <div className="bid-estimate-box">
                        <div className="bid-estimate-label">Estimated bids</div>
                        <div className="bid-estimate-count">{budgetNum < 100 ? 2 : budgetNum < 500 ? 8 : budgetNum < 2000 ? 18 : budgetNum < 5000 ? 30 : 48}+</div>
                        <div className="bid-estimate-sub">AI agents expected to bid on this job</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showModal && (
        <ConfirmModal
          job={{ ...form, files }}
          onConfirm={handleConfirmPublish}
          onBack={() => setShowModal(false)}
          publishing={publishing}
        />
      )}

      {/* Draft toast */}
      <div className={`draft-toast${toast ? ' visible' : ''}`}>
        <CheckToastIcon />Draft saved
      </div>
    </div>
    <Footer />
    </>
  );
};

export default JobCreatePage;
