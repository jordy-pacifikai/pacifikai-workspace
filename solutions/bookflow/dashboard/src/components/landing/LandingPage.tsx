'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  MessageCircle, CalendarCheck, Clock, BarChart3, Smartphone, Bot,
  ArrowRight, Check, ChevronDown, Zap, Shield, Globe,
  Scissors, UtensilsCrossed, Stethoscope, TrendingUp, Users, Star,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

const GREEN = '#25D366';

const MessengerMockup = dynamic(() => import('./MessengerMockup'), {
  ssr: false,
  loading: () => <div className="flex gap-5"><div className="w-[260px] h-[530px] rounded-[42px] bg-gray-900/50 animate-pulse" /><div className="hidden sm:block w-[200px] h-[400px] rounded-2xl bg-gray-900/30 animate-pulse" /></div>,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    className: visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
    style: { transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` },
  };
}

function useCountUp(end: number, suffix = '') {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el!.textContent = Math.round(eased * end) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, suffix]);
  return ref;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-lg border-b border-gray-800/50' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logos/logo-transparent.png" alt="Ve'a" width={36} height={36} className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold text-white">Ve&apos;a</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalites</a>
          <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://dashboard.vea.pacifikai.com/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Connexion</a>
          <a href="https://dashboard.vea.pacifikai.com/signup" className="text-sm font-semibold px-4 py-2 rounded-lg text-gray-950 hover:opacity-90 transition-opacity" style={{ backgroundColor: GREEN }}>
            Essayer gratuitement
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero (2-col with mockup) ─────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${GREEN}40 0%, transparent 60%)` }} />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left — copy */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700/50 text-xs text-gray-300 mb-6">
            <Zap size={12} style={{ color: GREEN }} />
            Assistant IA pour la Polynesie francaise
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight">
            Ne perdez plus<br className="hidden sm:block" /> de clients{' '}
            <span className="landing-glow-text" style={{ color: GREEN }}>quand vous ne pouvez pas repondre</span>
          </h1>

          <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
            Ve&apos;a repond a vos clients sur Messenger, Instagram et WhatsApp, propose les creneaux et confirme les rendez-vous. <strong className="text-gray-200">24h/24, 7j/7.</strong>
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <a href="https://dashboard.vea.pacifikai.com/signup" className="landing-breathing-border flex items-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold text-gray-950 hover:opacity-90 transition-all" style={{ backgroundColor: GREEN }}>
              Commencer gratuitement
              <ArrowRight size={18} />
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-600 lg:text-left text-center">
            Aucune carte bancaire requise &bull; Pret en 5 minutes
          </p>
        </div>

        {/* Right — mockup */}
        <div className="flex justify-center lg:justify-end">
          <MessengerMockup />
        </div>
      </div>
    </section>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

function Trust() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-gray-600">
        {[
          { icon: Shield, text: 'Donnees securisees' },
          { icon: Globe, text: 'Fait en Polynesie' },
          { icon: Zap, text: 'Setup en 5 min' },
          { icon: Check, text: 'Sans engagement' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm">
            <Icon size={16} style={{ color: GREEN }} /><span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Stats ROI ────────────────────────────────────────────────────────────────

function Stats() {
  const fade = useFadeIn();
  const s1 = useCountUp(50, '%');
  const s2 = useCountUp(52, '%');
  const s3 = useCountUp(95, '%');

  return (
    <section className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-4xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { ref: s1, prefix: '-', label: 'de no-shows', source: 'Bird/Aimy 2024' },
            { ref: s2, prefix: '+', label: 'de reservations', source: 'Chablyy, Bella Spa' },
            { ref: s3, prefix: '', label: 'taux de lecture messagerie', source: 'vs 30% email' },
            { ref: null, prefix: '', value: '24/7', label: 'disponibilite', source: 'Meme le dimanche a 23h' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white">
                {stat.prefix}{stat.ref ? <span ref={stat.ref}>0</span> : stat.value}
              </p>
              <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
              <p className="text-[10px] text-gray-600 mt-1 italic">{stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

function Problem() {
  const fade = useFadeIn();
  return (
    <section className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-4xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Le probleme que vous connaissez</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '📞', title: 'Client au telephone', desc: 'Vous etes occupe. Le telephone sonne. Vous ne pouvez pas repondre.' },
              { icon: '🏃', title: 'Le prospect part', desc: 'Il appelle votre concurrent. Un rendez-vous perdu, definitif.' },
              { icon: '🌙', title: 'Apres les heures', desc: '40% des demandes arrivent le soir et le weekend. Qui repond ?' },
            ].map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: MessageCircle, title: 'Multi-canal', desc: 'Messenger, Instagram, WhatsApp. Vos clients vous contactent ou ils veulent.' },
  { icon: CalendarCheck, title: 'Reservation automatique', desc: 'Le bot propose les creneaux disponibles et confirme en temps reel.' },
  { icon: Clock, title: '24h/24, 7j/7', desc: 'Ne manquez plus jamais un rendez-vous, meme le dimanche a 23h.' },
  { icon: Bot, title: 'IA conversationnelle', desc: 'Repond naturellement en francais, comprend les demandes complexes.' },
  { icon: BarChart3, title: 'Tableau de bord', desc: 'Suivez vos rendez-vous, clients et statistiques en temps reel.' },
  { icon: Smartphone, title: 'Google Calendar', desc: 'Synchronisation automatique avec votre agenda Google.' },
];

function Features() {
  const fade = useFadeIn();
  return (
    <section id="features" className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-6xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Tout ce qu&apos;il vous faut</h2>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto">Un assistant complet qui gere vos rendez-vous de A a Z.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="rounded-xl bg-gray-900/50 border border-gray-800 p-6 hover:border-gray-700 transition-all hover:-translate-y-0.5" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${GREEN}15` }}>
                <f.icon size={20} style={{ color: GREEN }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Industries ───────────────────────────────────────────────────────────────

function Industries() {
  const fade = useFadeIn();
  return (
    <section className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-5xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Pour tous les metiers a rendez-vous</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Scissors, name: 'Salons & Beaute', gain: '+70 000 F/mois', desc: 'Coupe, couleur, barbe, soins. Creneaux proposes selon la duree du service.', examples: 'Coiffeurs, estheticiennes, barbiers, spas' },
            { icon: UtensilsCrossed, name: 'Restaurants & Cafes', gain: '+91 000 F/mois', desc: 'Tables, nombre de couverts, preferences. Reservation automatique.', examples: 'Restaurants, snacks, roulottes, bars' },
            { icon: Stethoscope, name: 'Cabinets Medicaux', gain: '+136 000 F/mois', desc: 'Consultations, suivis, urgences. Respect de la confidentialite.', examples: 'Medecins, dentistes, kines, osteos' },
          ].map((sector) => (
            <div key={sector.name} className="rounded-xl bg-gray-900/50 border border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${GREEN}15` }}>
                <sector.icon size={20} style={{ color: GREEN }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{sector.name}</h3>
              <p className="text-xl font-bold mb-3" style={{ color: GREEN }}>{sector.gain}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{sector.desc}</p>
              <p className="text-xs text-gray-600">{sector.examples}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4 italic">
          Estimations basees sur Aimy, Bird, Chablyy, Simbo AI — secteurs internationaux compares
        </p>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const fade = useFadeIn();
  return (
    <section className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-4xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Pret en 3 etapes</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Inscrivez-vous', desc: 'Creez votre compte en 30 secondes. Aucune carte bancaire.' },
            { step: '2', title: 'Configurez', desc: 'Ajoutez vos services, horaires et preferences. 5 minutes.' },
            { step: '3', title: 'C\'est parti', desc: 'Votre assistant IA prend les rendez-vous pour vous.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-gray-950" style={{ backgroundColor: GREEN }}>
                {item.step}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Case Studies ─────────────────────────────────────────────────────────────

function CaseStudies() {
  const fade = useFadeIn();
  return (
    <section className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-5xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Resultats prouves dans le monde</h2>
          <p className="mt-3 text-gray-400">Des entreprises comme la votre ont deja automatise leurs reservations.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { flag: '🇳🇱', name: 'Aimy', location: 'Amsterdam', stat: '+30%', label: 'de reservations', desc: 'Plateforme IA pour salons de coiffure — 200+ salons en Europe.', source: 'aimy.io 2024' },
            { flag: '🌍', name: 'Bella Beauty Spa', location: 'International', stat: '+52%', label: 'en 2 mois', desc: 'Chatbot WhatsApp pour prise de rendez-vous beaute.', source: 'Chablyy Case Study' },
            { flag: '🇺🇸', name: 'Simbo AI', location: 'Californie', stat: '3000%', label: 'ROI', desc: '$6.2M de revenus additionnels grace a l\'automatisation medicale.', source: 'Simbo AI 2024' },
          ].map((cs) => (
            <div key={cs.name} className="rounded-xl bg-gray-900/50 border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{cs.flag}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{cs.name}</p>
                  <p className="text-xs text-gray-500">{cs.location}</p>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: GREEN }}>{cs.stat}</p>
              <p className="text-sm text-gray-300 mb-2">{cs.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{cs.desc}</p>
              <p className="text-[10px] text-gray-600 mt-2 italic">{cs.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Essentiel', desc: 'L\'automatisation qui change tout', price: '9 900',
    features: ['Messenger IA conversationnel', 'Jusqu\'a 200 conversations/mois', 'Tableau de bord complet', 'Configuration personnalisee', 'Support par email'],
    featured: false,
  },
  {
    name: 'Premium', desc: 'Le pack complet multi-canal', price: '19 900',
    features: ['Tout le plan Essentiel', 'Jusqu\'a 500 conversations/mois', 'Instagram + WhatsApp', 'Google Calendar sync', 'Support prioritaire', 'Statistiques avancees'],
    featured: true,
  },
  {
    name: 'Business', desc: 'Sur mesure pour votre entreprise', price: null as string | null,
    features: ['Tout le plan Premium', 'Conversations illimitees', 'Multi-sites / franchises', 'Campagnes acquisition', 'Onboarding dedie', 'SLA garanti'],
    featured: false,
  },
];

function Pricing() {
  const fade = useFadeIn();
  return (
    <section id="pricing" className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-6xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Tarification transparente</h2>
          <p className="mt-3 text-gray-400">Sans engagement. Annuel : 2 mois offerts.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`rounded-xl p-6 flex flex-col ${plan.featured ? 'bg-gray-900 border-2 landing-breathing-border' : 'bg-gray-900/50 border border-gray-800'}`}
              style={plan.featured ? { borderColor: GREEN } : undefined}
            >
              {plan.featured && (
                <div className="text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3" style={{ backgroundColor: `${GREEN}20`, color: GREEN }}>Populaire</div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              <div className="mt-5">
                {plan.price ? (
                  <><span className="text-3xl font-bold text-white">{plan.price}</span><span className="text-sm text-gray-500 ml-1">F/mois</span></>
                ) : (
                  <><span className="text-2xl font-bold text-white">Sur devis</span><p className="text-xs text-gray-600 mt-1">Tarif personnalise</p></>
                )}
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={15} className="shrink-0 mt-0.5" style={{ color: GREEN }} />{f}
                  </li>
                ))}
              </ul>
              <a href={plan.price ? 'https://dashboard.vea.pacifikai.com/signup' : 'mailto:support@vea.pacifikai.com?subject=Plan%20Business%20Ve%27a'}
                className={`mt-6 block text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${plan.featured ? 'text-gray-950 hover:opacity-90' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                style={plan.featured ? { backgroundColor: GREEN } : undefined}
              >
                {plan.price ? 'Commencer' : 'Nous contacter'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Comment ca marche exactement ?', a: 'Ve\'a est un chatbot IA qui repond automatiquement aux messages Messenger, Instagram et WhatsApp de vos clients. Il comprend leurs demandes, propose les creneaux disponibles et confirme les rendez-vous. Tout est synchronise avec votre tableau de bord.' },
  { q: 'Est-ce que mes clients parlent a un vrai humain ?', a: 'Non, c\'est une intelligence artificielle conversationnelle en francais. Elle est configuree avec vos services, horaires et regles. Si un cas est trop complexe, elle invite le client a vous appeler directement.' },
  { q: 'Combien de temps pour mettre en place ?', a: 'Environ 5 minutes. Creez votre compte, ajoutez vos services et horaires, et c\'est parti. Nous nous occupons de la configuration technique.' },
  { q: 'Est-ce que ca marche en Polynesie francaise ?', a: 'Oui ! Ve\'a est concu pour les entreprises polynesiennes. Prix en XPF, bot en francais, specificites locales integrees.' },
  { q: 'Je peux annuler quand je veux ?', a: 'Oui, sans engagement. Annulez a tout moment depuis votre tableau de bord. Pas de frais caches.' },
  { q: 'Ca fonctionne avec Google Calendar ?', a: 'Oui ! Connectez votre Google Calendar pour synchroniser les rendez-vous automatiquement. Les events bloquent aussi les creneaux dans Ve\'a.' },
];

function FAQ() {
  const fade = useFadeIn();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-16 px-6">
      <div ref={fade.ref} className={`max-w-3xl mx-auto ${fade.className}`} style={fade.style}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Questions frequentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl bg-gray-900/50 border border-gray-800 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-6 pb-4"><p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────

function CTAFinal() {
  const fade = useFadeIn();
  return (
    <section className="py-20 px-6">
      <div ref={fade.ref} className={`max-w-3xl mx-auto text-center ${fade.className}`} style={fade.style}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Pret a ne plus perdre de clients ?</h2>
        <p className="mt-4 text-gray-400 max-w-lg mx-auto">
          Rejoignez les commerces polynesiens qui automatisent leurs reservations avec Ve&apos;a.
        </p>
        <div className="mt-8">
          <a href="https://dashboard.vea.pacifikai.com/signup" className="landing-breathing-border inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold text-gray-950 hover:opacity-90 transition-all" style={{ backgroundColor: GREEN }}>
            Commencer maintenant <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logos/logo-transparent.png" alt="Ve'a" width={28} height={28} className="w-7 h-7 object-contain" />
              <p className="text-lg font-bold text-white">Ve&apos;a</p>
            </div>
            <p className="text-sm text-gray-500">Assistant IA de reservation pour les entreprises de Polynesie francaise.</p>
            <p className="text-sm text-gray-600 mt-2">Par PACIFIK&apos;AI</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Produit</p>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Fonctionnalites</a>
              <a href="#pricing" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Tarifs</a>
              <Link href="/faq" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Legal</p>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Confidentialite</Link>
              <Link href="/terms" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Conditions d&apos;utilisation</Link>
              <Link href="/data-deletion" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">Suppression des donnees</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; 2026 PACIFIK&apos;AI. Tous droits reserves.</p>
          <a href="mailto:support@vea.pacifikai.com" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">support@vea.pacifikai.com</a>
        </div>
      </div>
    </footer>
  );
}

// ─── CSS Animations (injected) ────────────────────────────────────────────────

function LandingStyles() {
  return (
    <style jsx global>{`
      @keyframes breathingBorder {
        0%, 100% { box-shadow: 0 0 0 0 ${GREEN}40; }
        50% { box-shadow: 0 0 20px 4px ${GREEN}25; }
      }
      .landing-breathing-border {
        animation: breathingBorder 3s ease-in-out infinite;
      }
      @keyframes glowText {
        0%, 100% { text-shadow: 0 0 20px ${GREEN}20; }
        50% { text-shadow: 0 0 40px ${GREEN}35; }
      }
      .landing-glow-text {
        animation: glowText 4s ease-in-out infinite;
      }
    `}</style>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <LandingStyles />
      <Nav />
      <Hero />
      <Trust />
      <Stats />
      <Problem />
      <Features />
      <Industries />
      <HowItWorks />
      <CaseStudies />
      <Pricing />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}
