<template>
  <div style="margin-top:10px">
    <input
      type="password"
      name="password"
      placeholder="Enter Wallet password"
      v-model="password"
    />
    <button
      v-for="account in encryptedAccounts"
      :key="account.address"
      @click="exportSeedPhrase(account)"
    >
      Export Keystore V3 Object for {{ account.address }}
    </button>
    <button @click="exportPrivateKey">
      Show Private Key
    </button>
    <div v-if="seedPhrase">
      <h3>Seed Phrase:</h3>
      <h4>{{ seedPhrase }}</h4>
    </div>
    <div v-if="privateKey">
      <h3>Private Key:</h3>
      <h4>{{ privateKey }}</h4>
    </div>
  </div>
</template>

<script>
import { sha256, cryptoDecrypt } from "../utils/cryptoFunctions";
import { getKeystoreFromEncryptedSeed } from "../utils/backupRestore";
import {
  downloadEncryptedKeystore,
  getAccountsFromKeystore
} from "../utils/utils";

export default {
  name: "ExportWallet",
  data: function() {
    return {
      password: "",
      seedPhrase: "",
      privateKey: "",
      encryptedAccounts: []
    };
  },
  mounted() {
    this.encryptedAccounts = JSON.parse(localStorage.getItem("encryptedSeed"));
    console.log(this.encryptedAccounts);
  },
  methods: {
    async exportSeedPhrase(account) {
      const storedPassword = window.sessionStorage.getItem("password");
      const password = await sha256(this.password);
      if (storedPassword === password) {
        // let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))
        // console.log(encryptedSeed)
        // this.seedPhrase = await cryptoDecrypt(password, encryptedSeed.ciphertext, encryptedSeed.iv, encryptedSeed.salt)
        // this.password = "";
        console.log(account);
        const keystore = await getKeystoreFromEncryptedSeed(
          [account],
          password
        );
        console.log(keystore);

        downloadEncryptedKeystore(keystore[0].encrypt(this.password));
      } else alert("Password is not right!");
    },
    async exportPrivateKey() {
      const storedPassword = window.sessionStorage.getItem("password");
      const password = await sha256(this.password);
      if (storedPassword === password) {
        const encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"));

        const keystore = await getKeystoreFromEncryptedSeed(
          encryptedSeed,
          password
        );
        const address = getAccountsFromKeystore(keystore)[0];

        keystore.keyFromPassword(password, function(err, pwDerivedKey) {
          if (err) throw err;
          this.privateKey = keystore.exportPrivateKey(address, pwDerivedKey);
        });
      } else alert("Password is not right!");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
