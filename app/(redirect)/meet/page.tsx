import { redirect } from "next/navigation"

// Short link (/meet) to the booking page; rendered as a static meta-refresh redirect.
export default function MeetPage() {
  redirect(process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || "/")
}
