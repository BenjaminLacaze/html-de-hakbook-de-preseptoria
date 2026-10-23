import React, { useState } from 'react';
import { useTheme } from '../../lib/themeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Check,
  Save,
  Lock,
  Smartphone,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences } = useTheme();
  const [saveToast, setSaveToast] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(preferences.emailNotifications);
  const [pushNotifs, setPushNotifs] = useState(preferences.pushNotifications);
  const [reducedMotion, setReducedMotion] = useState(preferences.reducedMotion);
  const [compactMode, setCompactMode] = useState(preferences.compactMode);

  const handleSavePreferences = () => {
    updatePreferences({
      emailNotifications: emailNotifs,
      pushNotifications: pushNotifs,
      reducedMotion,
      compactMode,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-primary-custom tracking-tight">
          Opciones & Preferencias de Usuario
        </h2>
        <p className="text-xs text-secondary-custom mt-0.5">
          Configuración local de la cuenta, notificaciones y accesibilidad
        </p>
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-[var(--radius-current)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Preferencias actualizadas y guardadas localmente con éxito.</span>
        </div>
      )}

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
            Notificaciones Académicas
          </CardTitle>
          <p className="text-xs text-secondary-custom">
            Elegí qué alertas querés recibir en tu correo o en tu dispositivo
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-xs">
            <label className="flex items-start justify-between gap-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary-custom block">
                  Publicación de calificaciones oficiales
                </span>
                <span className="text-secondary-custom block">
                  Aviso inmediato cuando una cátedra carga notas de parciales o trabajos prácticos.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs.notasPublicadas}
                onChange={(e) =>
                  setEmailNotifs((prev) => ({ ...prev, notasPublicadas: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] mt-1"
              />
            </label>

            <label className="flex items-start justify-between gap-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary-custom block">
                  Alertas de inasistencias y umbrales de faltas
                </span>
                <span className="text-secondary-custom block">
                  Aviso cuando acumulás inasistencias cercanas al límite del 75%.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs.ausenciasRegistradas}
                onChange={(e) =>
                  setEmailNotifs((prev) => ({ ...prev, ausenciasRegistradas: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] mt-1"
              />
            </label>

            <label className="flex items-start justify-between gap-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary-custom block">
                  Fechas de examen y entregas
                </span>
                <span className="text-secondary-custom block">
                  Recordatorios 48 hs antes de cada parcial programado.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs.fechasExamen}
                onChange={(e) =>
                  setEmailNotifs((prev) => ({ ...prev, fechasExamen: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] mt-1"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility & Interface Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
            Accesibilidad & Comportamiento Visual
          </CardTitle>
          <p className="text-xs text-secondary-custom">
            Ajustes para mejorar la comodidad visual y el rendimiento
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-xs">
            <label className="flex items-start justify-between gap-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary-custom block">
                  Reducción de movimiento (prefers-reduced-motion)
                </span>
                <span className="text-secondary-custom block">
                  Desactiva transiciones complejas y efectos animados para evitar mareos o fatiga.
                </span>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] mt-1"
              />
            </label>

            <label className="flex items-start justify-between gap-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary-custom block">
                  Modo de información compacta
                </span>
                <span className="text-secondary-custom block">
                  Reduce espaciados en tablas y listados para visualizar más filas por pantalla.
                </span>
              </div>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] mt-1"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Status (Honest info) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
            Seguridad & Sesión
          </CardTitle>
          <p className="text-xs text-secondary-custom">
            Estado de autenticación del dispositivo actual
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-primary-custom block">Navegador Web Actual</span>
                <span className="text-[11px] text-secondary-custom">Sesión de demostración para Alex Estudiante</span>
              </div>
            </div>
            <Badge variant="success">Activa</Badge>
          </div>

          <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/40 border border-subtle-custom text-[11px] text-muted-custom flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              La gestión de contraseñas y doble factor (2FA) se delega al servidor institucional central.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Save Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="primary" size="md" onClick={handleSavePreferences}>
          <Save className="w-4 h-4" />
          <span>Guardar Preferencias</span>
        </Button>
      </div>
    </div>
  );
};
