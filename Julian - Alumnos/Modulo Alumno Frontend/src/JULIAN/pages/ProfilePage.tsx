import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Mail,
  ShieldCheck,
  FileText,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  HelpCircle,
  Send,
  CheckCircle2
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';

export const ProfilePage: React.FC = () => {
  const { student, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [correctionNote, setCorrectionNote] = useState('');
  const [requestedCorrection, setRequestedCorrection] = useState(false);

  const handleRequestCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionNote.trim()) return;
    setRequestedCorrection(true);
    setTimeout(() => {
      setCorrectionNote('');
      setRequestedCorrection(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 lg:p-8 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={student.avatarUrl}
            alt={student.fullName}
            referrerPolicy="no-referrer"
            className={`w-24 h-24 lg:w-28 lg:h-28 object-cover border-2 shadow-xs shrink-0 ${radius.card}`}
            style={{ borderColor: themeColors.accentGold }}
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span
                style={{
                  backgroundColor: themeColors.positiveBg,
                  color: themeColors.positiveText,
                  borderColor: themeColors.positiveBorder
                }}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {student.status}
              </span>
              <span
                style={{
                  backgroundColor: themeColors.accentSurface,
                  color: themeColors.accentText
                }}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono tabular-nums"
              >
                Legajo: {student.legajo}
              </span>
            </div>

            <h1
              style={{ color: themeColors.textPrimary }}
              className="text-2xl lg:text-3xl font-extrabold tracking-tight"
            >
              {student.fullName}
            </h1>

            <p style={{ color: themeColors.textSecondary }} className="text-xs sm:text-sm">
              {student.career} · {student.institution}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs" style={{ color: themeColors.textMuted }}>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {student.email}
              </span>
              <span>·</span>
              <span>DNI: {student.dni}</span>
              <span>·</span>
              <span>Cohorte {student.cohort}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Academic vs Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Academic Data */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h2 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
              Información Académica Institucional
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Carrera:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold text-right max-w-xs">
                {student.career}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Plan de Estudios:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.plan}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Año de Cursada y División:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.year}° Año · {student.division}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Turno Asignado:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.shift}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Preceptora Asignada:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.tutorPreceptor}
              </span>
            </div>

            <div className="flex justify-between py-1.5" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Contacto Preceptoría:</span>
              <span style={{ color: themeColors.accentGold }} className="font-semibold">
                {student.preceptorEmail}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Personal & Emergency Data */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
            <User className="w-5 h-5 text-blue-500" />
            <h2 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
              Datos Personales y Contacto
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Nombre Completo:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.fullName}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Documento Nacional de Identidad:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold tabular-nums">
                {student.dni}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Correo Electrónico Institucional:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.email}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Domicilio Declarado:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.address}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Contacto de Emergencia:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                {student.emergencyContact.name} ({student.emergencyContact.relationship})
              </span>
            </div>

            <div className="flex justify-between py-1.5" style={{ borderColor: themeColors.borderSubtle }}>
              <span style={{ color: themeColors.textMuted }}>Teléfono de Emergencia:</span>
              <span style={{ color: themeColors.textPrimary }} className="font-semibold tabular-nums">
                {student.emergencyContact.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mechanism to Request Data Correction */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border ${radius.card} space-y-4`}
      >
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
              ¿Detectaste algún dato incorrecto en tu legajo?
            </h3>
            <p style={{ color: themeColors.textSecondary }} className="text-xs mt-1 leading-relaxed">
              Por razones de seguridad registral y validez ministerial, los datos académicos y filiatorios oficiales
              son gestionados exclusivamente por la Secretaría del Instituto 26. Podés solicitar una rectificación o actualización aquí:
            </p>
          </div>
        </div>

        {requestedCorrection ? (
          <div
            style={{
              backgroundColor: themeColors.positiveBg,
              borderColor: themeColors.positiveBorder,
              color: themeColors.positiveText
            }}
            className={`p-4 border flex items-center gap-3 text-xs ${radius.inner}`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ¡Solicitud recibida! Se generó el ticket de rectificación registral. Secretaría revisará tu constancia.
            </span>
          </div>
        ) : (
          <form onSubmit={handleRequestCorrection} className="space-y-3">
            <textarea
              rows={2}
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="Describí el dato que requiere corrección (ej. cambio de domicilio, actualización de correo, error en DNI)..."
              style={{
                backgroundColor: themeColors.bgPage,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`w-full p-3 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!correctionNote.trim()}
                style={{
                  backgroundColor: themeColors.accentGold,
                  color: '#FFFFFF'
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50 ${radius.button}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Solicitud a Secretaría</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
