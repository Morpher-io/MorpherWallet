import { sha256 } from "./cryptoFunctions";
import getKeystore from "./keystore";

const getEncryptedSeed = async (keystore, password) => {
    let pwDerivedKey = await new Promise((resolve, reject) => {
      keystore.keyFromPassword(password, (err, key) => {
        if (err) {
          reject(err);
        }
        resolve(key);
      });
    });
  
    let encryptedSeed = await cryptoEncrypt(
      password,
      await keystore.getSeed(pwDerivedKey)
    );
    return encryptedSeed;
  };

const restoreKeystoreFromMail = async (email, password) =>  {
  new Promise(async (resolve, reject) => {
    let key = sha256(email);
    let options = {
      method: "POST",
      body: JSON.stringify({ key: key }),
      mode: "cors",
      cache: "default",
    };
    let seed = false;
    let response = await fetch(
      config.BACKEND_ENDPOINT + "/index.php?endpoint=restoreEmailPassword",
      options
    );
    let responseBody = await response.json();

    /**
     * Login /Create Wallet is in one function
     * @todo: Separate Login and Create Wallet into separate functions so that upon failed "login" a recovery can be suggested
     */
    if (responseBody !== false) {
      /**
       * Wallet was found on server, attempting to decrypt with the password
       */
      let encryptedSeedObject = JSON.parse(responseBody);
      try {
        seed = await cryptoDecrypt(
          password,
          encryptedSeedObject.ciphertext,
          encryptedSeedObject.iv,
          encryptedSeedObject.salt
        );
        let keystore = getKeystore(password, seed);
        resolve(keystore);
      } catch (e) {
        reject(e);
      }
    }
    reject("seed not found");
  });
}



const saveWalletEmailPassword = async (userEmail, encryptedSeed) => {
  let key = sha256(userEmail);
  let options = {
    method: "POST",
    body: JSON.stringify({
      key: key,
      seed: encryptedSeed,
      email: userEmail,
    }),
    mode: "cors",
    cache: "default",
  };
  let result = await fetch(
    config.BACKEND_ENDPOINT + "/index.php?endpoint=saveEmailPassword",
    options
  );

  let response = await result.json();
  return response;
};

module.exports = {
  getEncryptedSeed,
  saveWalletEmailPassword,
  restoreKeystoreFromMail,
};
