import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ParticlesBackground from "@/components/effects/ParticlesBackground";
import ManaChat from "@/components/ui/ManaChat";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agence Digitale & IA à Tahiti | PACIFIK'AI — Sites Web, Chatbots, Automatisation",
  description:
    "PACIFIK'AI, agence digitale à Tahiti spécialisée en intelligence artificielle. Création de sites internet, chatbots IA, applications mobiles, automatisation et marketing digital pour entreprises en Polynésie française. Devis gratuit.",
  metadataBase: new URL("https://pacifikai.com"),
  alternates: {
    canonical: "https://pacifikai.com/",
  },
  keywords: [
    "agence digitale tahiti",
    "création site internet tahiti",
    "création site internet polynésie",
    "agence ia polynesie",
    "chatbot ia tahiti",
    "application mobile tahiti",
    "automatisation entreprise polynesie",
    "intelligence artificielle tahiti",
    "site web papeete",
    "agence web polynesie francaise",
    "marketing digital tahiti",
    "transformation digitale polynesie",
    "développeur web tahiti",
    "PACIFIK'AI",
    "pacifikai",
  ],
  openGraph: {
    title: "Agence Digitale & IA à Tahiti | PACIFIK'AI",
    description:
      "PACIFIK'AI, agence digitale à Tahiti spécialisée en intelligence artificielle. Création de sites internet, chatbots IA, applications mobiles, automatisation et marketing digital pour entreprises en Polynésie française.",
    url: "https://pacifikai.com/",
    type: "website",
    locale: "fr_PF",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "PACIFIK'AI — Agence digitale et IA à Tahiti, Polynésie française",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agence Digitale & IA à Tahiti | PACIFIK'AI",
    description:
      "PACIFIK'AI, agence digitale à Tahiti spécialisée en intelligence artificielle. Sites web, chatbots IA, automatisation pour entreprises en Polynésie française.",
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/apple-touch-icon.png",
  },
  other: {
    "google-site-verification": "hfgGx3lKxRCrn_DUbR_boTxcTvVh4ttg1tbdSuI5_40",
    "geo.region": "PF",
    "geo.placename": "Papeete, Polynésie française",
    "geo.position": "-17.5353;-149.5696",
    ICBM: "-17.5353, -149.5696",
  },
};

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "PACIFIK'AI",
  alternateName: "PACIFIKAI",
  url: "https://pacifikai.com",
  logo: "https://pacifikai.com/assets/logo.png",
  image: "https://pacifikai.com/assets/og-image.png",
  description:
    "Agence digitale et intelligence artificielle à Papeete, Tahiti. Création de sites web, chatbots IA, automatisation, applications et conseil digital pour entreprises en Polynésie française.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Papeete",
    addressLocality: "Papeete",
    addressRegion: "Tahiti",
    postalCode: "98714",
    addressCountry: "PF",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -17.535,
    longitude: -149.5696,
  },
  telephone: "+689-89558189",
  email: "contact@pacifikai.com",
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "contact@pacifikai.com",
      contactType: "sales",
      availableLanguage: ["French", "English"],
    },
    {
      "@type": "ContactPoint",
      email: "contact@pacifikai.com",
      contactType: "customer service",
      availableLanguage: ["French", "English"],
    },
  ],
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Polynésie française",
      sameAs: "https://en.wikipedia.org/wiki/French_Polynesia",
    },
    { "@type": "City", name: "Papeete" },
    { "@type": "City", name: "Moorea" },
    { "@type": "City", name: "Bora Bora" },
  ],
  priceRange: "$$",
  currenciesAccepted: "XPF,EUR",
  paymentAccepted: "Virement bancaire, Carte bancaire",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services PACIFIK'AI",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Création de sites web et applications",
          description:
            "Sites internet professionnels, landing pages et applications sur mesure pour entreprises en Polynésie française",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Chatbots et agents IA",
          description:
            "Chatbots intelligents pour service client automatisé, disponibles 24/7 sur WhatsApp, Messenger et site web",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Automatisation des processus",
          description:
            "Automatisation des tâches répétitives : devis, factures, relances, onboarding client",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Extraction de documents IA",
          description:
            "Extraction automatique de données depuis PDF, formulaires et documents scannés",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Conseil digital et stratégie IA",
          description:
            "Accompagnement stratégique pour la transformation digitale des entreprises polynésiennes",
        },
      },
    ],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce qu'une agence digitale à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une agence digitale à Tahiti comme PACIFIK'AI accompagne les entreprises de Polynésie française dans leur transformation numérique : création de sites web, chatbots IA, automatisation des process, marketing digital et formation.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte un site internet en Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un site vitrine professionnel commence à 100 000 XPF avec PACIFIK'AI. Le tarif varie selon les fonctionnalités : chatbot IA, e-commerce, dashboard analytics. Chaque projet est sur mesure avec un devis détaillé gratuit.",
      },
    },
    {
      "@type": "Question",
      name: "Comment un chatbot IA peut aider mon entreprise à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un chatbot IA répond à vos clients 24/7 sur votre site et WhatsApp, qualifie les prospects, prend les rendez-vous et réduit votre charge de service client de 57% en moyenne.",
      },
    },
    {
      "@type": "Question",
      name: "L'intelligence artificielle est-elle accessible aux PME polynésiennes ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolument. Nos solutions démarrent à 100 000 XPF/mois et s'adaptent à la taille de votre entreprise. L'IA n'est plus réservée aux grandes entreprises — c'est un levier de compétitivité pour les PME.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la meilleure agence digitale en Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PACIFIK'AI est la première agence spécialisée en intelligence artificielle à Tahiti. Nous combinons expertise web, IA et connaissance du marché polynésien pour des solutions vraiment adaptées.",
      },
    },
    {
      "@type": "Question",
      name: "Par où commencer la digitalisation de son entreprise à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Envoyez-nous un email pour nous parler de votre projet. On échange sur vos besoins, on identifie les opportunités et on vous propose une approche personnalisée.",
      },
    },
    {
      "@type": "Question",
      name: "PACIFIK'AI intervient-il en dehors de Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, nous intervenons sur toute la Polynésie française (Moorea, Bora Bora, Raiatea...) et auprès d'entreprises francophones dans le Pacifique. Nos solutions sont 100% en ligne.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${jakarta.variable}`}>
      <body className="bg-bg text-text font-body antialiased grain">
        <ParticlesBackground />
        <SmoothScroll>{children}</SmoothScroll>
        <ManaChat />
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
          }}
        />
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(FAQ_SCHEMA),
          }}
        />
        <Script id="glass-spotlight" strategy="afterInteractive">{`
          (function(){
            var SEL='.glass,.tilt-card,[data-tilt],.svc-detail-card,.pc-card,.process-card,.fk-feat-card';
            var cards=[];
            function refresh(){cards=document.querySelectorAll(SEL)}
            refresh();setInterval(refresh,2000);
            document.addEventListener('mousemove',function(e){
              for(var i=0;i<cards.length;i++){
                var c=cards[i],r=c.getBoundingClientRect();
                if(e.clientX<r.left-50||e.clientX>r.right+50||e.clientY<r.top-50||e.clientY>r.bottom+50)continue;
                var x=e.clientX-r.left,y=e.clientY-r.top;
                c.style.setProperty('--mx',x+'px');
                c.style.setProperty('--my',y+'px');
                if(c._hovered){
                  var px=(x/r.width-.5)*2,py=(y/r.height-.5)*2;
                  var t=parseFloat(c.dataset.tiltMax)||6;
                  var rotY=px*t,rotX=-py*t;
                  c.style.transform='perspective(800px) rotateX('+rotX+'deg) rotateY('+rotY+'deg) scale3d(1.02,1.02,1.02)';
                }
              }
            },{passive:true});
            document.addEventListener('mouseover',function(e){
              var c=e.target.closest(SEL);
              if(c){c._hovered=true;c.style.transition='transform 0.15s ease-out'}
            });
            document.addEventListener('mouseout',function(e){
              var c=e.target.closest(SEL);
              if(c){c._hovered=false;c.style.transition='transform 0.5s cubic-bezier(0.23,1,0.32,1)';c.style.transform=''}
            });
          })();
        `}</Script>
      </body>
    </html>
  );
}
