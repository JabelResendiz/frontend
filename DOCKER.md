# Dockerización del frontend

Pasos rápidos:

- Construir la imagen:

```
docker build -t frontend:latest .
```

- Ejecutar localmente:

```
docker run -p 8080:80 frontend:latest
```

- Usar docker-compose:

```
docker-compose up --build -d
```

Notas:
- El contenedor utiliza Nginx para servir la carpeta `dist` generada por `npm run build`.
- Si tu proyecto usa `pnpm` o `yarn`, ajusta el paso de instalación en `Dockerfile`.
- Si necesitas proxear llamadas `/api` hacia un backend, descomenta y ajusta la sección `location /api/` en `nginx.conf`.