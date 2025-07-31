import React, { useState } from 'react';
import '../styles/Loading.css';

export default function Loading({lang}) {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <div className="loading-text">{lang === 'EN' ? 'Loading data...' : 'Daten werden geladen...'}</div>
    </div>
  );
}
