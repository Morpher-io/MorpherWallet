![image info](./docs/morpher_logo_small.png)

# Introduction
This is the repository for the core Morpher Wallet components of https://wallet.morpher.com

Instead of being a full-blown wallet, its a keystore that can be integrated in virtually any DApp which needs zero installation and zero configuration.

![](https://img.shields.io/github/last-commit/Morpher-io/MorpherWallet) ![](https://img.shields.io/github/license/Morpher-io/MorpherProtocol) ![](https://img.shields.io/discord/859752396112396348) ![](https://img.shields.io/twitter/follow/morpher_io?style=social)

# Prerequisites Quickstart
* Install Docker https://docs.docker.com/get-docker/ and configure it correctly.
* [optional] Install Postgres https://www.postgresql.org/download/ (optional if you work with Docker).
* [optional] Install Node.js and Npm https://nodejs.org/en/download/ (optional if you work with Docker).
* Git clone this repo and `cd` into it.

    ```
    git clone https://github.com/Morpher-io/MorpherWallet.git
    cd MorpherWallet
    ```


# Installation
You can deploy MorpherWallet on your local/cloud machine for testing in two ways: 

* You can deploy using Docker (very quick).

* You can setup a Postgres database, install Node.js and Npm and run every component separately.

### Setting up the wallet with Docker (quickstart)
* Run `docker compose up`.

Postgres database, backend and frontend will be automatically setup through the Docker scripts.  

Postgres database will be deployed at: `http://127.0.0.1:5432`. 
* User "postgres", password "example", db "zerowallet"

Backend will be deployed at: `http://127.0.0.1:8080`.

Frontend will be deployed at: `http://127.0.0.1:3001`.

### Setting up the wallet with Node.js and Npm

#### Setting up backend
 
* Run `npm install` in the `backend-node` directory.

* Rename the `.env.example.` to `.env`.

* Input the correct database `DB_` variables.

* Run `npm run start`.

* Run `npm run db:seed` to populate the database with the initial data.
 
 Backend will be deployed at: `http://127.0.0.1:8080`.

#### Setting up frontend

* Run `npm install` in the `vue` directory. 
* Run `npm run serve` to start the frontend process.

 Frontend will be deployed at: `http://127.0.0.1:3001`.

# More information

The wallet has 3 components: A "Parent-Frame" that embeds the actual "iframe" wallet, and a backend. To read more about this architecture, head over to [the docs](docs/audit-doc.pdf)!