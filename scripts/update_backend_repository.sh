#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 612970435624.dkr.ecr.eu-central-1.amazonaws.com

cd $BASEDIR/../backend-node
docker build -t morpher-wallet-backend .
docker tag morpher-wallet-backend:latest 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-backend:latest
docker push 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-backend:latest