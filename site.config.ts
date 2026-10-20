/**
 * Everything that identifies the person behind this CV site.
 *
 * CV content (experience, projects, skills, …) comes from the Google Sheet; this file
 * only holds the static identity used for SEO, the footer, the PDF and page titles.
 */
export type SiteConfig = {
  name: string
  url: string
  /** Fallback job title when the sheet has none, also shown in the footer. */
  role: string
  email: string
  /** Shown in the footer when set, e.g. "+49 160 1234567". */
  phone?: string
  location: string
  linkedInUrl: string
  /** Portrait used in the footer and in the generated CV PDF. */
  portrait: string
  company: { name: string; url: string }
}

export const siteConfig: SiteConfig = {
  name: "Sebastian Grab",
  url: "https://grab.smiit.de",
  role: "Co-Founder & Software Engineer",
  email: "sebastian.grab@smiit.de",
  phone: "+49 160 4073198",
  location: "70176 Stuttgart",
  linkedInUrl: "https://www.linkedin.com/in/sebastian-grab/",
  portrait: "/assets/sebastian.webp",
  company: {
    name: "smiit GmbH",
    url: "https://www.smiit.de",
  },
}
