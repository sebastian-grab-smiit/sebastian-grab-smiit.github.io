import React from 'react';

export default function ThemeSwitcher({ theme, setTheme, lang }) {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    const label = isDark
        ? lang === 'DE' ? 'Heller Modus' : 'Light Mode'
        : lang === 'DE' ? 'Dunkler Modus' : 'Dark Mode';

    return (
        <a
            href="#"
            className="navbar-link theme-switch-link"
            onClick={e => {
                    e.preventDefault();
                    setTheme(nextTheme);
                }}
            tabIndex={0}
        >
            <span className="icon" role="img" aria-label={label}>
                {isDark ? '🌞' : '🌙'}
            </span>
            <span className="label">{label}</span>
        </a>
    );
}
