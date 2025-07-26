import React, { useState } from 'react';
import '../styles/Loading.css';

export default function Loading() {

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('lang') === 'DE' ? 'DE' : 'EN';

  const [lang, setLang] = useState(initial);

  return (
    <div className="loader-container">
      <div className="spinner" />
      <div className="loading-text">{lang === 'EN' ? 'Loading data...' : 'Daten werden geladen...'}</div>
    </div>
  );
}
