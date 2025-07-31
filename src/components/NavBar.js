import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import '../styles/NavBar.css';

const sections = [
  {
    id: 'personal',
    label: { EN: 'Personal', DE: 'Persönliches' },
    icon: '👤',
  },
  {
    id: 'academics',
    label: { EN: 'Academic History', DE: 'Akademischer Werdegang' },
    icon: '🎓',
  },
  {
    id: 'skills',
    label: { EN: 'Skills', DE: 'Kenntnisse' },
    icon: '🛠️',
  },
  {
    id: 'resume',
    label: { EN: 'Professional Experience', DE: 'Berufserfahrung' },
    icon: '📄',
  },
  {
    id: 'projects',
    label: { EN: 'Projects', DE: 'Projekte' },
    icon: '💼',
  },
  {
    id: 'demo',
    label: { EN: 'Demo', DE: 'Demo' },
    icon: '🖱️',
  },
  {
    id: 'certificates',
    label: { EN: 'Certificates', DE: 'Zertifikate' },
    icon: '📜',
  },
];

export default function NavBar({ lang, theme, setTheme }) {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      for (let sec of sections) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPos) {
          setActive(sec.id);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className="navbar"
      initial={{ x: -70, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
    >
      <nav className="navbar">
        <div className="navbar-content">
          <ul>
            {sections.map(sec => (
              <li key={sec.id} className={active === sec.id ? 'active' : ''}>
                <a href={`#${sec.id}`} className="navbar-link">
                  <span className="icon">{sec.icon}</span>
                  <span className="label">{sec.label[lang]}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="navbar-bottom">
            <ThemeSwitcher theme={theme} setTheme={setTheme} lang={lang} />
          </div>
        </div>
      </nav>
    </motion.nav>
  );
}
