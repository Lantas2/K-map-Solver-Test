import { useEffect, useRef, useState } from "react";

const THEMES = [
  { id: "original", label: "Original" },
  { id: "rose", label: "Rose" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "coffee", label: "Coffee" },
];

const MOTION_OPTIONS = [
  { id: "auto", label: "Auto", title: "Follow system motion preference" },
  { id: "full", label: "Full", title: "Keep all CITools motion active" },
  { id: "reduced", label: "Reduced", title: "Limit non-essential motion" },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7m10.8 10.8 1.7 1.7M2.5 12h2.4m14.2 0h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.7 8.7 0 1 0 11 11Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.3a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20.3c.7-3.6 3.6-5.7 7.5-5.7s6.8 2.1 7.5 5.7" />
    </svg>
  );
}

export default function ToolThemeMenu({
  theme,
  onThemeChange,
  appearance,
  onAppearanceChange,
  soundEnabled,
  onSoundToggle,
  motionPreference,
  motionReduced,
  onMotionChange,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const selected = THEMES.find((item) => item.id === theme) ?? THEMES[0];
  const dark = appearance === "dark";

  useEffect(() => {
    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    }
    function closeWithEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  return (
    <div className="orbit-utilities">
      <button
        type="button"
        className="appearance-switch"
        onClick={() => onAppearanceChange(dark ? "light" : "dark")}
        aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
        title={dark ? "Dark mode active" : "Light mode active"}
      >
        <span className="mode-icon">{dark ? <MoonIcon /> : <SunIcon />}</span>
        <span className="mode-track" aria-hidden="true"><i /></span>
      </button>

      <div className="tool-settings" ref={menuRef}>
        <button
          className="settings-trigger"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className="settings-icon"><UserIcon /></span>
          <span>CITools</span>
          <span className="settings-chevron">⌄</span>
        </button>

        {open && (
          <div className="settings-popover" role="dialog" aria-label="CITools appearance settings">
            <div className="settings-popover-head">
              <span>Appearance</span>
              <small>{dark ? "Dark" : "Light"}</small>
            </div>

            <button
              type="button"
              className="sound-setting"
              onClick={onSoundToggle}
              aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              <span><span aria-hidden="true">♪</span> Sound</span>
              <span className="sound-state">{soundEnabled ? "On" : "Off"}</span>
            </button>

            <span className="motion-label">Motion</span>
            <div className="motion-options" role="radiogroup" aria-label="Motion preference">
              {MOTION_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  role="radio"
                  aria-checked={motionPreference === item.id}
                  className={motionPreference === item.id ? "motion-option selected" : "motion-option"}
                  onClick={() => onMotionChange(item.id)}
                  title={item.title}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="motion-caption">
              {motionPreference === "auto"
                ? `System: ${motionReduced ? "Reduced" : "Full"}`
                : motionReduced
                  ? "Minimal movement"
                  : "All effects active"}
            </p>

            <span className="palette-label">Color palette</span>
            <div className="palette-grid" role="listbox" aria-label="Theme palette">
              {THEMES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  role="option"
                  aria-selected={theme === item.id}
                  className={theme === item.id ? "palette-option selected" : "palette-option"}
                  onClick={() => { onThemeChange(item.id); setOpen(false); }}
                >
                  <i className={`theme-swatch swatch-${item.id}`} />
                  <span>{item.label}</span>
                  {theme === item.id && <b className="palette-check">✓</b>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
