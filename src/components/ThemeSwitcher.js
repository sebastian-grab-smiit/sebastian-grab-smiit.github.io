import React from 'react';
import '../styles/ThemeSwitcher.css';

export default function ThemeSwitcher({ theme, setTheme, lang }) {
    return (
        <button
            className="theme-switch"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? lang === 'DE' ? '🌞 Heller Modus' : '🌞 Light Mode' : lang === 'DE' ? '🌙 Dunkler Modus' : '🌙 Dark Mode'}
        </button>
    );
}