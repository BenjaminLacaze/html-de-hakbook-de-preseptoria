import React from 'react';

interface FamiliasBrandIconProps {
  variant?: 'dark' | 'light' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withContainer?: boolean;
}

export const FamiliasBrandIcon: React.FC<FamiliasBrandIconProps> = ({
  variant = 'auto',
  size = 'md',
  className = '',
  withContainer = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  // icon-dark tiene fondo navy (#14214F), letras blancas y puntos dorados
  // icon-light tiene fondo blanco (#FFFFFF), letras navy y puntos dorados
  // BASE_URL: el panel se publica en su propio dominio ("/") y también dentro del
  // sitio del equipo ("/ecosistema-julian-lucia/familias/"). Sin este prefijo, las
  // imágenes dan 404 en el sitio del equipo.
  const base = import.meta.env.BASE_URL;
  const imageSrc =
    variant === 'dark'
      ? `${base}assets/familias/icon-dark.png`
      : variant === 'light'
      ? `${base}assets/familias/icon-light.png`
      : `${base}assets/familias/icon-dark.png`;

  const imgElement = (
    <img
      src={imageSrc}
      alt="Logo Familias"
      className={`${sizeClasses} object-contain rounded-xl select-none ${className}`}
      loading="eager"
    />
  );

  if (withContainer) {
    return (
      <div
        className={`${sizeClasses} rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 border border-[#89743A]/40 bg-[#14214F]`}
      >
        {imgElement}
      </div>
    );
  }

  return imgElement;
};
