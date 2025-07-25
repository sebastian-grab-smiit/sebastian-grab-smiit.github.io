import React, { useState } from 'react';
import '../styles/Home.css';

export default function Home({
  personal,
  certificates,
  languages,
  academics,
  skills,
  resume,
  projects,
}) {
  // language state
  const [lang, setLang] = useState('EN');

  // filter for selected language
  const person    = personal.find((p) => p.language === lang);
  const certs     = certificates.filter((c) => c.language === lang);
  const langs     = languages.filter((l) => l.language === lang);
  const acad      = academics.filter((a) => a.language === lang);
  const cvs       = resume.filter((r)   => r.language === lang).sort((a, b) => b.start.getTime() - a.start.getTime());
  const projs     = projects.filter((p) => p.language === lang).sort((a, b) => b.start.getTime() - a.start.getTime());
  const skl       = skills.filter((p) => p.language === lang); // .sort((a, b) => b.level - a.level);

  // ───── Filters ─────
  // extract unique techs & sections from both resume & projects
  const allItems = [...cvs, ...projs];
  const uniqueTechs = Array.from(
    new Set(
      allItems.flatMap((it) =>
        it.technologies
          .split(';')
          .map((t) => t.trim())
          .filter(Boolean)
      )
    )
  ).sort();
  const uniqueSections = Array.from(
    new Set(
      allItems.flatMap((it) =>
        it.sections
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    )
  ).sort();

  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  const toggleTech = (t) =>
    setSelectedTechs((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const toggleSection = (s) =>
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  // filter function: include if ANY selected tech/section matches
  const itemMatches = (it) => {
    const techList = it.technologies
      .split(';')
      .map((t) => t.trim());
    const secList = it.sections
      .split(';')
      .map((s) => s.trim());

    // no filters → keep all
    if (!selectedTechs.length && !selectedSections.length) return true;

    // tech OR section match
    const techMatch = selectedTechs.some((t) => techList.includes(t));
    const secMatch = selectedSections.some((s) => secList.includes(s));
    return techMatch || secMatch;
  };

  const filteredResume = cvs.filter(itemMatches);
  const filteredProjects = projs.filter(itemMatches);

  // date formatting
  const fmt = (d) => {
    if (d instanceof Date && !isNaN(d)) {
      const locale = lang === 'EN' ? 'en-US' : 'de-DE';
      return d.toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric',
      });
    }
    return lang === 'EN' ? 'Present' : 'heute';
  };

  function rangeFmt(start, end) {
    if (!(end instanceof Date) || isNaN(end)) {
      return `${fmt(start)} – ${lang === 'EN' ? 'Present' : 'heute'}`;
    }
    const sameMonth = start.getFullYear() === end.getFullYear() &&
                      start.getMonth()    === end.getMonth();
    return sameMonth ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
  }

  function withLineBreaks(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/ *• */g, '\n• ')
      .replace(/^\n/, '');
  }

  return (
    <div className="home">

      {/* LANGUAGE SWITCHER */}
      <div className="lang-switcher">
        {['EN', 'DE'].map((l) => (
          <button
            key={l}
            className={lang === l ? 'active' : ''}
            onClick={() => setLang(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* PERSONAL HERO */}
      <section className="hero-section">
        <div className="hero-content">
          {person.imageUrl && (
            <img
              className="hero-avatar"
              src={person.imageUrl}
              alt={person.name}
            />
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
                <a
                  href={person.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CERTIFICATES */}
      <section className="certs-section">
        <h2>{lang === 'EN' ? 'Certificates' : 'Zertifikate'}</h2>
        <div className="certs-grid">
          {certs.map((c, i) => (
            <div key={i} className="cert-card">
              {c.logoUrl && (
                <img src={c.logoUrl} alt={c.certificateName} className="cert-logo" />
              )}
              <div className="cc-name">{c.certificateName}</div>
              <div className="cc-date">{fmt(c.date)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="langs-section">
        <h2>{lang === 'EN' ? 'Languages' : 'Sprachen'}</h2>
        <div className="langs-grid">
          {langs.map((l, i) => (
            <div key={i} className="lang-pill">
              {l.iconUrl && <img src={l.iconUrl} alt={l.languageName} />}
              <span className="ln-name">{l.languageName}</span>
              <span className="ln-level">{l.level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ACADEMICS */}
      <section className="acad-section">
        <h2>{lang === 'EN' ? 'Academic History' : 'Akademischer Werdegang'}</h2>
        <div className="acad-grid">
          {acad.map((a) => (
            <div key={a.university + a.start} className="acad-card">
              {a.logoUrl && (
                <img src={a.logoUrl} alt={a.university} className="acad-logo" />
              )}
              <div className="ac-date">{rangeFmt(a.start, a.end)}</div>
              <strong className="ac-degree">
                {a.degree}, {a.university}
              </strong>
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

      {/* ── FILTER BARS ── */}
      <section className="filter-section">
        <div className="filter-group">
          <span className="filter-label">
            {lang === 'EN' ? 'Filter by Technology' : 'Filter nach Technologie'}
          </span>
          <div className="filter-pills">
            {uniqueTechs.map((t) => (
              <button
                key={t}
                className={`pill ${selectedTechs.includes(t) ? 'active' : ''}`}
                onClick={() => toggleTech(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">
            {lang === 'EN' ? 'Filter by Section' : 'Filter nach Bereich'}
          </span>
          <div className="filter-pills">
            {uniqueSections.map((s) => (
              <button
                key={s}
                className={`pill ${selectedSections.includes(s) ? 'active' : ''}`}
                onClick={() => toggleSection(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        </section>

      {/* RESUME */}
      <section className="resume-section">
        <h2>{lang === 'EN' ? 'Professional Experience' : 'Berufserfahrung'}</h2>
        <div className="resume-grid">
          {filteredResume.map((r) => (
            <div key={r.id} className="resume-card">
              <div className="rc-header">
                <span className="rc-date">
                  {rangeFmt(r.start, r.end)}
                </span>
              </div>
              <div className="rc-body">
                {r.logoUrl && (
                  <img src={r.logoUrl} alt={r.company} className="rc-logo" />
                )}
                <strong>{r.role}</strong>
                <p>{r.company}</p>
                <p className="rc-desc">{r.description}</p>
                <p className="rc-tech">
                  <em>{r.technologies}</em>
                </p>
                <p className="rc-sections">
                  <small>{r.sections}</small>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="projects-section">
        <h2>{lang === 'EN' ? 'Projects' : 'Projekte'}</h2>
        <div className="resume-grid">
          {filteredProjects.map((p) => (
            <div
              key={`${p.role}-${p.customer}-${p.start}`}
              className="resume-card"
            >
              <div className="rc-header">
                <span className="rc-date">
                  {rangeFmt(p.start, p.end)}
                </span>
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
                <p className="rc-desc">{withLineBreaks(p.description)}</p>
                <p className="rc-tech">
                  <em>{p.technologies}</em>
                </p>
                <p className="rc-sections">
                  <small>{p.sections}</small>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section className="skills-section">
        <h2>{lang === 'EN' ? 'Skills' : 'Kenntnisse'}</h2>
        <div className="skills-grid">
          {skl.map((s, i) => (
            <div key={i} className="skill-pill">
              <div className="skill-pill-header">
                <span className="skill-name">{s.name}</span>
                <span className="skill-percent">{s.level}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{ width: `${s.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
