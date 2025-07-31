import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Home.css';
import PowerBIReport from '../components/PowerBIReport';
import DroppingSection from '../services/DroppingSection';

/* ──────────────────────────────
    Helper Functions
────────────────────────────── */

// Language-based date formatting
function fmt(lang, d) {
  if (d instanceof Date && !isNaN(d)) {
    const locale = lang === 'EN' ? 'en-US' : 'de-DE';
    return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  }
  return lang === 'EN' ? 'Present' : 'heute';
}

// Format date range (start–end)
function rangeFmt(lang, start, end) {
  if (!(end instanceof Date) || isNaN(end)) {
    return `${fmt(lang, start)} – ${lang === 'EN' ? 'Present' : 'heute'}`;
  }
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();
  return sameMonth ? fmt(lang, start) : `${fmt(lang, start)} – ${fmt(lang, end)}`;
}

// For rendering multi-line text (bullets, etc.)
function withLineBreaks(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/ *• */g, '\n• ').replace(/^\n/, '');
}

// Extract unique, sorted values from item arrays (e.g., technologies/sections)
function getUniqueSortedFromItems(items, key) {
  return Array.from(
    new Set(
      items.flatMap((it) =>
        (it[key] || '')
          .split(';')
          .map((x) => x.trim())
          .filter(Boolean)
      )
    )
  ).sort();
}

// Count how many times each value (tech/section) occurs
function getCounts(base, key, uniqueList) {
  return uniqueList.reduce((acc, val) => {
    acc[val] = base.filter((it) =>
      (it[key] || '')
        .split(';')
        .map((x) => x.trim())
        .includes(val)
    ).length;
    return acc;
  }, {});
}

function groupSkills(skills) {
  const groups = {};
  skills.forEach(skill => {
    const cat = skill.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(skill);
  });
  return groups;
}
const VISIBLE_STACKS = 3;
const STACK_WIDTH = 320;

/* ──────────────────────────────
    Main Home Component
────────────────────────────── */

