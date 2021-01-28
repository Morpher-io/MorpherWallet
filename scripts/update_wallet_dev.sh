aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 612970435624.dkr.ecr.eu-central-1.amazonaws.com

cd ../vue
docker build -t morpher-wallet-frontend -f Dockerfile.production .
docker tag morpher-wallet-frontend:latest 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-frontend:latest
docker push 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-frontend:latest

cd ../backend-node
docker build -t morpher-wallet-backend .
docker tag morpher-wallet-backend:latest 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-backend:latest
docker push 612970435624.dkr.ecr.eu-central-1.amazonaws.com/morpher-wallet-backend:latest