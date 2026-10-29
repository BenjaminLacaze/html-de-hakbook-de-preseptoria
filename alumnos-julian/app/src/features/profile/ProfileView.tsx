import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  Save,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { studentService } from '../../services/studentService';

export const ProfileView: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: student, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentService.getProfile(),
  });

  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar datos iniciales una vez cargado
  React.useEffect(() => {
    if (student) {
      setEmail(student.email);
      setTelefono(student.telefono);
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: (data: { email: string; telefono: string }) => studentService.updateContactInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ email, telefono });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Summary */}
      <div className="rounded-[var(--radius-current)] border border-subtle-custom bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-subtle-custom flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            {student?.nombre[0]}{student?.apellido[0]}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary-custom tracking-tight">
                {student?.nombre} {student?.apellido}
              </h2>
              <Badge variant="success">Ficha institucional</Badge>
            </div>
            <p className="text-xs text-secondary-custom">
              Legajo Oficial: <strong className="font-mono text-primary-custom">{student?.legajo}</strong> · DNI {student?.dni}
            </p>
            <p className="text-xs text-muted-custom">
              {student?.institucion}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-secondary-custom">
          <span>Inscripción: <strong>{student?.fechaInscripcion}</strong></span>
          <span>Turno: <strong>{student?.turno}</strong></span>
          <span>Promedio General: <strong className="font-mono text-primary-custom">{student?.promedioGeneral?.toFixed(2) ?? 'Sin informar'}</strong></span>
        </div>
      </div>

      {/* Grid: Academic Information (Read-Only) vs Personal Information (Authorized Edition) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Information (Official & Read-Only) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[var(--accent-primary)]" />
                Información Académica Institucional
              </CardTitle>
              <Badge variant="outline">Oficial · Solo Lectura</Badge>
            </div>
            <p className="text-xs text-secondary-custom mt-1">
              Datos registrados en el Sistema Académico Central de la institución
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Carrera</span>
                <span className="font-bold text-primary-custom block">
                  {student?.carrera}
                </span>
                <span className="text-[11px] text-secondary-custom font-mono">
                  Código: {student?.codigoCarrera}
                </span>
              </div>

              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Plan de Estudios</span>
                <span className="font-bold text-primary-custom block">
                  {student?.planEstudio}
                </span>
                <span className="text-[11px] text-secondary-custom">
                  Resolución Ministerial vigente
                </span>
              </div>

              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Año y Cuatrimestre</span>
                <span className="font-bold text-primary-custom block">
                  {student?.anioCursada}° Año · Consultá el período de cada materia
                </span>
                <span className="text-[11px] text-secondary-custom">
                  Ciclo Lectivo 2026
                </span>
              </div>

              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Comisión Asignada</span>
                <span className="font-bold text-primary-custom block">
                  {student?.comision}
                </span>
                <span className="text-[11px] text-secondary-custom">
                  Sede Central - Aula 204
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/50 border border-subtle-custom flex items-center justify-between text-xs">
              <span className="text-secondary-custom">Condición de Matrícula:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{student?.estadoAcademico ?? 'Sin informar'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal & Contact Information (Editable with validation) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--accent-primary)]" />
                Datos Personales & Contacto
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" disabled title="La ficha institucional la actualiza Secretaría">
                  Modificar Contacto
                </Button>
              )}
            </div>
            <p className="text-xs text-secondary-custom mt-1">
              Canales autorizados para avisos institucionales y notificaciones
            </p>
          </CardHeader>
          <CardContent>
            {saveSuccess && (
              <div className="mb-4 p-3 rounded-[calc(var(--radius-current)-2px)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <Check className="w-4 h-4 shrink-0" />
                <span>Datos guardados.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo"
                  value={`${student?.nombre} ${student?.apellido}`}
                  disabled
                  helperText="Dato no modificable por el alumno"
                />
                <Input
                  label="Documento Nacional de Identidad"
                  value={student?.dni}
                  disabled
                  helperText="Verificado con constancia de RENAPER"
                />
              </div>

              <Input
                label="Correo Electrónico Institucional / Personal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                icon={<Mail className="w-4 h-4" />}
                required
                helperText={isEditing ? 'Se utilizará para notificaciones de notas y avisos' : undefined}
              />

              <Input
                label="Teléfono Móvil de Contacto"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={!isEditing}
                icon={<Phone className="w-4 h-4" />}
                required
                helperText={isEditing ? 'Incluir código de área sin 0 ni 15' : undefined}
              />

              {isEditing && (
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-subtle-custom">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-custom">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>La ficha institucional la actualiza Secretaría.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail(student?.email || '');
                        setTelefono(student?.telefono || '');
                        setIsEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={updateMutation.isPending}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