export default function Home({
  lang,
  personal,
  certificates,
  languages,
  academics,
  skills,
  resume,
  projects,
}) {
  // ─── Filter Data by Language ───
  const person = personal.find((p) => p.language === lang);
  const certs  = certificates.filter((c) => c.language === lang);
  const langs  = languages.filter((l) => l.language === lang);
  const acad   = academics.filter((a) => a.language === lang)
                       .sort((a, b) => b.start.getTime() - a.start.getTime());
  const cvs    = resume.filter((r) => r.language === lang)
                       .sort((a, b) => b.start.getTime() - a.start.getTime());
  const projs  = projects.filter((p) => p.language === lang)
                         .sort((a, b) => b.start.getTime() - a.start.getTime());
  const skl    = skills.filter((p) => p.language === lang);
  const groupedSkills = groupSkills(skl);

  // ─── Skills Formatting ───
  const categories = [
    { name: "Coding", color: "var(--accent-1)" },
    { name: "Cloud / DevOps", color: "var(--accent-2)" },
    { name: "Analytics", color: "#47C1BF" },
    { name: "AI / Data", color: "#FFB300" },
    { name: "Automation", color: "#14a800ff" },
  ];

  const displayCategories = categories.filter(cat => (groupedSkills[cat.name] || []).length > 0);
  const [startIdx, setStartIdx] = useState(0);
  const maxStartIdx = Math.max(0, displayCategories.length - VISIBLE_STACKS);
  const prev = () => setStartIdx(idx => Math.max(idx - 1, 0));
  const next = () => setStartIdx(idx => Math.min(idx + 1, maxStartIdx));
  const canPrev = startIdx > 0;
  const canNext = startIdx + VISIBLE_STACKS < displayCategories.length;
  const translateX = -(startIdx * (STACK_WIDTH + 40));

  // ─── Filter Logic: Tech/Sections ───
  const uniqueTechs    = getUniqueSortedFromItems(projs, 'technologies');
  const uniqueSections = getUniqueSortedFromItems(projs, 'sections');

  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // Helper: get filter base for counts
  const techBase = projs.filter((it) => {
    if (!selectedSections.length) return true;
    const secList = (it.sections || '').split(';').map((s) => s.trim());
    return selectedSections.some((s) => secList.includes(s));
  });
  const sectionBase = projs.filter((it) => {
    if (!selectedTechs.length) return true;
    const techList = (it.technologies || '').split(';').map((t) => t.trim());
    return selectedTechs.some((t) => techList.includes(t));
  });

  // Counts for filter display
  const techCounts    = getCounts(techBase, 'technologies', uniqueTechs);
  const sectionCounts = getCounts(sectionBase, 'sections', uniqueSections);

  // Toggle handlers
  const toggleTech = (t) =>
    setSelectedTechs((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  // Project filter logic
  const itemMatches = (it) => {
    const techList = (it.technologies || '').split(';').map((t) => t.trim());
    const secList  = (it.sections || '').split(';').map((s) => s.trim());

    const techOk = !selectedTechs.length
      ? true
      : selectedTechs.some((t) => techList.includes(t));
    const secOk  = !selectedSections.length
      ? true
      : selectedSections.some((s) => secList.includes(s));

    return techOk && secOk;
  };
  const filteredProjects = projs.filter(itemMatches);

  /* ──────────────────────────────
      RENDER
  ────────────────────────────── */
  return (
    <div className="home">

      {/* ───── PERSONAL HERO ───── */}
      <DroppingSection index={1}>
        <section id="personal" className="hero-section">
          <div className="hero-content">
            {person.imageUrl && (
              <img className="hero-avatar" src={person.imageUrl} alt={person.name} />
            )}
            <div className="hero-details">
              <h1 className="hero-name">{person.name}</h1>
              <p className="hero-job">{person.job}</p>
              <p className="hero-desc">{person.description}</p>
              <p className="hero-contact">
                <a href={`mailto:${person.email}`}>{person.email}</a> •{' '}
                <a href={`tel:${person.phone}`}>{person.phone}</a>
              </p>
              <p className="hero-contact">{person.address}</p>
              {person.linkedInUrl && (
                <p className="hero-contact">
                  <a href={person.linkedInUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                </p>
              )}
              <div className="hero-langs">
                {langs.map((l, i) => (
                  <span key={l.languageName} className="hero-lang">
                    {l.iconUrl && (
                      <img
                        src={l.iconUrl}
                        alt={l.languageName}
                        className="hero-lang-icon"
                      />
                    )}
                    <span className="hero-lang-name">
                      {l.languageName}
                      {l.level ? ` (${l.level})` : ''}
                    </span>
                    {i < langs.length - 1 && <span className="hero-lang-sep"></span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </DroppingSection>

      {/* ───── ACADEMICS ───── */}
      <DroppingSection index={2}>
        <section id="academics" className="acad-section">
          <h2>{lang === 'EN' ? 'Academic History' : 'Akademischer Werdegang'}</h2>
          <div className="acad-grid">
            {acad.map((a) => (
              <div key={a.university + a.start} className="acad-card">
                {a.logoUrl && (
                  <img src={a.logoUrl} alt={a.university} className="acad-logo" />
                )}
                <div className="ac-date">{rangeFmt(lang, a.start, a.end)}</div>
                <strong className="ac-degree">{a.degree}</strong>
                <p className="ac-uni">{a.university}</p>
                <p className="ac-desc">{a.description}</p>
                {a.grade && (
                  <div className="ac-grade">
                    {lang === 'EN' ? 'Grade' : 'Note'}: {a.grade}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </DroppingSection>

      {/* ───── SKILLS ───── */}
      <DroppingSection index={3}>
        <section id="skills" className="skills-section">
          <h2>{lang === 'EN' ? 'Skills' : 'Kenntnisse'}</h2>
          <div className="skills-carousel-wrapper">
            <button className="carousel-arrow left" onClick={() => setStartIdx(idx => Math.max(idx - 1, 0))} disabled={!canPrev}>‹</button>
            <div className="skills-carousel-outer">
              <div
                className="skills-carousel-inner"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: 'transform 0.66s cubic-bezier(.61,0.86,.54,.96)'
                }}
              >
                {displayCategories.map((cat, idx) => (
                  <div className="skill-stack" style={{ width: STACK_WIDTH }} key={cat.name}>
                    <div className="stack-label" style={{ color: cat.color }}>{cat.name}</div>
                    <div className="stack-list">
                      {(groupedSkills[cat.name] || []).map((s, i) => (
                        <div className="stack-skill" key={i}>
                          <span className="stack-skillname">{s.name}</span>
                          <span className="stack-skilllevel">{s.level}%</span>
                          <div className="stack-bar">
                            <div className="stack-bar-fill"
                              style={{
                                width: `${s.level}%`,
                                background: cat.color,
                                boxShadow: `0 0 8px ${cat.color}`,
                              }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="carousel-arrow right" onClick={() => setStartIdx(idx => Math.min(idx + 1, displayCategories.length - VISIBLE_STACKS))} disabled={!canNext}>›</button>
          </div>
        </section>
      </DroppingSection>

      {/* ───── RESUME / EXPERIENCE ───── */}
      <DroppingSection index={4}>
        <section id="resume" className="resume-section">
          <h2>{lang === 'EN' ? 'Professional Experience' : 'Berufserfahrung'}</h2>
          <div className="resume-grid">
            {cvs.map((r) => (
              <div key={r.id} className="resume-card">
                <div className="rc-header">
                  <span className="rc-date">{rangeFmt(lang, r.start, r.end)}</span>
                </div>
                <div className="rc-body">
                  {r.logoUrl && (
                    <img src={r.logoUrl} alt={r.company} className="rc-logo" />
                  )}
                  <strong>{r.role}</strong>
                  <p>{r.company}</p>
                  <p className="rc-desc">{r.description}</p>
                  <p className="rc-tasks">{withLineBreaks(r.tasks)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </DroppingSection>

      {/* ───── PROJECTS + FILTERS ───── */}
      <DroppingSection index={6}>
        <section id="projects" className="projects-section">
          <h2>{lang === 'EN' ? 'Projects' : 'Projekte'}</h2>
          {/* Tech Filters */}
          <div className="filter-section">
            <div className="filter-group">
              <span className="filter-label">
                {lang === 'EN' ? 'Filter by Technology' : 'Filter nach Technologie'}
              </span>
              <div className="filter-pills tech-filters">
                {uniqueTechs
                  .filter((t) => techCounts[t] > 0)
                  .map((t) => (
                    <button
                      key={t}
                      className={`pill ${selectedTechs.includes(t) ? 'active' : ''}`}
                      onClick={() => toggleTech(t)}
                    >
                      {t} ({techCounts[t]})
                    </button>
                  ))}
              </div>
            </div>
          </div>
          {/* Project Items */}
          <div className="resume-grid">
            {filteredProjects.map((p) => (
              <div
                key={`${p.role}-${p.customer}-${p.start}`}
                className="resume-card"
              >
                <div className="rc-header">
                  <span className="rc-date">{rangeFmt(lang, p.start, p.end)}</span>
                </div>
                <div className="rc-body">
                  {p.logoUrl && (
                    <img src={p.logoUrl} alt={p.customer} className="rc-logo" />
                  )}
                  <strong>{p.role}</strong>
                  <p className="rc-cust">
                    {p.linkUrl ? (
                      <a href={p.linkUrl} target="_blank" rel="noopener noreferrer">
                        {p.customer}
                      </a>
                    ) : (
                      p.customer
                    )}
                  </p>
                  <p className="rc-desc-projects">{withLineBreaks(p.description)}</p>
                  <div className="rc-tags">
                    {p.technologies
                      .split(';')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span key={t} className="tag tech-tag">{t}</span>
                      ))}
                  </div>
                  <div className="rc-tags">
                    {p.sections
                      .split(';')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => (
                        <span key={s} className="tag section-tag">{s}</span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </DroppingSection>

      {/* ───── Power BI Embed ───── */}
      <PowerBIReport lang={lang} />

      {/* ───── CERTIFICATES ───── */}
      <DroppingSection index={5}>
        <section id="certificates" className="certs-section">
          <h2>{lang === 'EN' ? 'Certificates' : 'Zertifikate'}</h2>
          <div className="certs-grid">
            {certs.map((c, i) => (
              <div key={i} className="cert-card">
                {c.logoUrl && (
                  <img src={c.logoUrl} alt={c.certificateName} className="cert-logo" />
                )}
                <div className="cc-name">{c.certificateName}</div>
                <div className="cc-date">{fmt(lang, c.date)}</div>
              </div>
            ))}
          </div>
        </section>
      </DroppingSection>

      {/* ───── FOOTER ───── */}
      <hr className="footer-separator" />
      <footer className="footer">
        <div className="footer-left">
          © 2025 smiit GmbH
        </div>
        <div className="footer-right">
          <button
            className="impressum-button"
            onClick={() => window.location.href = 'https://www.smiit.de/impressum'}
          >
            {lang === 'EN' ? 'Legal Notice' : 'Impressum'}
          </button>
        </div>
      </footer>
    </div>
  );
}
