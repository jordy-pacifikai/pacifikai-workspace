"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FadeIn from "@/components/FadeIn";

const chambresData = [
  { id: "miti", nom: "Fare Miti", prix: 25000 },
  { id: "mahana", nom: "Fare Mahana", prix: 20000 },
  { id: "moana", nom: "Fare Moana", prix: 22000 },
];

const steps = ["Chambre", "Dates", "Coordonnées", "Confirmation"];

export default function ReservationPage() {
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <ReservationContent />
    </Suspense>
  );
}

function ReservationContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("chambre") || "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    chambre: preselected,
    checkin: "",
    checkout: "",
    guests: "2",
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (preselected) {
      setForm((f) => ({ ...f, chambre: preselected }));
    }
  }, [preselected]);

  const selectedChambre = chambresData.find((c) => c.id === form.chambre);

  const getNights = () => {
    if (!form.checkin || !form.checkout) return 0;
    const diff =
      new Date(form.checkout).getTime() - new Date(form.checkin).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const canNext = () => {
    switch (step) {
      case 1:
        return !!form.chambre;
      case 2:
        return !!form.checkin && !!form.checkout && getNights() > 0;
      case 3:
        return !!form.nom && !!form.prenom && !!form.email;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    // TODO: send to API / email
    setStep(4);
  };

  return (
    <>
      {/* Header spacer */}
      <div className="h-32 md:h-40" />

      <section className="px-6 pb-32 md:pb-40">
        <div className="max-w-xl mx-auto">
          <h1 className="font-serif font-light text-3xl md:text-5xl tracking-wide text-center mb-16">
            Réserver
          </h1>

          {/* Progress */}
          <div className="flex items-center justify-center gap-6 md:gap-8 mb-16 text-sm">
            {steps.map((label, i) => (
              <button
                key={label}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`tabular-nums transition-colors duration-300 ${
                  i + 1 === step
                    ? "text-ink"
                    : i + 1 < step
                    ? "text-sand cursor-pointer"
                    : "text-muted/40"
                }`}
                disabled={i + 1 > step}
              >
                {i + 1}{" "}
                <span className="hidden md:inline text-xs">
                  {" "}
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Step 1: Chambre */}
          {step === 1 && (
            <FadeIn>
              <div className="space-y-6">
                <p className="text-sm text-muted uppercase tracking-wider mb-8">
                  Choisissez votre chambre
                </p>
                {chambresData.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setForm({ ...form, chambre: ch.id })}
                    className={`w-full text-left py-6 border-b transition-colors duration-300 ${
                      form.chambre === ch.id
                        ? "border-sand"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xl font-light">
                        {ch.nom}
                      </span>
                      <span className="text-sm text-muted">
                        {ch.prix.toLocaleString("fr-FR")} XPF / nuit
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <FadeIn>
              <div className="space-y-8">
                <p className="text-sm text-muted uppercase tracking-wider mb-8">
                  Vos dates de séjour
                </p>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-2">
                    Arrivée
                  </label>
                  <input
                    type="date"
                    name="checkin"
                    value={form.checkin}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="input-minimal"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-2">
                    Départ
                  </label>
                  <input
                    type="date"
                    name="checkout"
                    value={form.checkout}
                    onChange={handleChange}
                    min={form.checkin || new Date().toISOString().split("T")[0]}
                    className="input-minimal"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-2">
                    Voyageurs
                  </label>
                  <select
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    className="input-minimal bg-transparent"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "voyageur" : "voyageurs"}
                      </option>
                    ))}
                  </select>
                </div>

                {getNights() > 0 && selectedChambre && (
                  <div className="pt-4 text-sm text-muted">
                    {getNights()} nuit{getNights() > 1 ? "s" : ""} &mdash;{" "}
                    <span className="text-ink font-serif">
                      {(getNights() * selectedChambre.prix).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      XPF
                    </span>
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Step 3: Coordonnees */}
          {step === 3 && (
            <FadeIn>
              <div className="space-y-8">
                <p className="text-sm text-muted uppercase tracking-wider mb-8">
                  Vos coordonnées
                </p>
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="input-minimal"
                />
                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  className="input-minimal"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-minimal"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-minimal"
                />
                <textarea
                  name="message"
                  placeholder="Demande particulière (optionnel)"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className="input-minimal resize-none"
                />
              </div>
            </FadeIn>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <FadeIn>
              <div className="text-center py-12">
                <p className="font-serif text-2xl md:text-3xl font-light mb-4">
                  Mauruuru.
                </p>
                <p className="text-muted leading-relaxed max-w-sm mx-auto">
                  Votre demande de réservation pour{" "}
                  <span className="text-ink">{selectedChambre?.nom}</span> a
                  bien été envoyée. Nous vous confirmerons par email sous 24h.
                </p>
                {getNights() > 0 && selectedChambre && (
                  <div className="mt-8 pt-8 border-t border-gray-100 text-sm text-muted">
                    <p>
                      {form.checkin} &rarr; {form.checkout}
                    </p>
                    <p className="mt-1">
                      {getNights()} nuit{getNights() > 1 ? "s" : ""} &mdash;{" "}
                      {(getNights() * selectedChambre.prix).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      XPF
                    </p>
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Navigation buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-100">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-sm text-muted hover:text-ink transition-colors duration-300"
                >
                  &larr; Retour
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => (step === 3 ? handleSubmit() : setStep(step + 1))}
                disabled={!canNext()}
                className={`link-underline text-sm uppercase tracking-wider transition-opacity duration-300 ${
                  canNext() ? "opacity-100" : "opacity-30 pointer-events-none"
                }`}
              >
                {step === 3 ? "Confirmer" : "Suivant"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
