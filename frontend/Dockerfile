# --- Stage 1: Build the React application ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# We build the frontend; optionally pass environment variables here if needed
RUN npm run build

# --- Stage 2: Serve the application via Nginx ---
FROM nginx:alpine
# Copy the compiled Vite output to Nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default Nginx config to support React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

