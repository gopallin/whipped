#!/bin/sh

# Set permissions on startup
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Start PHP-FPM
php-fpm &

# Start Nginx in the foreground
nginx -g 'daemon off;'
