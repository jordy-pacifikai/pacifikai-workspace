'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  from: 'user' | 'bot';
  text: string;
  delay: number;
}

interface Booking {
  day: string;
  weekday: string;
  time: string;
  service: string;
  client: string;
}

interface Scenario {
  name: string;
  initials: string;
  gradient: string;
  messages: Message[];
  booking: Booking;
}

// ─── Scenarios Data ──────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    name: 'Salon Moana',
    initials: 'SM',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    messages: [
      { from: 'user', text: 'Bonjour, je voudrais un RDV pour une coupe', delay: 0 },
      { from: 'bot', text: 'Bonjour ! Avec plaisir 😊\n\nCreneaux disponibles demain :\n• 10h00\n• 14h30\n• 16h00', delay: 1400 },
      { from: 'user', text: '14h30 parfait', delay: 3200 },
      { from: 'bot', text: 'C\'est note ! RDV confirme demain a 14h30 pour une coupe ✅\nA bientot !', delay: 4400 },
    ],
    booking: { day: 'Mar 4', weekday: 'Mar.', time: '14h30', service: 'Coupe', client: 'Hina M.' },
  },
  {
    name: 'Le Coco\'s',
    initials: 'LC',
    gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
    messages: [
      { from: 'user', text: 'Bonsoir, table pour 6 personnes samedi soir svp', delay: 0 },
      { from: 'bot', text: 'Bonsoir ! Pour 6 personnes ce samedi, j\'ai :\n\n• 19h00 — terrasse\n• 20h30 — salle interieure', delay: 1400 },
      { from: 'user', text: '19h terrasse, et on a un anniversaire — c\'est possible un gateau ?', delay: 3400 },
      { from: 'bot', text: 'Bien sur ! J\'ai reserve la terrasse a 19h pour 6 🎉\n\nJ\'ai note la demande de gateau anniversaire, l\'equipe vous contactera pour les details.\n\nBon anniversaire !', delay: 5000 },
    ],
    booking: { day: 'Mar 8', weekday: 'Sam.', time: '19h00', service: 'Table 6 pers. (Terrasse)', client: 'Teiva R.' },
  },
  {
    name: 'Dr Teriitahi',
    initials: 'DT',
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    messages: [
      { from: 'user', text: 'Bonjour docteur, j\'ai tres mal aux dents depuis hier soir', delay: 0 },
      { from: 'bot', text: 'Bonjour. Je comprends, une douleur dentaire urgente doit etre prise en charge rapidement.', delay: 1400 },
      { from: 'bot', text: 'J\'ai un creneau d\'urgence disponible aujourd\'hui a 11h30. Souhaitez-vous le prendre ?', delay: 2600 },
      { from: 'user', text: 'Oui s\'il vous plait !', delay: 4000 },
      { from: 'bot', text: 'RDV confirme aujourd\'hui a 11h30 ✅\n\nEn attendant, prenez un antidouleur si besoin. A tout a l\'heure !', delay: 5200 },
    ],
    booking: { day: 'Mar 3', weekday: 'Lun.', time: '11h30', service: 'Urgence dentaire', client: 'Maui T.' },
  },
  {
    name: 'Spa Manea',
    initials: 'SM',
    gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    messages: [
      { from: 'user', text: 'Ia ora na, je dois decaler mon massage de demain, c\'est possible ?', delay: 0 },
      { from: 'bot', text: 'Ia ora na ! Bien sur 😊\n\nVotre massage est prevu demain a 15h. Quand preferez-vous ?', delay: 1400 },
      { from: 'user', text: 'Plutot vendredi matin si possible', delay: 3000 },
      { from: 'bot', text: 'Vendredi j\'ai 9h00 ou 10h30. Lequel ?', delay: 4200 },
      { from: 'user', text: '10h30', delay: 5400 },
      { from: 'bot', text: 'Parfait ! Votre massage est deplace a vendredi 10h30 ✅\n\nBonne journee !', delay: 6400 },
    ],
    booking: { day: 'Mar 7', weekday: 'Ven.', time: '10h30', service: 'Massage relaxant', client: 'Vaiana P.' },
  },
  {
    name: 'Chez Teva',
    initials: 'CT',
    gradient: 'linear-gradient(135deg, #FFA751 0%, #FFE259 100%)',
    messages: [
      { from: 'user', text: 'T\'as un creneau ce soir vers 19h ?', delay: 0 },
      { from: 'bot', text: 'Salut ! Malheureusement on ferme a 18h en semaine 😕', delay: 1200 },
      { from: 'bot', text: 'Par contre demain j\'ai :\n• 12h00\n• 15h30\n• 17h00\n\nOu samedi on est ouvert jusqu\'a 19h !', delay: 2400 },
      { from: 'user', text: 'Ok samedi 18h alors', delay: 4000 },
      { from: 'bot', text: 'Top ! Samedi 18h c\'est reserve 💈\nA samedi !', delay: 5200 },
    ],
    booking: { day: 'Mar 8', weekday: 'Sam.', time: '18h00', service: 'Coupe + Barbe', client: 'Tama K.' },
  },
  {
    name: 'Nails Factory',
    initials: 'NF',
    gradient: 'linear-gradient(135deg, #E233FF 0%, #FF6B6B 100%)',
    messages: [
      { from: 'user', text: 'Salut, je veux une pose gel vendredi aprem', delay: 0 },
      { from: 'bot', text: 'Salut ! J\'ai 14h00 ou 16h30 vendredi. Lequel te convient ?', delay: 1200 },
      { from: 'user', text: '14h... en fait non 16h30', delay: 2600 },
      { from: 'user', text: 'Attends non finalement 14h cest mieux', delay: 3800 },
      { from: 'bot', text: 'Pas de souci 😊 C\'est note pour vendredi 14h00, pose gel ✅\n\nSi tu changes d\'avis, ecris-moi !', delay: 5000 },
    ],
    booking: { day: 'Mar 7', weekday: 'Ven.', time: '14h00', service: 'Pose gel', client: 'Leilani H.' },
  },
  {
    name: 'Garage Taina',
    initials: 'GT',
    gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    messages: [
      { from: 'user', text: 'Mon vehicule est tombe en panne je lai recup hier et ca remarche pas !!!', delay: 0 },
      { from: 'bot', text: 'Je comprends votre frustration et je suis desole pour ce desagrement. Nous allons prendre en charge votre vehicule en priorite.', delay: 1600 },
      { from: 'bot', text: 'J\'ai un creneau prioritaire demain a 8h00. Le diagnostic sera gratuit vu la situation. Ca vous convient ?', delay: 3000 },
      { from: 'user', text: 'Ok mais jespere que ca sera regle cette fois', delay: 4600 },
      { from: 'bot', text: 'RDV confirme demain 8h00, diagnostic prioritaire gratuit ✅\n\nNotre chef mecanicien s\'en occupera personnellement. A demain !', delay: 6000 },
    ],
    booking: { day: 'Mar 4', weekday: 'Mar.', time: '08h00', service: 'Diagnostic prioritaire', client: 'Raita F.' },
  },
  {
    name: 'Yoga Mahana',
    initials: 'YM',
    gradient: 'linear-gradient(135deg, #A8E063 0%, #56AB2F 100%)',
    messages: [
      { from: 'user', text: 'Bonjour, est-ce qu\'il reste de la place pour le cours de 18h ?', delay: 0 },
      { from: 'bot', text: 'Bonjour ! Le cours de yoga du mardi 18h est presque complet — il reste 2 places sur 12.', delay: 1400 },
      { from: 'user', text: 'On sera 3 avec mes copines cest possible ?', delay: 2800 },
      { from: 'bot', text: 'Il ne reste que 2 places pour mardi. Mais j\'ai un cours jeudi 18h avec 6 places libres — vous pourriez y aller a 3 ?', delay: 4200 },
      { from: 'user', text: 'Va pour jeudi alors !', delay: 5600 },
      { from: 'bot', text: '3 places reservees jeudi 18h, cours de yoga ✅\n\nPensez a vos tapis ! Namaste 🙏', delay: 6800 },
    ],
    booking: { day: 'Mar 6', weekday: 'Jeu.', time: '18h00', service: 'Yoga (x3 places)', client: 'Moea L. +2' },
  },
  {
    name: 'Dr Faatomo',
    initials: 'DF',
    gradient: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    messages: [
      { from: 'user', text: 'Bonjour, c\'est pour mon fils de 8 ans, il a de la fievre depuis 2 jours', delay: 0 },
      { from: 'bot', text: 'Bonjour. Une fievre de 2 jours chez un enfant de 8 ans necessite une consultation. Quel est le nom de votre fils ?', delay: 1600 },
      { from: 'user', text: 'Tehau Paofai', delay: 2800 },
      { from: 'bot', text: 'J\'ai un creneau aujourd\'hui a 15h30 avec le Dr Faatomo (pediatrie). Souhaitez-vous confirmer pour Tehau ?', delay: 4200 },
      { from: 'user', text: 'Oui merci beaucoup', delay: 5400 },
      { from: 'bot', text: 'RDV confirme aujourd\'hui 15h30 pour Tehau Paofai (8 ans) ✅\n\nPensez au carnet de sante. Bon retablissement a Tehau !', delay: 6600 },
    ],
    booking: { day: 'Mar 3', weekday: 'Lun.', time: '15h30', service: 'Consultation pediatrie', client: 'Tehau P. (8 ans)' },
  },
  {
    name: 'Motu Clean',
    initials: 'MC',
    gradient: 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)',
    messages: [
      { from: 'user', text: 'Combien pour un nettoyage complet maison 3 chambres ?', delay: 0 },
      { from: 'bot', text: 'Pour une maison 3 chambres, voici nos forfaits :\n\n• Standard (2h) — 8 500 F\n• Complet (3h30) — 14 000 F\n• Grand menage (5h) — 19 500 F', delay: 1600 },
      { from: 'user', text: 'C pas donne.. le complet il inclut quoi exactement ?', delay: 3200 },
      { from: 'bot', text: 'Le Complet inclut :\n✓ Toutes les pieces\n✓ Vitres interieures\n✓ Salle de bain detartrage\n✓ Cuisine (four + frigo ext.)\n✓ Produits eco fournis\n\nC\'est notre best-seller 🏠', delay: 4800 },
      { from: 'user', text: 'Ok allons y pour le complet samedi matin', delay: 6400 },
      { from: 'bot', text: 'Parfait ! Menage complet reserve samedi 8h30 ✅\n\nNotre equipe de 2 personnes sera la. Bonne journee !', delay: 7600 },
    ],
    booking: { day: 'Mar 8', weekday: 'Sam.', time: '08h30', service: 'Menage complet 3ch', client: 'Vatea N.' },
  },
];

