import React from 'react';
import { Link } from 'react-router-dom';
export const SettingsView = () => <section><h2>Preferencias</h2><p>Las preferencias visuales se guardan en este dispositivo.</p><Link to="/apariencia">Configurar apariencia</Link><p>El servidor todavía no admite preferencias de correo ni notificaciones push.</p><button disabled>Configurar avisos por correo o push</button></section>;
