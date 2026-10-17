import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Mail,
  GraduationCap,
  BookOpen,
  Shield,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { communityService } from '../../services/communityService';
import type { CommunityMember } from '../../types';

export const CommunityView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('todos');

  const { data: members, isLoading } = useQuery({
    queryKey: ['communityMembers'],
    queryFn: () => communityService.getMembers(),
  });

  const roleTabs = [
    { id: 'todos', label: 'Toda la Comunidad' },
    { id: 'Compañero', label: 'Compañeros de Cursada' },
    { id: 'Docente', label: 'Docentes de Cátedra' },
    { id: 'Preceptor', label: 'Preceptoría & Coordinación' },
  ];

  const filteredMembers = members?.filter((m) => {
    const matchesRole =
      selectedRole === 'todos' ||
      (selectedRole === 'Preceptor' ? m.rol === 'Preceptor' || m.rol === 'Coordinador' : m.rol === selectedRole);

    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.carrera.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  }) || [];

  const getRoleBadgeVariant = (rol: CommunityMember['rol']) => {
    switch (rol) {
      case 'Docente':
        return 'info';
      case 'Preceptor':
      case 'Coordinador':
        return 'gold';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Comunidad Educativa
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Canales institucionales y contactos autorizados de la comisión 2° A
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar por nombre o carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <Tabs tabs={roleTabs} activeTab={selectedRole} onChange={setSelectedRole} />

      {/* Privacy Notice */}
      <div className="p-3.5 rounded-[var(--radius-current)] border border-subtle-custom bg-[var(--bg-surface-elevated)]/50 text-xs text-secondary-custom flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Privacidad académica: solo se exhiben casillas de correo institucional autorizadas y miembros de la misma cohorte.
          </span>
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-muted-custom" />}
          title="No se encontraron miembros"
          description="Probá ajustando el término de búsqueda o cambiando el filtro de rol."
          actionText="Ver todos"
          onAction={() => {
            setSearchTerm('');
            setSelectedRole('todos');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-5 flex flex-col justify-between hover:border-strong-custom transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center shrink-0 border border-subtle-custom">
                      {member.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-primary-custom leading-tight">
                        {member.nombre}
                      </h3>
                      <span className="text-[11px] text-secondary-custom block mt-0.5">
                        {member.comision}
                      </span>
                    </div>
                  </div>

                  <Badge variant={getRoleBadgeVariant(member.rol)}>
                    {member.rol}
                  </Badge>
                </div>

                {member.materiasCompartidas && member.materiasCompartidas.length > 0 && (
                  <div className="text-[11px] text-secondary-custom">
                    <span className="text-muted-custom block mb-1">Materias en común:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.materiasCompartidas.map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-subtle-custom text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-subtle-custom flex items-center justify-between text-xs">
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 text-secondary-custom hover:text-primary-custom transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-custom shrink-0" />
                  <span className="truncate text-[11px] font-mono">{member.email}</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
