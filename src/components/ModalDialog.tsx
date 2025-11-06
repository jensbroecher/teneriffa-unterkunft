"use client";
import React from "react";

type ModalDialogProps = {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  kind?: "info" | "success" | "error" | "warning";
  onClose?: () => void;
  actions?: Array<{ label: string; onClick: () => void; variant?: "primary" | "secondary" | "danger" }>;
};

export default function ModalDialog({ open, title, message, kind = "info", onClose, actions }: ModalDialogProps) {
  if (!open) return null;
  const border = kind === "error" ? "border-red-500" : kind === "success" ? "border-emerald-600" : kind === "warning" ? "border-amber-500" : "border-zinc-300";
  const titleColor = kind === "error" ? "text-red-700" : kind === "success" ? "text-emerald-700" : kind === "warning" ? "text-amber-700" : "text-zinc-900";
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md rounded-xl border ${border} bg-white/95 p-5 shadow-xl backdrop-blur-lg`}
      >
        {title && <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>}
        {message && <div className="mt-2 text-sm text-zinc-800">{message}</div>}
        <div className="mt-4 flex justify-end gap-2">
          {actions && actions.length > 0 ? (
            actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className={`rounded px-4 py-2 text-sm shadow-sm ${
                  a.variant === "primary"
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : a.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-white/40 bg-white/80 text-zinc-900 hover:bg-white"
                }`}
              >
                {a.label}
              </button>
            ))
          ) : (
            <button onClick={onClose} className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800">
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}