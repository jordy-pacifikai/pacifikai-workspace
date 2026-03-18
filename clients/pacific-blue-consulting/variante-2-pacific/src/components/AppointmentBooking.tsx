"use client";

import { useState, useCallback } from "react";

type Step = 1 | 2 | 3 | 4;

const domains = [
  { value: "aviation", label: "Aviation civile & Compagnies aeriennes" },
  { value: "aeroports", label: "Aeroports & Infrastructures" },
  { value: "environnement", label: "Environnement & Bilan carbone" },
  { value: "etudes", label: "Etudes strategiques & Modelisation" },
  { value: "amo", label: "AMO & Pilotage de projets" },
  { value: "formation", label: "Formation & Management" },
  { value: "autre", label: "Autre / Je ne suis pas sur" },
];

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

type BookingData = {
  domain: string;
  date: string;
  time: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

function getNextBusinessDays(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const current = new Date(today);
  current.setDate(current.getDate() + 1);

  while (dates.length < count) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatDateValue(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AppointmentBooking() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<BookingData>({
    domain: "",
    date: "",
    time: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});

  const businessDays = getNextBusinessDays(10);

  const updateField = useCallback(
    (field: keyof BookingData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof BookingData, string>> = {};

    if (step === 1 && !data.domain) {
      newErrors.domain = "Veuillez selectionner un domaine";
    }
    if (step === 2) {
      if (!data.date) newErrors.date = "Veuillez choisir une date";
      if (!data.time) newErrors.time = "Veuillez choisir un horaire";
    }
    if (step === 3) {
      if (!data.name.trim()) newErrors.name = "Veuillez indiquer votre nom";
      if (!data.email.trim()) newErrors.email = "Veuillez indiquer votre email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        newErrors.email = "Email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 4) as Step);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    // Save to localStorage
    const bookings = JSON.parse(
      localStorage.getItem("pbc-bookings") || "[]"
    );
    bookings.push({
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("pbc-bookings", JSON.stringify(bookings));

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    const selectedDomain = domains.find((d) => d.value === data.domain);
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-ocean">
          Rendez-vous confirme
        </h3>
        <p className="mt-2 text-slate">
          Votre demande de rendez-vous a bien ete enregistree.
        </p>
        <div className="mt-6 p-6 bg-ocean-50 rounded-xl inline-block text-left">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-ocean">Domaine :</span>{" "}
              <span className="text-slate">{selectedDomain?.label}</span>
            </p>
            <p>
              <span className="font-semibold text-ocean">Date :</span>{" "}
              <span className="text-slate">
                {formatDate(new Date(data.date + "T12:00:00"))}
              </span>
            </p>
            <p>
              <span className="font-semibold text-ocean">Heure :</span>{" "}
              <span className="text-slate">{data.time} (heure de Tahiti)</span>
            </p>
            <p>
              <span className="font-semibold text-ocean">Contact :</span>{" "}
              <span className="text-slate">{data.name}</span>
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate">
          Nous vous contacterons sous 24h pour confirmer le rendez-vous.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                s <= step
                  ? "bg-teal text-ocean shadow-glow-teal"
                  : "bg-ocean-100/50 text-slate"
              }`}
            >
              {s < step ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-0.5 transition-colors ${
                  s < step ? "bg-teal" : "bg-ocean-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6 text-xs text-slate">
        <span className={step >= 1 ? "text-ocean font-medium" : ""}>
          Domaine
        </span>
        <span className={step >= 2 ? "text-ocean font-medium" : ""}>
          Date & Heure
        </span>
        <span className={step >= 3 ? "text-ocean font-medium" : ""}>
          Vos coordonnees
        </span>
        <span className={step >= 4 ? "text-ocean font-medium" : ""}>
          Confirmation
        </span>
      </div>

      {/* Step 1: Domain */}
      {step === 1 && (
        <div>
          <h3 className="font-display text-xl font-bold text-ocean mb-4">
            Quel domaine concerne votre demande ?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {domains.map((domain) => (
              <button
                key={domain.value}
                onClick={() => updateField("domain", domain.value)}
                className={`p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                  data.domain === domain.value
                    ? "border-teal bg-teal/5 text-ocean"
                    : "border-ocean-100 text-slate hover:border-teal/30"
                }`}
              >
                {domain.label}
              </button>
            ))}
          </div>
          {errors.domain && (
            <p className="mt-2 text-sm text-red-500">{errors.domain}</p>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div>
          <h3 className="font-display text-xl font-bold text-ocean mb-4">
            Choisissez une date et un horaire
          </h3>

          {/* Dates */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ocean mb-3">
              Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {businessDays.map((date) => {
                const val = formatDateValue(date);
                return (
                  <button
                    key={val}
                    onClick={() => updateField("date", val)}
                    className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                      data.date === val
                        ? "border-teal bg-teal/5 text-ocean"
                        : "border-ocean-100 text-slate hover:border-teal/30"
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                );
              })}
            </div>
            {errors.date && (
              <p className="mt-2 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-sm font-medium text-ocean mb-3">
              Horaire (heure de Tahiti, UTC-10)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => updateField("time", time)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    data.time === time
                      ? "border-teal bg-teal/5 text-ocean"
                      : "border-ocean-100 text-slate hover:border-teal/30"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {errors.time && (
              <p className="mt-2 text-sm text-red-500">{errors.time}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div>
          <h3 className="font-display text-xl font-bold text-ocean mb-4">
            Vos coordonnees
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ocean mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-4 py-3 border border-ocean-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                placeholder="Jean Dupont"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean mb-1">
                Entreprise / Organisation
              </label>
              <input
                type="text"
                value={data.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="w-full px-4 py-3 border border-ocean-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                placeholder="Direction de l'Aviation Civile"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ocean mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 border border-ocean-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                  placeholder="jean@exemple.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean mb-1">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-4 py-3 border border-ocean-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                  placeholder="+689 87 000 000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean mb-1">
                Message (optionnel)
              </label>
              <textarea
                value={data.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-ocean-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal resize-none"
                placeholder="Decrivez brievement votre projet ou votre besoin..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div>
          <h3 className="font-display text-xl font-bold text-ocean mb-4">
            Recapitulatif de votre rendez-vous
          </h3>
          <div className="space-y-3 p-6 bg-ocean-50 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-slate">Domaine</span>
              <span className="font-medium text-ocean">
                {domains.find((d) => d.value === data.domain)?.label}
              </span>
            </div>
            <div className="border-t border-ocean-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate">Date</span>
              <span className="font-medium text-ocean">
                {data.date && formatDate(new Date(data.date + "T12:00:00"))}
              </span>
            </div>
            <div className="border-t border-ocean-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate">Heure</span>
              <span className="font-medium text-ocean">
                {data.time} (heure de Tahiti)
              </span>
            </div>
            <div className="border-t border-ocean-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate">Nom</span>
              <span className="font-medium text-ocean">{data.name}</span>
            </div>
            {data.company && (
              <>
                <div className="border-t border-ocean-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Entreprise</span>
                  <span className="font-medium text-ocean">{data.company}</span>
                </div>
              </>
            )}
            <div className="border-t border-ocean-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate">Email</span>
              <span className="font-medium text-ocean">{data.email}</span>
            </div>
            {data.phone && (
              <>
                <div className="border-t border-ocean-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Telephone</span>
                  <span className="font-medium text-ocean">{data.phone}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="px-6 py-3 text-sm font-medium text-slate hover:text-ocean transition-colors"
          >
            Retour
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-teal text-ocean text-sm font-semibold rounded-lg hover:bg-teal-400 transition-colors"
          >
            Continuer
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-teal text-ocean text-sm font-semibold rounded-lg hover:bg-teal-400 transition-colors"
          >
            Confirmer le rendez-vous
          </button>
        )}
      </div>
    </div>
  );
}
