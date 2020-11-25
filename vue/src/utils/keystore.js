const Accounts = require('web3-eth-accounts');

export function getKeystore(password, encryptedWalletObject = undefined) {
    return new Promise((resolve, reject) => {
        try {
            const account = new Accounts();
            if(encryptedWalletObject === undefined) {
                console.log("Creating new Wallet");
                resolve(account.wallet.create(1));
             } else {
                 console.log("Trying to unlock wallet");
                 resolve(account.wallet.decrypt(encryptedWalletObject, password));
             }
        } catch (err) {
            reject(err);
        }
    });
}
