# Manual de Diseño del Sistema — Perfil Directivo
## Identidad Visual basada en el Manual de Marca Oficial · ISFDyT N.° 26

Este documento formaliza la dirección visual, tokens de diseño, jerarquías tipográficas y lineamientos de experiencia de usuario aplicados en la plataforma **Perfil Directivo — Sistema de Gestión Educativa**, derivada del estudio e inspección directa del sitio oficial *Manual de Marca | Jornadas Estudiantiles · ISFDyT N.° 26* (`https://manualdemarca-i26.vercel.app/`).

---

## 1. Fundamentos de la Identidad Visual

El ISFDyT N.° 26 (Instituto Superior de Formación Docente y Técnica N.° 26) posee una identidad arraigada en la excelencia académica, la sobriedad institucional y el compromiso con la educación pública.

La adaptación a un sistema de gestión operativa (Perfil Directivo) respeta el ADN visual del manual de marca:
1. **Autoridad y Claridad:** Los directivos deben procesar información sensible (asistencia, calificaciones, plantas orgánicas funcionales) sin sobrecargas sensoriales ni distracciones superfluas.
2. **Nobleza de Materiales Digitales:** Uso del contraste entre el Azul Institucional (`#14214F`), el Dorado Ocre (`#89743A`) y superficies en tono Papel Suave (`#F8F9FA` / `#FFFFFF`).
3. **Tipografía Humanista y Funcional:** Combinación estricta de la tipografía titular `Tenor Sans` para jerarquías institucionales, `DM Sans` para lectura prolongada de formularios y tablas, y `JetBrains Mono` con cifras tabulares (`tabular-nums`) para evitar el temblor visual de los números.

---

## 2. Paleta Cromática Oficial

| Denominación Oficial | Hex | RGB | Rol en el Sistema Directivo |
| :--- | :--- | :--- | :--- |
| **Azul Institucional** | `#14214F` | `20, 33, 79` | Color primario de marca. Barras de navegación superior, titulares ejecutivos y botones de acción principal. |
| **Azul Noche Profundo** | `#0A1128` | `10, 17, 40` | Superficies de máxima jerarquía, fondos de barra lateral e insignias de autoridad. |
| **Dorado Ocre** | `#89743A` | `137, 116, 58` | Acento de excelencia. Bordes sutiles de separación, divisores institucionales y estados activos destacados. |
| **Arena Dorada** | `#AF9B63` | `175, 155, 99` | Selección de texto, focos interactivos y estados hover secundarios. |
| **Dorado Brillante** | `#D4C08A` | `212, 192, 138` | Destacados y emblema institucional en fondos oscuros. |
| **Azul Cielo** | `#3F78B6` | `63, 120, 182` | Acento interactivo, filtros aplicados, pestañas activas e indicadores de progreso. |
| **Papel Suave** | `#F8F9FA` | `248, 249, 250` | Fondo general de la aplicación (canvas neutro 60%). |
| **Blanco Puro** | `#FFFFFF` | `255, 255, 255` | Tarjetas y contenedores de datos (30% de superficies estructurales). |

### Estados Semánticos Operativos (Norma de No Dependencia Exclusiva del Color)
- **Asistencia Regular / Aprobado:** Verde bosque institucional `#15803D` acompañado siempre de texto y porcentaje.
- **Tardanza / Alerta Temprana:** Ámbar cálido `#B45309` con ícono de advertencia y cómputo de días.
- **Inasistencia Crítica / Desaprobado:** Rojo cardenal `#B91C1C` con etiqueta explícita de seguimiento directivo.

---

## 3. Tipografía y Escala Jerárquica

1. **Titulares y Rótulos Institucionales (`font-heading`):**
   - Familia: `Tenor Sans` (Google Fonts).
   - Aplicación: Nombre de la institución, títulos de módulo, balances ejecutivos y membrete oficial.
2. **Cuerpo de Texto y Formularios (`font-sans`):**
   - Familia: `DM Sans` (Google Fonts).
   - Pesos: Regular (400), Medium (500), Bold (700).
   - Aplicación: Nombres de alumnos, materias, tablas, inputs, descripciones de auditoría.
3. **Cifras y Datos Tabulares (`font-mono tabular-nums`):**
   - Familia: `JetBrains Mono` con `font-variant-numeric: tabular-nums`.
   - Aplicación: DNI, CUE, porcentajes de asistencia, calificaciones numéricas (1 a 10), fechas y horas de auditoría.

---

## 4. Componentes y Reglas Anti-Slop

En estricto cumplimiento de la Constitución de Diseño Frontend:
- **Cero píldoras decorativas:** No se encapsulan metadatos estáticos en cápsulas coloreadas estilo caramelo. Los metadatos usan texto limpio separado por puntos medios (`·`) o barras (`/`).
- **Control de elevación única:** Una sola elevación limpia con bordes de 1 píxel (`border border-slate-200` o `border-[#89743A]/20`).
- **Sin puntos pulsantes ni textos mecánicos:** No hay `//` ni `status: ONLINE` ni falsos puntitos verdes parpadeantes.
- **Comportamiento interactivo total:** Todo botón, selector de ciclo lectivo, filtro de fecha, descarga de informe, ordenamiento de columna y switch de rol posee handler activo y retroalimentación inmediata.
- **Soporte de Impresión Oficial:** Modo de impresión optimizado para imprimir constancias de asistencia, resúmenes de calificaciones para el Consejo Académico y circulares directivas con membrete.
