import React from 'react';
import '../styles/Loading.css';

export default function Loading() {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <div className="loading-text">Daten werden geladen...</div>
    </div>
  );
}
