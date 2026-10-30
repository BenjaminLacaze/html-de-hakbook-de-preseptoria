# Sistema visual — Portal del Alumno app v2

Describe la app React nueva en alumnos-julian/app v2/. No describe el diseño editorial de los HTML de documentación, que quedaron como referencia histórica.

## Dirección visual

La interfaz adapta la marca del ISFDyT N.° 26 a un panel académico: navegación navy, acentos dorados, superficies claras u oscuras e introducción audiovisual institucional. En escritorio usa una barra lateral fija y un encabezado; en móvil cambia a encabezado compacto y menú superpuesto.

## Marca y tipografía

Los tokens están en JULIAN/styles/theme.css.

| Uso | Fuente o token | Valor |
|---|---|---|
| Navy institucional | --brand-navy | #14214F |
| Dorado institucional | --brand-gold | #89743A |
| Azul complementario | --brand-blue | #3F78B6 |
| Arena dorada | --brand-gold-sand | #AF9B63 |
| Titulares | Outfit | 700 y 800 |
| Texto | DM Sans | 400, 500 y 600 |
| Datos tabulares | JetBrains Mono | 400 |

Los recursos de marca están en JULIAN/assets/brand/ y en public/JULIAN/assets/brand/ para servirlos desde Vite.

## Temas y componentes

ThemeProvider aplica data-theme al documento. El tema elegido se conserva en localStorage bajo isfd26_theme. La app define seis temas: Celestial, Oscuro, Ensoñación, Moderno, Fantasma y Rebelde.

- JULIAN/shared/ui/Components.tsx: tarjetas, bloques de marca, indicadores y barras.
- JULIAN/shared/ui/Titles.tsx: títulos y etiquetas de sección.
- JULIAN/shared/ui/States.tsx: estados de carga y error.
- JULIAN/shared/ui/Logo.tsx y AlumnosIcon.tsx: marca institucional.
- Tailwind CSS 4 aporta utilidades; theme.css define tokens y reglas globales.
- :focus-visible tiene un contorno con el token --focus.
- La app declara Motion como dependencia, pero no se encontraron imports de su API en las pantallas actuales; las transiciones observadas usan CSS y video.

## Mantenimiento

1. Mantener la paleta institucional y revisar contraste en los seis temas.
2. Usar tokens semánticos para superficies, texto, bordes y foco.
3. Mantener navegación por teclado y controles cómodos en pantallas móviles.
4. Respetar prefers-reduced-motion en animaciones nuevas.
5. No incluir datos personales reales en imágenes ni en el dataset demo.
