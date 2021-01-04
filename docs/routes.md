<!--
Created: Thu Dec 03 2020 11:57:15 GMT+0100 (Central European Standard Time)
Modified: Thu Dec 31 2020 10:55:24 GMT+0100 (Central European Standard Time)
-->

# Description of the Routes

:[LoginflowUml](fig_routes.plantuml)

 Route        | description           | 
| ------------- |-------------|
| Login: /login | The first screen if the LocalStorage is empty |
| Signup: /signup | If the user wants to create a new Account, then this is the component which takes care of that. |
| Unlock: /unlock | Let's the user unlock the keystore. This is the default screen if the encrypted keystore is in local-storage. Otherwise the App will default to /login |
| 2FA: /twoFa | If the user is required to enter 2fa codes, then he is redirected here before the keystore is fetched from the server |
| Wallet: / | If the user is logged in correctly, he will see the wallet address and can potentially switch accounts, sign transactions etc |
| Settings: /settings | Change Email, Password, Export Seed Phrases, Add Account Recovery |
| (Later) Sign Transaction: /signtx | Shows a summary of the transaction and a sign/cancel button |
