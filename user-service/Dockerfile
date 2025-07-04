FROM php:8.2-fpm

WORKDIR /var/www/html

# Install dependencies
RUN apt-get update && apt-get install -y \
    git zip unzip curl libpng-dev libonig-dev libxml2-dev libzip-dev nginx \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install

COPY nginx.conf /etc/nginx/sites-available/default
COPY start.sh /usr/local/bin/start.sh

RUN chown -R www-data:www-data /var/www/html


CMD ["/usr/local/bin/start.sh"]

