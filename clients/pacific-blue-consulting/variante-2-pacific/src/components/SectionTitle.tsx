type SectionTitleProps = {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export default function SectionTitle({
  label,
  title,
  description,
  align = "center",
  light = false,
}: SectionTitleProps) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {label && (
        <span
          className={`inline-block text-fluid-xs font-semibold uppercase tracking-[0.25em] mb-4 ${
            light ? "text-teal-300" : "text-teal"
          }`}
        >
          {label}
        </span>
      )}
      <h2
        className={`font-display text-fluid-4xl font-bold leading-[1.1] text-balance ${
          light ? "text-white" : "text-ocean"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 text-fluid-lg leading-relaxed ${
            light ? "text-white/60" : "text-slate"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
