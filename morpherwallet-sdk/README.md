
[<img width="90px" height="90px" src="https://www.morpher.com/img/morpher_logo.jpg">](https://www.morpher.com/)

# Morpher Wallet SDK

[![npm](https://img.shields.io/npm/v/morpherwallet-sdk.svg)](https://www.npmjs.com/package/morpherwallet-sdk)

## Morpher Wallet SDK allows dapps to connect to the Morpher Wallet via a standard web3 Provider

- [Try Morpher Wallet in your browser](https://wallet.morpher.com)
- [Use it on the Morpher App](https://www.morpher.com/trade)
- [Wallet Homepage](https://www.morpher.com/wallet)
- [Sample Client Project](https://github.com/Morpher-io/MorpherWallet/tree/master/client_trade_morpher_com)


### Installing Wallet SDK

1. Check available versions:

   ```shell
     # yarn
     yarn info morpherwallet-sdk versions

     # npm
     npm view morpherwallet-sdk versions
   ```

2. Install latest version:

   ```shell
   # yarn
   yarn add morpherwallet-sdk

   # npm
   npm install morpherwallet-sdk
   ```

3. Check installed version:

   ```shell
   # yarn
   yarn list morpherwallet-sdk

   # npm
   npm list morpherwallet-sdk
   ```


### Basic Usage

1. Initialize SDK

   ```js
   import MorpherWallet from "morpherwallet-sdk";

   

   const morpherWallet = new MorpherWallet(
        "{rds link to chain}",
        {chain id},
        {
            show_transaction: true,
            confirm_transaction: true,
            show_message: true,
            confirm_message: true,
            env: "live",
        },
    );
   ```

2. Make web3 Provider

   ```js
        let provider = morpherWallet.getProvider();

   ```

3. Request accounts to initialize connection to wallet

   ```js
   const addresses = provider.request({
     method: 'eth_requestAccounts',
   });
   ```

4. Make more requests

   ```js
   provider.request('personal_sign', [
     `0x${Buffer.from('test message', 'utf8').toString('hex')}`,
     addresses[0],
   ]);
   ```

5. Handle wallet events

   ```js
     morpherWallet.onLogin((eth_address: string, email: string) => {
        console.lo
     });

    morpherWallet.value.onLogout(() => {
        console.log('logged out')
    });

   ```
6. Use with Viem
    ```js

        import { createPublicClient, createWalletClient, custom } from "viem";

        let provider = morpherWallet.getProvider();

         let wallet_client = createWalletClient({
          chain: chain,
          account: wallet_eth_address as `0x${string}`,
          transport: custom(provider),
        });

        let accounts = await wallet_client.getAddresses();

        console.log('accounts', accounts)


    ```


