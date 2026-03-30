"use client";

/* ============================================================
   FAKE UI MINIATURES — Realistic mini app previews
   Ported from pacifikai.com bento card-stack visuals
   ============================================================ */

/* --- Shared wrapper --- */
function FK({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`fk ${className}`} style={style}>{children}</div>;
}

function FKNav({ logoColor, btnColor }: { logoColor: string; btnColor: string }) {
  return (
    <div className="fk-nav">
      <div className="fk-logo" style={{ background: logoColor }} />
      <div className="fk-nav-links">
        <div className="fk-nav-link" />
        <div className="fk-nav-link" />
      </div>
      <div className="fk-nav-btn" style={{ background: btnColor }} />
    </div>
  );
}

/* ============ TILE 1: WEBSITES ============ */

export function FKDashboard() {
  return (
    <FK className="fk-dashboard">
      <FKNav logoColor="var(--accent)" btnColor="var(--accent)" />
      <div className="fk-body">
        <div className="fk-side">
          <div className="fk-side-item active" style={{ background: "var(--accent)" }} />
          <div className="fk-side-item" />
          <div className="fk-side-item" />
          <div className="fk-side-item" />
        </div>
        <div className="fk-main">
          <div className="fk-title" />
          <div className="fk-stats-row" style={{ display: "flex", gap: "4px" }}>
            <div className="fk-stat"><div className="fk-stat-val" style={{ background: "var(--accent)" }} /><div className="fk-stat-label" /></div>
            <div className="fk-stat"><div className="fk-stat-val" style={{ background: "var(--lagoon)" }} /><div className="fk-stat-label" /></div>
            <div className="fk-stat"><div className="fk-stat-val" style={{ background: "var(--gold)" }} /><div className="fk-stat-label" /></div>
          </div>
          <div className="fk-chart" style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", paddingTop: "4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50].map((h, i) => (
              <div key={i} className="fk-bar" style={{ flex: 1, height: `${h}%`, background: i % 2 === 0 ? "var(--accent)" : "rgba(249,112,102,0.3)", borderRadius: "2px 2px 0 0", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    </FK>
  );
}

export function FKLandingPage() {
  return (
    <FK className="fk-landingpage">
      <FKNav logoColor="linear-gradient(135deg, #6366f1, #a855f7)" btnColor="linear-gradient(90deg, #6366f1, #a855f7)" />
      <div className="fk-hero" style={{ padding: "10px 12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div className="fk-hero-title" />
        <div className="fk-hero-sub" style={{ height: "3px", width: "60%", borderRadius: "2px", background: "rgba(255,255,255,0.15)" }} />
        <div className="fk-hero-cta" style={{ width: "40px", height: "10px", borderRadius: "5px", background: "linear-gradient(90deg, #6366f1, #a855f7)" }} />
      </div>
      <div style={{ display: "flex", gap: "5px", padding: "0 12px", marginTop: "auto", paddingBottom: "8px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="fk-feat-card" style={{ flex: 1, borderRadius: "5px", padding: "5px", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)", display: "flex", flexDirection: "column", gap: "3px", animation: `fkFadeUp 0.6s ease forwards ${0.2 * i}s`, opacity: 0 }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "4px", background: `rgba(${i === 1 ? "99,102,241" : i === 2 ? "168,85,247" : "236,72,153"},0.4)` }} />
            <div className="fk-text" style={{ width: "80%" }} />
            <div className="fk-text" style={{ width: "60%" }} />
          </div>
        ))}
      </div>
    </FK>
  );
}

export function FKEcommerce() {
  return (
    <FK className="fk-ecommerce">
      <FKNav logoColor="var(--lagoon)" btnColor="var(--lagoon)" />
      <div className="fk-main">
        <div className="fk-search" style={{ height: "9px", borderRadius: "5px", border: "1px solid rgba(20,184,166,0.3)", background: "rgba(0,0,0,0.3)", marginBottom: "3px", position: "relative", overflow: "hidden" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", flex: 1 }}>
          {["lagoon", "accent", "gold", "indigo", "purple", "pink"].map((c, i) => (
            <div key={i} style={{ borderRadius: "4px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, background: `linear-gradient(135deg, rgba(${c === "lagoon" ? "20,184,166" : c === "accent" ? "249,112,102" : c === "gold" ? "245,197,66" : c === "indigo" ? "99,102,241" : c === "purple" ? "168,85,247" : "236,72,153"},0.1), rgba(0,0,0,0.02))` }} />
              <div style={{ padding: "2px 3px" }}>
                <div style={{ height: "3px", width: "60%", borderRadius: "1px", background: "var(--lagoon)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FK>
  );
}

export function FKBookingApp() {
  return (
    <FK className="fk-bookingapp">
      <FKNav logoColor="#25D366" btnColor="#25D366" />
      <div className="fk-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
          <div style={{ height: "5px", width: "30px", borderRadius: "2px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ display: "flex", gap: "3px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", flex: 1 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ borderRadius: "2px", background: "rgba(255,255,255,0.02)", position: "relative", aspectRatio: "1" }}>
              {[3, 8, 14, 19, 24].includes(i) && (
                <div style={{ position: "absolute", inset: "1px", borderRadius: "2px", background: "rgba(37,211,102,0.2)", border: "1px solid rgba(37,211,102,0.4)" }} />
              )}
              {i === 10 && <div style={{ position: "absolute", inset: 0, border: "1px solid #25D366", borderRadius: "2px" }} />}
            </div>
          ))}
        </div>
      </div>
    </FK>
  );
}

export function FKMapApp() {
  return (
    <FK className="fk-mapapp" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, background: "rgba(12,18,34,0.85)", backdropFilter: "blur(4px)" }}>
        <FKNav logoColor="var(--accent)" btnColor="var(--accent)" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 30% 40%, rgba(20,184,166,0.08), transparent), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(99,102,241,0.06), transparent), linear-gradient(180deg, #0c1222, #1a2332)" }} />
      {/* Pins */}
      <div className="fk-pin coral" style={{ position: "absolute", top: "35%", left: "25%", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", zIndex: 1 }} />
      <div className="fk-pin teal" style={{ position: "absolute", top: "50%", left: "55%", width: "8px", height: "8px", borderRadius: "50%", background: "var(--lagoon)", zIndex: 1 }} />
      <div className="fk-pin gold" style={{ position: "absolute", top: "30%", left: "70%", width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold)", zIndex: 1 }} />
      {/* Bottom card */}
      <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", zIndex: 2, background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", padding: "5px 6px", display: "flex", gap: "5px", alignItems: "center" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "3px", background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          <div className="fk-text" style={{ width: "60%", background: "rgba(255,255,255,0.2)" }} />
          <div className="fk-text" style={{ width: "40%" }} />
        </div>
      </div>
    </FK>
  );
}

/* ============ TILE 2: AUTOMATION ============ */

export function FKWhatsApp() {
  return (
    <FK className="fk-whatsapp">
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 6px", background: "#1f2c33", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#25D366" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <div style={{ height: "4px", width: "28px", borderRadius: "2px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ height: "2px", width: "16px", borderRadius: "1px", background: "#25D366" }} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "6px", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "75%", padding: "3px 5px", borderRadius: "4px", background: "#1f2c33", alignSelf: "flex-start", borderTopLeftRadius: 0 }}>
          <div className="fk-text" style={{ width: "90%", background: "rgba(255,255,255,0.2)" }} />
          <div className="fk-text" style={{ width: "60%", background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div style={{ display: "flex", gap: "2px", alignSelf: "flex-start", padding: "4px 6px", background: "#1f2c33", borderRadius: "4px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: `fkBlink 1.4s infinite ${i * 0.2}s` }} />
          ))}
        </div>
        <div style={{ maxWidth: "75%", padding: "3px 5px", borderRadius: "4px", background: "#005c4b", alignSelf: "flex-end", borderTopRightRadius: 0 }}>
          <div className="fk-text" style={{ width: "85%", background: "rgba(255,255,255,0.25)" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "3px", padding: "4px 6px", background: "#1f2c33", alignItems: "center", flexShrink: 0 }}>
        <div style={{ flex: 1, height: "10px", borderRadius: "5px", background: "#2a3942" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#25D366" }} />
      </div>
    </FK>
  );
}

export function FKWorkflow() {
  return (
    <FK className="fk-workflow">
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 6px", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: "8px", height: "6px", borderRadius: "2px", background: "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div style={{ flex: 1, position: "relative", background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.03), transparent)", overflow: "hidden" }}>
        {/* Nodes */}
        <div className="fk-wf-node" style={{ top: "15%", left: "8%", background: "rgba(249,112,102,0.15)", border: "1px solid var(--accent)", animation: "fkNodePop 0.5s ease forwards", animationDelay: "0.1s" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "var(--accent)", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "3px", borderRadius: "1px", background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="fk-wf-connector" style={{ top: "24%", left: "30%", width: "20%", height: "2px", background: "var(--accent)", animation: "fkDrawArrow 0.4s ease forwards 0.4s", transformOrigin: "left", transform: "scaleX(0)" }} />
        <div className="fk-wf-node" style={{ top: "35%", left: "40%", background: "rgba(99,102,241,0.15)", border: "1px solid #6366f1", animation: "fkNodePop 0.5s ease forwards", animationDelay: "0.5s" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "#6366f1", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "3px", borderRadius: "1px", background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="fk-wf-connector" style={{ top: "48%", left: "58%", width: "18%", height: "2px", background: "#6366f1", animation: "fkDrawArrow 0.4s ease forwards 0.8s", transformOrigin: "left", transform: "scaleX(0)" }} />
        <div className="fk-wf-node" style={{ top: "55%", left: "65%", background: "rgba(20,184,166,0.15)", border: "1px solid var(--lagoon)", animation: "fkNodePop 0.5s ease forwards", animationDelay: "0.9s" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "var(--lagoon)", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "3px", borderRadius: "1px", background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
    </FK>
  );
}

export function FKEmailAuto() {
  return (
    <FK className="fk-emailauto">
      <FKNav logoColor="#ea580c" btnColor="#ea580c" />
      <div className="fk-main">
        <div className="fk-title" style={{ marginBottom: "4px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
          {[
            { color: "#ea580c", delay: "0.1s" },
            { color: "var(--lagoon)", delay: "0.3s" },
            { color: "#6366f1", delay: "0.5s" },
            { color: "var(--gold)", delay: "0.7s" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "4px", alignItems: "center", padding: "3px 4px", borderRadius: "3px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", animation: `fkFadeUp 0.4s ease forwards ${item.delay}`, opacity: 0 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", flexShrink: 0, background: `${item.color}33`, border: `1px solid ${item.color}` }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                <div className="fk-text" style={{ width: "70%", background: "rgba(255,255,255,0.2)" }} />
                <div className="fk-text" style={{ width: "90%" }} />
              </div>
              <div style={{ height: "5px", width: "12px", borderRadius: "3px", background: "#25D366", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </FK>
  );
}

export function FKAnalytics() {
  return (
    <FK className="fk-analyticsdash">
      <FKNav logoColor="#6366f1" btnColor="#6366f1" />
      <div className="fk-main">
        <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
          {["#6366f1", "var(--lagoon)", "var(--accent)"].map((c, i) => (
            <div key={i} className="fk-stat" style={{ flex: 1 }}>
              <div style={{ height: "5px", width: "50%", borderRadius: "2px", background: c }} />
              <div className="fk-stat-label" />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", paddingTop: "3px" }}>
          {[40, 55, 35, 70, 50, 85, 60, 75, 45, 90, 65, 80].map((h, i) => (
            <div key={i} className="fk-bar" style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "rgba(99,102,241,0.3)" : "var(--lagoon)", animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
    </FK>
  );
}

/* ============ TILE 3: CONSEIL ============ */

export function FKAudit() {
  return (
    <FK className="fk-audit">
      <FKNav logoColor="var(--gold)" btnColor="var(--gold)" />
      <div className="fk-main">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "3px solid var(--lagoon)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ height: "4px", width: "8px", borderRadius: "1px", background: "rgba(255,255,255,0.4)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div className="fk-text" style={{ width: "40px", background: "rgba(255,255,255,0.25)" }} />
            <div className="fk-text" style={{ width: "30px" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
          {[
            { status: "pass", width: "85%", color: "var(--lagoon)" },
            { status: "pass", width: "92%", color: "var(--lagoon)" },
            { status: "warn", width: "60%", color: "var(--gold)" },
            { status: "fail", width: "35%", color: "var(--accent)" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", gap: "4px", alignItems: "center", animation: `fkFadeUp 0.4s ease forwards ${0.2 + i * 0.3}s`, opacity: 0 }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: row.color, flexShrink: 0 }} />
              <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", width: row.width, borderRadius: "2px", background: row.color, animation: "fkGrow 1s ease forwards", transformOrigin: "left" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FK>
  );
}

export function FKRoadmap() {
  return (
    <FK className="fk-roadmap">
      <FKNav logoColor="var(--accent)" btnColor="var(--accent)" />
      <div className="fk-main" style={{ paddingLeft: "14px", position: "relative" }}>
        <div style={{ position: "absolute", left: "7px", top: 0, bottom: 0, width: "2px", background: "rgba(255,255,255,0.08)" }} />
        {[
          { color: "var(--lagoon)", delay: "0.2s", w: "70%" },
          { color: "var(--accent)", delay: "0.5s", w: "55%" },
          { color: "#6366f1", delay: "0.8s", w: "80%" },
          { color: "var(--gold)", delay: "1.1s", w: "45%" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start", position: "relative", animation: `fkFadeUp 0.5s ease forwards ${item.delay}`, opacity: 0, padding: "2px 0" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color, flexShrink: 0, position: "absolute", left: "-10px", top: "3px", zIndex: 1 }} />
            <div style={{ flex: 1, borderRadius: "3px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "3px 5px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="fk-text" style={{ width: item.w, background: "rgba(255,255,255,0.2)" }} />
              <div className="fk-text" style={{ width: "50%" }} />
            </div>
          </div>
        ))}
      </div>
    </FK>
  );
}

export function FKKPI() {
  return (
    <FK className="fk-kpi">
      <FKNav logoColor="var(--lagoon)" btnColor="var(--lagoon)" />
      <div className="fk-main">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          {["var(--lagoon)", "var(--accent)", "var(--gold)", "#6366f1"].map((c, i) => (
            <div key={i} className="fk-stat" style={{ padding: "4px 5px" }}>
              <div style={{ height: "6px", width: "55%", borderRadius: "2px", background: c }} />
              <div className="fk-text" style={{ width: "60%" }} />
              <div style={{ height: "3px", width: "20px", borderRadius: "1px", background: "#25D366" }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", marginTop: "4px" }}>
          <svg className="fk-kpi-line" viewBox="0 0 200 50" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--lagoon)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--lagoon)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path className="fk-kpi-fill" d="M0,45 L25,38 L50,35 L75,28 L100,22 L125,18 L150,12 L175,8 L200,3 L200,50 L0,50Z" fill="url(#kpiGrad)" style={{ opacity: 0, animation: "fkFadeIn 1s ease forwards 1.5s" }} />
            <path d="M0,45 L25,38 L50,35 L75,28 L100,22 L125,18 L150,12 L175,8 L200,3" fill="none" stroke="var(--lagoon)" strokeWidth={2} style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: "fkDrawLine 2s ease forwards" }} />
          </svg>
        </div>
      </div>
    </FK>
  );
}

export function FKFormation() {
  return (
    <FK className="fk-formation">
      <FKNav logoColor="#a855f7" btnColor="#a855f7" />
      <div className="fk-main">
        <div className="fk-title" style={{ width: "50%", marginBottom: "3px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
          {[
            { color: "#a855f7", w: "95%", delay: "0.1s" },
            { color: "#6366f1", w: "70%", delay: "0.3s" },
            { color: "var(--lagoon)", w: "40%", delay: "0.5s" },
            { color: "var(--gold)", w: "15%", delay: "0.7s" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "4px", alignItems: "center", padding: "3px 4px", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", animation: `fkFadeUp 0.4s ease forwards ${item.delay}`, opacity: 0 }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "3px", flexShrink: 0, background: `${item.color}4D`, border: `1px solid ${item.color}` }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                <div className="fk-text" style={{ width: "65%", background: "rgba(255,255,255,0.2)" }} />
                <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: item.w, borderRadius: "2px", background: item.color, animation: `fkGrow 1.2s ease forwards ${parseFloat(item.delay) + 0.2}s`, transformOrigin: "left" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FK>
  );
}
