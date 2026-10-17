import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogoutModal } from './LogoutModal';
import { motion } from 'motion/react';
import { Info, Database } from 'lucide-react';
import { IS_MOCK_MODE } from '../../services/apiConfig';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-canvas text-primary-custom selection:bg-[var(--accent-subtle)] selection:text-[var(--accent-primary)]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        onOpenLogout={() => setIsLogoutOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenMobile={() => setIsOpenMobile(true)} />

        {/* Content Viewport with motion fade */}
        <motion.main
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <Outlet />
        </motion.main>

        {/* Institutional Footer */}
        <footer className="border-t border-subtle-custom bg-surface px-6 py-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-custom">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-custom">Asistencia Terciario</span>
              <span aria-hidden="true">·</span>
              <span>IES N° 26 — Educación Superior Técnica</span>
              <span aria-hidden="true">·</span>
              <span>Versión 2.4.0</span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1 text-muted-custom">
                <Database className="w-3.5 h-3.5" />
                {IS_MOCK_MODE ? 'Capa de Demostración Activa (Desacoplada para REST/MySQL)' : 'API Conectada'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-muted-custom">
                <Info className="w-3.5 h-3.5" />
                Vercel Ready
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </div>
  );
};
