import React, { useEffect } from 'react';
import { X, MagnifyingGlassPlus, MagnifyingGlassMinus } from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';

export const PhotoViewerModal: React.FC = () => {
  const { activePhotoViewerUrl, setActivePhotoViewerUrl } = useAuxiliares();
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhotoViewerUrl(null);
      }
    };
    if (activePhotoViewerUrl) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activePhotoViewerUrl, setActivePhotoViewerUrl]);

  if (!activePhotoViewerUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotografía de incidencia"
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 backdrop-blur-xs"
    >
      {/* Top bar */}
      <div className="w-full flex items-center justify-between text-white max-w-4xl py-2">
        <span className="text-sm font-medium text-slate-300">
          Evidencia fotográfica · Incidencia
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            className="touch-target p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            aria-label={isZoomed ? 'Reducir tamaño' : 'Ampliar tamaño'}
          >
            {isZoomed ? <MagnifyingGlassMinus size={24} /> : <MagnifyingGlassPlus size={24} />}
          </button>
          <button
            type="button"
            onClick={() => setActivePhotoViewerUrl(null)}
            className="touch-target p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Cerrar visor"
          >
            <X size={26} />
          </button>
        </div>
      </div>

      {/* Main image container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-2">
        <img
          src={activePhotoViewerUrl}
          alt="Detalle de la incidencia"
          className={`rounded-lg object-contain transition-transform duration-200 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[80vh] max-w-full cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed((z) => !z)}
        />
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Tocá la imagen para ampliar o reducir · Presioná Esc para salir
      </div>
    </div>
  );
};
