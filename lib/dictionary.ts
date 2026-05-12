export type Locale = "de" | "en"

const dictionaries = {
  de: {
    sections: {
      focus: "Was ich mache",
      experienceProfessional: "Berufliche Erfahrung",
      experienceAcademic: "Akademische Erfahrung",
      skills: "Kenntnisse",
      projects: "Projekte",
      certificates: "Zertifikate",
    },
    labels: {
      present: "heute",
      filterByTech: "Filter nach Technologie",
      grade: "Note",
      clearFilters: "Filter zurücksetzen",
      moreDetails: "Mehr Details",
      showMore: "Mehr anzeigen",
    },
    skills: {
      eyebrow: "Meine Erfahrungen",
    },
    projects: {
      eyebrow: "Meine Projekterfahrung",
    },
    focus: {
      eyebrow: "Mein Fokus",
      learnMore: "Mehr erfahren",
      cards: {
        apps: {
          title: "Apps & Workflows",
          description:
            "Ich entwickle individuelle Web-Apps und Workflows, die Teams entlasten und Prozesse beschleunigen.",
        },
        analytics: {
          title: "Datenanalyse & ML",
          description:
            "Ich mache Daten verständlich und nutzbar – mit klaren Analysen, Dashboards und Forecasts.",
        },
        strategy: {
          title: "Digitale Strategie",
          description:
            "Ich entwickle digitale Strategien, bewerte Risiken und begleite die Umsetzung mit klarem Fokus.",
        },
      },
      previews: {
        apps: {
          appName: "OperationsHub",
          navDashboard: "Dashboard",
          navOrders: "Aufträge",
          navCustomers: "Kunden",
          navReports: "Berichte",
          statOrders: "Aufträge",
          statInProgress: "In Arbeit",
          statDone: "Erledigt",
          teamUtilization: "Auslastung Team",
          recentActivity: "Letzte Aktivitäten",
          activity1: "Angebot Müller AG",
          activity2: "Freigabe Report",
        },
        analytics: {
          appName: "Management Dashboard",
          revenueHeader: "Umsatz · 12 Monate",
          revenueDelta: "+18,4%",
          months: ["Jan", "Apr", "Jul", "Okt"],
          vsLastYear: "vs. Vorjahr",
          vsLastYearValue: "+14,2%",
          forecast: "Forecast Q1",
          forecastValue: "5,4 Mio.",
          metrics: "Kennzahlen",
          revenue: "Umsatz",
          revenueValue: "4,86 Mio.",
          growth: "Wachstum",
          growthValue: "18,4%",
          projects: "Projekte",
          projectsValue: "27",
        },
        strategy: {
          appName: "Digital Strategy Cockpit",
          maturityIndex: "Maturity-Index",
          maturityScore: "3,0",
          maturityMax: "/ 5",
          activeInitiatives: "Aktive Initiativen",
          phaseExplore: "Sondieren",
          phaseDesign: "Konzipieren",
          phaseImplement: "Umsetzen",
          phaseEmbed: "Verankern",
          strategicRisks: "Strategische Risiken",
          riskTrend: "+1,4 pp",
          riskLabel: "Daten",
          riskLevel: "Mittel",
        },
      },
    },
    hero: {
      eyebrowPrefix: "Hallo, ich bin",
      titleLine1: "Digitale Produkte.",
      titleLine2Pre: "Daten mit",
      titleHighlight: "Wirkung",
      titleLine2Post: ".",
      titleLine3: "Software, die trägt.",
      ctaEmail: "Kontakt aufnehmen",
      ctaEmailShort: "Kontakt",
      ctaDownload: "Lebenslauf herunterladen",
      ctaDownloadShort: "Lebenslauf",
      statYears: "5+ Jahre Erfahrung",
      statProjects: "70+ Projekte",
      statRegion: "DACH-weiter Fokus",
    },
  },
  en: {
    sections: {
      focus: "What I do",
      experienceProfessional: "Professional Experience",
      experienceAcademic: "Academic Experience",
      skills: "Skills",
      projects: "Projects",
      certificates: "Certificates",
    },
    labels: {
      present: "Present",
      filterByTech: "Filter by Technology",
      grade: "Grade",
      clearFilters: "Clear filters",
      moreDetails: "More details",
      showMore: "Show more",
    },
    skills: {
      eyebrow: "My experience",
    },
    projects: {
      eyebrow: "My project experience",
    },
    focus: {
      eyebrow: "My focus",
      learnMore: "Learn more",
      cards: {
        apps: {
          title: "Apps & Workflows",
          description:
            "I build custom web apps and workflows that take work off teams and speed up processes.",
        },
        analytics: {
          title: "Data Analytics & ML",
          description:
            "I make data understandable and usable — with clear analyses, dashboards, and forecasts.",
        },
        strategy: {
          title: "Digital Strategy",
          description:
            "I shape digital strategies, assess risks, and guide implementation with a clear focus.",
        },
      },
      previews: {
        apps: {
          appName: "OperationsHub",
          navDashboard: "Dashboard",
          navOrders: "Orders",
          navCustomers: "Customers",
          navReports: "Reports",
          statOrders: "Orders",
          statInProgress: "In progress",
          statDone: "Done",
          teamUtilization: "Team utilization",
          recentActivity: "Recent activity",
          activity1: "Quote Müller AG",
          activity2: "Report approved",
        },
        analytics: {
          appName: "Management Dashboard",
          revenueHeader: "Revenue · 12 months",
          revenueDelta: "+18.4%",
          months: ["Jan", "Apr", "Jul", "Oct"],
          vsLastYear: "vs. last year",
          vsLastYearValue: "+14.2%",
          forecast: "Forecast Q1",
          forecastValue: "5.4M",
          metrics: "Metrics",
          revenue: "Revenue",
          revenueValue: "4.86M",
          growth: "Growth",
          growthValue: "18.4%",
          projects: "Projects",
          projectsValue: "27",
        },
        strategy: {
          appName: "Digital Strategy Cockpit",
          maturityIndex: "Maturity index",
          maturityScore: "3.0",
          maturityMax: "/ 5",
          activeInitiatives: "Active initiatives",
          phaseExplore: "Explore",
          phaseDesign: "Design",
          phaseImplement: "Implement",
          phaseEmbed: "Embed",
          strategicRisks: "Strategic risks",
          riskTrend: "+1.4 pp",
          riskLabel: "Data",
          riskLevel: "Medium",
        },
      },
    },
    hero: {
      eyebrowPrefix: "Hello, I'm",
      titleLine1: "Digital products.",
      titleLine2Pre: "Data that has",
      titleHighlight: "impact",
      titleLine2Post: ".",
      titleLine3: "Software that carries.",
      ctaEmail: "Reach out",
      ctaEmailShort: "Contact",
      ctaDownload: "Download CV",
      ctaDownloadShort: "CV",
      statYears: "5+ years of experience",
      statProjects: "70+ projects",
      statRegion: "DACH-wide focus",
    },
  },
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.de
}
