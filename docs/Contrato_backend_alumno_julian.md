# Contrato de backend del Portal del Alumno

La integración actualizada considera el backend común usado por Profesores, Preceptoría, Auxiliares y Centro de Estudiantes. El estado del frontend, los endpoints reales, los permisos por rol y los pendientes de app v2 están en [el contrato del módulo](../alumnos-julian/docs/Contrato_backend_alumno_julian.md).

La app v2 aún usa datos de demostración; no está conectada a esas rutas. La API sí ofrece lecturas personales /me/* para alumno, datos institucionales y espacios separados del Centro. Los endpoints operativos /staff/* están limitados al rol Auxiliar y no corresponden al panel Alumno.
