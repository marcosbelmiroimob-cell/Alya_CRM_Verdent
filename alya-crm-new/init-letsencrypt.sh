#!/bin/bash
# ===========================================
# Script de Setup SSL - Let's Encrypt
# CRM Alya - alyacrm.com.br
# ===========================================

set -e

domains=(alyacrm.com.br www.alyacrm.com.br)
email="contato@alyacrm.com.br"
staging=0  # Set to 1 for testing

data_path="./certbot"

if [ -d "$data_path/conf/live/alyacrm.com.br" ]; then
    read -p "Certificados existentes encontrados. Deseja substituir? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        exit
    fi
fi

echo "### Criando diretórios..."
mkdir -p "$data_path/conf"
mkdir -p "$data_path/www"

echo "### Baixando parâmetros TLS..."
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
fi

if [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
fi

echo "### Criando certificado dummy..."
path="/etc/letsencrypt/live/alyacrm.com.br"
mkdir -p "$data_path/conf/live/alyacrm.com.br"
docker compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Iniciando nginx..."
docker compose -f docker-compose.ssl.yml up --force-recreate -d nginx

echo "### Removendo certificado dummy..."
docker compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/alyacrm.com.br && \
    rm -Rf /etc/letsencrypt/archive/alyacrm.com.br && \
    rm -Rf /etc/letsencrypt/renewal/alyacrm.com.br.conf" certbot

echo "### Solicitando certificado Let's Encrypt..."

domain_args=""
for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
done

staging_arg=""
if [ $staging != "0" ]; then
    staging_arg="--staging"
fi

docker compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    $domain_args \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

echo "### Reiniciando nginx..."
docker compose -f docker-compose.ssl.yml exec nginx nginx -s reload

echo ""
echo "=========================================="
echo "  Certificado SSL configurado!"
echo "=========================================="
echo "Acesse: https://alyacrm.com.br"
