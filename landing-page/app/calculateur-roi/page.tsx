"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ─── Types ─── */
type Answers = {
  secteur: string;
  nb_employes: string;
  taches: string[];
  temps_taches: string;
  outils: string[];
};

type ROIResult = {
  heuresEconomisees: number;
  economiesAnnuelles: number;
  roiPct: number;
  moisPayback: number;
};

/* ─── Constantes de calcul ─── */
const TAUX_HORAIRE_PF = 1_800; // XPF/h (SMIG PF ~215 000 XPF/mois)
const COUT_IMPLANTATION = 350_000; // XPF forfait type

const TACHE_HEURES: Record<string, number> = {
  "Réponses emails/messages clients": 4,
  "Facturation/comptabilité": 5,
  "Gestion RDV/réservations": 3,
  "Création contenu marketing": 4,
  "Saisie de données": 5,
  "Relances clients/prospects": 3,
  "Rapports et reporting": 4,
};

const TEMPS_MAP: Record<string, number> = {
  "Moins de 5h/semaine": 3,
  "5-10h/semaine": 7.5,
  "10-20h/semaine": 15,
  "20-40h/semaine": 30,
  "Plus de 40h/semaine": 50,
};

const EMPLOYE_MULT: Record<string, number> = {
  "1-5": 1,
  "6-20": 2.5,
  "21-50": 5,
  "51-200": 12,
  "200+": 25,
};

function calculerROI(answers: Answers): ROIResult {
  const heuresBase = TEMPS_MAP[answers.temps_taches] ?? 10;
  const mult = EMPLOYE_MULT[answers.nb_employes] ?? 1;
  const automationRate = Math.min(0.7, 0.4 + answers.taches.length * 0.05);
  const heuresSemaine = heuresBase * automationRate * mult;
  const heuresMois = heuresSemaine * 4.33;
  const economiesMois = heuresMois * TAUX_HORAIRE_PF;
  const economiesAnnuelles = economiesMois * 12;
  const roiPct = Math.round(
    ((economiesAnnuelles - COUT_IMPLANTATION) / COUT_IMPLANTATION) * 100
  );
  const moisPayback = Math.round(COUT_IMPLANTATION / economiesMois);

  return {
    heuresEconomisees: Math.round(heuresMois),
    economiesAnnuelles: Math.round(economiesAnnuelles),
    roiPct,
    moisPayback: Math.max(1, moisPayback),
  };
}

function formatXPF(n: number) {
  return n.toLocaleString("fr-FR") + " XPF";
}

/* ─── Étapes ─── */
const STEPS = [
  { label: "Secteur" },
  { label: "Équipe" },
  { label: "Tâches" },
  { label: "Temps" },
  { label: "Outils" },
];

const SECTEURS = [
  "Commerce",
  "Hôtellerie / Tourisme",
  "Services",
  "Import / Distribution",
  "Finance",
  "Santé",
  "Autre",
];

const NB_EMPLOYES = ["1-5", "6-20", "21-50", "51-200", "200+"];
const NB_EMPLOYES_LABELS: Record<string, string> = {
  "1-5": "1 - 5 employés",
  "6-20": "6 - 20 employés",
  "21-50": "21 - 50 employés",
  "51-200": "51 - 200 employés",
  "200+": "200+ employés",
};

const TACHES = [
  "Réponses emails/messages clients",
  "Facturation/comptabilité",
  "Gestion RDV/réservations",
  "Création contenu marketing",
  "Saisie de données",
  "Relances clients/prospects",
  "Rapports et reporting",
];

const TEMPS_OPTIONS = [
  "Moins de 5h/semaine",
  "5-10h/semaine",
  "10-20h/semaine",
  "20-40h/semaine",
  "Plus de 40h/semaine",
];

const OUTILS = [
  "Excel / Google Sheets",
  "Email seul",
  "CRM (Salesforce, HubSpot...)",
  "WhatsApp / Messenger",
  "Logiciel métier",
  "Rien de spécifique",
];

