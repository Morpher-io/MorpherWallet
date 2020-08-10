const { getKeystore }  = require("./keystore");
const config = require("./../config.json");
const { cryptoEncrypt, cryptoDecrypt, sha256 } = require("./cryptoFunctions");

const changePasswordEncryptedSeed = async (
    encryptedSeed,
    oldPassword,
    newPassword
) => {
    let seed = await cryptoDecrypt(
        oldPassword,
        encryptedSeed.ciphertext,
        encryptedSeed.iv,
        encryptedSeed.salt
    );
    return await cryptoEncrypt(newPassword, seed);
};

const getKeystoreFromEncryptedSeed = async (encryptedSeed, password) =>
    new Promise(async (resolve, reject) => {
        try {
            let seed = await cryptoDecrypt(
                password,
                encryptedSeed.ciphertext,
                encryptedSeed.iv,
                encryptedSeed.salt
            );
            let keystore = await getKeystore(password, seed);
            resolve(keystore);
        } catch (e) {
            reject(e);
        }
    });

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

const getEncryptedSeedFromMail = async (email) =>
    new Promise(async (resolve, reject) => {
        let key = await sha256(email);

        let options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key }),
            mode: "cors",
            cache: "default",
        };
        let response = await fetch(
            config.BACKEND_ENDPOINT + "/v1/getEncryptedSeed",
            options
        );
        let responseBody = await response.json();

        /**
         * Login /Create Wallet is in one function
         * @todo: Separate Login and Create Wallet into separate functions so that upon failed "login" a recovery can be suggested
         */
        if (responseBody.status === 200) {
            /**
             * Wallet was found on server, attempting to decrypt with the password
             */
            resolve(JSON.parse(responseBody));
        }
        reject("seed not found");
    });

const saveWalletEmailPassword = async (userEmail, encryptedSeed) => {
    let key = await sha256(userEmail);
    let options = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key,
            encryptedSeed,
            email: userEmail,
        }),
        mode: "cors",
        cache: "default",
    };
    let result = await fetch(
        config.BACKEND_ENDPOINT + "/v1/saveEmailPassword",
        options
    );

    let response = await result.json();
    return response;
};

const backupGoogleSeed = async (userEmail, userid, encryptedSeed) =>
    new Promise(async (resolve, reject) => {
        let key = await sha256(config.GOOGLE_APP_ID + userid);
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptedSeed,
                key,
                email: userEmail,
                recoveryTypeId: 3
            }),
            mode: "cors",
            cache: "default",
        };
        try {
            fetch(
                config.BACKEND_ENDPOINT + "/v1/saveEmailPassword",
                options
            ).then((r) => {
                r.json().then((response) => {
                    resolve(response);
                });
            });
        } catch (e) {
            reject(e);
        }
    });

const backupFacebookSeed = async (userEmail, userid, encryptedSeed) =>
    new Promise(async (resolve, reject) => {
        let key = await sha256(config.FACEBOOK_APP_ID + userid);
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptedSeed,
                key: key,
                email: userEmail,
                recoveryTypeId: 2
            }),
            mode: "cors",
            cache: "default",
        };
        try {
            fetch(
                config.BACKEND_ENDPOINT + "/v1/saveEmailPassword",
                options
            ).then((r) => {
                r.json().then((response) => {
                    resolve(response);
                });
            });
        } catch (e) {
            reject(e);
        }
    });

const recoverFacebookSeed = async (accessToken, signupEmail) =>
    new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken: accessToken, signupEmail: signupEmail}),
            mode: "cors",
            cache: "default",
        };
        fetch(
            config.BACKEND_ENDPOINT + "/v1/getFacebookEncryptedSeed",
            options
        ).then((r) => {
            r.json().then(async (responseBody) => {
                if (responseBody.status === 200){
                    //initiate recovery
                    let encryptedSeed = JSON.parse(responseBody);
                    resolve(encryptedSeed);
                } else {
                    reject(
                        "Your account wasn't found with Facebook recovery, create one with username and password first"
                    );
                }
            });
        });
    });
const recoverGoogleSeed = async (accessToken, signupEmail) =>
    new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken: accessToken, signupEmail: signupEmail }),
            mode: "cors",
            cache: "default",
        };
        fetch(
            config.BACKEND_ENDPOINT + "/v1/getGoogleEncryptedSeed",
            options
        ).then((r) => {
            r.json().then(async (responseBody) => {
                if (responseBody.status === 200) {
                    //initiate recovery
                    let encryptedSeed = JSON.parse(responseBody);
                    resolve(encryptedSeed);
                } else {
                    reject(
                        "Your account wasn't found with Google recovery, create one with username and password first"
                    );
                }
            });
        });
    });

const recoverVKSeed = async (accessToken, signupEmail) =>
    new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken: accessToken, signupEmail: signupEmail }),
            mode: "cors",
            cache: "default",
        };
        fetch(
            config.BACKEND_ENDPOINT + "/v1/getVKontakteEncryptedSeed",
            options
        ).then((r) => {
            r.json().then(async (responseBody) => {
                if (responseBody.status === 200) {
                    //initiate recovery
                    let encryptedSeed = JSON.parse(responseBody);
                    resolve(encryptedSeed);
                } else {
                    reject(
                        "Your account wasn't found with VK recovery, create one with username and password first"
                    );
                }
            });
        });
    });

const backupVKSeed = async (userEmail, userid, encryptedSeed) =>
    new Promise(async (resolve, reject) => {
        let key = await sha256(config.VK_APP_ID + userid);
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptedSeed,
                key,
                email: userEmail,
                recoveryTypeId: 5
            }),
            mode: "cors",
            cache: "default",
        };
        try {
            fetch(
                config.BACKEND_ENDPOINT + "/v1/saveEmailPassword",
                options
            ).then((r) => {
                r.json().then((response) => {
                    resolve(response);
                });
            });
        } catch (e) {
            reject(e);
        }
    });

export {  getEncryptedSeed,
    saveWalletEmailPassword,
    getKeystoreFromEncryptedSeed,
    changePasswordEncryptedSeed,
    backupFacebookSeed,
    recoverFacebookSeed,
    getEncryptedSeedFromMail,
    backupGoogleSeed,
    recoverGoogleSeed,
    backupVKSeed,
    recoverVKSeed,
};
