"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLang } from "@/lib/useLang";
import { rooms } from "@/lib/data";
import { ReservationData } from "@/types";

const STEPS = 4;

export default function ReservationPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ReservationPage />
    </Suspense>
  );
}

function ReservationPage() {
  const { lang, toggleLang, t } = useLang();
  const searchParams = useSearchParams();
  const preselectedRoom = searchParams.get("room");

  const [step, setStep] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoom || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === selectedRoomId), [selectedRoomId]);

  // If room preselected, go to step 2
  useEffect(() => {
    if (preselectedRoom && rooms.find((r) => r.id === preselectedRoom)) {
      setSelectedRoomId(preselectedRoom);
      setStep(2);
    }
  }, [preselectedRoom]);

  const today = new Date().toISOString().split("T")[0];

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1 && !selectedRoomId) {
      newErrors.room = lang === "fr" ? "Selectionnez une chambre" : "Select a room";
    }
    if (s === 2) {
      if (!checkIn) newErrors.checkIn = lang === "fr" ? "Date d'arrivee requise" : "Check-in date required";
      if (!checkOut) newErrors.checkOut = lang === "fr" ? "Date de depart requise" : "Check-out date required";
      if (checkIn && checkOut && checkIn >= checkOut) {
        newErrors.checkOut = lang === "fr" ? "La date de depart doit etre apres l'arrivee" : "Check-out must be after check-in";
      }
    }
    if (s === 3) {
      if (!firstName.trim()) newErrors.firstName = lang === "fr" ? "Prenom requis" : "First name required";
      if (!lastName.trim()) newErrors.lastName = lang === "fr" ? "Nom requis" : "Last name required";
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = lang === "fr" ? "Email valide requis" : "Valid email required";
      }
      if (!phone.trim()) newErrors.phone = lang === "fr" ? "Telephone requis" : "Phone required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < STEPS) setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleConfirm = () => {
    const reservation: ReservationData = {
      roomId: selectedRoomId,
      roomName: selectedRoom?.name || "",
      checkIn,
      checkOut,
      guests,
      firstName,
      lastName,
      email,
      phone,
      message,
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for demo
    const existing = JSON.parse(localStorage.getItem("povai-reservations") || "[]");
    existing.push(reservation);
    localStorage.setItem("povai-reservations", JSON.stringify(existing));

    setConfirmed(true);
    setStep(4);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedRoomId("");
    setCheckIn("");
    setCheckOut("");
    setGuests(2);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setConfirmed(false);
    setErrors({});
  };

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * nights;
  }, [selectedRoom, nights]);

  const stepLabels = [t.reservation.step1, t.reservation.step2, t.reservation.step3, t.reservation.step4];

  return (
    <>
      <Navbar lang={lang} toggleLang={toggleLang} t={t} />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
            alt="Reservation"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl text-white font-bold animate-fade-in-up">
            {t.reservation.title}
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {t.reservation.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 bg-offwhite-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step > i + 1
                        ? "bg-sky-500 text-white"
                        : step === i + 1
                        ? "bg-ocean-500 text-white scale-110"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > i + 1 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-500 hidden sm:block">{label}</span>
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step > i + 1 ? "bg-sky-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Room Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                {t.reservation.selectRoom}
              </h2>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRoomId === room.id
                      ? "border-ocean-500 bg-ocean-50"
                      : "border-gray-200 bg-white hover:border-ocean-300"
                  }`}
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-bold text-gray-900">{room.name}</h3>
                    <p className="text-gray-500 text-sm truncate">
                      {room.capacity} {t.rooms.persons} &middot; {room.size} &middot; {lang === "fr" ? room.bedTypeFr : room.bedType}
                    </p>
                    <p className="text-ocean-500 font-semibold mt-1">{room.priceLabel}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selectedRoomId === room.id
                        ? "border-ocean-500 bg-ocean-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRoomId === room.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
              {errors.room && <p className="text-red-500 text-sm">{errors.room}</p>}
            </div>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                {t.reservation.selectDates}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.reservation.checkIn}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.checkIn ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                  />
                  {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.reservation.checkOut}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.checkOut ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                  />
                  {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reservation.guests}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition bg-white"
                >
                  {Array.from({ length: selectedRoom?.capacity || 4 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? (lang === "fr" ? "personne" : "guest") : t.rooms.persons}
                    </option>
                  ))}
                </select>
              </div>
              {nights > 0 && selectedRoom && (
                <div className="bg-ocean-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{selectedRoom.priceLabel} x {nights} {lang === "fr" ? "nuits" : "nights"}</span>
                    <span className="font-semibold">{totalPrice.toLocaleString()} XPF</span>
                  </div>
                  <div className="flex justify-between font-heading text-lg font-bold text-ocean-600 pt-2 border-t border-ocean-200">
                    <span>Total</span>
                    <span>{totalPrice.toLocaleString()} XPF</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personal Info */}
          {step === 3 && !confirmed && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                {t.reservation.yourInfo}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.reservation.firstName}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.reservation.lastName}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reservation.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reservation.phone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reservation.message}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={t.reservation.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-ocean-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t.reservation.summary}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t.reservation.step1}</span>
                    <span className="font-semibold">{selectedRoom?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.reservation.checkIn}</span>
                    <span className="font-semibold">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.reservation.checkOut}</span>
                    <span className="font-semibold">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.reservation.guests}</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="flex justify-between font-heading text-lg font-bold text-ocean-600 pt-3 border-t border-ocean-200 mt-3">
                    <span>Total ({nights} {lang === "fr" ? "nuits" : "nights"})</span>
                    <span>{totalPrice.toLocaleString()} XPF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && confirmed && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                {t.reservation.confirmed}
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                {t.reservation.confirmedText}
              </p>
              <div className="animate-fade-in-up bg-white rounded-xl p-6 max-w-md mx-auto shadow-sm border border-gray-100 mb-8" style={{ animationDelay: "400ms" }}>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.reservation.step1}</span>
                    <span className="font-semibold">{selectedRoom?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.reservation.checkIn}</span>
                    <span className="font-semibold">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.reservation.checkOut}</span>
                    <span className="font-semibold">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.reservation.guests}</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-ocean-600">
                    <span>Total</span>
                    <span>{totalPrice.toLocaleString()} XPF</span>
                  </div>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="bg-ocean-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-ocean-600 transition-colors animate-fade-in-up"
                style={{ animationDelay: "600ms" }}
              >
                {t.reservation.newReservation}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {!confirmed && (
            <div className="flex justify-between mt-10">
              {step > 1 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t.reservation.previous}
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-ocean-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-ocean-600 transition-all duration-300 hover:scale-105"
                >
                  {t.reservation.next}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : step === 3 ? (
                <button
                  onClick={() => {
                    if (validateStep(3)) handleConfirm();
                  }}
                  className="flex items-center gap-2 bg-sky-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-sky-600 transition-all duration-300 hover:scale-105"
                >
                  {t.reservation.confirm}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <Footer t={t} />
      <WhatsAppButton label={t.common.whatsapp} />
    </>
  );
}
