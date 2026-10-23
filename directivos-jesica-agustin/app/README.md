# Perfil Directivo — Sistema de Gestión Educativa
### Instituto Superior de Formación Docente y Técnica N.° 26 · Dolores, Provincia de Buenos Aires

**Perfil Directivo** es una plataforma web integral, robusta y con identidad visual propia diseñada para la conducción institucional, supervisión pedagógica y toma de decisiones estratégicas en instituciones educativas de nivel superior y secundario.

La dirección estética y el sistema de diseño derivan del estudio e inspección directa del sitio oficial **Manual de Marca | Jornadas Estudiantiles · ISFDyT N.° 26** (`https://manualdemarca-i26.vercel.app/`), adoptando su paleta cromática oficial, tipografías humanistas y nobleza editorial para una experiencia operativa sin concesiones estéticas.

---

## 1. Módulos Funcionales Implementados

1. **Tablero Directivo Ejecutivo (`/inicio`):**
   - Resumen institucional instantáneo: matrícula activa, planta docente en funciones, divisiones activas y tasa global de asistencia.
   - Panel de alertas de trayectorias prioritarias (estudiantes con ausentismo reiterado $>15\%$ o materias en riesgo pedagógico).
   - Accesos directos para la carga de partes diarios y emisión de circulares.
   - Estado de ocupación áulica, agenda de hitos escolares y bitácora reciente.

2. **Gestión de Usuarios, Roles y Permisos (`/usuarios`):**
   - Personal institucional categorizado: Equipo Directivo, Vicedirección, Secretaría, Preceptoría, Docentes y Equipo de Orientación Escolar (EOE).
   - Alta de usuarios con validación de identificador único (correo `@isfdyt26.edu.ar` o `@abc.gob.ar`), DNI y teléfono.
   - Edición de perfiles y activación/desactivación controlada de cuentas sin pérdida de registros históricos.
   - Simulador interactivo en la barra superior para alternar entre perfiles y comprobar alcances de permisos.

3. **Cursos, Divisiones y Matrícula Estudiantil (`/cursos`):**
   - Estructura curricular por Ciclo Lectivo (2026 Vigente y 2025 Histórico).
   - Divisiones en los tres turnos (Mañana, Tarde, Vespertino) con capacidad máxima y preceptor responsable.
   - Asignación de cátedras y situación de revista docente (Titular, Provisional, Suplente).
   - Nómina oficial de alumnos con legajo, DNI, datos de contacto del tutor y alertas médicas/pedagógicas.

4. **Seguimiento de Asistencia Escolar (`/asistencia`):**
   - Carga de partes diarios de asistencia por división y fecha (Presente, Ausente Injustificado, Ausente Justificado con certificado, Tardanza).
   - Asentamiento rápido y guardado en lote con observaciones particulares.
   - Resumen acumulado por alumno con cálculo exacto de inasistencias y detección automática de ausentismo crítico.
   - Modal de historial detallado por estudiante con justificaciones presentadas.

5. **Seguimiento Académico y Calificaciones (`/rendimiento`):**
   - Sábana digital de calificaciones por curso, materia y período (1°, 2°, 3° Trimestre y Período de Intensificación).
   - Escala numérica oficial argentina de 1 a 10 con nota mínima de aprobación configurable (7).
   - Modal de rectificación formal de notas con registro de observaciones docentes y fecha.
   - **Boletín Oficial de Calificaciones Digital e Imprimible** con membrete oficial del ISFDyT N.° 26 y espacios para firmas.

6. **Organización Institucional y Horarios (`/organizacion`):**
   - Grilla horaria interactiva semanal de Lunes a Viernes con 6 módulos horarios.
   - Asignación de cátedras y docentes con **detección proactiva de solapamientos horarios** (conflictos de profesores en múltiples cursos simultáneamente).
   - Calendario escolar oficial (Jornadas PNFP, Actos Escolares, Mesas de Examen, Cierres de Calificaciones y Feriados).

7. **Circulares y Comunicados Oficiales (`/comunicados`):**
   - Redacción y publicación de disposiciones directivas dirigidas a toda la comunidad, docentes, preceptores o familias.
   - Estados: Borrador, Publicado, Vencido y Archivado.
   - Contador de lecturas confirmadas y opción para fijar al inicio del tablero.
   - **Vista de Circular Imprimible con Membrete Oficial** de la Dirección General de Cultura y Educación.

