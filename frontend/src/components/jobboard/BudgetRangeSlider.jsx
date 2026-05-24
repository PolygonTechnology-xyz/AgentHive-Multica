import { useRef, useCallback, useEffect, useState } from 'react';

const PRESETS = [
  { label: 'Under $100',    min: 0,    max: 100  },
  { label: '$100 — $500',   min: 100,  max: 500  },
  { label: '$500 — $2,000', min: 500,  max: 2000 },
  { label: '$2,000+',       min: 2000, max: 5000 },
];

const BudgetRangeSlider = ({ min = 0, max = 5000, value, onChange }) => {
  const TRACK_MIN = 0;
  const TRACK_MAX = 5000;

  const trackRef = useRef(null);
  const dragging  = useRef(null); // 'low' | 'high'
  const [activeDrag, setActiveDrag] = useState(null);

  const pct = (v) => ((v - TRACK_MIN) / (TRACK_MAX - TRACK_MIN)) * 100;

  const valueFromPct = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = TRACK_MIN + ratio * (TRACK_MAX - TRACK_MIN);
    // snap to nearest 50
    return Math.round(raw / 50) * 50;
  }, []);

  const onPointerDown = useCallback((thumb, e) => {
    e.preventDefault();
    dragging.current = thumb;
    setActiveDrag(thumb);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const v = valueFromPct(clientX);

      if (dragging.current === 'low') {
        onChange([Math.min(v, value[1] - 50), value[1]]);
      } else {
        onChange([value[0], Math.max(v, value[0] + 50)]);
      }
    };
    const onUp = () => {
      dragging.current = null;
      setActiveDrag(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [value, onChange, valueFromPct]);

  const formatVal = (v) => v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`;

  const activePreset = PRESETS.find(p => p.min === value[0] && p.max === value[1]) || null;

  const displayMin = value[0] === 0 && value[1] === 5000
    ? `$0 — $5,000`
    : `${formatVal(value[0])} — ${value[1] === 5000 ? '$5,000+' : formatVal(value[1])}`;

  return (
    <div>
      <div className="jb-range-display">{displayMin}</div>

      <div className="jb-range-track-wrap" ref={trackRef}>
        <div className="jb-range-track" />
        <div
          className="jb-range-fill"
          style={{ left: `${pct(value[0])}%`, width: `${pct(value[1]) - pct(value[0])}%` }}
        />
        {/* Low thumb */}
        <div
          className={`jb-range-thumb${activeDrag === 'low' ? ' dragging' : ''}`}
          style={{ left: `${pct(value[0])}%` }}
          onMouseDown={(e) => onPointerDown('low', e)}
          onTouchStart={(e) => onPointerDown('low', e)}
        />
        {/* High thumb */}
        <div
          className={`jb-range-thumb${activeDrag === 'high' ? ' dragging' : ''}`}
          style={{ left: `${pct(value[1])}%` }}
          onMouseDown={(e) => onPointerDown('high', e)}
          onTouchStart={(e) => onPointerDown('high', e)}
        />
      </div>

      <div className="jb-preset-chips">
        {PRESETS.map(p => (
          <button
            key={p.label}
            className={`jb-preset-chip${activePreset?.label === p.label ? ' active' : ''}`}
            onClick={() => onChange([p.min, p.max])}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BudgetRangeSlider;
