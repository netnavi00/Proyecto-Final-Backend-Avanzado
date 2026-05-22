# 1. Usamos una versión oficial y súper ligera de Node.js
FROM node:22-alpine

# 2. Creamos nuestro directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos SOLO los archivos de dependencias primero (Para optimizar el caché de Docker)
COPY package*.json ./

# 4. Instalamos las dependencias (solo las de producción para ahorrar peso)
RUN npm install --omit=dev

# 5. Copiamos el resto de tu código (server.js, testping.js, etc.)
COPY . .

# 6. Exponemos el puerto por donde "habla" tu servidor (asumiendo que es el 3001)
EXPOSE 5001

# 7. El comando para encender la máquina
CMD ["node", "server.js"]