// ─── Mini Calendar ───────────────────────────────────────────────────────────

interface CalendarProps {
  bookings: Booking[];
  activeGradient: string;
}

const MiniCalendar = ({ bookings, activeGradient }: CalendarProps) => {
  const MONTH = 'Mars 2026';
  const DAYS_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const START_OFFSET = 6;
  const TOTAL_DAYS = 31;

  const bookedDays = new Set(bookings.map(b => parseInt(b.day.replace('Mar ', ''))));

  const cells: (number | null)[] = [];
  for (let i = 0; i < START_OFFSET; i++) cells.push(null);
  for (let d = 1; d <= TOTAL_DAYS; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{MONTH}</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: activeGradient }} />
          <span className="text-[10px] text-gray-500">{bookings.length} RDV</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_HEADER.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-medium text-gray-600 py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const isBooked = day !== null && bookedDays.has(day);
          const isToday = day === 3;

          return (
            <div
              key={i}
              className={`relative aspect-square flex items-center justify-center rounded-md text-[10px] transition-all duration-500 ${
                day === null
                  ? ''
                  : isBooked
                    ? 'text-white font-bold calBookedPulse'
                    : isToday
                      ? 'text-white bg-gray-700/50 font-semibold'
                      : 'text-gray-500'
              }`}
              style={isBooked ? { background: activeGradient } : undefined}
            >
              {day}
              {isBooked && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-1.5 min-h-[100px]">
        {bookings.length === 0 && (
          <div className="text-center text-[10px] text-gray-600 py-4">
            Les RDV apparaitront ici...
          </div>
        )}
        {bookings.map((b, i) => (
          <div
            key={`${b.day}-${b.time}-${i}`}
            className="calBookingAppear flex items-center gap-2 rounded-lg bg-gray-800/60 border border-gray-700/50 px-2.5 py-2"
          >
            <div
              className="shrink-0 w-[36px] h-[36px] rounded-lg flex flex-col items-center justify-center"
              style={{ background: `${activeGradient}`, opacity: 0.85 }}
            >
              <span className="text-[8px] font-medium text-white/80 leading-none">{b.weekday}</span>
              <span className="text-[12px] font-bold text-white leading-tight">{b.day.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white truncate">{b.service}</span>
                <span className="text-[10px] text-gray-400 shrink-0 ml-1">{b.time}</span>
              </div>
              <span className="text-[10px] text-gray-500">{b.client}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2"/>
              <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Messenger Phone Mockup ──────────────────────────────────────────────────
// iPhone 15 proportions: 280×572, bezel 8px, border-radius 44px outer / 36px screen
// Messenger 2025 colors: sent #0084FF, received #E4E6EB, bg white

interface PhoneProps {
  scenario: Scenario;
  scenarioIdx: number;
  visibleCount: number;
  isTyping: boolean;
  chatRef: React.RefObject<HTMLDivElement | null>;
}

const PHONE_W = 280;
const PHONE_H = 572;
const BEZEL = 8;
const SCREEN_R = 36;

const MessengerPhone = ({ scenario, scenarioIdx, visibleCount, isTyping, chatRef }: PhoneProps) => {
  const messages = scenario.messages;

  return (
    <div className="relative shrink-0" style={{ width: PHONE_W, height: PHONE_H }}>
      {/* iPhone outer shell — bezel color showing through padding */}
      <div
        className="w-full h-full relative"
        style={{
          borderRadius: 44,
          padding: BEZEL,
          background: 'linear-gradient(145deg, #2a2a2e 0%, #1a1a1d 100%)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Screen */}
        <div
          className="w-full h-full overflow-hidden relative flex flex-col"
          style={{ borderRadius: SCREEN_R, background: '#FFFFFF' }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute z-20"
            style={{
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 90,
              height: 22,
              borderRadius: 11,
              background: '#000',
            }}
          />

          {/* Status bar */}
          <div className="h-[42px] shrink-0 flex items-end justify-between px-6 pb-1 relative z-10 bg-white">
            <span className="text-[10px] font-semibold text-black" style={{ fontFeatureSettings: '"tnum"' }}>9:41</span>
            <div className="flex items-center gap-1">
              {/* Signal bars */}
              <svg width="13" height="9" viewBox="0 0 13 9" fill="black">
                <rect x="0" y="5.5" width="2.2" height="3.5" rx="0.5"/>
                <rect x="3.2" y="3.5" width="2.2" height="5.5" rx="0.5"/>
                <rect x="6.4" y="1.5" width="2.2" height="7.5" rx="0.5"/>
                <rect x="9.6" y="0" width="2.2" height="9" rx="0.5"/>
              </svg>
              {/* Battery */}
              <svg width="18" height="8" viewBox="0 0 25 12">
                <rect x="0.5" y="1" width="20" height="10" rx="2" fill="none" stroke="black" strokeWidth="1"/>
                <rect x="2" y="2.5" width="17" height="7" rx="1" fill="black"/>
                <rect x="21.5" y="4" width="2" height="4" rx="0.5" fill="black"/>
              </svg>
            </div>
          </div>

          {/* Messenger Header — fidele 2025 */}
          <div className="h-[48px] bg-white shrink-0 flex items-center gap-2.5 px-3 border-b border-[#E4E6EB]">
            {/* Back chevron */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M15 18l-6-6 6-6" stroke="#0084FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Avatar + online dot */}
            <div className="relative shrink-0">
              <div
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: scenario.gradient }}
              >
                {scenario.initials}
              </div>
              <div
                className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] rounded-full border-[2px] border-white"
                style={{ background: '#31a24c' }}
              />
            </div>
            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-black leading-tight truncate">{scenario.name}</p>
              <p className="text-[10px] text-[#65676B] leading-tight">Active now</p>
            </div>
            {/* Phone icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            {/* Video icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>

          {/* Chat Area — FIXED HEIGHT, messages start at bottom */}
          <div
            ref={chatRef}
            className="overflow-y-auto flex flex-col justify-end px-2.5 py-2"
            style={{
              height: PHONE_H - BEZEL * 2 - 42 - 48 - 44 - 22,
              scrollBehavior: 'smooth',
              background: '#FFFFFF',
            }}
          >
            {messages.slice(0, visibleCount).map((msg, i) => {
              const isBot = msg.from === 'bot';
              const prevSame = i > 0 && messages[i - 1].from === msg.from;
              const nextSame = i < visibleCount - 1 && i < messages.length - 1 && messages[i + 1]?.from === msg.from;
              const isLastInGroup = isBot && !nextSame;

              return (
                <div
                  key={`${scenarioIdx}-${i}`}
                  className="msgrAppear flex items-end gap-[6px]"
                  style={{
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                    marginTop: prevSame ? 2 : 8,
                  }}
                >
                  {/* Bot avatar — only on last message of consecutive group */}
                  {isBot && (
                    <div className={`shrink-0 w-[24px] ${isLastInGroup ? '' : 'invisible'}`}>
                      <div
                        className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ background: scenario.gradient }}
                      >
                        {scenario.initials}
                      </div>
                    </div>
                  )}
                  {/* Message bubble */}
                  <div
                    className="max-w-[78%]"
                    style={{
                      borderRadius: 18,
                      padding: '6px 12px',
                      fontSize: 13,
                      lineHeight: 1.35,
                      whiteSpace: 'pre-line',
                      ...(isBot
                        ? { backgroundColor: '#E4E6EB', color: '#050505' }
                        : { backgroundColor: '#0084FF', color: '#FFFFFF' }),
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="msgrAppear flex items-end gap-[6px]" style={{ marginTop: 2 }}>
                <div className="shrink-0 w-[24px]">
                  <div
                    className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ background: scenario.gradient }}
                  >
                    {scenario.initials}
                  </div>
                </div>
                <div
                  className="flex items-center gap-[3px]"
                  style={{ borderRadius: 18, backgroundColor: '#E4E6EB', padding: '8px 14px' }}
                >
                  <span className="msgrDot1 w-[5px] h-[5px] rounded-full bg-[#65676B]" />
                  <span className="msgrDot2 w-[5px] h-[5px] rounded-full bg-[#65676B]" />
                  <span className="msgrDot3 w-[5px] h-[5px] rounded-full bg-[#65676B]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar — Messenger 2025 style */}
          <div className="h-[44px] bg-white shrink-0 flex items-center gap-[6px] px-2.5 border-t border-[#E4E6EB]">
            {/* Circle plus button */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="#0084FF" strokeWidth="2"/>
              <path d="M12 8v8M8 12h8" stroke="#0084FF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {/* Camera */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <circle cx="12" cy="13" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>
            </svg>
            {/* Image */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            {/* Mic */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {/* Text field */}
            <div
              className="flex-1 rounded-full flex items-center"
              style={{ background: '#F0F2F5', padding: '5px 12px', fontSize: 12, color: '#65676B' }}
            >
              Aa
            </div>
            {/* Thumbs up */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0">
              <path d="M2 20h2V10H2v10zm20-9c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 2 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
          </div>

          {/* Home Indicator */}
          <div className="h-[22px] bg-white shrink-0 flex items-center justify-center">
            <div className="w-[100px] h-[4px] rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </div>

      {/* Glow behind phone */}
      <div
        className="absolute -inset-5 -z-10 rounded-[52px] animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(0,132,255,0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

// ─── Main Export: DemoShowcase ────────────────────────────────────────────────

const MessengerMockup = () => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scenarioRef = useRef(0);

  const playScenario = useCallback((idx: number) => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    scenarioRef.current = idx;
    setScenarioIdx(idx);
    setVisibleCount(0);
    setIsTyping(false);
    setConfirmedBookings([]);

    const scenario = SCENARIOS[idx];
    const lastMsgIdx = scenario.messages.length - 1;

    scenario.messages.forEach((msg, i) => {
      if (msg.from === 'bot') {
        const typingDelay = i === 0 ? msg.delay : msg.delay - 800;
        const tid1 = setTimeout(() => {
          if (scenarioRef.current === idx) setIsTyping(true);
        }, typingDelay);
        timeoutIds.current.push(tid1);
      }
      const tid2 = setTimeout(() => {
        if (scenarioRef.current === idx) {
          setIsTyping(false);
          setVisibleCount(i + 1);
          if (i === lastMsgIdx) {
            setConfirmedBookings(prev => [...prev, scenario.booking]);
          }
        }
      }, msg.delay);
      timeoutIds.current.push(tid2);
    });

    const lastDelay = scenario.messages[lastMsgIdx].delay;
    const tid3 = setTimeout(() => {
      const next = (idx + 1) % SCENARIOS.length;
      playScenario(next);
    }, lastDelay + 3500);
    timeoutIds.current.push(tid3);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleCount, isTyping]);

  // Start animation on intersection
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          playScenario(0);
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => { obs.disconnect(); timeoutIds.current.forEach(clearTimeout); };
  }, [playScenario]);

  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div ref={containerRef} className="flex items-start gap-5">
      {/* Left: Messenger Phone */}
      <MessengerPhone
        scenario={scenario}
        scenarioIdx={scenarioIdx}
        visibleCount={visibleCount}
        isTyping={isTyping}
        chatRef={chatRef}
      />

      {/* Right: Calendar Panel */}
      <div className="hidden sm:block w-[200px] pt-4">
        <div className="rounded-2xl bg-gray-900/70 border border-gray-800/60 backdrop-blur-sm p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-white">Agenda en direct</span>
          </div>
          <MiniCalendar bookings={confirmedBookings} activeGradient={scenario.gradient} />
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-gray-500">Synchronisation en direct</span>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes msgrAppearKf {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msgrAppear { animation: msgrAppearKf 0.35s ease forwards; }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
        }
        .msgrDot1 { animation: dotBounce 1.4s ease-in-out infinite; }
        .msgrDot2 { animation: dotBounce 1.4s ease-in-out 0.2s infinite; }
        .msgrDot3 { animation: dotBounce 1.4s ease-in-out 0.4s infinite; }
        @keyframes calBookingAppearKf {
          from { opacity: 0; transform: translateX(-10px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .calBookingAppear { animation: calBookingAppearKf 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes calBookedPulseKf {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .calBookedPulse { animation: calBookedPulseKf 0.4s ease; }
      `}</style>
    </div>
  );
};

export default MessengerMockup;
