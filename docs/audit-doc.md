# Morpher Wallet
This is the guideline for a security review of the Morpher Wallet

## General thoughts for the wallet
In contrast to other wallets, this wallet should simply replace the _secure keystore_ from wallets. It should not connect to a blockchain node, or represent a full API.

The wallet is running on its own domain with very clear inputs and outputs, so that the surface for XSS-like attacks is minimized. Running on a separate domain also esures that there is no leakage from the localStore or sessionStore.

## Getting started quickly

The wallet comes packed with a sample docker-compose file. Open /docker-compose.yml, edit the environment variables accordingly and type in `docker-compose up`.

It will start a postgres database, an express server backend and a vue development environment. The vue environment would be the content of the iframe.

If you want to simulate a full iframe environment, please find a sample "parent-frame" application in client_trade_morpher_com. `npm install && npm run start`.

## Iframe Flow
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