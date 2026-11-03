import React, { createContext, useContext, useEffect, useState } from "react";
import { AppTheme } from "../types";

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  availableThemes: { id: AppTheme; name: string; description: string; colors: string[] }[];
}

export const THEME_LIST: { id: AppTheme; name: string; description: string; colors: string[] }[] = [
  {
    id: "celestial",
    name: "Celestial (Predeterminado)",
    description: "Lienzo blanco frío con azul institucional y dorado ocre oficial del manual.",
    colors: ["#F8FAFD", "#14214F", "#89743A", "#3F78B6"],
  },
  {
    id: "oscuro",
    name: "Oscuro",
    description: "Navy profundo con superficies de alto contraste, arena dorada y logo en negativo.",
    colors: ["#0B122B", "#14214F", "#AF9B63", "#3F78B6"],
  },
  {
    id: "ensoniacion",
    name: "Ensoñación",
    description: "Superficies suaves y atmósfera luminosa con matices de cielo y arena dorada.",
    colors: ["#F4F7FC", "#22376E", "#3F78B6", "#AF9B63"],
  },
  {
    id: "moderno",
    name: "Moderno",
    description: "Geometría nítida de alto contraste con navy estricto y dorado ocre puro.",
    colors: ["#FFFFFF", "#101B40", "#89743A", "#4B5563"],
  },
  {
    id: "fantasma",
    name: "Fantasma",
    description: "Baja saturación mineral fría con contraste de tinta institucional y acentos sutiles.",
    colors: ["#F1F4F8", "#29385C", "#55678B", "#CBD5E1"],
  },
  {
    id: "rebelde",
    name: "Rebelde",
    description: "Contraste dinámico y expresivo con arena dorada viva sobre navy medianoche.",
    colors: ["#0E1838", "#253C7D", "#D4AF37", "#60A5FA"],
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // 1. Verificar localStorage
    const saved = localStorage.getItem("isfd26_theme") as AppTheme | null;
    if (saved && THEME_LIST.some((t) => t.id === saved)) {
      return saved;
    }
    // 2. Fallback según prefers-color-scheme
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "oscuro";
    }
    return "celestial";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Para dark mode variant de Tailwind
    if (theme === "oscuro" || theme === "rebelde") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("isfd26_theme", theme);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEME_LIST }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme debe utilizarse dentro de ThemeProvider");
  }
  return context;
};
