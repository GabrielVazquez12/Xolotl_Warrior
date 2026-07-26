# Usamos una imagen ligera de Node.js Alpine
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar dependencias e instalarlas en modo producción
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código del servidor
COPY . .

# Exponer el puerto donde corre Express
EXPOSE 3000

# Comando para arrancar el servidor
CMD ["node", "server.js"]