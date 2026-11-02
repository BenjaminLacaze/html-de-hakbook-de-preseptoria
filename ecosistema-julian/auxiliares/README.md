# Panel de Auxiliares — ISFDyT N° 26

Panel de maestranza / mantenimiento (rol `STAFF`) conectado a la API institucional (`/api/v1`).

## Correr en local

1. Levantar la API (`backend/`, puerto 4000).
2. `npm install` y `npm run dev` (puerto 3002). Vite redirige `/api` a `http://localhost:4000`.
3. Ingresar con una cuenta de auxiliar (la sesión es una cookie HttpOnly compartida con los demás portales).

Datos: todo sale de la API (`src/auxiliares/api/`). Solo quedan en el navegador el tema,
el tamaño de letra, la reducción de movimiento y la intro.
