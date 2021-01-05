# Morpher Wallet
This is the guideline for a security review of the Morpher Wallet

## General thoughts for the wallet
In contrast to other wallets, this wallet should simply replace the _secure keystore_ from wallets. It should not connect to a blockchain node, or represent a full API.

The wallet is running on its own domain with very clear inputs and outputs, so that the surface for XSS-like attacks is minimized. Running on a separate domain also esures that there is no leakage from the localStore or sessionStore.

## Getting started quickly

The wallet comes packed with a sample docker-compose file. It also comes pre-packaged with development keys for Social Recovery. All you need to fill in is AWS keys for Email2FA functionality.

```
cp .env.aws.backend.example .env.aws.backend
vi .env.aws.backend
```

Fill in the values then simply run `docker-compose up`. It will start a postgres database, an express server backend and a vue development environment. The vue environment would be the content of the iframe.

If you want to simulate a full iframe environment, please find a sample "parent-frame" application in client_trade_morpher_com. `npm install && npm run start`.

## Iframe Flow
The Iframe and parent app follows a flow with defined interfaces for inputs and outputs. 

The inputs from the main app are:

1. Get the Accounts (no payload attached)
1. Sign a Transaction (payload is the transaction object)
1. Sign a Message (payload is the message object)

:[IframeFlow](fig_iframe.plantuml)

<div style='page-break-after: always;'></div>


:[LoginFlow](login.md)

<div style='page-break-after: always;'></div>


:[Routes](routes.md)

<div style='page-break-after: always;'></div>


:[Packages](packages.md)

<div style='page-break-after: always;'></div>


:[Packages](settings.md)
<div style='page-break-after: always;'></div>


:[Packages](logging.md)
<div style='page-break-after: always;'></div>


:[Packages](socialrecovery.md)
<div style='page-break-after: always;'></div>


:[Packages](frontendtests.md)
<div style='page-break-after: always;'></div>


:[Packages](unittests.md)