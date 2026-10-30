/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlumnosLogoFull } from "./AlumnosIcon";

interface LogoProps {
  /**
   * "negativo": para barra lateral navy sólida o temas oscuros
   * "marca": para superficies claras
   */
  variant?: "negativo" | "marca";
  className?: string;
  height?: number;
}

/**
 * Componente oficial de logotipo institucional ISFDyT N° 26 (A7)
 * Carga alumnos-logo-negativo.png o alumnos-logo-marca.png completo,
 * con object-fit: contain y sin texto adicional por separado ya que
 * el propio imagotipo contiene la palabra ALUMNOS.
 */
export const Logo: React.FC<LogoProps> = ({
  variant = "negativo",
  className = "",
  height = 56,
}) => {
  const [imageError, setImageError] = useState(false);
  const isDark = variant === "negativo";
  const imageSrc = isDark
    ? "/JULIAN/assets/brand/alumnos-logo-negativo.png"
    : "/JULIAN/assets/brand/alumnos-logo-marca.png";

  if (imageError) {
    // Respaldo vectorial idéntico si el navegador no puede renderizar el binario
    return (
      <AlumnosLogoFull
        variant={variant}
        iconSize={Math.max(32, height - 16)}
        className={className}
        showSubtitle={true}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt="Alumnos · ISFDyT N° 26"
      className={`object-contain transition-opacity duration-150 ${className}`}
      style={{ height: `${height}px`, width: "auto", maxWidth: "100%" }}
      onError={() => setImageError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
