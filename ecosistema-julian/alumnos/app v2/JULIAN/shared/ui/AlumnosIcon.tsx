import React from "react";

interface AlumnosIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: "negativo" | "marca" | "monochrome";
  className?: string;
}

/**
 * Ícono oficial "Alumnos" (ISFDyT N° 26)
 * Emblema vectorial fiel al video de transición de marca:
 * Letra 'A' con remates tipográficos institucionales combinada con el libro abierto
 * en perspectiva sobre la rama izquierda y páginas curvadas en dorado ocre.
 */
export const AlumnosIcon: React.FC<AlumnosIconProps> = ({
  size = 32,
  variant = "marca",
  className = "",
  ...props
}) => {
  // Paleta oficial
  const navyColor = variant === "negativo" ? "#FFFFFF" : variant === "monochrome" ? "currentColor" : "#14214F";
  const goldColor = variant === "negativo" ? "#AF9B63" : variant === "monochrome" ? "currentColor" : "#89743A";
  const pageBg = variant === "negativo" ? "rgba(255,255,255,0.9)" : "#FFFFFF";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-label="Emblema Alumnos - ISFDyT N° 26"
      {...props}
    >
      {/* 1. Letra 'A' institucional con serifs estilizados */}
      <g id="letter-A">
        {/* Pierna derecha, vértice y travesaño */}
        <path
          d="M 46 14 
             L 54 14 
             L 76 78 
             L 86 78 
             L 86 82 
             L 60 82 
             L 60 78 
             L 68 78 
             L 61.5 56 
             L 42 56 
             L 42 49 
             L 60 49 
             L 51 22 
             Z"
          fill={navyColor}
        />
        {/* Vértice superior serif */}
        <rect x="44" y="11" width="12" height="3.5" rx="1" fill={navyColor} />
      </g>

      {/* 2. Libro abierto institucional (apoyado en la rama izquierda de la 'A') */}
      <g id="open-book" transform="rotate(-6 35 50)">
        {/* Lomo exterior del libro */}
        <path
          d="M 16 38
             C 24 39, 32 41, 35 44
             C 38 41, 46 39, 54 38
             L 54 74
             C 46 75, 38 77, 35 80
             C 32 77, 24 75, 16 74
             Z"
          fill={navyColor}
        />

        {/* Interior de las páginas abiertas (contraste blanco/perla) */}
        <path
          d="M 18 41
             C 25 42, 32 43.5, 34.5 46
             L 34.5 77
             C 32 74.5, 25 73, 18 72
             Z"
          fill={pageBg}
        />
        <path
          d="M 52 41
             C 45 42, 38 43.5, 35.5 46
             L 35.5 77
             C 38 74.5, 45 73, 52 72
             Z"
          fill={pageBg}
        />

        {/* Hojas y líneas de páginas en Dorado Ocre oficial (#89743A / #AF9B63) */}
        <path
          d="M 18 70
             C 25 71, 32 72.5, 35 75
             C 38 72.5, 45 71, 52 70"
          stroke={goldColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 20 64
             C 26 65, 31 66, 34 68
             C 37 66, 42 65, 48 64"
          stroke={goldColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 22 58
             C 27 59, 31 60, 34 61.5
             C 37 60, 41 59, 46 58"
          stroke={goldColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 1"
        />

        {/* Lomo central de encuadernación */}
        <line
          x1="35"
          y1="44"
          x2="35"
          y2="78"
          stroke={navyColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

interface AlumnosLogoFullProps {
  variant?: "negativo" | "marca";
  iconSize?: number;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Logotipo institucional completo "ALUMNOS · ISFDyT N° 26"
 * Combina el emblema del libro y la 'A' con la tipografía oficial.
 */
export const AlumnosLogoFull: React.FC<AlumnosLogoFullProps> = ({
  variant = "marca",
  iconSize = 36,
  className = "",
  showSubtitle = true,
}) => {
  const isDark = variant === "negativo";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <AlumnosIcon size={iconSize} variant={variant} />
      <div className="flex flex-col text-left leading-none">
        <span
          className={`font-black text-base sm:text-lg tracking-[0.14em] uppercase ${
            isDark ? "text-white" : "text-[#14214F]"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          ALUMNOS
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-[0.2em] uppercase font-bold mt-0.5 ${
              isDark ? "text-[#AF9B63]" : "text-[#89743A]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ISFDyT N° 26
          </span>
        )}
      </div>
    </div>
  );
};
