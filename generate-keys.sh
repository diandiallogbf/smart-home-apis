#!/bin/bash

mkdir -p keys

# Générer la clé privée
openssl genrsa -out keys/private.key 2048

# Générer la clé publique
openssl rsa -in keys/private.key -pubout -out keys/public.key

echo "# RSA keys generated successfully in ./keys"