import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Shield,
  Mail,
  Clock,
  Search,
  MessageSquare,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { CommunityMember } from '../types';

export const CommunityPage: React.FC = () => {
  const { community, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [activeTab, setActiveTab] = useState<'todos' | 'docentes' | 'preceptoria' | 'companeros'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageTarget, setMessageTarget] = useState<CommunityMember | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const filteredMembers = community.filter((m) => {
    const matchTab =
      activeTab === 'todos' ||
      (activeTab === 'docentes' && m.role === 'Docente') ||
      (activeTab === 'preceptoria' && m.role === 'Preceptor') ||
      (activeTab === 'companeros' && m.role === 'Compañero');

    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.roleDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.commission.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTab && matchSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessageTarget(null);
      setMessageText('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Comunidad Educativa · Instituto 26
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Docentes, Preceptoría y Compañeros
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Directorio de contacto institucional autorizado y horarios de consulta académica
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o cátedra..."
              style={{
                backgroundColor: themeColors.bgPage,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`w-full pl-9 pr-3 py-2 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'todos', label: 'Todos los integrantes' },
          { id: 'docentes', label: 'Cuerpo Docente' },
          { id: 'preceptoria', label: 'Preceptoría y Bedelía' },
          { id: 'companeros', label: 'Compañeros de Cursada' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              backgroundColor: activeTab === tab.id ? themeColors.accentGold : themeColors.bgCard,
              color: activeTab === tab.id ? '#FFFFFF' : themeColors.textSecondary,
              borderColor: activeTab === tab.id ? themeColors.accentGold : themeColors.borderSubtle
            }}
            className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${radius.button}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-5 border ${radius.card} flex flex-col justify-between gap-4`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    style={{
                      backgroundColor:
                        member.role === 'Docente'
                          ? themeColors.accentSurface
                          : member.role === 'Preceptor'
                          ? themeColors.warningBg
                          : themeColors.bgSubtle,
                      color:
                        member.role === 'Docente'
                          ? themeColors.accentText
                          : member.role === 'Preceptor'
                          ? themeColors.warningText
                          : themeColors.textMuted
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  >
                    {member.role}
                  </span>
                  <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold mt-1">
                    {member.name}
                  </h3>
                  <p style={{ color: themeColors.textSecondary }} className="text-xs">
                    {member.roleDetail}
                  </p>
                </div>

                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{
                    backgroundColor: member.status === 'Disponible' ? '#22C55E' : '#EAB308'
                  }}
                  title={member.status}
                />
              </div>

              <div className="space-y-1.5 text-xs pt-1 border-t" style={{ borderColor: themeColors.borderSubtle }}>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.institutionalEmail}</span>
                </div>

                {member.officeHours && (
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">Consulta: {member.officeHours}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setMessageTarget(member)}
              style={{
                backgroundColor: themeColors.bgSubtle,
                color: themeColors.textPrimary,
                borderColor: themeColors.borderSubtle
              }}
              className={`w-full py-2 px-3 text-xs font-semibold border flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors ${radius.button}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Enviar Mensaje de Demostración</span>
            </button>
          </div>
        ))}
      </div>

      {/* Message Modal Demo */}
      {messageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`w-full max-w-md border p-6 shadow-2xl relative ${radius.card}`}
          >
            <button
              onClick={() => setMessageTarget(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Cerrar modal de mensaje"
            >
              <X className="w-5 h-5" />
            </button>

            {sentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
                  Consulta de demostración enviada
                </h4>
                <p style={{ color: themeColors.textMuted }} className="text-xs">
                  Este mensaje se registró en el entorno local del prototipo para evaluación de interfaz.
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold mb-1">
                  Contactar a {messageTarget.name}
                </h3>
                <p style={{ color: themeColors.textMuted }} className="text-xs mb-3">
                  {messageTarget.roleDetail} · Correo: {messageTarget.institutionalEmail}
                </p>

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escribí tu consulta académica o solicitud de reunión de consulta..."
                    style={{
                      backgroundColor: themeColors.bgPage,
                      borderColor: themeColors.borderSubtle,
                      color: themeColors.textPrimary
                    }}
                    className={`w-full p-3 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageTarget(null)}
                      style={{
                        backgroundColor: themeColors.bgSubtle,
                        color: themeColors.textSecondary
                      }}
                      className={`px-3 py-1.5 text-xs font-medium ${radius.button}`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      style={{
                        backgroundColor: themeColors.accentGold,
                        color: '#FFFFFF'
                      }}
                      className={`px-4 py-1.5 text-xs font-semibold disabled:opacity-50 ${radius.button}`}
                    >
                      Enviar Mensaje
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
