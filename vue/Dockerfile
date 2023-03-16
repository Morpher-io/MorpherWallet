FROM public.ecr.aws/docker/library/node:18-buster

# ARG DEBIAN_FRONTEND=noninteractive
# ENV TZ=Europe/Vienna
# RUN apt-get install -y tzdata
# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get clean && apt-get update && apt-get -y install python3 make g++ && npm install
# If you are building your code for production
# RUN npm ci --only=production


# Bundle app source
COPY . .


#RUN DEBIAN_FRONTEND=noninteractive apt-get -y install keyboard-configuration

EXPOSE 3001
CMD [ "npm", "run", "serve" ]