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
    const ctArray = Array.from(new Uint8Array(ciphertext));                              // ciphertext as byte array
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
    const ctBase64 = btoa(ctStr);                                                      // encode ciphertext as base64

    const ivArray = Array.from(new Uint8Array(iv));
    const ivStr = ivArray.map(byte => String.fromCharCode(byte)).join('');
    const ivBase64 = btoa(ivStr);  

    const saltArray = Array.from(new Uint8Array(salt));
    const saltStr = saltArray.map(byte => String.fromCharCode(byte)).join('');
    const saltBase64 = btoa(saltStr);  

    //const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join(''); // iv as hex string
    resolve({ciphertext: ctBase64, iv: ivBase64, salt: saltBase64});
    //send to server
  

})

export default cryptoEncrypt;
