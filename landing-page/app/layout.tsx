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
    "ai-content-declaration": "human-created",
  },
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
