# Diseño unificado — ISFDyT N.° 26

Un solo lenguaje visual para todas las apps del sistema, basado en el **manual de marca del
instituto**. Fuente: [`shared/design/tokens.css`](../shared/design/tokens.css).

**Ya lo usan:** la landing y la app de Consolidación (tema "Institucional").
**Pendiente:** Directivos, Profesores y los dos portales de Alumno (backlog INT-97), cada equipo
en su app, sin apuro y sin romper lo que ya tiene.

## Cómo se usa

```ts
// En una app Vite (alias @shared ya configurado en las 4 apps)
import '@shared/design/tokens.css';
```

```html
<!-- En una página HTML suelta -->
<link rel="stylesheet" href="/shared/design/tokens.css">
```

## Colores

| Token | Valor | Uso |
|---|---|---|
| `--i26-blue` | `#14214f` | Azul institucional: barras, botón principal, títulos |
| `--i26-blue-hover` | `#1e3172` | Hover del azul |
| `--i26-sky` | `#3f78b6` | Enlaces e información |
| `--i26-gold` | `#89743a` | Dorado ocre: acentos y detalles |
| `--i26-gold-text` | `#6b5b2e` | Dorado para **texto** sobre blanco (contraste AAA) |
| `--i26-sand` | `#af9b63` | Arena: bordes destacados, hover de tarjetas |
| `--i26-bg` | `#f4f6f9` | Fondo de la app |
| `--i26-surface` | `#ffffff` | Tarjetas |
| `--i26-border` | `#e2e8f0` | Bordes |
| `--i26-text` / `--i26-text-muted` | `#0f172a` / `#475569` | Texto (14:1 y 4.8:1 sobre blanco) |

**Asistencia (los mismos colores en todas las apps):**

| Estado | Fondo / texto | Clase |
|---|---|---|
| Presente | `--i26-present-bg` / `--i26-present-text` | `.i26-badge-present` |
| Ausente | `--i26-absent-bg` / `--i26-absent-text` | `.i26-badge-absent` |
| Llegada tarde | `--i26-late-bg` / `--i26-late-text` | `.i26-badge-late` |
| Justificado | `--i26-justified-bg` / `--i26-justified-text` | `.i26-badge-justified` |

Los valores salen de `profesores-nicolas/app/src/styles/tokens.css` (Nicolás ya había pasado el
manual a código, con el contraste verificado).

## Tipografía

El manual pide Cocomat Pro, Hussar Bold y Dubai, que son comerciales. Se usan sustitutas libres:

- Títulos: **Outfit** (`--i26-font-heading`)
- Texto: **Inter** (`--i26-font-body`)

## Componentes base

| Clase | Qué es |
|---|---|
| `.i26-card` | Tarjeta blanca con borde y sombra suave |
| `.i26-btn` + `.i26-btn-primary` / `.i26-btn-secondary` | Botones (azul lleno / borde) |
| `.i26-input` | Campo de texto con foco visible |
| `.i26-badge-*` | Estados de asistencia |
| `.i26-eyebrow` | Rótulo chico en dorado sobre los títulos |

Todas llevan el prefijo `i26-` para no chocar con los estilos propios de cada app.

## Reglas

1. Usar los tokens, no colores sueltos. Si falta uno, se agrega en `tokens.css`.
2. Foco visible siempre (`--i26-focus`); no sacar el `outline` sin reemplazo.
3. Contraste mínimo AA (4.5:1) para texto. El dorado sobre blanco, solo con `--i26-gold-text`.
4. Respetar `prefers-reduced-motion`.
5. Cada app puede tener sus temas extra (como los de la app de Julián), pero el **tema por
   defecto es el institucional**.
