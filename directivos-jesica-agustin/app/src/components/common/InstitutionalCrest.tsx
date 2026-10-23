import React from 'react';

interface Props {
  className?: string;
  size?: number;
  monochrome?: boolean;
}

export const InstitutionalCrest: React.FC<Props> = ({
  className = '',
  size = 40,
  monochrome = false,
}) => {
  const gold = monochrome ? 'currentColor' : '#89743A';
  const navy = monochrome ? 'currentColor' : '#14214F';
  const goldBright = monochrome ? 'currentColor' : '#D4C08A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Escudo Oficial ISFDyT N° 26"
    >
      {/* Outer shield contour */}
      <path
        d="M50 4L88 18V50C88 73.2 71.8 91.5 50 96C28.2 91.5 12 73.2 12 50V18L50 4Z"
        fill={navy}
        stroke={gold}
        strokeWidth="2.5"
      />
      {/* Inner decorative rim */}
      <path
        d="M50 11L81 22.5V49C81 68.8 67.8 84.8 50 89C32.2 84.8 19 68.8 19 49V22.5L50 11Z"
        fill="none"
        stroke={goldBright}
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      {/* Open book / laurel / torch motif */}
      <path
        d="M50 30L68 38V62L50 54L32 62V38L50 30Z"
        fill="none"
        stroke={goldBright}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="30"
        x2="50"
        y2="54"
        stroke={goldBright}
        strokeWidth="1.8"
      />
      {/* Roman/Arabic numeral 26 */}
      <text
        x="50"
        y="75"
        textAnchor="middle"
        fill={goldBright}
        fontSize="14"
        fontFamily="'Tenor Sans', Georgia, serif"
        fontWeight="bold"
        letterSpacing="1"
      >
        N° 26
      </text>
      {/* Subtle star of excellence */}
      <polygon
        points="50,21 52,26 57,26 53,29 55,34 50,31 45,34 47,29 43,26 48,26"
        fill={goldBright}
      />
    </svg>
  );
};
