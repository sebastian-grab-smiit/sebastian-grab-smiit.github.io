// ./components/SettingsModal.js
import React, { useEffect, useRef, useState } from 'react';

const GearIcon = ({ size = 32, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="32" cy="32" r="10" />
    <g>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="30"
          y="4"
          width="4"
          height="12"
          rx="1"
          ry="1"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
    </g>
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
);

export default function SettingsModal({ lang, setLang, theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const [spinDir, setSpinDir] = useState(null);
  const ref = useRef(null);
  const gearRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (open && ref.current && !ref.current.contains(e.target) && gearRef.current && !gearRef.current.contains(e.target)) {
        setSpinDir('out');
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (open && e.key === 'Escape') {
        setSpinDir('out');
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleGearClick = () => {
    if (open) {
      setSpinDir('out');
      setOpen(false);
    } else {
      setSpinDir('in');
      setOpen(true);
    }
  };

  useEffect(() => {
    if (spinDir) {
      const tid = setTimeout(() => setSpinDir(null), 600);
      return () => clearTimeout(tid);
    }
  }, [spinDir]);

  return (
    <>
      <button
        aria-label="Settings"
        aria-expanded={open}
        className={`settings-gear ${spinDir === 'in' ? 'spin-in' : ''} ${spinDir === 'out' ? 'spin-out' : ''} ${open ? 'open' : ''}`}
        onClick={handleGearClick}
        ref={gearRef}
      >
        <div className="gear-ring" aria-hidden="true" />
        <GearIcon />
      </button>

      {open && (
        <div
          className="settings-popover"
          ref={ref}
          role="dialog"
          aria-label="Settings"
        >
          <div className="section">
            <div className="label">{ lang === "EN" ? "Language" : "Sprache" }</div>
            <div className="options">
              {['EN', 'DE'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={lang === l ? 'active' : ''}
                  aria-pressed={lang === l}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="section">
            <div className="label">Theme</div>
            <div className="options">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={theme === t ? 'active' : ''}
                  aria-pressed={theme === t}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
