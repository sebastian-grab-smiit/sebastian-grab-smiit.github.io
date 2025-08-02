import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
import PropTypes from "prop-types";
import "../styles/Timeline.css";

/* ─── constants & formatters ─── */
const PRESENT = { EN: "Present", DE: "heute" };

const dateFormatters = {
  EN: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }),
  DE: new Intl.DateTimeFormat("de-DE", { month: "short", year: "numeric" }),
};

const fmt = (lang, d) => {
  if (d instanceof Date && !isNaN(d)) {
    return dateFormatters[lang === "EN" ? "EN" : "DE"].format(d);
  }
  return lang === "EN" ? PRESENT.EN : PRESENT.DE;
};

const rangeFmt = (lang, start, end) => {
  const hasValidEnd = end instanceof Date && !isNaN(end);
  if (hasValidEnd) {
    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()
    ) {
      return fmt(lang, start);
    }
    return `${fmt(lang, start)} – ${fmt(lang, end)}`;
  }
  return `${fmt(lang, start)} – ${lang === "EN" ? PRESENT.EN : PRESENT.DE}`;
};

/* ─── task parsing ─── */
const parseTasks = (text) => {
  if (typeof text !== "string") return [];
  return text
    .split(/\n| *• */)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("•") ? line.slice(1).trim() : line));
};

/* ─── layout helpers ─── */
const PX_PER_MONTH = 5;
const MIN_GAP_PX = 30;
const MAX_GAP_PX = 60;

const monthsBetween = (d1, d2) =>
  (d2.getFullYear() - d1.getFullYear()) * 12 +
  (d2.getMonth() - d1.getMonth());

/**
 * Bucket resume + academic entries into aligned rows with spacing.
 */
function useBucketedRows(resume, academics) {
  return useMemo(() => {
    const items = [
      ...resume.map((r) => ({ ...r, side: "right" })), // professional
      ...academics.map((a) => ({ ...a, side: "left" })), // academic
    ];

    const bucketKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    const map = new Map();

    for (const it of items) {
      if (!(it.start instanceof Date)) continue;
      const key = bucketKey(it.start);
      if (!map.has(key)) map.set(key, { date: it.start });
      map.get(key)[it.side] = it;
    }

    const rawRows = [...map.values()].sort((a, b) => a.date - b.date); // oldest → newest

    const rows = rawRows.map((r, idx, arr) => {
      if (idx === 0) return { ...r, marginTop: 30 };
      const prev = arr[idx - 1];
      const ideal = monthsBetween(prev.date, r.date) * PX_PER_MONTH;
      const clamped = Math.min(Math.max(ideal, MIN_GAP_PX), MAX_GAP_PX);
      return { ...r, marginTop: clamped };
    });

    return rows;
  }, [resume, academics]);
}

/* ─── components ─── */
const TaskDisclosure = React.memo(function TaskDisclosure({ text, lang }) {
  const tasks = useMemo(() => parseTasks(text), [text]);
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [tasks, open]);

  return (
    <div className="task-disclosure">
      <button
        className={`task-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={lang === "EN" ? "Responsibilities" : "Verantwortlichkeiten"}
      >
        <span className="trigger-label">
          {lang === "EN" ? "Responsibilities" : "Verantwortlichkeiten"}
        </span>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="disclosure-panel"
        style={{
          maxHeight: open ? height + 24 : 0,
          opacity: open ? 1 : 0,
          marginTop: open ? 10 : 0,
        }}
      >
        <div ref={contentRef} className="task-content">
          {tasks.map((line, i) => (
            <div key={i} className="task-line">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TaskDisclosure.propTypes = {
  text: PropTypes.string.isRequired,
};

const Card = React.memo(function Card({ item, lang, side }) {
  const title = side === "academic" ? item.degree : item.role;
  const sub = side === "academic" ? item.university : item.company;
  const showGrade = side === "academic" && item.grade;
  const showTasks = side === "resume" && item.tasks;

  return (
    <div className={`timeline-item ${side}`} data-aos="fade-up">
      {item.logoUrl && (
        <img
          src={item.logoUrl}
          alt={
            side === "academic"
              ? item.university || ""
              : item.company || ""
          }
          className="timeline-logo"
          loading="lazy"
        />
      )}
      <div className="timeline-date">
        {rangeFmt(lang, item.start, item.end)}
      </div>
      <div className="timeline-title">{title}</div>
      {sub && <div className="timeline-sub">{sub}</div>}
      {item.description && (
        <div className="timeline-desc">{item.description}</div>
      )}
      {showGrade && (
        <div className="timeline-grade">
          {lang === "EN" ? "Grade" : "Note"}: {item.grade}
        </div>
      )}
      {showTasks && <TaskDisclosure text={item.tasks} lang = {lang} />}
    </div>
  );
});

Card.propTypes = {
  item: PropTypes.object.isRequired,
  lang: PropTypes.oneOf(["EN", "DE"]).isRequired,
  side: PropTypes.oneOf(["academic", "resume"]).isRequired,
};

export default function Timeline({ resume, academics, lang }) {
  const rows = useBucketedRows(resume, academics);

  return (
    <section className="timeline-section" id="timeline">
      <div className="timeline-line" />

      {rows.map(({ marginTop, left, right }, idx) => (
        <div
          className="timeline-row"
          key={idx}
          style={{ marginTop }}
        >
          <div className="side-wrapper academic">
            {left && <Card item={left} lang={lang} side="academic" />}
          </div>

          <div className="axis-cell">
            <div className="center-dot" aria-hidden="true" />
          </div>

          <div className="side-wrapper resume">
            {right && <Card item={right} lang={lang} side="resume" />}
          </div>
        </div>
      ))}
    </section>
  );
}

Timeline.propTypes = {
  resume: PropTypes.array.isRequired,
  academics: PropTypes.array.isRequired,
  lang: PropTypes.oneOf(["EN", "DE"]).isRequired,
};
