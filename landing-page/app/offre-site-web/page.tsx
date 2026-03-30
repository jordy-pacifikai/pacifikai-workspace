import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import PortfolioCarousel from "@/components/ui/PortfolioCarousel";

export const metadata: Metadata = {
  title: "Offre Site Web Pro 100 000 XPF | PACIFIK'AI",
  description:
    "Offre limitée : votre site internet professionnel pour seulement 100 000 XPF. Design premium, mobile-ready, SEO, livré en 7 jours ouvrables. 50 places seulement.",
  openGraph: {
    title: "Site Web Pro à 100 000 XPF — 50 Places Seulement",
    description:
      "Site internet professionnel clé en main pour 100 000 XPF. Design premium, 5 pages, livré en 7 jours.",
    url: "https://pacifikai.com/offre-site-web",
    locale: "fr_FR",
  },
};

const INCLUS = [
  {
    icon: "✏️",
    title: "Design sur-mesure",
    desc: "Adapté à votre activité, votre identité visuelle, vos couleurs",
  },
  {
    icon: "📱",
    title: "Responsive mobile",
    desc: "Parfait sur téléphone, tablette et ordinateur",
  },
  {
    icon: "📄",
    title: "Jusqu'à 5 pages",
    desc: "Accueil, À propos, Services, Galerie, Contact",
  },
  {
    icon: "🔍",
    title: "SEO de base",
    desc: "Optimisé pour apparaître sur Google",
  },
  {
    icon: "💬",
    title: "Formulaire de contact",
    desc: "Vos clients vous écrivent directement depuis le site",
  },
  {
    icon: "🚀",
    title: "Livré en 7 jours",
    desc: "Brief lundi, site en ligne vendredi",
  },
  {
    icon: "📝",
    title: "1 révision incluse",
    desc: "Ajustements après la première livraison",
  },
  {
    icon: "🎓",
    title: "Formation 30 min",
    desc: "On vous montre comment gérer votre site",
  },
  {
    icon: "🔧",
    title: "Support 3 mois",
    desc: "Assistance technique par email",
  },
  {
    icon: "🔒",
    title: "Propriétaire à 100 %",
    desc: "Le site est à vous. Code source inclus.",
  },
];

const OPTIONS = [
  {
    icon: "🌐",
    title: "Nom de domaine",
    desc: ".com (~2 000 XPF/an) ou .pf (~3 000 XPF HT/an via Vini) — on s'occupe de tout",
  },
  {
    icon: "☁️",
    title: "Hébergement premium",
    desc: "Serveur rapide, SSL, à partir de 2 000 XPF/mois — ou hébergement gratuit de base",
  },
];

const PREVIEW_FEATURES = [
  "Design personnalisé à votre charte graphique",
  "Responsive parfait sur tous les écrans",
  "Optimisé pour Google (SEO)",
  "Chargement ultra-rapide",
  "Certificat SSL (HTTPS) inclus",
];

