/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Modal de confirmación de cierre de sesión (POST /auth/logout)
 */

import React, { useState } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { Dialog } from './Dialog';
import { Button } from './Button';

export const LogoutModal: React.FC = () => {
  const { openLogoutModal, setOpenLogoutModal, currentUser, logout } = useCentro();
  const [busy, setBusy] = useState(false);

  if (!openLogoutModal) return null;

  const handleConfirmLogout = async () => {
    setBusy(true);
    await logout();
    setBusy(false);
  };

  return (
    <Dialog
      isOpen={openLogoutModal}
      onClose={() => setOpenLogoutModal(false)}
      title="Cerrar sesión en el Centro"
      description="Confirmá la salida de la sesión de gestión activa."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-xs text-foreground-muted leading-relaxed">
          ¿Querés cerrar la sesión de{' '}
          <strong>
            {currentUser.nombre}
            {currentUser.cargo && ` (${currentUser.cargo})`}
          </strong>
          ? Vas a volver a la pantalla de ingreso. Todo lo que guardaste ya está en el sistema.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button variant="secondary" onClick={() => setOpenLogoutModal(false)} disabled={busy}>
            Permanecer conectado/a
          </Button>
          <Button
            variant="danger"
            icon={<SignOut weight="bold" className="w-4 h-4" />}
            onClick={handleConfirmLogout}
            loading={busy}
            disabled={busy}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
