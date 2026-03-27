import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statut — Ve'a by PACIFIK'AI",
  description:
    "Page de statut en temps reel des services Ve'a : systeme, WhatsApp, reservations.",
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
