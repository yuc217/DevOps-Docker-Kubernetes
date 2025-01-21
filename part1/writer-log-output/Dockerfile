FROM node:18-slim
WORKDIR /app
COPY index.js package.json ./
RUN npm install
CMD ["node", "index.js"]