"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { rooms, formatXPF } from "@/lib/data";
import FloatingInput from "@/components/FloatingInput";
import AnimatedSection from "@/components/AnimatedSection";

type Step = 1 | 2 | 3 | 4;

const STORAGE_KEY = "povai-reservation";

function getStoredData() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function ReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-40 pb-24 text-center">
          <div className="w-8 h-8 border border-lagoon/30 border-t-lagoon rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ReservationContent />
    </Suspense>
  );
}

function ReservationContent() {
  const searchParams = useSearchParams();
  const preselectedRoom = searchParams.get("room");

  const [step, setStep] = useState<Step>(1);
  const [selectedRoom, setSelectedRoom] = useState<string>(preselectedRoom || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("2");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    const stored = getStoredData();
    if (stored) {
      if (!preselectedRoom && stored.selectedRoom) setSelectedRoom(stored.selectedRoom);
      if (stored.checkIn) setCheckIn(stored.checkIn);
      if (stored.checkOut) setCheckOut(stored.checkOut);
      if (stored.name) setName(stored.name);
      if (stored.email) setEmail(stored.email);
      if (stored.phone) setPhone(stored.phone);
      if (stored.guests) setGuests(stored.guests);
      if (stored.message) setMessage(stored.message);
    }
  }, [preselectedRoom]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedRoom, checkIn, checkOut, name, email, phone, guests, message })
    );
  }, [selectedRoom, checkIn, checkOut, name, email, phone, guests, message]);

  const selectedRoomData = useMemo(() => rooms.find((r) => r.id === selectedRoom), [selectedRoom]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoomData || nights <= 0) return 0;
    return selectedRoomData.priceNight * nights;
  }, [selectedRoomData, nights]);

  const canProceed = (s: Step): boolean => {
    switch (s) {
      case 1: return !!selectedRoom;
      case 2: return !!checkIn && !!checkOut && nights > 0;
      case 3: return !!name && !!email && !!phone;
      default: return true;
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const today = new Date().toISOString().split("T")[0];

  const stepLabels = ["Chambre", "Dates", "Informations", "Confirmation"];

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lagoon/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Reservation
          </p>
          <h1
            className="font-serif text-ink font-light"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Reservez votre sejour
          </h1>
        </div>
      </section>

      {/* Progress bar */}
      <div className="max-w-xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-sans transition-all duration-600 ${
                    s <= step
                      ? s < step
                        ? "bg-lagoon-deep text-white"
                        : "bg-lagoon text-white"
                      : "bg-sand-200 text-ink/30"
                  }`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                >
                  {s < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className="text-[9px] uppercase tracking-[0.1em] mt-2 text-ink/30 hidden sm:block">
                  {stepLabels[s - 1]}
                </span>
              </div>
              {s < 4 && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-[1px] transition-colors duration-600 ${
                      s < step ? "bg-lagoon/50" : "bg-sand-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps content */}
      <div className="max-w-3xl mx-auto px-6 pb-28">
        {/* Step 1 */}
        {step === 1 && (
          <AnimatedSection>
            <h2 className="font-serif text-xl text-ink/80 mb-10 text-center font-light">
              Choisissez votre chambre
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`relative overflow-hidden text-left transition-all duration-500 group ${
                    selectedRoom === room.id
                      ? "ring-2 ring-gold ring-offset-4 ring-offset-sand-50"
                      : "hover:shadow-lg"
                  }`}
                  style={{ borderRadius: "16px" }}
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Selected indicator */}
                    {selectedRoom === room.id && (
                      <div className="absolute top-4 right-4 w-7 h-7 bg-gold rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-gold-light/60 text-[9px] uppercase tracking-[0.2em] mb-1 font-sans">
                        {room.subtitle}
                      </p>
                      <h3 className="font-serif text-white text-lg font-light mb-2">
                        {room.name}
                      </h3>
                      <p className="text-white/60 text-sm font-sans">
                        {formatXPF(room.priceNight)} <span className="text-white/30">/ nuit</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <AnimatedSection>
            <h2 className="font-serif text-xl text-ink/80 mb-10 text-center font-light">
              Selectionnez vos dates
            </h2>
            <div className="max-w-md mx-auto space-y-8">
              <div className="float-label-group">
                <input
                  id="checkin"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut("");
                  }}
                  placeholder=" "
                  required
                />
                <label htmlFor="checkin">Date d&apos;arrivee</label>
              </div>
              <div className="float-label-group">
                <input
                  id="checkout"
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="checkout">Date de depart</label>
              </div>

              {nights > 0 && selectedRoomData && (
                <div className="bg-white rounded-2xl p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <p className="text-ink/40 text-sm mb-2">
                    {nights} nuit{nights > 1 ? "s" : ""} &mdash; {selectedRoomData.name}
                  </p>
                  <p className="font-serif text-lagoon-deep" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                    {formatXPF(totalPrice)}
                  </p>
                  <p className="text-ink/30 text-xs mt-1">
                    {formatXPF(selectedRoomData.priceNight)} / nuit
                  </p>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <AnimatedSection>
            <h2 className="font-serif text-xl text-ink/80 mb-10 text-center font-light">
              Vos informations
            </h2>
            <div className="max-w-md mx-auto space-y-8">
              <FloatingInput id="name" label="Nom complet" value={name} onChange={setName} required />
              <FloatingInput id="email" label="Adresse email" type="email" value={email} onChange={setEmail} required />
              <FloatingInput id="phone" label="Telephone" type="tel" value={phone} onChange={setPhone} required />
              <div className="float-label-group">
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                >
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                </select>
                <label htmlFor="guests">Nombre de personnes</label>
              </div>
              <FloatingInput id="message" label="Message (optionnel)" value={message} onChange={setMessage} textarea rows={3} />
            </div>
          </AnimatedSection>
        )}

        {/* Step 4 */}
        {step === 4 && !submitted && (
          <AnimatedSection>
            <h2 className="font-serif text-xl text-ink/80 mb-10 text-center font-light">
              Recapitulatif
            </h2>
            <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              {/* Room header */}
              {selectedRoomData && (
                <div className="relative h-36">
                  <Image
                    src={selectedRoomData.image}
                    alt={selectedRoomData.name}
                    fill
                    className="object-cover"
                    sizes="500px"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative h-full flex items-end p-6">
                    <div>
                      <p className="text-gold-light/60 text-[9px] uppercase tracking-[0.2em] mb-1">{selectedRoomData.subtitle}</p>
                      <h3 className="font-serif text-white text-xl font-light">{selectedRoomData.name}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Details */}
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Arrivee", value: checkIn ? new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "" },
                    { label: "Depart", value: checkOut ? new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "" },
                    { label: "Duree", value: `${nights} nuit${nights > 1 ? "s" : ""}` },
                    { label: "Voyageurs", value: `${guests} personne${parseInt(guests) > 1 ? "s" : ""}` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-ink/35">{row.label}</span>
                      <span className="text-ink/70">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-[1px] bg-sand-100" />

                <div className="space-y-2 text-sm">
                  {[
                    { label: "Nom", value: name },
                    { label: "Email", value: email },
                    { label: "Telephone", value: phone },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-ink/35">{row.label}</span>
                      <span className="text-ink/70">{row.value}</span>
                    </div>
                  ))}
                  {message && (
                    <div className="pt-2">
                      <span className="text-ink/35 text-sm">Message</span>
                      <p className="text-ink/70 text-sm mt-1">{message}</p>
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-sand-100" />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-ink/40">Total</span>
                  <span className="font-serif text-2xl text-lagoon-deep">{formatXPF(totalPrice)}</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Submitted */}
        {submitted && (
          <AnimatedSection className="text-center py-16">
            {/* Animated check */}
            <div className="w-20 h-20 bg-lagoon/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-9 h-9 text-lagoon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-ink font-light mb-4">
              Demande envoyee
            </h2>
            <p className="text-ink/50 text-base max-w-md mx-auto mb-10 leading-relaxed">
              Merci pour votre demande de reservation. Christian vous
              recontactera sous 24 heures pour confirmer votre sejour.
            </p>
            <a
              href="https://wa.me/68989538387"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full text-[11px] uppercase tracking-[0.1em] hover:bg-[#20BD5A] transition-colors duration-400"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contacter par WhatsApp
            </a>
          </AnimatedSection>
        )}

        {/* Navigation buttons */}
        {!submitted && (
          <div className="flex justify-between mt-14 max-w-md mx-auto">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as Step)}
                className="px-6 py-3 text-ink/30 text-[11px] uppercase tracking-[0.15em] hover:text-ink/60 transition-colors font-sans"
              >
                Precedent
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                onClick={() => canProceed(step) && setStep((step + 1) as Step)}
                disabled={!canProceed(step)}
                className={`px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.15em] font-sans transition-all duration-500 ${
                  canProceed(step)
                    ? "bg-lagoon text-white hover:bg-lagoon-deep"
                    : "bg-sand-200 text-ink/20 cursor-not-allowed"
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-lagoon text-white rounded-full text-[11px] uppercase tracking-[0.15em] font-sans hover:bg-lagoon-deep transition-colors duration-500"
              >
                Confirmer la demande
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
