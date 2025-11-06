"use client";
import React, { useEffect, useState } from "react";
import { useEditMode } from "@/components/EditModeContext";

type Props = {
  id: string;
  defaultText: string;
  as?: React.ElementType;
  className?: string;
};

export default function ContentBlock({ id, defaultText, as = "p", className }: Props) {
  const { editMode } = useEditMode();
  const [text, setText] = useState(defaultText);
  const Tag = as as any;

  // Initial load: try server, fall back to localStorage or default
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/content?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && typeof data.text === "string" && data.text.length > 0) {
            setText(data.text);
            localStorage.setItem(`content:${id}`, data.text);
            return;
          }
        }
      } catch {}
      const saved = localStorage.getItem(`content:${id}`);
      if (!cancelled && saved !== null) setText(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Debounced auto-save to server and localStorage when editing
  useEffect(() => {
    localStorage.setItem(`content:${id}`, text);
    if (!editMode) return;
    const t = setTimeout(() => {
      fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [id, text, editMode]);

  if (editMode) {
    return (
      <div className={className}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded border border-zinc-300 p-2 text-zinc-800"
          rows={Math.max(2, Math.min(8, Math.ceil(text.length / 80)))}
        />
      </div>
    );
  }

  return <Tag className={className}>{text}</Tag>;
}