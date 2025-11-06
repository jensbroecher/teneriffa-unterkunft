"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type EditModeContextValue = {
  editMode: boolean;
  toggle: () => void;
  setEditMode: (v: boolean) => void;
  isAuthenticated: boolean;
  authenticate: (password: string) => Promise<boolean>;
};

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined
);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("edit-mode");
    if (saved) setEditMode(saved === "true");
    const auth = localStorage.getItem("edit-auth") === "true";
    setIsAuthenticated(auth);
  }, []);

  useEffect(() => {
    localStorage.setItem("edit-mode", String(editMode));
  }, [editMode]);

  const toggle = () => setEditMode((v) => !v);

  async function authenticate(password: string): Promise<boolean> {
    try {
      const res = await fetch("/api/edit/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const ok = !!data.ok;
      if (ok) {
        localStorage.setItem("edit-auth", "true");
        setIsAuthenticated(true);
      }
      return ok;
    } catch {
      return false;
    }
  }

  return (
    <EditModeContext.Provider value={{ editMode, toggle, setEditMode, isAuthenticated, authenticate }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used within EditModeProvider");
  return ctx;
}