/* ─── Sub-components ─── */
function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-sm text-left transition-all duration-200 ${
        selected
          ? "border-accent bg-accent/10 text-text"
          : "border-border bg-bg text-text-secondary hover:border-border-light hover:bg-bg-card hover:text-text"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-accent" : "border-border-light"
        }`}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full bg-accent block" />
        )}
      </span>
      {label}
    </button>
  );
}

function CheckOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${
        selected
          ? "border-accent bg-accent/10 text-text"
          : "border-border bg-bg text-text-secondary hover:border-border-light hover:bg-bg-card hover:text-text"
      }`}
    >
      <span
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-accent bg-accent" : "border-border-light"
        }`}
      >
        {selected && (
          <svg
            viewBox="0 0 10 8"
            fill="none"
            className="w-2.5 h-2"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

/* ─── Page ─── */
export default function CalculateurROIPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({
    taches: [],
    outils: [],
  });
  const [result, setResult] = useState<ROIResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");

  const canProceed = (() => {
    if (step === 0) return !!answers.secteur;
    if (step === 1) return !!answers.nb_employes;
    if (step === 2) return (answers.taches?.length ?? 0) > 0;
    if (step === 3) return !!answers.temps_taches;
    if (step === 4) return (answers.outils?.length ?? 0) > 0;
    return false;
  })();

  function goNext() {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      const roi = calculerROI(answers as Answers);
      setResult(roi);
    }
  }

  function toggleTache(val: string) {
    setAnswers((prev) => {
      const cur = prev.taches ?? [];
      return {
        ...prev,
        taches: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
      };
    });
  }

  function toggleOutil(val: string) {
    setAnswers((prev) => {
      const cur = prev.outils ?? [];
      return {
        ...prev,
        outils: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
      };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Lead capture — in production would POST to /api/leads
    setSubmitted(true);
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute rounded-full blur-[100px] opacity-[0.10]"
            style={{
              width: 500,
              height: 500,
              background: "#f97066",
              top: "-15%",
              left: "5%",
            }}
          />
          <div
            className="absolute rounded-full blur-[100px] opacity-[0.08]"
            style={{
              width: 400,
              height: 400,
              background: "#f59e0b",
              top: "40%",
              right: "-5%",
            }}
          />
        </div>

        {/* Header */}
        <section className="relative z-10 pt-36 pb-10 text-center px-6">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-lagoon/10 border border-lagoon/20 text-lagoon px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              Outil gratuit
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Calculez votre{" "}
              <span className="text-accent">ROI</span> avec l&apos;IA
            </h1>
            <p className="text-text-secondary text-lg max-w-lg mx-auto">
              Estimez en 2 minutes les économies que l&apos;automatisation peut
              apporter à votre entreprise polynésienne.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
          {!result ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        i < step
                          ? "border-[#22c55e] bg-[#22c55e]/15 text-[#22c55e]"
                          : i === step
                          ? "border-accent bg-accent/10 text-accent shadow-[0_0_20px_rgba(249,112,102,0.3)]"
                          : "border-border text-text-dim"
                      }`}
                    >
                      {i < step ? (
                        <svg
                          viewBox="0 0 10 8"
                          fill="none"
                          className="w-3 h-2.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M1 4l3 3 5-6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-8 h-0.5 rounded transition-colors duration-300 ${
                          i < step ? "bg-[#22c55e]" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Card */}
              <div className="relative bg-bg-card border border-border rounded-2xl p-8">
                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                {/* Step 1: Secteur */}
                {step === 0 && (
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                      Question 1/5
                    </p>
                    <h2 className="font-display text-xl font-semibold mb-6">
                      Quel est votre secteur d&apos;activité ?
                    </h2>
                    <div className="space-y-2.5">
                      {SECTEURS.map((s) => (
                        <RadioOption
                          key={s}
                          label={s}
                          selected={answers.secteur === s}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, secteur: s }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Employés */}
                {step === 1 && (
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                      Question 2/5
                    </p>
                    <h2 className="font-display text-xl font-semibold mb-6">
                      Combien d&apos;employés dans votre entreprise ?
                    </h2>
                    <div className="space-y-2.5">
                      {NB_EMPLOYES.map((n) => (
                        <RadioOption
                          key={n}
                          label={NB_EMPLOYES_LABELS[n]}
                          selected={answers.nb_employes === n}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, nb_employes: n }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Tâches */}
                {step === 2 && (
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                      Question 3/5
                    </p>
                    <h2 className="font-display text-xl font-semibold mb-1">
                      Quelles tâches répétitives effectuez-vous ?
                    </h2>
                    <p className="text-text-dim text-xs mb-6">
                      Sélectionnez toutes les tâches concernées
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TACHES.map((t) => (
                        <CheckOption
                          key={t}
                          label={t}
                          selected={(answers.taches ?? []).includes(t)}
                          onClick={() => toggleTache(t)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Temps */}
                {step === 3 && (
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                      Question 4/5
                    </p>
                    <h2 className="font-display text-xl font-semibold mb-6">
                      Combien de temps passez-vous sur ces tâches ?
                    </h2>
                    <div className="space-y-2.5">
                      {TEMPS_OPTIONS.map((t) => (
                        <RadioOption
                          key={t}
                          label={t}
                          selected={answers.temps_taches === t}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              temps_taches: t,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Outils */}
                {step === 4 && (
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                      Question 5/5
                    </p>
                    <h2 className="font-display text-xl font-semibold mb-1">
                      Quels outils utilisez-vous actuellement ?
                    </h2>
                    <p className="text-text-dim text-xs mb-6">
                      Sélectionnez tous les outils utilisés
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {OUTILS.map((o) => (
                        <CheckOption
                          key={o}
                          label={o}
                          selected={(answers.outils ?? []).includes(o)}
                          onClick={() => toggleOutil(o)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="text-sm text-text-secondary border border-border px-4 py-2.5 rounded-lg hover:border-border-light hover:text-text transition-colors"
                    >
                      Retour
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed}
                    className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-6 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(249,112,102,0.4)] transition-all duration-300"
                  >
                    {step === 4 ? "Voir mes résultats" : "Suivant"}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ─── RESULTS ─── */
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="font-display text-2xl font-bold mb-1">
                  Vos résultats d&apos;automatisation
                </h2>
                <p className="text-text-secondary text-sm">
                  Estimation basée sur votre profil d&apos;entreprise
                </p>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Heures */}
                <div className="bg-bg-card border border-border rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
                  <div className="w-10 h-10 mx-auto mb-3 bg-accent/10 rounded-xl flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f97066"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-text-dim mb-1">
                    Heures économisées / mois
                  </div>
                  <div className="text-3xl font-extrabold text-accent leading-tight">
                    {result.heuresEconomisees}
                  </div>
                  <div className="text-text-secondary text-xs mt-0.5">heures</div>
                  <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, result.heuresEconomisees * 1.5)}%` }}
                    />
                  </div>
                </div>

                {/* Économies */}
                <div className="bg-bg-card border border-border rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#22c55e]" />
                  <div className="w-10 h-10 mx-auto mb-3 bg-[#22c55e]/10 rounded-xl flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-text-dim mb-1">
                    Économies annuelles
                  </div>
                  <div className="text-2xl font-extrabold text-[#22c55e] leading-tight">
                    {Math.round(result.economiesAnnuelles / 1000)}k
                  </div>
                  <div className="text-text-secondary text-xs mt-0.5">XPF / an</div>
                  <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22c55e] rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, (result.economiesAnnuelles / 5_000_000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Payback */}
                <div className="bg-bg-card border border-border rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#f59e0b]" />
                  <div className="w-10 h-10 mx-auto mb-3 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-text-dim mb-1">
                    Retour sur investissement
                  </div>
                  <div className="text-3xl font-extrabold text-[#f59e0b] leading-tight">
                    {result.moisPayback}
                  </div>
                  <div className="text-text-secondary text-xs mt-0.5">mois payback</div>
                  <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(20, 100 - result.moisPayback * 8)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ROI Highlight */}
              <div className="bg-gradient-to-br from-bg-card to-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-8 text-center">
                <h3 className="text-text-secondary text-sm mb-2">
                  ROI sur 12 mois
                </h3>
                <div
                  className="font-display font-extrabold leading-none mb-2"
                  style={{
                    fontSize: "clamp(3rem, 8vw, 5rem)",
                    color:
                      result.roiPct >= 0 ? "#22c55e" : "#ef4444",
                    textShadow:
                      result.roiPct >= 0
                        ? "0 0 40px rgba(34,197,94,0.3)"
                        : "0 0 40px rgba(239,68,68,0.3)",
                  }}
                >
                  {result.roiPct >= 0 ? "+" : ""}
                  {result.roiPct} %
                </div>
                <p className="text-text-dim text-sm">
                  Basé sur un coût d&apos;implantation moyen de{" "}
                  {formatXPF(COUT_IMPLANTATION)}
                </p>
              </div>

              {/* Avant / Après */}
              <div className="bg-bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-center mb-5 text-sm">
                  Avant vs Après automatisation
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Avant */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-widest text-text-dim text-center pb-2 border-b border-border">
                      Avant
                    </div>
                    {[
                      {
                        label: "Tâches manuelles",
                        val: `${TEMPS_MAP[answers.temps_taches ?? ""] ?? 0}h/sem`,
                      },
                      {
                        label: "Coût humain/mois",
                        val: formatXPF(
                          Math.round(
                            (TEMPS_MAP[answers.temps_taches ?? ""] ?? 0) *
                              4.33 *
                              TAUX_HORAIRE_PF *
                              (EMPLOYE_MULT[answers.nb_employes ?? ""] ?? 1)
                          )
                        ),
                      },
                      { label: "Risque d'erreur", val: "Élevé" },
                    ].map((item) => (
                      <div key={item.label} className="text-sm text-center">
                        <div className="text-text-dim text-xs mb-0.5">
                          {item.label}
                        </div>
                        <div className="text-text font-semibold">{item.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center justify-center gap-3 pt-6">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f97066"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Après */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-widest text-[#22c55e] text-center pb-2 border-b border-border">
                      Après
                    </div>
                    {[
                      {
                        label: "Tâches automatisées",
                        val: `${result.heuresEconomisees}h/mois`,
                      },
                      {
                        label: "Économies/mois",
                        val: formatXPF(Math.round(result.economiesAnnuelles / 12)),
                      },
                      { label: "Risque d'erreur", val: "Minimal" },
                    ].map((item) => (
                      <div key={item.label} className="text-sm text-center">
                        <div className="text-text-dim text-xs mb-0.5">
                          {item.label}
                        </div>
                        <div className="text-[#22c55e] font-semibold">
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lead Capture */}
              <div className="bg-bg-card border border-border rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                {!submitted ? (
                  <>
                    <h3 className="font-display text-lg font-semibold mb-1 relative">
                      Recevez votre rapport complet
                    </h3>
                    <p className="text-text-secondary text-sm mb-6 relative">
                      Obtenez une analyse détaillée et un plan d&apos;action
                      personnalisé par nos experts.
                    </p>
                    <form
                      onSubmit={handleSubmit}
                      className="max-w-sm mx-auto space-y-3 relative"
                    >
                      <input
                        type="text"
                        placeholder="Votre prénom"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text text-sm placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Votre email professionnel"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text text-sm placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Nom de votre entreprise"
                        value={entreprise}
                        onChange={(e) => setEntreprise(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text text-sm placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full mt-1 bg-accent text-bg font-bold py-3 rounded-xl hover:shadow-[0_0_24px_rgba(249,112,102,0.4)] transition-all duration-300"
                      >
                        Recevoir mon rapport gratuit &rarr;
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="py-4">
                    <div className="w-14 h-14 mx-auto mb-4 bg-[#22c55e]/15 rounded-full flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        className="w-7 h-7"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">
                      Merci {nom} !
                    </h4>
                    <p className="text-text-secondary text-sm">
                      Vous recevrez votre rapport sous 24h à l&apos;adresse{" "}
                      <strong className="text-text">{email}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Reset */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setStep(0);
                    setAnswers({ taches: [], outils: [] });
                    setSubmitted(false);
                  }}
                  className="text-sm text-text-dim hover:text-text-secondary underline underline-offset-4 transition-colors"
                >
                  Refaire le calcul
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
