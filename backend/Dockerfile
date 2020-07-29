#
# PHP Dependencies
#
FROM composer:1.7 as vendor

COPY composer.json composer.json
#COPY composer.lock composer.lock

RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

FROM php:7.4-apache

RUN docker-php-ext-install mysqli
COPY --from=vendor /app/vendor/ /var/www/html/vendor/