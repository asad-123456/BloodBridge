# --- Stage 1: Build the React application ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Allow injecting API URL at build time for production deployments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Stage 2: Serve the application via Nginx ---
FROM nginx:alpine
# Copy the compiled Vite output to Nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default Nginx config to support React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

