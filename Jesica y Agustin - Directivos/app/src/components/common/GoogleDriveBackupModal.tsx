import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  getAccessToken,
} from '../../services/googleAuth';
import {
  uploadFileToDrive,
  listAppDriveFiles,
  DriveFile,
} from '../../services/googleDriveService';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ExternalLink,
  LogOut,
  X,
  FileText,
  RotateCw,
  FolderOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveBackupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    users,
    courses,
    students,
    teachers,
    subjects,
    teacherAssignments,
    attendanceRecords,
    gradeRecords,
    schedules,
    events,
    notices,
    auditLogs,
    institutionSettings,
    activeCycleId,
    showNotification,
  } = useApp();

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setGoogleUser(user);
        setToken(accessToken);
        fetchFiles(accessToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFiles = async (accessToken: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listAppDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        showNotification('Cuenta de Google conectada exitosamente.');
        fetchFiles(result.accessToken);
      }
    } catch (err: any) {
      showNotification('No se pudo conectar la cuenta de Google.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setToken(null);
    setDriveFiles([]);
    showNotification('Sesión de Google Drive cerrada.', 'info');
  };

  const executeBackupToDrive = async () => {
    if (!token) return;
    setIsUploading(true);
    setConfirmPrompt(false);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dateFormatted = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      const fileName = `Respaldo_ISFDyT26_Ciclo${activeCycleId}_${dateFormatted}.json`;

      const backupPayload = {
        metadata: {
          institucion: institutionSettings.name,
          cue: institutionSettings.cue,
          cicloLectivo: activeCycleId,
          fechaGeneracion: new Date().toISOString(),
          generadoPor: googleUser?.email || 'Directivo',
          version: '1.0',
        },
        institutionSettings,
        users,
        courses,
        students,
        teachers,
        subjects,
        teacherAssignments,
        attendanceRecords,
        gradeRecords,
        schedules,
        events,
        notices,
        auditLogs,
      };

      const uploaded = await uploadFileToDrive(
        token,
        fileName,
        JSON.stringify(backupPayload, null, 2),
        'application/json'
      );

      showNotification(`Respaldo guardado exitosamente en Google Drive: ${fileName}`);
      fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      showNotification('Error al subir el respaldo a Google Drive: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-[#D4C08A]" />
            <div>
              <h3 className="text-base font-bold text-white">
                Respaldo en Google Drive
              </h3>
              <p className="text-xs text-[#D4C08A]">
                ISFDyT N.° 26 · Copia de seguridad institucional en la nube
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {!googleUser ? (
            /* Sign in required view */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#14214F] flex items-center justify-center mx-auto border border-blue-200">
                <Cloud className="w-8 h-8 text-[#3F78B6]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Conectá tu cuenta de Google Drive
                </h4>
                <p className="text-slate-500 mt-1 max-w-md mx-auto">
                  Para guardar una copia completa de toda la información escolar (alumnos, asistencias, notas, docentes y circulares) en tu propia cuenta de Drive, iniciá sesión a continuación con permiso para crear archivos.
                </p>
              </div>

              {/* Official Google Sign-in button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs text-xs font-semibold text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connected view */
            <div className="space-y-4">
              {/* Account connected bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#14214F] text-white font-bold flex items-center justify-center">
                      {googleUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">
                      {googleUser.displayName || 'Usuario de Google'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {googleUser.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-700 p-1.5 rounded transition-colors flex items-center gap-1 text-[11px]"
                  title="Desconectar cuenta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>

              {/* Action Button */}
              {confirmPrompt ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>¿Confirmar la creación del archivo de respaldo en tu Google Drive?</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Se creará la carpeta oficial <strong>"Perfil Directivo - ISFDyT 26"</strong> en tu Drive y se subirá un archivo con la base de datos completa ({students.length} estudiantes, {courses.length} cursos, asistencias y calificaciones del ciclo {activeCycleId}).
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setConfirmPrompt(false)}
                      className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-white/60"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={executeBackupToDrive}
                      disabled={isUploading}
                      className="px-4 py-1.5 rounded text-xs font-semibold bg-[#14214F] hover:bg-[#0A1128] text-white shadow-xs"
                    >
                      {isUploading ? 'Guardando...' : 'Sí, Guardar en mi Drive'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-bold text-[#14214F]">
                      Crear Copia de Seguridad Actualizada
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Empaqueta todos los registros del ciclo {activeCycleId} en tu Google Drive.
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmPrompt(true)}
                    disabled={isUploading}
                    className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded font-medium transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D4C08A]" />
                    <span>{isUploading ? 'Generando...' : 'Guardar en Drive Ahora'}</span>
                  </button>
                </div>
              )}

              {/* Existing Drive files list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-800 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-[#89743A]" />
                    <span>Archivos en tu Google Drive (Carpeta "Perfil Directivo")</span>
                  </div>
                  <button
                    onClick={() => token && fetchFiles(token)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Actualizar lista"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded text-center text-slate-400">
                    Todavía no has creado respaldos en tu Google Drive. Hacé clic en "Guardar en Drive Ahora".
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded max-h-48 overflow-y-auto">
                    {driveFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-[#3F78B6] shrink-0" />
                          <div className="truncate">
                            <div className="font-medium text-slate-800 truncate" title={f.name}>
                              {f.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {f.id.slice(0, 12)}...
                            </div>
                          </div>
                        </div>

                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-medium text-[#14214F] hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 shrink-0"
                          >
                            <span>Abrir en Drive</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Carpeta: <strong>Perfil Directivo - ISFDyT 26</strong></span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded transition-colors text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
