'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GREEN = '#25D366';

interface Message {
  from: 'user' | 'bot';
  text: string;
  delay: number; // ms from start
}

const CONVERSATION: Message[] = [
  { from: 'user', text: 'Bonjour, je voudrais prendre rendez-vous pour une coupe', delay: 0 },
  { from: 'bot', text: 'Bonjour ! Avec plaisir. Voici les creneaux disponibles demain :', delay: 1200 },
  { from: 'bot', text: '• 10h00\n• 14h30\n• 16h00\n\nLequel vous convient ?', delay: 2200 },
  { from: 'user', text: '14h30 parfait', delay: 3800 },
  { from: 'bot', text: 'C\'est note ! Rendez-vous confirme demain a 14h30 pour une coupe. A bientot !', delay: 5000 },
];

export default function WhatsAppMockup() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startAnimation = useCallback(() => {
    // Clear previous timeouts
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    setVisibleCount(0);
    setIsTyping(false);

    CONVERSATION.forEach((msg, i) => {
      // Show typing indicator before bot messages
      if (msg.from === 'bot') {
        const typingDelay = i === 0 ? msg.delay : msg.delay - 600;
        const tid1 = setTimeout(() => setIsTyping(true), typingDelay);
        timeoutIds.current.push(tid1);
      }

      const tid2 = setTimeout(() => {
        setIsTyping(false);
        setVisibleCount(i + 1);
      }, msg.delay);
      timeoutIds.current.push(tid2);
    });

    // Replay after last message + 4s pause
    const lastDelay = CONVERSATION[CONVERSATION.length - 1].delay;
    const tid3 = setTimeout(() => startAnimation(), lastDelay + 4000);
    timeoutIds.current.push(tid3);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          startAnimation();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      timeoutIds.current.forEach(clearTimeout);
    };
  }, [startAnimation]);

  return (
    <div ref={containerRef} className="relative mx-auto" style={{ width: 280 }}>
      {/* Phone frame */}
      <div
        className="rounded-[2.5rem] p-3 shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: `0 0 40px ${GREEN}15, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Notch */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
        </div>

        {/* Screen */}
        <div className="rounded-[2rem] overflow-hidden bg-[#0b141a]" style={{ minHeight: 420 }}>
          {/* WhatsApp header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#1f2c34' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              SM
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">Salon Moana</p>
              <p className="text-[10px] text-gray-400 mt-0.5">en ligne</p>
            </div>
          </div>

          {/* Chat wallpaper */}
          <div
            className="px-3 py-3 flex flex-col gap-2 overflow-hidden"
            style={{
              minHeight: 340,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23ffffff08\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'%230b141a\'/%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23p)\'/%3E%3C/svg%3E")',
            }}
          >
            {CONVERSATION.slice(0, visibleCount).map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[12px] leading-relaxed animate-msgAppear ${
                  msg.from === 'user'
                    ? 'self-end bg-[#005c4b] text-white'
                    : 'self-start bg-[#1f2c34] text-gray-100'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="self-start bg-[#1f2c34] rounded-lg px-4 py-2.5 flex items-center gap-1 animate-msgAppear">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breathing glow behind phone */}
      <div
        className="absolute -inset-4 -z-10 rounded-[3rem] animate-pulse opacity-30"
        style={{ background: `radial-gradient(circle, ${GREEN}40 0%, transparent 70%)` }}
      />

      {/* Inline keyframe */}
      <style jsx>{`
        @keyframes msgAppear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-msgAppear {
          animation: msgAppear 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
