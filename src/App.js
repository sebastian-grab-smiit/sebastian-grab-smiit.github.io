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
import AppLogo from './components/AppLogo';
import SettingsModal from './components/SettingsModal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

export default function App() {
  const [cvData, setCvData] = useState(null);
  const [theme, setTheme] = useState(() => {
    // optional: initialize from localStorage or fallback to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('lang') === 'EN' ? 'EN' : 'DE';
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

        setCvData({
          personal,
          certificates,
          languages,
          academics,
          skills,
          resume,
          projects,
        });
      } catch (err) {
        console.error('Failed to load CV data', err);
      }
    }

    loadData();

    AOS.init({ duration: 800, false: true, mirror: true });
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // persist
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
                <AppLogo theme={theme} />
              </div>

              {/* Settings gear top-right */}
              <SettingsModal
                lang={lang}
                setLang={toggleLang}
                theme={theme}
                setTheme={setTheme}
              />

              <Home lang={lang} {...cvData} />
            </div>
          ) : (
            <Loading lang={lang} />
          )}
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}