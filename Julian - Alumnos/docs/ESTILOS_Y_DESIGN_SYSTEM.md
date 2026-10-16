# Informe Técnico de Estilos y Design System

> **Proyecto:** Sistema de Gestión Académica — Alcance del Módulo Alumno  
> **Autores:** Julián y Lucía  
> **Archivo interactivo relacionado:** [`index.html`](../index.html)  

---

## 🎨 Filosofía de Diseño Editorial

El documento de definición funcional del Módulo Alumno fue proyectado bajo un sistema de **diseño editorial minimalista de alta precisión**. El objetivo es imitar el acabado de una especificación formal de producto técnico o documentación interna de arquitectura de software, evitando apariencias genéricas de IA o dashboards sobrecargados.

---

## 🔤 Sistema Tipográfico

Se utiliza un triplete de fuentes especializadas importadas desde Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap');
```

| Rol Tipográfico | Familia Tipográfica | Pesos Usados | Aplicación |
| :--- | :--- | :--- | :--- |
| **Jerarquía Editorial** | `Newsreader`, Georgia, serif | `600` SemiBold, `700` Bold | Títulos de documento (`h1`), nombres de secciones (`h2`) y números de sección. |
| **Cuerpo y Párrafos** | `Inter`, system-ui, sans-serif | `400` Regular, `500` Medium, `600` SemiBold | Párrafos descriptivos, títulos de tarjetas y texto secundario. |
| **Etiquetas Técnicas** | `JetBrains Mono`, monospace | `400` Regular, `500` Medium | Pills de encabezado, tags de tablas de BD (`usuarios`, `asistencias`) y endpoints API. |

---

## 🎨 Paleta de Colores (Tokens de Estilo)

La paleta se basa en tonos fríos Slate/Azul Grisáceo para proyectar limpieza y profesionalismo:

```css
:root {
  --bg-main: #f8fafc;           /* Slate-50: Fondo general de la página */
  --card-bg: #ffffff;           /* Blanco puro: Fondo de tarjetas y paneles */
  --text-title: #0f172a;        /* Slate-900: Títulos principales de alto contraste */
  --text-sub: #1e293b;          /* Slate-800: Subtítulos */
  --text-body: #475569;         /* Slate-600: Texto de cuerpo y descripciones */
  --text-muted: #64748b;        /* Slate-500: Números de sección y etiquetas */
  --border-color: #e2e8f0;      /* Slate-200: Bordes sutiles para tarjetas */
  
  --badge-check-bg: #ecfdf5;    /* Emerald-50: Fondo indicador verde suave (MVP) */
  --badge-check-border: #a7f3d0;/* Emerald-200: Borde verde */
  --badge-check-text: #059669;  /* Emerald-600: Texto/ícono verde */
  
  --badge-out-bg: #f8fafc;      /* Fondo tenue para ítems fuera del MVP */
  --badge-out-border: #cbd5e1;  /* Borde gris */
  --badge-out-text: #94a3b8;    /* Texto/ícono gris */
}
```

---

## 📐 Layout y Estructura Espacial

* **Ancho Máximo:** `860px` centrado horizontalmente (`margin: 0 auto`).
* **Padding Lateral:** `20px` responsive.
* **Espacio en Blanco (Whitespace):** Entre secciones principales se aplican márgenes de `44px` a `64px` para permitir una lectura descansada y una jerarquía visual limpia.

---

## 🧩 Especificación de Componentes

### 1. Encabezado de Documento
* **Etiqueta Superior:** `JetBrains Mono`, `11px`, `uppercase`, `letter-spacing: 0.14em`, color `#64748b`.
* **Título Principal:** `Newsreader`, `38px`, `font-weight: 700`, color `#0f172a`.
* **Pills de Meta-información:** `border-radius: 9999px`, fondo `#ffffff`, borde `1px solid #e2e8f0`, texto monoespaciado de `12px`.

### 2. Tarjetas de Funcionalidad (Feature Cards)
* **Contenedor:** Fondo `#ffffff`, borde `1px solid #e2e8f0`, `border-radius: 12px`, `padding: 18px 22px`.
* **Disposición Flex:** Alineación izquierda para el ícono + título + descripción, y alineación derecha para la etiqueta técnica.
* **Badges de Estado:** Cuadro pequeño de `22px x 22px` con bordes redondeados (`6px`) conteniendo un checkmark (`✓`) o cruz (`✕`).

### 3. Bloque de Integración entre Módulos
* **Contenedor Destacado:** `padding: 24px 28px`, borde `1px solid #e2e8f0`, `border-radius: 12px`.
* **Filas de Diagrama:** Fondos sutiles diferenciados para distinguir el origen, el endpoint consumido y el módulo destino:
  * Origen: Purpura suave (`#f3e8ff`).
  * Endpoint: Monoespacio gris (`#475569`).
  * Destino Auth: Verde suave (`#f0fdf4`).
  * Destino Servicios: Azul suave (`#eff6ff`).
