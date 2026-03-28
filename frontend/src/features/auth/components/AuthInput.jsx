import React, { useId } from "react";

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
  name,
  inputMode,
}) {
  const autoId = useId();
  const id = name || autoId;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-white/80"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/40",
          "border-white/10 outline-none transition",
          "focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/15",
          "hover:border-white/20",
          error
            ? "border-rose-400/60 focus:border-rose-300/70 focus:ring-rose-300/15"
            : "",
        ].join(" ")}
      />
      {error ? (
        <p id={describedBy} className="mt-2 text-sm text-rose-200/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}

