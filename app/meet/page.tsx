import { redirect } from "next/navigation";

export default function MeetPage() {
  redirect((process.env.NEXT_PUBLIC_CALENDLY_URL ?? "").trim());
}