const cryptoEncrypt = (password, seedPhrase) =>
  new Promise(async (resolve, reject) => {
    let enc = new TextEncoder();
    let keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    let salt = await window.crypto.getRandomValues(new Uint8Array(16));
    let iv = await window.crypto.getRandomValues(new Uint8Array(12));

    let key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    let encoded = enc.encode(seedPhrase);

    let ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoded
    );

    console.log(ciphertext);
    const ctArray = Array.from(new Uint8Array(ciphertext)); // ciphertext as byte array
    const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(""); // ciphertext as string
    const ctBase64 = btoa(ctStr); // encode ciphertext as base64

    const ivArray = Array.from(new Uint8Array(iv));
    const ivStr = ivArray.map((byte) => String.fromCharCode(byte)).join("");
    const ivBase64 = btoa(ivStr);

    const saltArray = Array.from(new Uint8Array(salt));
    const saltStr = saltArray.map((byte) => String.fromCharCode(byte)).join("");
    const saltBase64 = btoa(saltStr);

    //const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join(''); // iv as hex string
    resolve({ ciphertext: ctBase64, iv: ivBase64, salt: saltBase64 });
    //send to server
  });

const cryptoDecrypt = (password, ciphertext, iv, salt) =>
  new Promise(async (resolve, reject) => {
    //https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
    const ctStr = atob(ciphertext); // decode base64 ciphertext
    const ctUint8 = new Uint8Array(
      ctStr.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0))
    ); // ciphertext as Uint8Array

    const ivStr = atob(iv);
    const ivUint8 = new Uint8Array(
      ivStr.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0))
    );

    const saltStr = atob(salt);
    const saltUint8 = new Uint8Array(
      saltStr.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0))
    );

    let enc = new TextEncoder();
    let keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    //let salt = window.crypto.getRandomValues(new Uint8Array(16));
    //let iv = window.crypto.getRandomValues(new Uint8Array(12));

    let key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltUint8,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    try {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivUint8,
        },
        key,
        ctUint8
      );

      let dec = new TextDecoder();
      resolve(dec.decode(decrypted));
    } catch (e) {
      reject(e);
    }
  });

const sha256 = async (inputString) => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder("utf-8").encode(inputString);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");
  return hashHex;
};

module.exports = { cryptoDecrypt, cryptoEncrypt, sha256 };
