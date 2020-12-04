import Lightwallet from "eth-lightwallet";

export function getKeystore(password: string, _secretSeed = false) {
  return new Promise((resolve, reject) => {
    const secretSeed =
      _secretSeed === false
        ? Lightwallet.keystore.generateRandomSeed()
        : _secretSeed;
    const vaultOpts = {
      seedPhrase: secretSeed, //'motion candy violin crazy north hazard uphold corn spray message vibrant palace',
      password: password,
      hdPathString: "m/44'/60'/0'/0"
    };

    try {
      Lightwallet.keystore.createVault(vaultOpts, (err1: any, ks: any) => {
        if (err1) throw err1;

        ks.keyFromPassword(
          vaultOpts.password,
          (err2: any, pwDerivedKey: any) => {
            if (err2) throw err2;

            ks.generateNewAddress(pwDerivedKey, 1);

            //don't prompt the user for the password on every transaction sign
            ks.passwordProvider = function(callback: any) {
              callback(null, password);
            };
            resolve(ks);
          }
        );
      });
    } catch (err) {
      reject(err);
    }
  });
}
