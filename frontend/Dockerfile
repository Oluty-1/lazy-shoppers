# Use nginx to serve the static site
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy our site into nginx's public folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx runs automatically as CMD in this base image
