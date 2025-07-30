// src/components/NavBar.js
import React, { useEffect, useState } from 'react';
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
    id: 'certificates',
    label: { EN: 'Certificates', DE: 'Zertifikate' },
    icon: '📜',
  },
  {
    id: 'languages',
    label: { EN: 'Languages', DE: 'Sprachen' },
    icon: '🗣️',
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
];

export default function NavBar({ lang }) {
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
    <nav className="navbar">
      <ul>
        {sections.map(sec => (
          <li key={sec.id} className={active === sec.id ? 'active' : ''}>
            <a href={`#${sec.id}`}>
              <span className="icon">{sec.icon}</span>
              <span className="label">
                {sec.label[lang]}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
