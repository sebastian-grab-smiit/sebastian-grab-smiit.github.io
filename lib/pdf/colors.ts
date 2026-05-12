import { rgb, type RGB } from "pdf-lib"

function hex(h: string): RGB {
  const n = h.replace("#", "")
  return rgb(
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  )
}

export const COLORS = {
  primary: hex("#21569C"),
  primaryDark: hex("#1A4580"),
  primaryLight: hex("#8AB0DA"),
  primaryTint: hex("#E8EEF6"),
  primarySoft: hex("#F2F6FB"),
  dark: hex("#0B162D"),
  darkSoft: hex("#3A4356"),
  darkMuted: hex("#6A7384"),
  accent: hex("#F703EB"),
  accentSoft: hex("#FDE5FB"),
  white: rgb(1, 1, 1),
  cream: hex("#F7F4ED"),
  rule: hex("#E3E0D8"),
  ruleSoft: hex("#EFECE4"),
  gray700: hex("#4A4A4A"),
  gray500: hex("#7A7A7A"),
  gray300: hex("#C8C5BD"),
}
