# Zerowallet Fortmatic/Portis drop-in replacement
A wallet which needs zero installation and zero configuration (almost!)

# Components

For development you need to run wallet first. It will throw errors, because it's supposed to run in an iFrame. Then run the sample trade app and use the wallet as a keystore, running on a different domain.

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
