import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadSimple,
  Trash,
  CheckCircle,
  WarningOctagon,
  Flame,
  Clock,
  ArrowRight,
  ArrowsClockwise,
  MapPin,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { IncidentPriority, SectorConditionOnReport } from '../types';
import { toast } from 'sonner';

/** Límite de la API para imageUrl (backend/src/routes/staff.ts, IMAGE). */
const MAX_PHOTO_DATA_URL_CHARS = 1_990_000;

export const ReportarIncidenciaScreen: React.FC = () => {
  const { sectors, reportIncident, setCurrentScreen, screenParams } = useAuxiliares();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initial sector if passed in screenParams (e.g. from Plano)
  const [sectorId, setSectorId] = useState(
    screenParams?.prefilledSectorId || sectors[0]?.id || ''
  );
  const [sectorSearch, setSectorSearch] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('media');
  const [sectorCondition, setSectorCondition] = useState<SectorConditionOnReport>('en_uso');

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoSizeMsg, setPhotoSizeMsg] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Success state after report
  const [reportedIncidentId, setReportedIncidentId] = useState<string | null>(null);

  // Quick problem tags
  const quickTags = [
    'Pérdida de agua',
    'Luz parpadeando',
    'Cerradura trabada',
    'Vidrio rajado',
    'Limpieza urgente',
    'Falta de insumos',
  ];

  const [submitting, setSubmitting] = useState(false);

  // Client-side image compression (JPEG data URL). La API acepta hasta 2.000.000 de
  // caracteres en la foto (~1,5 MB de imagen): se baja calidad/tamaño hasta entrar.
  const processAndCompressFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen válida');
      return;
    }

    // Size limit check (max 15MB initial)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('La imagen supera los 15MB permitidos');
      return;
    }

    setIsCompressing(true);
    const originalKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const attempts: [number, number][] = [
          [1200, 0.75],
          [1200, 0.6],
          [1000, 0.55],
          [800, 0.5],
          [640, 0.45],
        ];
        let result: string | null = null;

        for (const [maxDim, quality] of attempts) {
          if (!ctx) break;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl.length <= MAX_PHOTO_DATA_URL_CHARS) {
            result = dataUrl;
            break;
          }
        }

        if (result) {
          setPhotoUrl(result);
          const head = 'data:image/jpeg;base64,';
          const compressedKb = Math.round(((result.length - head.length) * 3) / 4 / 1024);
          setPhotoSizeMsg(
            `Optimizada: de ${originalKb} KB a ${compressedKb} KB (lista para enviar)`
          );
        } else {
          toast.error('No se pudo achicar la foto lo suficiente (máx. ~1,5 MB). Probá con otra.');
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        toast.error('No se pudo leer la imagen');
        setIsCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 3) {
      toast.error('Contanos brevemente qué pasó en el sector');
      return;
    }
    if (!sectorId) {
      toast.error('Elegí el sector donde ocurrió');
      return;
    }
    if (isCompressing) {
      toast.info('Esperá a que termine de procesarse la foto');
      return;
    }

    setSubmitting(true);
    const created = await reportIncident({
      sectorId,
      description: description.trim(),
      priority,
      sectorConditionOnReport: sectorCondition,
      photoUrl: photoUrl || undefined,
    });
    setSubmitting(false);
    if (!created) return;

    setReportedIncidentId(created.id);
    toast.success('Incidencia registrada con éxito', {
      description:
        sectorCondition === 'en_uso' ? 'El sector sigue habilitado.' : 'Sector actualizado en el plano.',
    });
  };

  const handleResetForAnother = () => {
    setReportedIncidentId(null);
    setDescription('');
    setPhotoUrl(null);
    setPhotoSizeMsg(null);
    setPriority('media');
    setSectorCondition('en_uso');
  };

  // Filtered sectors for search
  const filteredSectors = sectors.filter((s) =>
    s.name.toLowerCase().includes(sectorSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(sectorSearch.toLowerCase())
  );

  // =========================================================================
  // SUCCESS VIEW AFTER REPORTING
  // =========================================================================
  if (reportedIncidentId) {
    const selectedSectorObj = sectors.find((s) => s.id === sectorId);
    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center space-y-6 pb-24">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle size={40} weight="fill" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider">
            Reporte N° {reportedIncidentId.slice(0, 8).toUpperCase()}
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
            ¡Incidencia registrada correctamente!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            El problema en <strong>{selectedSectorObj?.name}</strong> quedó registrado en el sistema institucional y el plano ya refleja su estado operativo.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Sector:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSectorObj?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Prioridad:</span>
            <span className="font-bold uppercase text-[#89743A]">{priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Estado del sector:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {sectorCondition === 'fuera_servicio'
                ? 'Fuera de servicio'
                : sectorCondition === 'mantenimiento'
                ? 'En mantenimiento'
                : 'Sigue en uso'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('incidencias')}
            className="touch-target w-full sm:flex-1 py-3 rounded-lg bg-[#14214F] hover:bg-[#1E2E5D] text-white font-bold text-sm shadow-md"
          >
            Ver incidencias
          </button>
          <button
            type="button"
            onClick={handleResetForAnother}
            className="touch-target w-full sm:flex-1 py-3 rounded-lg bg-[#89743A] hover:brightness-110 text-white font-bold text-sm shadow-md"
          >
            Reportar otra
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setCurrentScreen('plano')}
            className="touch-target text-xs text-[#3F78B6] hover:underline font-semibold"
          >
            Ir al plano del edificio
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SINGLE-SCREEN MOBILE-FIRST FORM
  // foto → qué pasó → dónde → qué tan urgente → cómo queda → enviar
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-10">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Reporte rápido · Celular y terreno
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Reportar <span className="text-[#89743A]">Incidencia</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PASO 1: FOTO */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={18} className="text-[#89743A]" />
              <span>1. Foto de la situación (opcional)</span>
            </label>
            {photoUrl && (
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl(null);
                  setPhotoSizeMsg(null);
                }}
                className="touch-target text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1"
              >
                <Trash size={16} />
                Quitar
              </button>
            )}
          </div>

          {/* Photo preview 4:3 */}
          {photoUrl ? (
            <div className="space-y-2">
              <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100">
                <img
                  src={photoUrl}
                  alt="Vista previa de la incidencia"
                  className="w-full h-full object-cover"
                />
              </div>
              {photoSizeMsg && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {photoSizeMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Big mobile camera button & upload button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sacar foto (environment camera) */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="touch-target w-full py-4 px-4 rounded-xl border-2 border-dashed border-[#89743A] bg-[#FAF6EC] dark:bg-amber-950/20 text-[#89743A] dark:text-[#E5C365] flex flex-col items-center justify-center gap-1.5 hover:bg-[#F3ECCE] transition-colors cursor-pointer"
                >
                  <Camera size={26} weight="bold" />
                  <span className="font-bold text-sm">Sacar foto con cámara</span>
                  <span className="text-[11px] opacity-80">Ideal desde el celular</span>
                </button>

                {/* Subir de la galería */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="touch-target w-full py-4 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <UploadSimple size={24} />
                  <span className="font-bold text-sm">Subir de la galería</span>
                  <span className="text-[11px] opacity-80">Archivos JPG o PNG</span>
                </button>
              </div>

              {isCompressing && (
                <p role="status" className="text-xs text-slate-500">
                  Optimizando la foto…
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                La foto se achica en el celular antes de enviarse (máximo ~1,5 MB).
              </p>
            </div>
          )}
        </div>

        {/* PASO 2: QUÉ PASÓ */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            2. ¿Qué pasó? <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contanos con palabras claras qué desperfecto encontraste..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#3F78B6] focus:outline-none"
          />

          {/* Quick tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Etiquetas rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setDescription((prev) => (prev ? `${prev}. ${tag}` : tag));
                  }}
                  className="touch-target text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PASO 3: DÓNDE */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            3. ¿Dónde ocurrió? (Sector del plano) <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por aula o nombre..."
              value={sectorSearch}
              onChange={(e) => setSectorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs mb-2"
            />
          </div>

          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-[#3F78B6]"
          >
            {sectors.length === 0 && <option value="">No hay sectores cargados en el plano</option>}
            {filteredSectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ` : ''}
                {s.name} ({s.floor === 'PB' ? 'Planta Baja' : 'Primer Piso'})
              </option>
            ))}
          </select>
        </div>

        {/* PASO 4: QUÉ TAN URGENTE (Prioridad) */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            4. ¿Qué tan urgente es?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Alta */}
            <button
              type="button"
              onClick={() => setPriority('alta')}
              className={`touch-target p-3.5 rounded-xl border-2 flex items-center sm:flex-col sm:items-center justify-between sm:justify-center gap-2 text-left sm:text-center transition-all ${
                priority === 'alta'
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Flame size={24} weight="fill" className="text-red-600" />
              <div>
                <p className="font-bold text-sm">Alta / Urgente</p>
                <p className="text-[11px] opacity-80">Riesgo o corte total</p>
              </div>
            </button>

            {/* Media */}
            <button
              type="button"
              onClick={() => setPriority('media')}
              className={`touch-target p-3.5 rounded-xl border-2 flex items-center sm:flex-col sm:items-center justify-between sm:justify-center gap-2 text-left sm:text-center transition-all ${
                priority === 'media'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Clock size={24} weight="fill" className="text-[#AF9B63]" />
              <div>
                <p className="font-bold text-sm">Media</p>
                <p className="text-[11px] opacity-80">Atención en el día</p>
              </div>
            </button>

            {/* Baja */}
            <button
              type="button"
              onClick={() => setPriority('baja')}
              className={`touch-target p-3.5 rounded-xl border-2 flex items-center sm:flex-col sm:items-center justify-between sm:justify-center gap-2 text-left sm:text-center transition-all ${
                priority === 'baja'
                  ? 'border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <CheckCircle size={24} weight="fill" className="text-slate-500" />
              <div>
                <p className="font-bold text-sm">Baja</p>
                <p className="text-[11px] opacity-80">Programable</p>
              </div>
            </button>
          </div>
        </div>

        {/* PASO 5: ¿CÓMO QUEDA EL SECTOR? */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              5. ¿Cómo queda el sector ahora?
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Lo decidís vos según la situación; la prioridad no lo fuerza automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSectorCondition('en_uso')}
              className={`touch-target p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                sectorCondition === 'en_uso'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Sigue en uso</span>
            </button>

            <button
              type="button"
              onClick={() => setSectorCondition('mantenimiento')}
              className={`touch-target p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                sectorCondition === 'mantenimiento'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 text-amber-800 dark:text-amber-200 ring-1 ring-amber-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>En mantenimiento</span>
            </button>

            <button
              type="button"
              onClick={() => setSectorCondition('fuera_servicio')}
              className={`touch-target p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                sectorCondition === 'fuera_servicio'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-800 dark:text-red-200 ring-1 ring-red-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Fuera de servicio</span>
            </button>
          </div>
        </div>

        {/* PASO 6: BOTÓN ENVIAR (Ancho completo en móvil, dorado ocre) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || isCompressing}
            className="touch-target w-full py-4 rounded-xl bg-[#89743A] hover:brightness-110 active:brightness-95 text-white font-extrabold text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Enviando…' : 'Registrar incidencia'}</span>
            <ArrowRight size={20} weight="bold" />
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Se guarda en el sistema institucional · El plano se actualiza al instante
          </p>
        </div>
      </form>
    </div>
  );
};
