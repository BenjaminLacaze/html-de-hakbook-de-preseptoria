/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Rutas de imágenes y video de marca
 *
 * La app se publica bajo una subcarpeta (--base=/ecosistema-julian/centro/), así que los
 * archivos de public/ se piden con import.meta.env.BASE_URL y los SVG se importan para que
 * Vite les ponga la ruta final.
 */

import isotipoNegativoSvg from '../assets/centro-estudiantes-isotipo-negativo.svg';
import logoMarcaSvg from '../assets/centro-estudiantes-logo-marca.svg';

export const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const LOGO_NEGATIVO_PNG = publicAsset('assets/aistudio/centro-estudiantes-logo-negativo_7bf01047.png');
export const LOGO_MARCA_PNG = publicAsset('assets/aistudio/centro-estudiantes-logo-marca_d7f683d7.png');
export const INTRO_VIDEO_MP4 = publicAsset('assets/aistudio/centro-estudiantes_loop_16x9_8e28b9e8.mp4');

/** Respaldo si no carga el PNG. */
export const ISOTIPO_NEGATIVO_SVG = isotipoNegativoSvg;
export const LOGO_MARCA_SVG = logoMarcaSvg;
