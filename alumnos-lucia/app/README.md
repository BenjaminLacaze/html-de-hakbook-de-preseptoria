# Sistema de Asistencia Escolar — Módulo Alumno
## Aplicación Frontend desarrollada en React 19, TypeScript y Tailwind CSS

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  
**Institución:** Instituto Superior de Educación Técnica N° 26 (I26)  
**Ciclo Lectivo:** 2026  

---

## 💡 ¿Cómo está estructurado este proyecto?

Este proyecto **NO es un archivo HTML estático**. Es una **Single Page Application (SPA) construida en React 19 y Tailwind CSS**, empaquetada con **Vite**.

En la arquitectura moderna de React con Vite:
1. `index.html` es únicamente el **punto de anclaje inicial** (`<div id="root"></div>`), que le indica al navegador que debe ejecutar el módulo React ubicado en `src/main.tsx`.
2. `src/main.tsx` inicializa React y monta el componente raíz `<App />` dentro de ese contenedor.
3. **Toda la lógica de la aplicación, las pantallas, componentes, cálculos de asistencia y estilos en Tailwind CSS residen dentro de la carpeta `/src/`**.

---

## 📁 Mapa de Componentes y Código Fuente en React

```
├── index.html                     # Contenedor raíz donde React monta la aplicación
├── vite.config.ts                 # Configuración del compilador Vite y Tailwind CSS
├── package.json                   # Dependencias (React 19, Tailwind CSS, Lucide Icons, etc.)
│
├── src/                           # 👈 AQUÍ ESTÁ TODO EL CÓDIGO REACT Y TAILWIND
│   ├── main.tsx                   # Punto de inicio que ejecuta ReactDOM.createRoot()
│   ├── App.tsx                    # Componente principal que orquesta el diseño y las vistas
│   ├── index.css                  # Estilos globales y directivas de Tailwind CSS (@import "tailwindcss")
│   │
│   ├── components/                # Componentes React reutilizables
│   │   ├── views/                 # Vistas o Pantallas principales
│   │   │   ├── LoginView.tsx      # Pantalla de acceso con modo demo y validaciones
│   │   │   ├── HomeView.tsx       # Inicio con resumen estadístico y cálculo de asistencia
│   │   │   ├── AttendanceView.tsx # Consulta detallada con filtros dinámicos y tabla responsive
│   │   │   ├── ProfileView.tsx    # Ficha del alumno en modo solo lectura
│   │   │   ├── HelpView.tsx       # Guía de ayuda, fórmulas y protocolos institucionales
│   │   │   └── AccessibilityView.tsx # Ajustes de tamaño de texto, alto contraste y modo oscuro
│   │   │
│   │   ├── common/                # Componentes comunes de interfaz
│   │   │   ├── Header.tsx         # Barra superior con datos de usuario y accesibilidad
│   │   │   ├── Sidebar.tsx        # Navegación lateral adaptativa para escritorio y móvil
│   │   │   ├── StatCard.tsx       # Tarjeta de métricas con números tabulares
│   │   │   └── StatusBadge.tsx    # Insignia de estado accesible con iconos y texto
│   │   │
│   │   └── modals/
│   │       └── RecordDetailModal.tsx # Ventana modal con detalle oficial de asistencia
│   │
│   ├── context/                   # Gestión de Estado Global (React Context API)
│   │   ├── AuthContext.tsx        # Manejo de sesión del alumno y conmutador de pruebas
│   │   └── AccessibilityContext.tsx # Preferencias visuales con persistencia en localStorage
│   │
│   ├── services/                  # Lógica de Negocio y Algoritmos
│   │   └── attendanceService.ts   # Cálculo oficial de % de asistencia y motor de filtros
│   │
│   ├── data/                      # Datos Ficticios de Demostración
│   │   └── mockData.ts            # Registros históricos del alumno y cátedras del I26
│   │
│   └── types/                     # Tipos e Interfaces de TypeScript
│       └── index.ts               # Contratos para registros, perfiles y estados
│
└── docs/                          # Documentación Funcional y Técnica
    ├── informe-general.md         # Propósito y alcance del módulo
    ├── handbook.md                # Organización de componentes y responsabilidades
    ├── roadmap.md                 # Fases completadas y pendientes
    ├── arquitectura-tecnica.md    # Estructura técnica y diseño de endpoints API
    └── requisitos-funcionales.md  # Requisitos y criterios de aceptación
```

---

## 🚀 Cómo ejecutar la aplicación

En entornos basados en Vite, el proyecto se ejecuta mediante el servidor de desarrollo de Node:

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo en http://localhost:3000
npm run dev

# Generar la versión optimizada para producción
npm run build
```

> **Nota:** Al abrir `index.html` con doble clic como un archivo local (`file:///...`), los navegadores bloquean la carga de módulos ES por políticas de seguridad (CORS). Por eso se debe visualizar mediante el servidor de desarrollo (`npm run dev`) o la vista previa integrada de AI Studio.
