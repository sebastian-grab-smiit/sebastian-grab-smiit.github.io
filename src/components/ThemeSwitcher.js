import React from 'react';
import '../styles/ThemeSwitcher.css';

export default function ThemeSwitcher({ theme, setTheme }) {
    return (
        <button
            className="theme-switch"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
    );
}