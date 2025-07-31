import React from 'react';
import '../styles/PowerBIReport.css';

export default function PowerBIReport({ lang }) {
    const src = process.env.REACT_APP_PBI_URL;
    return (
        <section section id = "demo" className="powerbi-section">
            <h2>{lang === 'EN' ? 'Demo - Data Visualization' : 'Demo - Datenvisualisierung'}</h2>
            <div className="powerbi-container">
                <iframe
                title="Power BI Report - smiit Analytics"
                src={src}
                frameBorder="0"
                allowFullScreen
                />
            </div>
        </section>
    );
}
