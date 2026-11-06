import React, { useState } from 'react';

interface Props {
  className?: string;
  size?: number;
  monochrome?: boolean;
  alt?: string;
}

export const InstitutionalCrest: React.FC<Props> = ({
  className = '',
  size = 40,
  monochrome = false,
  alt = 'Emblema Directivo - Sistema Educativo',
}) => {
  const [loadError, setLoadError] = useState(false);

  if (loadError) {
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
        aria-label={alt}
      >
        <circle cx="50" cy="50" r="46" fill={navy} stroke={gold} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={goldBright} strokeWidth="1.2" />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill={goldBright}
          fontSize="14"
          fontFamily="'Tenor Sans', Georgia, serif"
          fontWeight="bold"
        >
          N° 26
        </text>
      </svg>
    );
  }

  return (
    <img
      src="/assets/logo_directivo.png"
      alt={alt}
      width={size}
      height={size}
      onError={() => setLoadError(true)}
      className={`shrink-0 object-contain rounded-full select-none ${monochrome ? 'grayscale brightness-125' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="eager"
      decoding="async"
    />
  );
};
