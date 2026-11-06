import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Power,
  Shield,
  Phone,
  Mail,
  IdCard,
  X,
  AlertCircle,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, activeUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDni, setFormDni] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('DOCENTE');
  const [formStatus, setFormStatus] = useState<UserStatus>('ACTIVO');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormDni('');
    setFormPhone('');
    setFormRole('DOCENTE');
    setFormStatus('ACTIVO');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormDni(user.dni);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formDni.trim()) {
      setFormError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    // Check duplicate email
    const duplicateEmail = users.find(
      (u) =>
        u.email.toLowerCase() === formEmail.trim().toLowerCase() &&
        u.id !== editingUser?.id
    );
    if (duplicateEmail) {
      setFormError('Ya existe un usuario con este correo electrónico institucional.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        dni: formDni.trim(),
        phone: formPhone.trim(),
        role: formRole,
        status: formStatus,
      });
    } else {
      addUser({
        name: formName.trim(),
        email: formEmail.trim(),
        dni: formDni.trim(),
        phone: formPhone.trim(),
        role: formRole,
        status: formStatus,
        lastLogin: 'Nunca',
      });
    }

    setIsModalOpen(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.dni.includes(searchQuery);

      const matchesRole = roleFilter === 'TODOS' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'TODOS' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const roleDescriptions: Record<UserRole, string> = {
    DIRECTIVO: 'Acceso irrestricto, resoluciones, supervisión académica y administración general',
    VICEDIRECTOR: 'Supervisión de planes pedagógicos, horarios y reemplazos directivos',
    SECRETARIA: 'Expedición de títulos, carga de matrícula formal, actas y libros matrices',
    PRECEPTORIA: 'Registro diario de inasistencias, control de partes y asistencia de cursos',
    DOCENTE: 'Carga de notas trimestrales, planificaciones y trayectorias formativas',
    ORIENTACION_ESCOLAR: 'Informes de acompañamiento psicosocial y trayectorias vulnerables',
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Estructura de Personal y Permisos
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Gestión de Usuarios Institucionales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración de cuentas, perfiles de acceso y estado del personal educativo del ISFDyT N.° 26.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#D4C08A]" />
          <span>Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por apellido, nombre, email o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F] focus:ring-1 focus:ring-[#14214F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Rol:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODOS">Todos los roles ({users.length})</option>
            <option value="DIRECTIVO">Equipo Directivo</option>
            <option value="VICEDIRECTOR">Vicedirección</option>
            <option value="SECRETARIA">Secretaría</option>
            <option value="PRECEPTORIA">Preceptoría</option>
            <option value="DOCENTE">Docente</option>
            <option value="ORIENTACION_ESCOLAR">Orientación Escolar</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
            <span>Estado:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODOS">Todos</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredUsers.length} de {users.length} usuarios registrados</span>
          <span className="font-mono text-[11px]">Personal verificado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Usuario / Personal</th>
                <th className="py-2.5 px-4 font-semibold">DNI & Contacto</th>
                <th className="py-2.5 px-4 font-semibold">Rol Asignado</th>
                <th className="py-2.5 px-4 font-semibold">Estado</th>
                <th className="py-2.5 px-4 font-semibold">Último Acceso</th>
                <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron usuarios que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 tabular-nums">DNI {user.dni}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {user.phone || 'Sin registrar'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#14214F]">{user.role}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[220px]">
                        {roleDescriptions[user.role]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.status === 'ACTIVO' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] tabular-nums">
                      {user.lastLogin}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-600 hover:text-[#14214F] hover:bg-slate-100 rounded transition-colors"
                          title="Editar información de usuario"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-1.5 rounded transition-colors ${
                            user.status === 'ACTIVO'
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'ACTIVO' ? 'Desactivar cuenta' : 'Activar cuenta'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingUser ? 'Modificar Usuario Institucional' : 'Alta de Nuevo Usuario'}
                </h3>
                <p className="text-xs text-[#D4C08A] mt-0.5">
                  ISFDyT N.° 26 · Registro oficial de autoridades y personal
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo y Título Académico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Prof. Marcelo Adrián Benítez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Documento Nacional de Identidad (DNI) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="25.432.109"
                    value={formDni}
                    onChange={(e) => setFormDni(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="2245-420911"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico Institucional (@isfdyt26.edu.ar o abc.gob.ar) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@isfdyt26.edu.ar"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rol Institucional *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs"
                  >
                    <option value="DIRECTIVO">Equipo Directivo</option>
                    <option value="VICEDIRECTOR">Vicedirección</option>
                    <option value="SECRETARIA">Secretaría</option>
                    <option value="PRECEPTORIA">Preceptoría</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="ORIENTACION_ESCOLAR">Orientación Escolar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs"
                  >
                    <option value="ACTIVO">Activo (Habilitado)</option>
                    <option value="INACTIVO">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Alcance de este rol: </span>
                {roleDescriptions[formRole]}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
