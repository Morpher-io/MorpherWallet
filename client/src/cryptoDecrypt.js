const cryptoDecrypt = (password, ciphertext, iv, salt) => new Promise(async (resolve, reject) => {

  //https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
  const ctStr = atob(ciphertext);                                                    // decode base64 ciphertext
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0))); // ciphertext as Uint8Array

  const ivStr = atob(iv);
  const ivUint8 =  new Uint8Array(ivStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

  const saltStr = atob(salt);
  const saltUint8 = new Uint8Array(saltStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

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
        salt: saltUint8, 
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
          iv: ivUint8
        },
        key,
        ctUint8
      );

    let dec = new TextDecoder();
    resolve(dec.decode(decrypted));
    } catch(e) {
      reject(e);
    }
  

});

export default cryptoDecrypt;
