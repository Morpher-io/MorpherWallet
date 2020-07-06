const cryptoDecrypt = (password, ciphertext, iv, salt) => new Promise(async (resolve, reject) => {
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


   
    try {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        ciphertext
      );

    let dec = new TextDecoder();
    resolve(dec.decode(decrypted));
    } catch(e) {
      reject(e);
    }
  

});

export default cryptoDecrypt;
