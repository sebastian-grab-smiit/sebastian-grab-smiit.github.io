import React from 'react';
import html2pdf from 'html2pdf.js';
import '../styles/PDFDownload.css';

export default function PDFDownload() {
    const handleDownload = () => {
        const element = document.getElementById('root');
        html2pdf().from(element).save('CV.pdf');
    };

    return (
        <button className="pdf-btn" onClick={handleDownload}>
        Download PDF
        </button>
    );
}