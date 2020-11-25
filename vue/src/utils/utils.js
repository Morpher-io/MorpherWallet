const download = require("downloadjs");
function getAccountsFromKeystore(keystore) {
    let accounts = [];
    for(let i = 0; i < keystore.length; i++) {
        accounts.push(keystore[i].address);
    }
    return accounts;
}

function downloadEncryptedKeystore(keystore) {
    
    let now = new Date();
    download(JSON.stringify(keystore), now.toISOString()+"--"+keystore.address)
}

export {  
    getAccountsFromKeystore,
    downloadEncryptedKeystore
};
