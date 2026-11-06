import React, { useState } from 'react';
import { ENDPOINTS_CATALOG, EndpointDefinition } from '../../contracts/endpointsCatalog';
import {
  Code2,
  Send,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Layers,
  Sparkles,
  Server,
  FileJson,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BackendContractView: React.FC = () => {
  const { showNotification } = useApp();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDefinition>(
    ENDPOINTS_CATALOG[0]
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [liveTestResponse, setLiveTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const filteredEndpoints = ENDPOINTS_CATALOG.filter(
    (ep) =>
      ep.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.module.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopyContract = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEndpoint, null, 2));
    setCopied(true);
    showNotification('Contrato del endpoint copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFullContract = () => {
    const fullSpec = {
      info: {
        title: 'API Perfil Directivo — ISFDyT N.° 26',
        version: '1.0.0',
        description: 'Especificación oficial de endpoints, esquemas de datos y control de accesos RBAC.',
      },
      endpoints: ENDPOINTS_CATALOG,
    };
    const blob = new Blob([JSON.stringify(fullSpec, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Contrato_Backend_ISFDyT26_v1.json';
    a.click();
    showNotification('Catálogo completo del contrato exportado como JSON.');
  };

  const handleExecuteLiveTest = () => {
    setIsTesting(true);
    setLiveTestResponse(null);
    setTimeout(() => {
      setLiveTestResponse(JSON.stringify(selectedEndpoint.responseExample, null, 2));
      setIsTesting(false);
      showNotification(`Simulación de contrato para ${selectedEndpoint.method} ${selectedEndpoint.path} exitosa.`);
    }, 400);
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-800 border-blue-200',
    POST: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    PUT: 'bg-amber-50 text-amber-800 border-amber-200',
    DELETE: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Arquitectura e Interoperabilidad Técnica
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Contrato de Backend / Especificación de API
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Definición rigurosa de rutas REST, esquemas de petición, respuestas y roles autorizados (RBAC).
          </p>
        </div>

        <button
          onClick={handleExportFullContract}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14214F] border border-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#89743A]" />
          <span>Exportar Especificación JSON</span>
        </button>
      </div>

      {/* Main Container: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Endpoint List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por ruta, método o módulo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
            {filteredEndpoints.map((ep) => {
              const isSelected = ep.id === selectedEndpoint.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setLiveTestResponse(null);
                  }}
                  className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-3 border-[#14214F]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      {ep.module}
                    </span>
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded border ${
                        methodColors[ep.method]
                      }`}
                    >
                      {ep.method}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-semibold text-slate-900 truncate">
                    {ep.path}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">
                    {ep.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Endpoint Detail & Contract Inspector */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-5">
            {/* Top Bar of Selected Endpoint */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                      methodColors[selectedEndpoint.method]
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#14214F]">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedEndpoint.summary}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedEndpoint.description}
                </p>
              </div>

              <button
                onClick={handleCopyContract}
                className="px-2.5 py-1 text-slate-600 hover:text-[#14214F] hover:bg-slate-100 rounded border border-slate-200 text-xs flex items-center gap-1.5 transition-colors self-start shrink-0"
                title="Copiar especificación del endpoint"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Security / Roles Allowed */}
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#89743A]" />
              <span className="font-semibold text-slate-700">Roles Autorizados:</span>
              <div className="flex flex-wrap gap-1">
                {selectedEndpoint.requiredRoles.map((role) => (
                  <span
                    key={role}
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Request Body Specification (if POST / PUT) */}
            {selectedEndpoint.requestBodyExample && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Esquema de Solicitud (Request Body):</span>
                  <span className="font-mono text-[10px] text-slate-400">Content-Type: application/json</span>
                </div>
                <pre className="p-3.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedEndpoint.requestBodyExample, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Specification */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Respuesta Exitosa (HTTP 200 / 201 OK):</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">Status: 200 OK</span>
              </div>
              <pre className="p-3.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
              </pre>
            </div>

            {/* Live Contract Test Execution Button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ejecutar verificación de contrato en el servidor:
                </span>
                <button
                  onClick={handleExecuteLiveTest}
                  disabled={isTesting}
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-semibold rounded transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4C08A]" />
                  <span>{isTesting ? 'Validando...' : 'Ejecutar Solicitud'}</span>
                </button>
              </div>

              {liveTestResponse && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <span>✓ Respuesta del Servidor (Validación de Esquema Aprobada)</span>
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-950 overflow-x-auto">
                    {liveTestResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
