# Zerowallet Fortmatic/Portis drop-in replacement
A wallet which needs zero installation and zero configuration (almost!)

# Installation

First you need the eth-lightwallet repository/folder in the frontend. Either download the whole repository from 
https://github.com/Morpher-io/eth-lightwallet or simply clone it into the folder:

`cd vue && git clone git@github.com:Morpher-io/eth-lightwallet.git && cd ..`

then start docker-compose:

`docker-compose up`



# Components

## SDK
In /zerowallet-sdk you find the actual SDK. This is used in a sample trade app (see below). You can basically do:

```
let sdk = new ZeroWallet("ws://127.0.0.1:7545");
let web3 = new Web3(sdk.getProvider());
```

It will override getAccounts and signTransaction and delegate it to the Wallet (Keystore)

## Sample-Trade App
This is a sample React app integrating the Zerowallet. 

Run it with
```
cd client_trade_morpher_com
npm install
npm start
```

It should be running on localhost:3000

*You Need To Run The Wallet First!*

## Wallet
This is the actual keystore which should be running under wallet.morpher.com (or localhost:3001 in development)

The SDK tries to open this in an iFrame.

Run it with
```
cd client_wallet_morpher_com
npm install
npm start
```

Communication is done via postMessage/onMessage wrapped in penpal.

Idea:

sample-app wants to know if you are logged in:
in parent isLoggedIn() -> to iframe child -> isLoggedIn() in child -> messageBack to parent -> result

## Backend
There is a social recovery method which uses a backend to try and get encrypted seed phrases from a server

start the php-backend and a database with

```
docker-compose up
```
