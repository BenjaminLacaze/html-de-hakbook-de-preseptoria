/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect } from 'react';
import type { AuthMe } from '@shared/types';
import { SessionGate } from '@shared/auth/SessionGate';
import { StudentCommunication } from './communication/StudentCommunication';
import { SessionContext } from './lib/session';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './lib/themeContext';
import { AppLayout } from './components/layout/AppLayout';

// Feature Views
import { DashboardView } from './features/dashboard/DashboardView';
import { ProfileView } from './features/profile/ProfileView';
import { AgendaView } from './features/agenda/AgendaView';
import { SubjectsView } from './features/subjects/SubjectsView';
import { GradesView } from './features/grades/GradesView';
import { AttendanceView } from './features/attendance/AttendanceView';
import { AttendanceQRView } from './features/attendance/AttendanceQRView';
import { HistoryView } from './features/history/HistoryView';
import { CommunityView } from './features/community/CommunityView';
import { ForumsView } from './features/forums/ForumsView';
import { SettingsView } from './features/settings/SettingsView';
import { AppearanceView } from './features/settings/AppearanceView';
import { NotFoundView } from './features/notfound/NotFoundView';

function Portal({me}: {me:AuthMe}) {
  useLayoutEffect(() => () => queryClient.clear(), []);
  return (
    <SessionContext.Provider value={me}><QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardView />} />
              <Route path="perfil" element={<ProfileView />} />
              <Route path="agenda" element={<AgendaView />} />
              <Route path="materias" element={<SubjectsView />} />
              <Route path="notas" element={<GradesView />} />
              <Route path="faltas" element={<AttendanceView />} />
              <Route path="historial" element={<HistoryView />} />
              <Route path="comunicacion" element={<StudentCommunication userId={me.user.id} />} />
              <Route path="comunidad" element={<CommunityView />} />
              <Route path="foros" element={<ForumsView />} />
              <Route path="opciones" element={<SettingsView />} />
              <Route path="apariencia" element={<AppearanceView />} />
              <Route path="asistencia-qr" element={<AttendanceQRView />} />
              <Route path="*" element={<NotFoundView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider></SessionContext.Provider>
  );
}

export default function App(){return <SessionGate apps={['alumnos']}>{me=><Portal me={me} key={me.user.id}/>}</SessionGate>;}