export default function OffreSiteWebPage() {
  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute rounded-full blur-[80px] opacity-[0.12]"
            style={{
              width: 500,
              height: 500,
              background: "#f97066",
              top: "5%",
              left: "10%",
            }}
          />
          <div
            className="absolute rounded-full blur-[80px] opacity-[0.08]"
            style={{
              width: 400,
              height: 400,
              background: "#8b5cf6",
              top: "50%",
              right: "8%",
            }}
          />
          <div
            className="absolute rounded-full blur-[80px] opacity-[0.08]"
            style={{
              width: 350,
              height: 350,
              background: "#06b6d4",
              bottom: "10%",
              left: "40%",
            }}
          />
        </div>

        {/* HERO */}
        <section className="relative z-10 min-h-screen flex items-center justify-center text-center px-6">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-5 py-2 rounded-full text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Offre limitée — 2026
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-5">
              Votre site internet
              <br />
              professionnel pour
              <br />
              <span className="text-accent text-5xl md:text-7xl">
                100 000 XPF
              </span>
            </h1>

            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
              Design premium, mobile-ready, optimisé Google. Livré en 7 jours
              ouvrables.
            </p>

            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent text-bg font-bold text-lg px-10 py-4 rounded-xl hover:shadow-[0_0_32px_rgba(249,112,102,0.5)] transition-all duration-300"
            >
              Je réserve ma place &rarr;
            </a>

            <p className="mt-4 text-text-dim text-sm">
              Paiement en 2x possible &middot; Facture incluse
            </p>

            {/* Slots counter */}
            <div className="inline-flex items-center gap-3 bg-bg-card border border-border px-7 py-3 rounded-xl mt-8">
              <span className="text-accent font-extrabold text-3xl">50</span>
              <span className="text-text-secondary text-sm text-left leading-snug">
                places
                <br />
                disponibles
              </span>
            </div>
          </div>
        </section>

        {/* CE QUI EST INCLUS */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Tout est inclus. Zéro surprise.
              </h2>
              <p className="text-text-secondary max-w-md mx-auto">
                Un site professionnel clé en main, sans frais cachés
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {INCLUS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 p-5 bg-bg-card border border-border rounded-xl hover:border-accent/40 transition-colors duration-300"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-text-secondary text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OPTIONS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 p-5 bg-lagoon/5 border border-lagoon/30 rounded-xl"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5 flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] bg-lagoon/10 text-lagoon border border-lagoon/20 px-2 py-0.5 rounded font-semibold">
                        EN OPTION
                      </span>
                    </h3>
                    <p className="text-text-secondary text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APERÇU VISUEL */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight mb-4">
                Un site qui ressemble vraiment à votre entreprise
              </h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Chaque site est conçu sur-mesure. Pas de template générique. On
                crée un design unique qui reflète votre identité et parle à vos
                clients.
              </p>
              <ul className="space-y-3">
                {PREVIEW_FEATURES.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2.5 text-sm text-text-secondary"
                  >
                    <span className="text-lagoon font-bold text-base">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Browser mockup */}
            <div className="w-full max-w-md mx-auto bg-bg-card border border-border-light rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(249,112,102,0.12)]">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1424] border-b border-border">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 ml-2 bg-border/60 rounded px-3 py-1 text-[11px] text-text-dim flex items-center gap-1">
                  <span className="text-[#22c55e] text-[10px]">🔒</span>
                  votre-entreprise.com
                </div>
              </div>

              {/* Body */}
              <div className="min-h-[240px] p-4 space-y-3">
                {/* Nav simulation */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="w-14 h-2 rounded-full bg-gradient-to-r from-accent to-[#8b5cf6]" />
                  <div className="flex gap-1.5">
                    <span className="w-8 h-1.5 rounded-full bg-border-light" />
                    <span className="w-8 h-1.5 rounded-full bg-border-light" />
                    <span className="w-8 h-1.5 rounded-full bg-border-light" />
                  </div>
                </div>

                {/* Hero text simulation */}
                <div className="text-center py-3">
                  <div className="text-[13px] font-semibold text-text mb-2">
                    Votre site qui convertit
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="w-3/4 h-2 rounded-full bg-border-light mx-auto" />
                    <div className="w-1/2 h-2 rounded-full bg-border-light mx-auto" />
                  </div>
                  <span className="inline-block px-4 py-1.5 bg-accent rounded text-[10px] text-bg font-semibold">
                    Découvrir
                  </span>
                </div>

                {/* Content blocks */}
                {[
                  { color: "accent" },
                  { color: "lagoon" },
                  { color: "#8b5cf6" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 bg-border/30 rounded-lg"
                  >
                    <div
                      className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        background:
                          b.color === "accent"
                            ? "rgba(249,112,102,0.15)"
                            : b.color === "lagoon"
                            ? "rgba(20,184,166,0.15)"
                            : "rgba(139,92,246,0.15)",
                      }}
                    >
                      <span
                        className="text-[10px]"
                        style={{
                          color:
                            b.color === "accent"
                              ? "#f97066"
                              : b.color === "lagoon"
                              ? "#14b8a6"
                              : "#8b5cf6",
                        }}
                      >
                        ●
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="w-4/5 h-1.5 rounded-full bg-border-light" />
                      <div className="w-3/5 h-1.5 rounded-full bg-border/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Comment ça marche ?
              </h2>
              <p className="text-text-secondary">
                En 4 étapes simples, de la prise de contact à la mise en ligne
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  title: "Brief",
                  desc: "On échange sur votre activité, vos besoins, vos couleurs",
                },
                {
                  num: "02",
                  title: "Maquette",
                  desc: "Vous validez le design avant qu'on code quoi que ce soit",
                },
                {
                  num: "03",
                  title: "Développement",
                  desc: "On construit votre site en moins de 7 jours ouvrables",
                },
                {
                  num: "04",
                  title: "Mise en ligne",
                  desc: "Formation incluse, vous prenez le contrôle de votre site",
                },
              ].map((step) => (
                <div key={step.num} className="relative">
                  <div className="bg-bg-card border border-border rounded-xl p-5 h-full hover:border-accent/30 transition-colors">
                    <div className="font-display text-accent text-2xl font-bold mb-3">
                      {step.num}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFOLIO SHOWCASE */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
                10 exemples de sites qu&apos;on peut créer pour vous
              </h2>
              <p className="text-text-secondary max-w-md mx-auto">
                Chaque site est unique, conçu sur mesure pour votre activité.
              </p>
            </div>
            <PortfolioCarousel />
          </div>
        </section>

        {/* PRICING */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-accent/8 to-lagoon/5 border border-accent/20 rounded-3xl p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Offre spéciale — places limitées
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold mb-2">
                100 000 XPF
              </h2>
              <p className="text-text-secondary mb-2">
                paiement unique &middot; tout inclus
              </p>
              <p className="text-text-dim text-sm mb-8">
                Paiement en 2x sans frais possible (2 &times; 50 000 XPF)
              </p>

              <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
                {[
                  "Design sur-mesure",
                  "5 pages incluses",
                  "Responsive mobile",
                  "SEO de base",
                  "Livré en 7 jours",
                  "Formation & support 3 mois",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-sm">
                    <span className="text-lagoon">✓</span>
                    <span className="text-text-secondary">{feat}</span>
                  </div>
                ))}
              </div>

              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent text-bg font-bold text-base px-10 py-4 rounded-xl hover:shadow-[0_0_32px_rgba(249,112,102,0.5)] transition-all duration-300 w-full justify-center mb-4"
              >
                Je réserve ma place &rarr;
              </a>
              <p className="text-text-dim text-xs">
                Aucun engagement &middot; Réponse sous 24h
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Qu'est-ce qui est inclus dans les 100 000 XPF ?",
                  a: "Design sur-mesure, développement, jusqu'à 5 pages, responsive mobile, SEO de base, formulaire de contact, 1 révision, formation de 30 min et support technique pendant 3 mois.",
                },
                {
                  q: "En combien de temps mon site sera-t-il en ligne ?",
                  a: "7 jours ouvrables à partir du brief validé. Brief le lundi, site en ligne le vendredi suivant.",
                },
                {
                  q: "Suis-je propriétaire du site ?",
                  a: "Oui, à 100 %. Le code source vous appartient. On peut aussi vous le transférer sur votre propre hébergeur si vous le souhaitez.",
                },
                {
                  q: "Le paiement en 2x est-il possible ?",
                  a: "Oui, 50 000 XPF à la commande et 50 000 XPF à la livraison. Aucun frais supplémentaire.",
                },
                {
                  q: "Et si j'ai plus de 5 pages ?",
                  a: "Chaque page supplémentaire est facturée 15 000 XPF. On vous donne un devis précis avant de commencer.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="bg-bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-semibold mb-2 text-sm">{faq.q}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative z-10 py-24 px-6" id="contact">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-accent/8 to-lagoon/5 border border-accent/20 rounded-3xl p-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Prêt à avoir votre site pro ?
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Écrivez-nous par email ou discutez avec MANA. On vous répond
                dans l&apos;heure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-bg font-bold px-8 py-3.5 rounded-xl hover:shadow-[0_0_24px_rgba(249,112,102,0.4)] transition-all duration-300"
                >
                  Nous contacter par email &rarr;
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-bg-card text-text border border-border px-8 py-3.5 rounded-xl hover:border-lagoon/40 transition-colors duration-300"
                >
                  Discutons de votre projet
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
