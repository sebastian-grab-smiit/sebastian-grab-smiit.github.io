import React, { useEffect, useState } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import {
  fetchPersonal,
  fetchCertificates,
  fetchLanguages,
  fetchAcademics,
  fetchSkills,
  fetchResume,
  fetchProjects,
} from './services/googleSheetReader';
import Home from './pages/Home';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import logoWhite from './assets/logo-white.png';
import logoBlack from './assets/logo-black.png';

export default function App() {
  const [cvData, setCvData] = useState(null);
  const [theme, setTheme] = useState('dark');

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('lang') === 'DE' ? 'DE' : 'EN';
  const [lang, setLang] = useState(initial);

  useEffect(() => {
    const newUrl = `${window.location.pathname}?lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          personal,
          certificates,
          languages,
          academics,
          skills,
          resume,
          projects,
        ] = await Promise.all([
          fetchPersonal(),
          fetchCertificates(),
          fetchLanguages(),
          fetchAcademics(),
          fetchSkills(),
          fetchResume(),
          fetchProjects(),
        ]);

        setCvData({ personal, certificates, languages, academics, skills, resume, projects });
      } catch (err) {
        console.error('Failed to load CV data', err);
      }
    }

    loadData();

    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleLang = (l) => {
    if (l !== lang) setLang(l);
  };

  return (
    <div className="App">
      <SwitchTransition>
        <CSSTransition
          key={cvData ? 'home' : 'loading'}
          timeout={400}
          classNames="fade"
        >
          {cvData ? (
            <div className="page">
              <div className="app-logo">
                <a href="https://www.smiit.de">
                  <img src={theme === 'dark' ? logoWhite : logoBlack} alt="smiit GmbH Logo" />
                </a>
              </div>
              <div className="lang-switcher">
                {['EN', 'DE'].map((l) => (
                  <button
                    key={l}
                    className={lang === l ? 'active' : ''}
                    onClick={() => toggleLang(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <NavBar lang={lang} theme={theme} setTheme={setTheme} />
              <Home lang={lang} {...cvData} />
            </div>
          ) : (
            <Loading />
          )}
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