8. **Informes Estadísticos Institucionales (`/informes`):**
   - Consolidado de Asistencia y Ausentismo por división.
   - Matriz de Rendimiento Académico y tasas de acreditación por materia.
   - Censo de Capacidad Áulica y Matrícula.
   - **Exportación real a formato CSV con codificación UTF-8 BOM** para apertura nativa en Excel.
   - **Modo de Impresión Formal** optimizado para presentar ante el Consejo Académico Institucional (CAI).

9. **Bitácora de Auditoría y Trazabilidad (`/auditoria`):**
   - Registro cronológico inmutable de operaciones (creación, rectificación, cambios de estado, conmutación de ciclos).
   - Detalle de usuario responsable, rol, fecha, hora argentina (GMT-3) y valores anteriores/nuevos.
   - Filtros dinámicos por módulo y tipo de acción.

10. **Configuración Institucional (`/configuracion`):**
    - Parámetros del establecimiento: CUE, número, región, distrito, autoridades (Directora y Vicedirector).
    - Parámetros pedagógicos: umbral de inasistencia (default 15%), días consecutivos para alerta temprana y nota mínima de aprobación.
    - Conmutador de Ciclo Lectivo (Vigente vs. Histórico de solo lectura).
    - Botón de restablecimiento integral de datos de demostración.

---

## 2. Tecnologías y Racional Técnico

- **React 19 & TypeScript:** Tipado exhaustivo de todas las entidades del dominio educativo argentino, evitando errores de inconsistencia de datos.
- **Tailwind CSS v4:** Tokens basados en el manual de marca oficial:
  - Azul Institucional: `#14214F`
  - Azul Noche Profundo: `#0A1128`
  - Dorado Ocre: `#89743A`
  - Arena Dorada: `#AF9B63`
  - Azul Cielo: `#3F78B6`
  - Papel Suave: `#F8F9FA`
- **Tipografías:** `Tenor Sans` (titulares y membrete institucional), `DM Sans` (cuerpo de formularios y tablas), y `JetBrains Mono` con `tabular-nums` (DNI, legajos, fechas, porcentajes y calificaciones).
- **Lucide Icons:** Iconografía sobria y estrictamente funcional.
- **Persistencia Reactiva:** Gestión centralizada en `AppContext` con persistencia en `localStorage`, asegurando que todas las operaciones (inscripción de alumnos, partes de asistencia, calificaciones y circulares) se conserven entre recargas.

---

## 3. Instrucciones de Ejecución

Para iniciar el entorno de desarrollo:

```bash
npm run dev
```

La aplicación quedará disponible en el puerto 3000 (`http://localhost:3000`).

Para verificar tipos y compilar para producción:

```bash
npm run lint    # Ejecuta tsc --noEmit
npm run build   # Compila el paquete de producción con Vite
```

---

## 4. Pruebas y Validación Realizadas

- [x] **Compilación y Typescript:** `tsc --noEmit` y `npm run build` ejecutados exitosamente con 0 errores.
- [x] **Flujo de Asistencia:** Carga de partes diarios, marcado masivo, justificación médica y verificación de alerta en alumnos con ausentismo reiterado.
- [x] **Flujo de Calificaciones:** Carga de notas del 1° y 2° trimestre, rectificación con observación pedagógica y generación del Boletín Oficial imprimible.
- [x] **Flujo de Organización y Horarios:** Asignación de cátedras con validación y bloqueo ante docentes solapados en el mismo módulo.
- [x] **Flujo de Circulares:** Creación, edición, filtrado y vista previa imprimible con firma y sello.
- [x] **Exportación de Informes:** Generación y descarga probada de archivos `.csv` para asistencia, calificaciones y matrícula.
- [x] **Conmutación de Roles:** Simulación funcional de perfiles (Directora, Vicedirector, Secretaria, Preceptor, Docente) desde la barra superior.

---

## 5. Hoja de Ruta para Producción Institucional

1. **Autenticación Federada:** Conexión con el portal ABC de la provincia de Buenos Aires o autenticación OAuth institucional.
2. **Base de Datos Relacional:** Migración del almacenamiento de `AppContext` hacia PostgreSQL / Cloud SQL con políticas de acceso a nivel de fila (RLS).
3. **Firma Digital:** Integración de certificados de firma digital para actas de examen finales y títulos oficiales.
