import React, { useState } from 'react';
import { logout } from '@shared/api';
import { queryClient } from '../../lib/queryClient';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
export const LogoutModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const exit = async () => { setBusy(true); setError(''); try {
        await logout();
        queryClient.clear();
        window.location.reload();
    }
    catch (e) {
        setError((e as Error).message);
        setBusy(false);
    } };
    return <Modal isOpen={isOpen} onClose={onClose} title="Cerrar sesión" footer={<Button disabled={busy} onClick={exit}>Confirmar cierre</Button>}><p>Se cerrará tu sesión en este dispositivo.</p>{error && <p role="alert">{error}</p>}</Modal>;
};
