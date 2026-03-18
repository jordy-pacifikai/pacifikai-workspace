"use client";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
}

export default function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  textarea = false,
  rows = 4,
}: FloatingInputProps) {
  const baseClass = "float-label-group";

  if (textarea) {
    return (
      <div className={baseClass}>
        <textarea
          id={id}
          name={id}
          placeholder=" "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          className="resize-none"
        />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }

  return (
    <div className={baseClass}>
      <input
        id={id}
        name={id}
        type={type}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
