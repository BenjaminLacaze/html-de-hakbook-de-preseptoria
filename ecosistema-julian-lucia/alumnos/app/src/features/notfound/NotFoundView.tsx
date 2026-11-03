import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-elevated)] border border-subtle-custom flex items-center justify-center text-[var(--accent-primary)] mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono text-muted-custom uppercase font-semibold">
            Error 404 · Ruta no encontrada
          </span>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Página Académica Inexistente
          </h2>
          <p className="text-xs text-secondary-custom leading-relaxed">
            La sección a la que intentás acceder no existe o fue reubicada en el plan de navegación del Panel de Alumno.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => navigate('/')} className="mx-auto">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Button>
      </Card>
    </div>
  );
};
