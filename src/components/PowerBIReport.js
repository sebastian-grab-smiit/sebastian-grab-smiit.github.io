import React from 'react';
import '../styles/PowerBIReport.css';

export default function PowerBIReport({ lang }) {
    const src = process.env.REACT_APP_PBI_URL;
    return (
        <section id="powerbi" className="powerbi-section">
          <h2>{lang === 'EN' ? 'Demo - Data Visualization' : 'Demo - Datenvisualisierung'}</h2>
          <div className="powerbi-wrap">
            <div className="powerbi-card">
              <PowerBIReport lang={lang} className="powerbi-embed" />
            </div>
          </div>
        </section>
    );
}
