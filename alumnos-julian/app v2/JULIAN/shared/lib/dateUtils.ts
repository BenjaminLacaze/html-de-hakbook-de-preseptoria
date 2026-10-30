/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Parsea de manera segura cadenas de fecha locales ("YYYY-MM-DD")
 * evitando el desplazamiento UTC a husos horarios de América/Argentina (UTC-3).
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Si contiene solo fecha YYYY-MM-DD
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0); // mediodía local seguro
  }

  return parseISO(dateStr);
}

/**
 * Formatea una fecha visible con estándar oficial del instituto: dd/MM/yyyy
 */
export function formatFecha(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy", { locale: es });
}

/**
 * Formatea fecha en formato largo legible: "16 de noviembre de 2026"
 */
export function formatFechaLarga(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (isNaN(d.getTime())) return "—";
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea fecha corta con mes abreviado: "16 nov"
 */
export function formatFechaCorta(date: string | Date | null | undefined): { dia: string; mes: string } {
  if (!date) return { dia: "--", mes: "---" };
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (isNaN(d.getTime())) return { dia: "--", mes: "---" };
  return {
    dia: format(d, "dd", { locale: es }),
    mes: format(d, "MMM", { locale: es }).replace(".", "").toUpperCase(),
  };
}

/**
 * Formato horario: HH:mm
 */
export function formatHora(timeStr: string): string {
  if (!timeStr) return "—";
  if (timeStr.length === 5) return timeStr; // ya viene como HH:mm
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return timeStr;
}
