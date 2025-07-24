import React, { useEffect, useState } from 'react';
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
import ThemeSwitcher from './components/ThemeSwitcher';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

export default function App() {
  const [cvData, setCvData] = useState(null);
  const [theme, setTheme] = useState('dark');

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

  if (!cvData) {
    return <Loading />;
  }

  return (
    <div className="App">
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
      <Home {...cvData} />
    </div>
  );
}
