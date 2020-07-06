const cryptoEncrypt = (password, seedPhrase) => new Promise(async (resolve, reject) => {
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
        "name": "PBKDF2",
        salt: salt, 
        "iterations": 100000,
        "hash": "SHA-256"
      },
      keyMaterial,
      { "name": "AES-GCM", "length": 256},
      true,
      [ "encrypt", "decrypt" ]
    );


    let encoded = enc.encode(seedPhrase);

    let ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encoded
    );

    console.log(ciphertext);
    let buffer = new Uint8Array(ciphertext, 0, 5);
    console.log(buffer);
    resolve({ciphertext: ciphertext, iv: iv, salt: salt});
    //send to server
  

})

export default cryptoEncrypt;
